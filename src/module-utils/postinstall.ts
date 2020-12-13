import fs from 'fs'
import path from 'path'
const cwd: string = process.env.INIT_CWD;

//SETTING UP package.json
let packageJson: any = JSON.parse(fs.readFileSync(path.join(cwd,"package.json")).toString());
if(!packageJson.averModule) packageJson.averModule = {};
packageJson.averModule.rubah = {
    config: ".avermodule/rubah/rubahconfig.json",
    firstrun: true
}

packageJson.scripts.preprocess = "rubah generate";
packageJson.scripts.revertTemplate = "rubah revert";
fs.writeFileSync(path.join(cwd,"package.json"),JSON.stringify(packageJson,null,2));

//initializing rubah folder
if(!fs.existsSync(path.join(cwd, ".avermodule"))) fs.mkdirSync(path.join(cwd, ".avermodule"));
if(!fs.existsSync(path.join(cwd, ".avermodule", "rubah"))) fs.mkdirSync(path.join(cwd, ".avermodule", "rubah"));


//load config
const initialConfig = {
    "mappingfile": ".avermodule/rubah/rubahmapping.json",
    "helpers": ["rubah/build/helpers"],
    "commands": ["rubah/build/commands"],
    "jobpaths": [".avermodule/rubah/jobs/*.json"]
}
let configpath = path.join(cwd, packageJson.averModule.rubah.config);
let loadedConfig = fs.existsSync(configpath)? JSON.parse(fs.readFileSync(configpath).toString()): {};
loadedConfig = Object.assign(initialConfig, loadedConfig);
fs.writeFileSync(configpath,JSON.stringify(loadedConfig,null,2));
