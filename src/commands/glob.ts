import { RubahJobs } from "../models/RubahJobs";
import g from "glob";

function hash(s: string): number {
    return s.split('').map(x=>x.charCodeAt(0)).reduce((p:number, c: number)=>{
        return ((p<<5) - p) + c;
    },0)
}

export async function glob(job: RubahJobs, params: string[]): Promise<{ key: string; value: any; }[]>{
    let locations = g.sync(job.location);
    let res: { key: string; value: any; }[] = [];
    let cmd = job.rubah.commands[params[0]];
    if(!cmd) console.error(`[rubah glob command] Error, command ${cmd} is not recognized`);
    else{
        for(let location of locations) {
            let newJob = Object.assign({}, job);
            newJob.location = location;
            newJob.name = job.name+"_"+hash(location);
            res = res.concat(await cmd(newJob, params.slice(1)));
        }
    }
    return res;
}