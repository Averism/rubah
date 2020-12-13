"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cwd = process.env.INIT_CWD;
let packageJson = JSON.parse(fs_1.default.readFileSync(path_1.default.join(cwd, "package.json")).toString());
const initialConfig = {
    "mappingfile": ".avermodule/rubah/rubahmapping.json",
    "helpers": ["rubah/build/helpers"],
    "commands": ["rubah/build/commands"],
    "jobpaths": [".avermodule/rubah/jobs/*.json"]
};
let configpath = path_1.default.join(cwd, packageJson.averModule.rubah.config);
let loadedConfig = fs_1.default.existsSync(configpath) ? JSON.parse(fs_1.default.readFileSync(configpath).toString()) : {};
loadedConfig = Object.assign(initialConfig, loadedConfig);
for (let moduleName in packageJson.averModule) {
    let averModule = packageJson.averModule[moduleName];
    if (averModule.rubahCommands && Array.isArray(averModule.rubahCommands)) {
        for (let cmd of averModule.rubahCommands) {
            if (loadedConfig.commands.indexOf(cmd) == -1)
                loadedConfig.commands.push(cmd);
        }
    }
    if (averModule.rubahHelpers && Array.isArray(averModule.rubahHelpers)) {
        for (let hlp of averModule.rubahHelpers) {
            if (loadedConfig.helpers.indexOf(hlp) == -1)
                loadedConfig.helpers.push(hlp);
        }
    }
}
fs_1.default.writeFileSync(configpath, JSON.stringify(loadedConfig, null, 2));
