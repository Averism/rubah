"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateParser = exports.callHandler = void 0;
const templateRegex = /(\w+)\((@?[\w\.]*(\s*,\s*@?[\w\.]*)*)\)/;
const temporaryVariablePrefix = 'temporaryvariableprefixsolongthatithavepracticallyzerochancetobeused';
function isHandlerFunc(x) { return x.handle && x.params; }
function traverse(obj, key) {
    let current = obj;
    let keys = key.split('.');
    for (let k of keys) {
        if (typeof current[k] == "undefined")
            return undefined;
        current = current[k];
    }
    return current;
}
function evalueateStringParam(x, data) {
    if (x.startsWith('@')) {
        x = x.substr(1);
        let temp = traverse(data, x);
        if (Array.isArray(temp))
            temp = temp.map(x => x.toString());
        return temp;
    }
    else {
        return x;
    }
}
function callHandler(rubah, handler, ...params) {
    let handlerList = rubah.helpers;
    let data = rubah.data;
    if (typeof handlerList[handler] == "undefined")
        throw "unknown handler " + handler;
    let evaluatedParams = params.map(x => {
        if (typeof x == "string") {
            return evalueateStringParam(x, data);
        }
        else if (isHandlerFunc(x)) {
            return callHandler(rubah, x.handle, ...x.params);
        }
        else if (Array.isArray(x)) {
            return x.map(y => evalueateStringParam(y, data).toString());
        }
        return "";
    });
    let isMulti = evaluatedParams.map((x) => Array.isArray(x)).reduce((p, c) => p || c, false);
    if (isMulti) {
        let l = evaluatedParams.map(x => Array.isArray(x) ? x.length : 1);
        let s = l.map((x, i, arr) => i == arr.length - 1 ? 1 : arr.slice(i + 1).reduce((p, c) => p * c));
        let n = l.reduce((p, c) => p * c, 1);
        let allParams = (new Array(n)).fill(0).map((x, i) => {
            return l.map((z, j) => {
                let idx = Math.floor(i / s[j]) % z;
                return Array.isArray(evaluatedParams[j]) ? evaluatedParams[j][idx] : evaluatedParams[j];
            });
        });
        return allParams.map(x => handlerList[handler](...x)).reduce((p, c) => {
            if (Array.isArray(c))
                p = p.concat(c);
            else
                p.push(c);
            return p;
        }, []);
    }
    else {
        return handlerList[handler](...evaluatedParams);
    }
    return;
}
exports.callHandler = callHandler;
function templateParser(template) {
    let done = false;
    let current = template;
    let varStore = {};
    let i = 0;
    let res;
    do {
        let temp = templateRegex.exec(template);
        if (temp[1]) {
            if (temp[0].length == current.length) {
                res = {
                    handle: temp[1],
                    params: temp[2].split(',').map(x => x.trim())
                };
                done = true;
            }
            else {
                let n = temporaryVariablePrefix + i;
                varStore[n] = {
                    handle: temp[1],
                    params: temp[2].split(',').map(x => x.trim())
                };
                current = current.replace(temp[0], n);
            }
        }
        else
            throw `cannot parse ${template}`;
    } while (!done);
    res = remap(varStore, res);
    return res;
}
exports.templateParser = templateParser;
function remap(varStore, root) {
    root.params = root.params.map(x => {
        if (typeof x == "string" && varStore[x])
            x = remap(varStore, varStore[x]);
        return x;
    });
    return root;
}
// export function templateParser(template: string): { handle: string; params: string[]; } {
//     let done = false;
//     do{
//         let temp = templateRegex.exec(template);
//         if (temp[1]) {
//             return { handle: temp[1], params: temp[2].split(',').map(x => x.trim()) };
//         } else
//             throw `cannot parse ${template}`;
//     }while(!done)
// }
