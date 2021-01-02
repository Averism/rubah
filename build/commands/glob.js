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
exports.glob = void 0;
const glob_1 = __importDefault(require("glob"));
function glob(job, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let locations = glob_1.default.sync(job.location);
        let res = [];
        let cmd = job.rubah.commands[params[0]];
        if (!cmd)
            console.error(`[rubah glob command] Error, command ${cmd} is not recognized`);
        else {
            for (let location of locations) {
                let newJob = Object.assign({}, job);
                newJob.location = location;
                newJob.name = job.name + "_" + location;
                res = res.concat(yield cmd(newJob, params.slice(1)));
            }
        }
        return res;
    });
}
exports.glob = glob;
