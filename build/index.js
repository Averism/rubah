#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RubahOptions_1 = require("./models/RubahOptions");
const Rubah_1 = __importDefault(require("./Rubah"));
const fs_1 = __importDefault(require("fs"));
function main(mode) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = new RubahOptions_1.RubahOptions();
        config = Object.assign(config, JSON.parse(fs_1.default.readFileSync("rubahconfig.json").toString()));
        let rubah = new Rubah_1.default(config);
        switch (mode) {
            //!line-read maincommand getwordbetween(case,await)
            case 'generate':
                yield rubah.generate();
                break;
            case 'revert':
                yield rubah.revert();
                break;
            //---maincommand
            case 'reconfigure':
                require('./module-utils/reconfigure');
                break;
            default: console.error("[tsemplate error] UNKNOWN MODE:", mode);
        }
        return 0;
    });
}
exports.default = main;
main(process.argv[2]);
