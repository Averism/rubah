import { RubahJobs } from "../models/RubahJobs";
export declare function line_write(job: RubahJobs, params: string[]): Promise<{
    key: string;
    value: any;
}[]>;
