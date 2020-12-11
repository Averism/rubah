export function parsecommand(command: string, jobname: string): { key: string, mapkey: string, template: string } {
    let parts = command.split(' ');
    let key = parts[1];
    let mapkey = jobname + "_" + key;
    let template = parts[2];
    return { key, mapkey, template };
}
