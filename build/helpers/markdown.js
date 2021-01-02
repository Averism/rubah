"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mdcopyright = exports.mdselect = void 0;
const mdformatter = {
    h1: (body) => "# " + body,
    code: (body) => "``` " + body + "```"
};
function mdselect(format, obj, ...paths) {
    let current = obj;
    for (let path of paths)
        current = current[path];
    return [mdformatter[format](current)];
}
exports.mdselect = mdselect;
function mdcopyright(pkg, year) {
    switch (pkg.license) {
        case 'GPL-3.0': return [
            `### ${pkg.name} -- ${pkg.description}`,
            ``,
            `Copyright (C) ${year} ${pkg.author}`,
            ``,
            `This program is free software: you can redistribute it and/or modify`,
            `it under the terms of the GNU General Public License as published by`,
            `the Free Software Foundation, either version 3 of the License, or`,
            `(at your option) any later version.`,
            ``,
            `This program is distributed in the hope that it will be useful,`,
            `but WITHOUT ANY WARRANTY; without even the implied warranty of`,
            `MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the`,
            `GNU General Public License for more details.`,
            ``,
            `You should have received a copy of the GNU General Public License`,
            `along with this program.  If not, see <https://www.gnu.org/licenses/>.`
        ];
    }
}
exports.mdcopyright = mdcopyright;
