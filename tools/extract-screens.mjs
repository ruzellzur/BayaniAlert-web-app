// Extract prototype screens to temp files with < > " swapped for safe tokens,
// so downstream readers cannot mangle markup.
import fs from 'node:fs';

const SRC = 'D:/download/bayanialert-prototype/bayanialert-prototype/index.html';
const OUT = 'C:/Users/ruzel/AppData/Local/Temp/';

const html = fs.readFileSync(SRC, 'utf8');
const lines = html.split(/\r?\n/);

const IDS = [
  'screen-thread',
  'screen-listResource',
  'screen-myRequests',
  'screen-weatherHistory',
  'screen-announcements',
  'screen-profile',
  'screen-editProfile',
  'screen-directory',
  'screen-home',
];

const tx = (s) =>
  s.replace(/</g, '~L~').replace(/>/g, '~G~').replace(/"/g, '~Q~');

for (const id of IDS) {
  const start = lines.findIndex((l) => l.includes(`id="${id}"`));
  if (start < 0) {
    console.log(`MISS ${id}`);
    continue;
  }
  // Walk forward until the matching </section> at the same indent.
  const indent = lines[start].match(/^\s*/)[0];
  let end = start;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i] === indent + '</section>') {
      end = i;
      break;
    }
  }
  const slice = [];
  for (let i = start; i <= end; i++) slice.push(i + 1 + '|' + lines[i]);
  fs.writeFileSync(OUT + id + '.txt', tx(slice.join('\n')));
  console.log(`${id} lines ${start + 1}-${end + 1} (${end - start + 1})`);
}
