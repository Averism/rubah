import path from "path";
import fs from "fs";
import { RubahJobs } from "../models/RubahJobs";

export async function import_ts(job: RubahJobs, params: string[]): Promise<{ key: string; value: any; }[]>{
    const relative = path.relative(__dirname, process.cwd());
    let res: { key: string; value: any; }[] = [];
    switch(params[0]){
        case 'single':
            let temp = await import('./'+path.join(relative, ...job.location));
            if(job.module) temp = temp[job.module];
            res.push({key: job.name, value: temp});
            break;
        case 'folder':
            let temp2: any[] = [];
            let folder = path.join(...job.location);
            let files = fs.readdirSync(folder);
            let regex = job.filter?new RegExp(job.filter):/./;
            for(let file of files){
                if(!file.endsWith('.ts')) continue;
                if(!regex.test(file)) continue;
                let filename = file.substr(0,file.length-3);
                let temp = await import('./'+path.join(relative, ...job.location, filename));
                if(job.module) temp = temp[job.module];
                temp2.push(temp);
            }
            res.push({key: job.name, value: temp2});
            break;
        default: throw "invalid option for import-ts, expected single or folder, but found: "+params[0];
    }
    return res;
}