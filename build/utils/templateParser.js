"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateParser = void 0;
const templateRegex = /^(\w+)\((\w*(\s*,\s*\w*)*)\)$/;
function templateParser(template) {
    let temp = templateRegex.exec(template);
    if (temp[1]) {
        return { handle: temp[1], params: temp[2].split(',').map(x => x.trim()) };
    }
    else
        throw `cannot parse ${template}`;
}
exports.templateParser = templateParser;
