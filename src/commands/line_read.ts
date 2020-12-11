import fs from 'fs';
import { RubahJobs } from "../models/RubahJobs";
import { commentStyleParser } from "../utils/commentStyleParser";
import { parsecommand } from "../utils/parsecommand";
import { templateParser } from "../utils/templateParser";

export async function line_read (job: RubahJobs, params: string[]): Promise<{ key: string; value: any; }[]> {
    let res: { key: string; value: any; }[] = [];
    if(!job.location) throw `line_read needs location property in ${job.name}`;
    let nl = job.newline?job.newline:job.rubah.config.newline?job.rubah.config.newline:"\n";
    let filename = job.location;
    let file = fs.readFileSync(filename).toString();
    let lines = file.split(nl);
    let commentStyle = job.commentStyle || 'doubleslash';
    let state: any = null
    let chunk: string[];
    for(let line of lines){
        let left = line.substr(0,line.indexOf(line.trim()));
        let parsed = commentStyleParser[commentStyle](line.trim(),"PARSE");
        if(parsed && parsed[0] == "HEAD" && parsed[1].startsWith('line-read')){       
            let {key, mapkey, template} = parsecommand(parsed[1], job.name);
            let {handle, params} = templateParser(template);
            state = {key, handle, params, mapkey}
            chunk = [];
        } else if (parsed && parsed[0] == "TAIL" && state && state.key && parsed[1].trim()==state.key) {
            let value:any = chunk;
            if(job.rubah.helpers[state.handle]){
                value = job.rubah.helpers[state.handle](value, ...state.params)
            }
            res.push({key: state.mapkey, value})
            state = null;
        } else if (parsed == null && state && state.key) {
            chunk.push(line.trim());
        }
    }
    return res;
}