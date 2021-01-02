import { RubahJobs } from "../models/RubahJobs";
export declare function glob(job: RubahJobs, params: string[]): Promise<{
    key: string;
    value: any;
}[]>;
