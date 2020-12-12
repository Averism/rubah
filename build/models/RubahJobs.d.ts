import { RubahInterface } from "../interfaces/Rubah";
export declare class RubahJobs {
    name: string;
    command: string;
    isGenerate: boolean;
    location?: string;
    module?: string;
    filter?: string;
    newline?: string;
    commentStyle?: string;
    rubah: RubahInterface;
}
