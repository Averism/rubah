import { RubahJobs } from "../models/RubahJobs";
import fs from "fs";
import path from "path";

function splitPath(text: string){
    let current = text;
    let res: string[] = [];
    do{
        let next = path.dirname(current);
        res.push(next=='.'?current:current.substr(next.length+1));
        current = next;
    }while(current!='.');
    return res.reverse();
}

function writeIfNotExist(f: string, data: string){
    if(!fs.existsSync(f)) {
        let splitted = splitPath(f);
        let partial = ".";
        for(let i=0; i< splitted.length-1; i++){
            partial = path.join(partial,splitted[i]);
            if(!fs.existsSync(partial)) fs.mkdirSync(partial);
        }
        fs.writeFileSync(f, data);
    }
}

export async function template_file(job: RubahJobs, params: string[]): Promise<{ key: string; value: any; }[]>{
    if(!job.location) {
        console.error(`[rubah:template_file] Error: job doesn't have location property`);
        return [];
    }
    let templatePath: string = job.location;
    let bodyData = fs.readFileSync(templatePath).toString();
    let mode = params[0];
    let target: {fn: string, body: string}[];
    if(mode == "target"){
        target = [{fn: params.slice(1).join(" "), body: bodyData}];
    }else if(mode == "source"){
        let sourceKey = params[1];
        let targetTemplate = params.slice(2).join(" ");
        if(typeof job.rubah.data[sourceKey] == "object") {
            target = Object.entries(job.rubah.data[sourceKey]).map(x=>{
                let fn = targetTemplate.split('${key}').join(x[0]);
                fn = fn.split('${value}').join(x[1].toString());
                let body = bodyData.split('${key}').join(x[0]);
                body = body.split('${value}').join(x[1].toString());
                return {fn, body};
            })
        } else {
            let v = job.rubah.data[sourceKey].toString();
            let fn = targetTemplate.split('${key}').join(sourceKey);
            fn = fn.split('${value}').join(v);
            let body = bodyData.split('${key}').join(sourceKey);
            body = body.split('${value}').join(v);
            target = [{fn, body}];
        }
    }
    for(let o of target){
        writeIfNotExist( o.fn, o.body );
    }
    let res: { key: string; value: any; }[] = [];
    return res;
}