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
exports.Rubah = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const relative = path_1.default.relative(__dirname, process.cwd());
class Rubah {
    constructor(config) {
        this.commands = {};
        this.state = {};
        this.data = {};
        this.helpers = {};
        this.config = config;
        console.log("reading rubah mapping");
        if (!config.mappingfile)
            config.mappingfile = "rubahmap.json";
        if (fs_1.default.existsSync(config.mappingfile)) {
            this.state = JSON.parse(fs_1.default.readFileSync(config.mappingfile).toString());
        }
        if (config.helpers) {
            for (let helper of config.helpers) {
                let temp;
                if (helper.startsWith('./'))
                    temp = require('./' + path_1.default.join(relative, helper.substr(2)));
                else
                    temp = require(path_1.default.join(relative, helper));
                for (let key of Object.keys(temp)) {
                    this.helpers[key] = temp[key];
                }
            }
        }
        if (config.commands) {
            for (let command of config.commands) {
                let temp;
                if (command.startsWith('./'))
                    temp = require('./' + path_1.default.join(relative, command.substr(2)));
                else
                    temp = require(path_1.default.join(relative, command));
                for (let key of Object.keys(temp)) {
                    this.commands[key] = temp[key];
                }
            }
        }
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`found ${this.config.jobs.length} job${this.config.jobs.length > 1 ? 's' : ''} generating...`);
            for (let job of this.config.jobs) {
                job.isGenerate = true;
                yield this.doJob(job);
            }
            console.log("rubah generate finished");
            return Promise.resolve(0);
        });
    }
    revert() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`found ${this.config.jobs.length} job${this.config.jobs.length > 1 ? 's' : ''} reverting...`);
            for (let job of this.config.jobs) {
                job.isGenerate = false;
                yield this.doJob(job);
            }
            console.log("rubah revert finished");
            return Promise.resolve(0);
        });
    }
    doJob(job) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`executing job ${job.name}`);
            let commands = job.command.split(" ");
            let handler = commands.shift();
            if (this.commands[handler]) {
                job.rubah = this;
                try {
                    let temp = yield this.commands[handler](job, commands);
                    for (let o of temp) {
                        this.data[o.key] = o.value;
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
            else {
                console.error(`\u001b[41mERROR: unknown handler ${handler} with params ${commands}\u001b[0m`);
            }
        });
    }
    writeMapping() {
        return __awaiter(this, void 0, void 0, function* () {
            let mf = this.config.mappingfile;
            fs_1.default.writeFileSync(mf, JSON.stringify(this.state, null, 2));
            return;
        });
    }
    iterate(params) {
        const rubah = this;
        function resolveParams(params, index) {
            return params.map((x, i) => Array.isArray(rubah.data[x]) ? rubah.data[x][i] : rubah.data[x]);
        }
        function next(index, maxIndex) {
            let nx = Array.from(index);
            nx[nx.length - 1] = nx[nx.length - 1] + 1;
            for (let i = nx.length - 1; i > 0; i--)
                if (nx[i] == maxIndex[i]) {
                    nx[i] = 0;
                    nx[i - 1] = nx[i - 1] + 1;
                }
            return nx;
        }
        let res = [];
        let currentIndex = params.map(x => 0);
        let maxIndex = params.map(x => Array.isArray(rubah.data[x]) ? this.data[x].length : 1);
        while (currentIndex[0] < maxIndex[0]) {
            res.push(resolveParams(params, currentIndex));
            currentIndex = next(currentIndex, maxIndex);
        }
        return res;
    }
}
exports.Rubah = Rubah;
exports.default = Rubah;
