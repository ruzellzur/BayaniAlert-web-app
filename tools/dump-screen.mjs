import fs from 'node:fs';

const SRC = 'D:/download/bayanialert-prototype/bayanialert-prototype/index.html';
const OUT = 'C:/Users/ruzel/AppData/Local/Temp/';
const lines = fs.readFileSync(SRC, 'utf8').split(/\r?\n/);

const [id, a, b] = process.argv.slice(2);
const start = parseInt(a, 10) - 1;
const end = parseInt(b, 10) - 1;

const chunk = [];
for (let i = start; i <= end && i < lines.length; i++) chunk.push(lines[i]);

fs.writeFileSync(OUT + 'S_' + id + '.txt', JSON.stringify(chunk.join('\n')));
console.log('WROTE S_' + id + '.txt chars=' + chunk.join('\n').length);
