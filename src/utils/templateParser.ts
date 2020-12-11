const templateRegex = /^(\w+)\((\w*(\s*,\s*\w*)*)\)$/;
export function templateParser(template: string): { handle: string; params: string[]; } {
    let temp = templateRegex.exec(template);
    if (temp[1]) {
        return { handle: temp[1], params: temp[2].split(',').map(x => x.trim()) };
    } else
        throw `cannot parse ${template}`;
}
