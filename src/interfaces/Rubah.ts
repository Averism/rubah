import { RubahJobs } from "../models/RubahJobs";
import { RubahOptions } from "../models/RubahOptions";

export interface RubahInterface {
    generate: ()=>Promise<number>;
    revert: ()=>Promise<number>;
    writeMapping: ()=>Promise<number>;
    iterate: (params: string[])=> any[][];
    commands: {[key: string]: (job: RubahJobs, params: string[])=>Promise<{key: string, value: any}[]>}
    config: RubahOptions;
    /**
     * the property to hold state: that is value in original template but replaced by generated content
     */
    state: any;
    /**
     * the current data held from previous read job in rubah data repository
     */
    data: any;
    helpers: {[key: string]: Function};
}