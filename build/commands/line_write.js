"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.line_write = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const commentStyleParser_1 = require("../utils/commentStyleParser");
const parsecommand_1 = require("../utils/parsecommand");
const templateParser_1 = require("../utils/templateParser");
function generateBody(job, multi, mapkey, template, commentStyle, left) {
    let rawbody = `generated-line${multi ? '-multi' : ''} ${mapkey} DO NOT EDIT`;
    let body = [commentStyleParser_1.commentStyleParser[commentStyle](rawbody, "HEAD")];
    let { handle, params } = templateParser_1.templateParser(template);
    // if(job.rubah.helpers[handle]){
    //     let p: any[][];
    //     if(multi) p = job.rubah.iterate(params);
    //     else p = [params.map((x:any)=>job.rubah.data[x] || x)];
    //     body = body.concat( p.map(x=>job.rubah.helpers[handle](...x) ).reduce((p,c)=>p.concat(c),[]) );
    // }else throw `unknown helper ${handle} with params ${params}`;
    let temp = templateParser_1.callHandler(job.rubah, handle, ...params);
    if (Array.isArray(temp))
        body = body.concat(temp);
    else
        body.push(temp);
    body.push(commentStyleParser_1.commentStyleParser[commentStyle](mapkey, "TAIL"));
    body = body.map(x => left + x);
    return body;
}
function line_write(job, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let nl = job.newline ? job.newline : job.rubah.config.newline ? job.rubah.config.newline : "\n";
        let filename = path_1.default.join(job.location);
        let file = fs_1.default.readFileSync(filename).toString();
        let lines = file.split(nl);
        let res = [];
        let mode = null;
        let commentStyle = job.commentStyle || 'doubleslash';
        for (let line of lines) {
            let left = line.substr(0, line.indexOf(line.trim()));
            let parsed = commentStyleParser_1.commentStyleParser[commentStyle](line.trim(), "PARSE");
            if (parsed && parsed[0] == "HEAD" && parsed[1].startsWith('line-writer')) {
                let multi = false;
                if (parsed[1].startsWith('line-writer-multi'))
                    multi = true;
                let { mapkey, template } = parsecommand_1.parsecommand(parsed[1], job.name);
                job.rubah.state[mapkey] = template;
                let body = generateBody(job, multi, mapkey, template, commentStyle, left);
                res = res.concat(body);
            }
            else if (parsed && parsed[0] == "HEAD" && parsed[1].startsWith('generated-line')) {
                let multi = false;
                if (parsed[1].startsWith('generated-line-multi'))
                    multi = true;
                let mapkey = parsed[1].split(' ')[1].trim();
                let name = mapkey.split('_').slice(1).join('_');
                let template = job.rubah.state[mapkey];
                let body = generateBody(job, multi, mapkey, template, commentStyle, left);
                res = job.isGenerate ? res.concat(body) :
                    res.concat(commentStyleParser_1.commentStyleParser[commentStyle](['line-writer' + (multi ? '-multi' : ''), name, template].join(" "), "HEAD"));
                mode = mapkey;
            }
            else if (mode != null && parsed && parsed[0] == "TAIL" && parsed[1].trim() == mode) {
                mode = null;
            }
            else if (mode == null) {
                res.push(line);
            }
        }
        // console.log(res.join(nl));
        fs_1.default.writeFileSync(filename, res.join(nl));
        yield job.rubah.writeMapping();
        return [];
    });
}
exports.line_write = line_write;
