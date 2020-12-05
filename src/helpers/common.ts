export function select(obj: any, ...paths: string[]):string[] {
    let current = obj;
    for(let path of paths) current = current[path];
    return [current];
}