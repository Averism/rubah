import path from "path";
import fs from 'fs';
import { RubahJobs } from "../models/RubahJobs";

const templateRegex = /^(\w+)\((\w*(\s*,\s*\w*)*)\)$/;
function templateParser(template: string): {handle: string, params: string[]} {
    let temp = templateRegex.exec(template);
    if(temp[1]){
        return {handle: temp[1], params: temp[2].split(',').map(x=>x.trim())};
    } else throw `cannot parse ${template}`
}

type commentType = "HEAD" | "TAIL" | "PARSE";
const commentStyleParser: {[key: string]: (body: string, type: string)=>string|string[]} = {
    "doubleslash": (body: string, type: string):string|string[] => {
        if(type == "HEAD") return "//!"+body;
        else if (type == "TAIL") return "//---";
        else if (body.startsWith("//")) {
            if(body.startsWith("//!")) return ["HEAD",body.substr(3).trim()];
            else if(body.startsWith("//---")) return ["TAIL",body.substr(5).trim()];
            else return null;
        } else return null;
    },
    "html": (body: string, type: string):string|string[] => {
        if(type == "HEAD") return "<!--#!"+body+"-->";
        else if (type == "TAIL") return "<!--#!---"+body+"-->";
        else if (body.startsWith("<!--")) {
            if(body.startsWith("<!--#!")){
                let i = body.indexOf("-->");
                return ["HEAD",body.substr(6,i-6).trim()];
            }
            else if(body.startsWith("<!--#!---")){
                let i = body.indexOf("-->");
                return ["TAIL",body.substr(9,i-9).trim()];
            }
            else return null;
        } else return null;
    },
};

function parsecommand(command: string, jobname: string): 
    {mapkey: string, template: string}
{
    let parts = command.split(' ');
    let mapkey = jobname + "-" + parts[1];
    let template = parts[2];
    return {mapkey, template};
}

function generateBody(job: RubahJobs, multi: boolean, mapkey: string, template: string, commentStyle: string, left: string): string[]{
    let rawbody = `generated-line${multi?'-multi':''} ${mapkey} DO NOT EDIT`;
    let body : string[] = [commentStyleParser[commentStyle](rawbody,"HEAD") as string];
    let {handle, params} = templateParser(template);
    if(job.rubah.helpers[handle]){
        let p: any[][];
        if(multi) p = job.rubah.iterate(params);
        else p = [params.map((x:any)=>job.rubah.data[x] || x)];
        body = body.concat( p.map(x=>job.rubah.helpers[handle](...x) ).reduce((p,c)=>p.concat(c),[]) );
    }else throw `unknown helper ${handle} with params ${params}`;
    body.push(commentStyleParser[commentStyle](mapkey,"TAIL") as string);
    body = body.map(x=>left+x);
    return body;
}

export async function line_write (job: RubahJobs, params: string[]): Promise<{ key: string; value: any; }[]> {
    let nl = job.newline?job.newline:job.rubah.config.newline?job.rubah.config.newline:"\n";
    let filename = path.join(job.location);
    let file = fs.readFileSync(filename).toString();
    let lines = file.split(nl);
    let res: string[] = [];
    let mode: string = null;
    let commentStyle = job.commentStyle || 'doubleslash';
    for(let line of lines){
        let left = line.substr(0,line.indexOf(line.trim()));
        let parsed = commentStyleParser[commentStyle](line.trim(),"PARSE");
        if(parsed && parsed[0] == "HEAD" && parsed[1].startsWith('line-writer')){
            let multi = false;
            if(parsed[1].startsWith('line-writer-multi'))
                multi = true;
            let {mapkey, template} = parsecommand(parsed[1], job.name);
            job.rubah.state[mapkey] = template;
            let body : string[] = generateBody(job,multi,mapkey,template,commentStyle,left)
            res = res.concat(body);
        } else if(parsed && parsed[0] == "HEAD" && parsed[1].startsWith('generated-line')){
            let multi = false;
            if(parsed[1].startsWith('generated-line-multi'))
                multi = true;
            let mapkey = parsed[1].split(' ')[1].trim();
            let template = job.rubah.state[mapkey];
            let body : string[] = generateBody(job,multi,mapkey,template,commentStyle,left)
            res = res.concat(body);
            mode = mapkey;
        } else if (mode!=null && parsed && parsed[0] == "TAIL" && parsed[1].split(' ')[1].trim()==mode) {
            mode = null;
        } else if (mode==null) {
            res.push(line);
        }
    }
    // console.log(res.join(nl));
    fs.writeFileSync(filename,res.join(nl))
    await job.rubah.writeMapping();
    return [];
}