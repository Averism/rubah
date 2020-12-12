import { RubahInterface } from "./interfaces/Rubah";
import { RubahJobs } from "./models/RubahJobs";
import { RubahOptions } from "./models/RubahOptions";
export declare class Rubah implements RubahInterface {
    constructor(config: RubahOptions);
    generate(): Promise<number>;
    revert(): Promise<number>;
    private doJob;
    writeMapping(): Promise<number>;
    iterate(params: string[]): any[][];
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
export default Rubah;
