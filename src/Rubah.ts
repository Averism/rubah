import path from "path";
import fs from "fs";
import glob from "glob";
import { RubahInterface } from "./interfaces/Rubah";
import { RubahJobs } from "./models/RubahJobs";
import { RubahOptions } from "./models/RubahOptions";

const relative = path.relative(__dirname, process.cwd());

export class Rubah implements RubahInterface {
    constructor (config: RubahOptions){
        this.config = config;
        console.log("reading rubah mapping");
        if(!config.mappingfile) 
            config.mappingfile = "rubahmap.json";
        if(fs.existsSync(config.mappingfile)){
            this.state = JSON.parse(fs.readFileSync(config.mappingfile).toString());
        }
        let temp;
        if(config.helpers){
            for(let helperPath of config.helpers){
                if(helperPath.startsWith('./')){
                    let helpers = glob.sync(helperPath)
                    for(let helper of helpers){
                        if(helper.startsWith('./')) temp = require('./'+path.join( relative ,helper.substr(2)));
                        else temp = require(path.join(relative,helper));
                        for(let key of Object.keys(temp)){
                            this.helpers[key] = temp[key];
                        }
                    }
                }else {
                    temp = require(helperPath);
                    for(let key of Object.keys(temp)){
                        this.helpers[key] = temp[key];
                    }   
                }
            }
        }
        if(config.commands){
            for(let commandPath of config.commands){
                if(commandPath.startsWith('./')){
                    let commands = glob.sync(commandPath);
                    for(let command of commands){
                        if(command.startsWith('./')) temp = require('./'+path.join(relative,command.substr(2)));
                        else temp = require(path.join(relative,command));
                        for(let key of Object.keys(temp)){
                            this.commands[key] = temp[key];
                        }
                    }
                }else{
                    temp = require(commandPath);
                    for(let key of Object.keys(temp)){
                        this.commands[key] = temp[key];
                    }
                }
            }
        }
    }
    async generate(): Promise<number> {
        console.log(`found ${this.config.jobs.length} job${this.config.jobs.length>1?'s':''} generating...`);
        for(let job of this.config.jobs){
            job.isGenerate = true;
            await this.doJob(job);
        }
        console.log("rubah generate finished")
        return Promise.resolve(0);
    }
    async revert(): Promise<number> {
        console.log(`found ${this.config.jobs.length} job${this.config.jobs.length>1?'s':''} reverting...`);
        for(let job of this.config.jobs){
            job.isGenerate = false;
            await this.doJob(job);
        }
        console.log("rubah revert finished")
        return Promise.resolve(0);
    }
    private async doJob(job: RubahJobs){
        console.log(`executing job ${job.name}`);
        let commands: string[] = job.command.split(" ");
        let handler = commands.shift();
        if(this.commands[handler]){
            job.rubah = this;
            try{
                let temp:{ key: string; value: any; }[] = await this.commands[handler](job, commands);
                for(let o of temp){
                    this.data[o.key] = o.value;
                }
            }catch(e) {console.error(e)}
        } else {
            console.error(`\u001b[41mERROR: unknown handler ${handler} with params ${commands}\u001b[0m`);
        }
    }
    async writeMapping(): Promise<number> {
        let mf = this.config.mappingfile;
        fs.writeFileSync(mf,JSON.stringify(this.state,null,2));
        return;
    }
    iterate(params: string[]): any[][] {
        const rubah: Rubah = this;
        function resolveParams(params: string[], index: number[]): any[] {
            return params.map((x,i)=>Array.isArray(rubah.data[x])?rubah.data[x][i]:rubah.data[x]);
        }
        function next(index: number[], maxIndex: number[]): number[] {
            let nx = Array.from(index);
            nx[nx.length-1] = nx[nx.length-1] + 1 ;
            for(let i = nx.length-1; i>0; i--) if(nx[i] == maxIndex[i]) {
                nx[i] = 0;
                nx[i-1] = nx[i-1] + 1;
            }
            return nx;
        }
        let res: any[][] = [];
        let currentIndex:number[] = params.map(x=>0);
        let maxIndex: number[] = params.map(x=>Array.isArray(rubah.data[x])?this.data[x].length:1);
        while(currentIndex[0] < maxIndex[0]) {
            res.push(resolveParams(params,currentIndex));
            currentIndex = next(currentIndex, maxIndex);
        }
        return res;
    }
    commands: { [key: string]: (job: RubahJobs, params: string[]) => Promise<{ key: string; value: any; }[]>; } = {};
    config: RubahOptions;
    state: any = {};
    data: any = {};
    helpers: { [key: string]: Function; } = {};

}

export default Rubah;