import fs from 'fs'
import path from 'path'
const cwd: string = process.env.INIT_CWD;

let packageJson: any = JSON.parse(fs.readFileSync(path.join(cwd,"package.json")).toString());
const initialConfig = {
    "mappingfile": ".avermodule/rubah/rubahmapping.json",
    "helpers": ["rubah/build/helpers"],
    "commands": ["rubah/build/commands"],
    "jobpaths": [".avermodule/rubah/jobs/*.json"]
}
let configpath = path.join(cwd, packageJson.averModule.rubah.config);
let loadedConfig = fs.existsSync(configpath)? JSON.parse(fs.readFileSync(configpath).toString()): {};
loadedConfig = Object.assign(initialConfig, loadedConfig);
for(let moduleName in packageJson.averModule){
    let averModule = packageJson.averModule[moduleName];
    if(averModule.rubahCommands && Array.isArray(averModule.rubahCommands)){
        for(let cmd of averModule.rubahCommands){
            if(loadedConfig.commands.indexOf(cmd)==-1)
                loadedConfig.commands.push(cmd);
        }
    }
    if(averModule.rubahHelpers && Array.isArray(averModule.rubahHelpers)){
        for(let hlp of averModule.rubahHelpers){
            if(loadedConfig.helpers.indexOf(hlp)==-1)
                loadedConfig.helpers.push(hlp);
        }
    }
}

fs.writeFileSync(configpath,JSON.stringify(loadedConfig,null,2));