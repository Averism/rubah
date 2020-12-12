import { RubahJobs } from "../models/RubahJobs";
export declare function load_json(job: RubahJobs, params: string[]): Promise<{
    key: string;
    value: any;
}[]>;
