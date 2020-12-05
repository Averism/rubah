import { RubahInterface } from "../interfaces/Rubah";

export class RubahJobs {
    name: string;
    command: string;
    location?: string;
    module?: string;
    filter?: string;
    newline?: string;
    commentStyle?: string
    rubah: RubahInterface;
}