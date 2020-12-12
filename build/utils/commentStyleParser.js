"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentStyleParser = void 0;
exports.commentStyleParser = {
    "doubleslash": (body, type) => {
        if (type == "HEAD")
            return "//!" + body;
        else if (type == "TAIL")
            return "//---";
        else if (body.startsWith("//")) {
            if (body.startsWith("//!"))
                return ["HEAD", body.substr(3).trim()];
            else if (body.startsWith("//---"))
                return ["TAIL", body.substr(5).trim()];
            else
                return null;
        }
        else
            return null;
    },
    "html": (body, type) => {
        if (type == "HEAD")
            return "<!--#!" + body + "-->";
        else if (type == "TAIL")
            return "<!--#!---" + body + "-->";
        else if (body.startsWith("<!--")) {
            if (body.startsWith("<!--#!")) {
                if (body.startsWith("<!--#!---")) {
                    let i = body.indexOf("-->");
                    return ["TAIL", body.substr(9, i - 9).trim()];
                }
                let i = body.indexOf("-->");
                return ["HEAD", body.substr(6, i - 6).trim()];
            }
            else
                return null;
        }
        else
            return null;
    },
};
