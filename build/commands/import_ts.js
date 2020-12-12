"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.import_ts = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function import_ts(job, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const relative = path_1.default.relative(__dirname, process.cwd());
        let res = [];
        switch (params[0]) {
            case 'single':
                let temp = yield Promise.resolve().then(() => __importStar(require('./' + path_1.default.join(relative, ...job.location))));
                if (job.module)
                    temp = temp[job.module];
                res.push({ key: job.name, value: temp });
                break;
            case 'folder':
                let temp2 = [];
                let folder = path_1.default.join(...job.location);
                let files = fs_1.default.readdirSync(folder);
                let regex = job.filter ? new RegExp(job.filter) : /./;
                for (let file of files) {
                    if (!file.endsWith('.ts'))
                        continue;
                    if (!regex.test(file))
                        continue;
                    let filename = file.substr(0, file.length - 3);
                    let temp = yield Promise.resolve().then(() => __importStar(require('./' + path_1.default.join(relative, ...job.location, filename))));
                    if (job.module)
                        temp = temp[job.module];
                    temp2.push(temp);
                }
                res.push({ key: job.name, value: temp2 });
                break;
            default: throw "invalid option for import-ts, expected single or folder, but found: " + params[0];
        }
        return res;
    });
}
exports.import_ts = import_ts;
