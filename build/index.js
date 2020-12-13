#!/usr/bin/env node
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
const RubahOptions_1 = require("./models/RubahOptions");
const Rubah_1 = __importDefault(require("./Rubah"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = __importDefault(require("glob"));
function getJobs(config) {
    let jobsfile = [];
    let jobs = [];
    let jobsqueued = [];
    for (let jobpath of config.jobpaths) {
        jobsfile = jobsfile.concat(glob_1.default.sync(jobpath));
    }
    for (let jobfile of jobsfile) {
        let job = JSON.parse(fs_1.default.readFileSync(jobfile).toString());
        job.name = path_1.default.basename(jobfile).substr(0, path_1.default.basename(jobfile).length - path_1.default.extname(jobfile).length);
        let checkname = jobs.filter(x => x.name == job.name).length > 0;
        if (checkname)
            console.error(`\u001b[41mERROR: job ${job.name} are already exists\u001b[0m`);
        if (job.dependson) {
            let dependency = jobs.filter(x => job.dependson.indexOf(x.name) > -1).length == job.dependson.length;
            if (dependency)
                jobs.push(job);
            else
                jobsqueued.push(job);
        }
        else {
            jobs.push(job);
        }
    }
    let delta = -1;
    while (jobsqueued.length > 0 && delta != 0) {
        let next = [];
        for (let job of jobsqueued) {
            let dependency = jobs.filter(x => job.dependson.indexOf(x.name) > -1).length == job.dependson.length;
            if (dependency)
                jobs.push(job);
            else
                next.push(job);
        }
        delta = jobsqueued.length - next.length;
        jobsqueued = next;
    }
    if (jobsqueued.length > 0) {
        for (let job of jobsqueued) {
            let found = jobs.filter(x => job.dependson.indexOf(x.name) > -1).map(x => x.name);
            let notfound = job.dependson.filter(x => found.indexOf(x) > -1);
            console.error(`\u001b[41mERROR: job ${job.name} cannot find dependency of ${notfound}\u001b[0m`);
        }
    }
    return jobs;
}
function main(mode) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = new RubahOptions_1.RubahOptions();
        config = Object.assign(config, JSON.parse(fs_1.default.readFileSync(".avermodule/rubah/rubahconfig.json").toString()));
        let rubah = new Rubah_1.default(config);
        config.jobs = getJobs(config);
        switch (mode) {
            //!line-read maincommand getwordbetween(case,await)
            case 'generate':
                yield rubah.generate();
                break;
            case 'revert':
                yield rubah.revert();
                break;
            //---maincommand
            case 'reconfigure':
                require('./module-utils/reconfigure');
                break;
            default: console.error("[tsemplate error] UNKNOWN MODE:", mode);
        }
        return 0;
    });
}
exports.default = main;
main(process.argv[2]);
