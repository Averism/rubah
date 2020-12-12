"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.select = void 0;
function select(obj, ...paths) {
    let current = obj;
    for (let path of paths)
        current = current[path];
    return [current];
}
exports.select = select;
