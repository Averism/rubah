import { RubahJobs } from "./RubahJobs";

export class RubahOptions {
    jobs: RubahJobs[];
    mappingfile?: string;
    newline?: string;
    helpers?: string[];
    commands?: string[];
}