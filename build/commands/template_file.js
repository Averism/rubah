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
exports.template_file = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function splitPath(text) {
    let current = text;
    let res = [];
    do {
        let next = path_1.default.dirname(current);
        res.push(next == '.' ? current : current.substr(next.length + 1));
        current = next;
    } while (current != '.');
    return res.reverse();
}
function writeIfNotExist(f, data) {
    if (!fs_1.default.existsSync(f)) {
        let splitted = splitPath(f);
        let partial = ".";
        for (let i = 0; i < splitted.length - 1; i++) {
            partial = path_1.default.join(partial, splitted[i]);
            if (!fs_1.default.existsSync(partial))
                fs_1.default.mkdirSync(partial);
        }
        fs_1.default.writeFileSync(f, data);
    }
}
function template_file(job, params) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!job.location) {
            console.error(`[rubah:template_file] Error: job doesn't have location property`);
            return [];
        }
        let templatePath = job.location;
        let bodyData = fs_1.default.readFileSync(templatePath).toString();
        let mode = params[0];
        let target;
        if (mode == "target") {
            target = [{ fn: params.slice(1).join(" "), body: bodyData }];
        }
        else if (mode == "source") {
            let sourceKey = params[1];
            let targetTemplate = params.slice(2).join(" ");
            if (typeof job.rubah.data[sourceKey] == "object") {
                target = Object.entries(job.rubah.data[sourceKey]).map(x => {
                    let fn = targetTemplate.split('${key}').join(x[0]);
                    fn = fn.split('${value}').join(x[1].toString());
                    let body = bodyData.split('${key}').join(x[0]);
                    body = body.split('${value}').join(x[1].toString());
                    return { fn, body };
                });
            }
            else {
                let v = job.rubah.data[sourceKey].toString();
                let fn = targetTemplate.split('${key}').join(sourceKey);
                fn = fn.split('${value}').join(v);
                let body = bodyData.split('${key}').join(sourceKey);
                body = body.split('${value}').join(v);
                target = [{ fn, body }];
            }
        }
        for (let o of target) {
            writeIfNotExist(o.fn, o.body);
        }
        let res = [];
        return res;
    });
}
exports.template_file = template_file;
