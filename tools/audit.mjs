import fs from 'node:fs';

const PROTOTYPE = 'D:/download/bayanialert-prototype/bayanialert-prototype/index.html';
const PAGES = 'src/pages';
const html = fs.readFileSync(PROTOTYPE, 'utf8');

const sections = [];
const re = /<section class="([^"]*)" id="([^"]+)">/g;
let m;
while ((m = re.exec(html))) sections.push({ cls: m[1], id: m[2], start: m.index });
sections.forEach((s, i) => { s.end = i + 1 < sections.length ? sections[i + 1].start : html.length; });

function tokens(src) {
  const set = new Set();
  for (const mm of src.matchAll(/class="([^"]+)"/g)) mm[1].split(/\s+/).forEach(t => t && set.add(t));
  for (const mm of src.matchAll(/className="([^"]+)"/g)) mm[1].split(/\s+/).forEach(t => t && set.add(t));
  for (const mm of src.matchAll(/className=\{`([^`]+)`\}/g)) {
    mm[1].replace(/\$\{[^}]*\}/g, ' ').split(/\s+/).forEach(t => t && set.add(t));
    for (const lit of mm[1].matchAll(/'([a-zA-Z][\w-]*)'/g)) set.add(lit[1]);
  }
  return set;
}

const MAP = {
  'screen-welcome': 'Welcome.jsx',
  'screen-login': 'Login.jsx',
  'screen-register': 'Register.jsx',
  'screen-home': 'Home.jsx',
  'screen-board': 'Board.jsx',
  'screen-resourceDetail': 'ResourceDetail.jsx',
  'screen-thread': 'MessageThread.jsx',
  'screen-listResource': 'Board.jsx',
  'screen-myRequests': 'MyRequests.jsx',
  'screen-checkin': 'Checkin.jsx',
  'screen-weatherHistory': 'WeatherHistory.jsx',
  'screen-announcements': 'Announcements.jsx',
  'screen-profile': 'Profile.jsx',
  'screen-editProfile': 'EditProfile.jsx',
  'screen-directory': 'Directory.jsx',
  'screen-map': 'Map.jsx',
  'screen-evacDetail': 'EvacDetail.jsx',
};

const out = [];
for (const sec of sections) {
  const page = MAP[sec.id];
  if (!page) { out.push({ screen: sec.id, page: null, note: 'unmapped' }); continue; }
  const p = PAGES + '/' + page;
  if (!fs.existsSync(p)) { out.push({ screen: sec.id, page, note: 'MISSING FILE' }); continue; }
  const src = fs.readFileSync(p, 'utf8');
  const proto = tokens(html.slice(sec.start, sec.end));
  const react = tokens(src);
  const missing = [...proto].filter(c => !react.has(c)).sort();
  const sect = (src.match(/<section className="([^"]*)"/) || [])[1] || '(none)';
  out.push({
    screen: sec.id,
    page,
    sectionClass: sect,
    inlineStyle: /<style>/.test(src),
    missing,
  });
}

fs.writeFileSync('audit.json', JSON.stringify(out));
console.log('WROTE audit.json entries=' + out.length);
