import { RubahInterface } from "../interfaces/Rubah";

export class RubahJobs {
    name: string;
    command: string;
    isGenerate: boolean;
    dependson?: string[];
    location?: string;
    module?: string;
    filter?: string;
    newline?: string;
    commentStyle?: string;
    data?: any;
    rubah: RubahInterface;
}