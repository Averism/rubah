import { RubahJobs } from "../models/RubahJobs";
import fs from 'fs';

export async function load_json(job: RubahJobs, params: string[]): Promise<{ key: string; value: any; }[]>{
    if(!job.location) throw `load_json command needs location parameter`
    if(!fs.existsSync(job.location)) throw `cannot find json file ${job.location}`
    return [{key: job.name, value: JSON.parse(fs.readFileSync(job.location).toString())}];
}