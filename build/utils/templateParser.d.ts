import { RubahInterface } from "../interfaces/Rubah";
export declare type HandlerFunc = {
    handle: string;
    params: HandlerParam[];
};
export declare type HandlerParam = string[] | string | HandlerFunc;
export declare function callHandler(rubah: RubahInterface, handler: string, ...params: HandlerParam[]): string | string[];
export declare function templateParser(template: string): HandlerFunc;
