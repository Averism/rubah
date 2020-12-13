#!/usr/bin/env node
import { RubahOptions } from "./models/RubahOptions";
import Rubah from "./Rubah";
import fs from 'fs'
import path from 'path'
import glob from 'glob'
import { RubahJobs } from "./models/RubahJobs";

function getJobs(config: RubahOptions){
    let jobsfile: string[] = [];
    let jobs: RubahJobs[] = [];
    let jobsqueued: RubahJobs[] = [];
    for(let jobpath of config.jobpaths){
        jobsfile = jobsfile.concat(glob.sync(jobpath));
    }
    for(let jobfile of jobsfile){
        let job: RubahJobs = JSON.parse(fs.readFileSync(jobfile).toString());
        job.name = path.basename(jobfile).substr(0,path.basename(jobfile).length - path.extname(jobfile).length);
        let checkname = jobs.filter(x=>x.name==job.name).length>0;
        if(checkname) console.error(`\u001b[41mERROR: job ${job.name} are already exists\u001b[0m`) 
        if(job.dependson){
            let dependency = jobs.filter(x=>job.dependson.indexOf(x.name)>-1).length == job.dependson.length;
            if(dependency) jobs.push(job);
            else jobsqueued.push(job);
        }else{
            jobs.push(job);
        }
    }
    let delta = -1;
    while(jobsqueued.length > 0 && delta!=0){
        let next: RubahJobs[] = [];
        for(let job of jobsqueued){
            let dependency = jobs.filter(x=>job.dependson.indexOf(x.name)>-1).length == job.dependson.length;
            if(dependency) jobs.push(job);
            else next.push(job);
        }
        delta = jobsqueued.length - next.length;
        jobsqueued = next;
    }
    if(jobsqueued.length>0){
        for(let job of jobsqueued){
            let found = jobs.filter(x=>job.dependson.indexOf(x.name)>-1).map(x=>x.name);
            let notfound = job.dependson.filter(x=>found.indexOf(x)>-1);
            console.error(`\u001b[41mERROR: job ${job.name} cannot find dependency of ${notfound}\u001b[0m`) 
        }
    }
    return jobs;
}

export default async function main(mode: string):Promise<number>{
    let config: RubahOptions = new RubahOptions();
    config = Object.assign(config, JSON.parse(fs.readFileSync(".avermodule/rubah/rubahconfig.json").toString()));
    let rubah = new Rubah(config);
    config.jobs = getJobs(config);
    switch(mode){
        //!line-read maincommand getwordbetween(case,await)
        case 'generate': await rubah.generate(); break;
        case 'revert': await rubah.revert(); break;
        //---maincommand
        case 'reconfigure': require('./module-utils/reconfigure'); break;
        default: console.error("[tsemplate error] UNKNOWN MODE:",mode)
    }
    return 0;
}

main(process.argv[2]); 