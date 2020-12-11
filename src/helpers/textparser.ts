let word = [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
]
word = word.concat(word.map(x=>x.toLowerCase()));
word = word.concat([
    '0','1','2','3','4','5','6','7','8','9'
])


export function getwordbetween(texts: string[], start: string, end: string):string[] {
    return texts
    .map(x=>x.split(end)[0].split(start)[1])
    .filter(x=>x)
    .map(x=>x.split('').filter(x=>word.indexOf(x)>-1).join(''))
    .filter(x=>x&&x.length>0);
}