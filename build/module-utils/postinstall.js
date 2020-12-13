"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cwd = process.env.INIT_CWD;
//SETTING UP package.json
let packageJson = JSON.parse(fs_1.default.readFileSync(path_1.default.join(cwd, "package.json")).toString());
if (!packageJson.averModule)
    packageJson.averModule = {};
packageJson.averModule.rubah = {
    reconfigure: "rubah reconfigure",
    config: ".avermodule/rubah/rubahconfig.json",
    priority: 1,
    firstrun: true
};
packageJson.scripts.preprocess = "rubah generate";
packageJson.scripts.revertTemplate = "rubah revert";
//initializing rubah folder
if (!fs_1.default.existsSync(path_1.default.join(cwd, ".avermodule")))
    fs_1.default.mkdirSync(path_1.default.join(cwd, ".avermodule"));
if (!fs_1.default.existsSync(path_1.default.join(cwd, "rubah")))
    fs_1.default.mkdirSync(path_1.default.join(cwd, "rubah"));
//load config
const initialConfig = {
    "mappingfile": ".avermodule/rubah/rubahmapping.json",
    "helpers": ["rubah/build/helpers"],
    "commands": ["rubah/build/commands"],
    "jobpaths": [".avermodule/rubah/jobs/*.json"]
};
let configpath = path_1.default.join(cwd, packageJson.averModule.rubah.config);
let loadedConfig = fs_1.default.existsSync(configpath) ? JSON.parse(fs_1.default.readFileSync(configpath).toString()) : {};
loadedConfig = Object.assign(initialConfig, loadedConfig);
fs_1.default.writeFileSync(configpath, JSON.stringify(loadedConfig, null, 2));
