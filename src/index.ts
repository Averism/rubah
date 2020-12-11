#!/usr/bin/env node
import { RubahOptions } from "./models/RubahOptions";
import Rubah from "./Rubah";
import fs from 'fs'

export default async function main(mode: string):Promise<number>{
    let config: RubahOptions = new RubahOptions();
    config = Object.assign(config, JSON.parse(fs.readFileSync("rubahconfig.json").toString()));
    let rubah = new Rubah(config);
    switch(mode){
        //!line-read maincommand getwordbetween(case,await)
        case 'generate': await rubah.generate(); break;
        case 'revert': await rubah.revert(); break;
        //---maincommand
        case 'reconfigure': require('./module-utils/reconfigure'); break;
        default: console.error("[tsemplate error] UNKNOWN MODE:",mode)
    }
    return 0;
}

main(process.argv[2]); 