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
            if(body.startsWith("//!")) return ["HEAD",body.substr(3)];
            else if(body.startsWith("//---")) return ["TAIL",body.substr(5)];
            else return null;
        } else return null;
    },
    "html": (body: string, type: string):string|string[] => {
        if(type == "HEAD") return "<!--#!"+body+"-->";
        else if (type == "TAIL") return "<!--#!---"+body+"-->";
        else if (body.startsWith("<!--")) {
            if(body.startsWith("<!--#!")){
                let i = body.indexOf("-->");
                return ["HEAD",body.substr(6,i-6)];
            }
            else if(body.startsWith("<!--#!---")){
                let i = body.indexOf("-->");
                return ["TAIL",body.substr(9,i-9)];
            }
            else return null;
        } else return null;
    },
};

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
            let parts = parsed[1].split(' ');
            let mapkey = job.name + "-" + parts[1];
            let template = parts[2];
            job.rubah.state[mapkey] = line.trim();
            let {handle, params} = templateParser(template);
            let rawbody = `rubah-generated${multi?'-multi':''} ${mapkey} DO NOT EDIT`;
            let body : string[] = [commentStyleParser[commentStyle](rawbody,"HEAD") as string];
            if(job.rubah.helpers[handle]){
                let p: any[][];
                if(multi) p = job.rubah.iterate(params);
                else p = [params.map((x:any)=>job.rubah.data[x] || x)];
                body = body.concat( p.map(x=>job.rubah.helpers[handle](...x) ).reduce((p,c)=>p.concat(c),[]) );
            }else throw `unknown helper ${handle} with params ${params}`
            body.push(commentStyleParser[commentStyle](mapkey,"TAIL") as string);
            body = body.map(x=>left+x);
            res = res.concat(body);
        } else if(parsed && parsed[0] == "HEAD" && parsed[1].startsWith('rubah-generated')){
            let multi = false;
            if(parsed[1].startsWith('rubah-generated-multi'))
                multi = true;
            let mapkey = line.trim().split(' ')[1];
            mode = mapkey;
        } else if (mode!=null && parsed && parsed[0] == "TAIL" && parsed[1]==mode) {
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