import { RubahJobs } from "../models/RubahJobs";
import { RubahOptions } from "../models/RubahOptions";
export interface RubahInterface {
    generate: () => Promise<number>;
    revert: () => Promise<number>;
    writeMapping: () => Promise<number>;
    iterate: (params: string[]) => any[][];
    commands: {
        [key: string]: (job: RubahJobs, params: string[]) => Promise<{
            key: string;
            value: any;
        }[]>;
    };
    config: RubahOptions;
    state: any;
    data: any;
    helpers: {
        [key: string]: Function;
    };
}
