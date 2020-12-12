"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsecommand = void 0;
function parsecommand(command, jobname) {
    let parts = command.split(' ');
    let key = parts[1];
    let mapkey = jobname + "_" + key;
    let template = parts[2];
    return { key, mapkey, template };
}
exports.parsecommand = parsecommand;
