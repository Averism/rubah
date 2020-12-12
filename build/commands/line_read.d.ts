import { RubahJobs } from "../models/RubahJobs";
export declare function line_read(job: RubahJobs, params: string[]): Promise<{
    key: string;
    value: any;
}[]>;
