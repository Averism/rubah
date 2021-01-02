import { RubahJobs } from "../models/RubahJobs";
import fs from 'fs';

export async function load(job: RubahJobs, params: string[]): Promise<{ key: string; value: any; }[]>{
    let res = {
        key: params[0]+"."+job.name,
        value: fs.readFileSync(job.location).toString()
    };
    return [res];
}