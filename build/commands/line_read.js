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
exports.line_read = void 0;
const fs_1 = __importDefault(require("fs"));
const commentStyleParser_1 = require("../utils/commentStyleParser");
const parsecommand_1 = require("../utils/parsecommand");
const templateParser_1 = require("../utils/templateParser");
function line_read(job, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = [];
        if (!job.location)
            throw `line_read needs location property in ${job.name}`;
        let nl = job.newline ? job.newline : job.rubah.config.newline ? job.rubah.config.newline : "\n";
        let filename = job.location;
        let file = fs_1.default.readFileSync(filename).toString();
        let lines = file.split(nl);
        let commentStyle = job.commentStyle || 'doubleslash';
        let state = null;
        let chunk;
        for (let line of lines) {
            let left = line.substr(0, line.indexOf(line.trim()));
            let parsed = commentStyleParser_1.commentStyleParser[commentStyle](line.trim(), "PARSE");
            if (parsed && parsed[0] == "HEAD" && parsed[1].startsWith('line-read')) {
                let { key, mapkey, template } = parsecommand_1.parsecommand(parsed[1], job.name);
                if (typeof template == "string" && template.length > 3) {
                    let { handle, params } = templateParser_1.templateParser(template);
                    state = { key, handle, params, mapkey };
                }
                else {
                    state = { key, mapkey };
                }
                chunk = [];
            }
            else if (parsed && parsed[0] == "TAIL" && state && state.key && parsed[1].trim() == state.key) {
                let value = chunk;
                if (state.handle && job.rubah.helpers[state.handle]) {
                    value = templateParser_1.callHandler(job.rubah, state.handle, value, ...state.params);
                }
                res.push({ key: state.mapkey, value });
                state = null;
            }
            else if (parsed == null && state && state.key) {
                chunk.push(line.trim());
            }
        }
        return res;
    });
}
exports.line_read = line_read;
