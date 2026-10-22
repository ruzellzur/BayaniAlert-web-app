// Parity report: compares class tokens used by the static prototype against
// the class names emitted by the React pages. Writes a compact report to
// ../parity-report.txt so the result survives stdout truncation.
import fs from 'node:fs';
import path from 'node:path';

const PROTOTYPE = 'D:/download/bayanialert-prototype/bayanialert-prototype/index.html';
const PAGES = 'src/pages';
const OUT = 'parity-report.txt';

const html = fs.readFileSync(PROTOTYPE, 'utf8');

// Split the prototype into per-screen sections so we can compare per page.
const sections = [];
const screenRe = /<section class="screen[^"]*" id="([^"]+)">/g;
let m;
while ((m = screenRe.exec(html))) {
  sections.push({ id: m[1], start: m.index });
}
sections.forEach((s, i) => {
  s.end = i + 1 < sections.length ? sections[i + 1].start : html.length;
});

function classTokens(source) {
  const set = new Set();
  // static class="a b c"
  for (const mm of source.matchAll(/class="([^"]+)"/g)) {
    mm[1].split(/\s+/).forEach((t) => t && set.add(t));
  }
  // JSX className="a b"
  for (const mm of source.matchAll(/className="([^"]+)"/g)) {
    mm[1].split(/\s+/).forEach((t) => t && set.add(t));
  }
  // JSX template strings: className={`chip ${x ? 'active' : ''}`}
  for (const mm of source.matchAll(/className=\{`([^`]+)`\}/g)) {
    mm[1].replace(/\$\{[^}]*\}/g, ' ').split(/\s+/).forEach((t) => t && set.add(t));
    for (const lit of mm[1].matchAll(/'([a-zA-Z][\w-]*)'/g)) set.add(lit[1]);
  }
  return set;
}

// Map prototype screen id -> React page file
const SCREEN_TO_PAGE = {
  'screen-welcome': 'Welcome.jsx',
  'screen-login': 'Login.jsx',
  'screen-register': 'Register.jsx',
  'screen-home': 'Home.jsx',
  'screen-board': 'Board.jsx',
  'screen-resourceDetail': 'ResourceDetail.jsx',
  'screen-messageThread': 'MessageThread.jsx',
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

const lines = [];
lines.push('PROTOTYPE CLASS PARITY REPORT');
lines.push('='.repeat(60));

for (const sec of sections) {
  const page = SCREEN_TO_PAGE[sec.id];
  const body = html.slice(sec.start, sec.end);
  const protoClasses = classTokens(body);
  if (!page) {
    lines.push(`\n[?] ${sec.id} — no React page mapped`);
    continue;
  }
  const pagePath = path.join(PAGES, page);
  if (!fs.existsSync(pagePath)) {
    lines.push(`\n[!] ${sec.id} -> ${page} MISSING FILE`);
    continue;
  }
  const src = fs.readFileSync(pagePath, 'utf8');
  const reactClasses = classTokens(src);
  const missing = [...protoClasses].filter((c) => !reactClasses.has(c)).sort();
  const extra = [...reactClasses].filter((c) => !protoClasses.has(c)).sort();
  lines.push(`\n${sec.id} -> ${page}`);
  lines.push(`  prototype classes: ${protoClasses.size}   react classes: ${reactClasses.size}`);
  if (missing.length) lines.push(`  MISSING (${missing.length}): ${missing.join(' ')}`);
  else lines.push('  MISSING: none');
  if (extra.length) lines.push(`  extra (${extra.length}): ${extra.join(' ')}`);
}

// Also report pages with no prototype screen at all
const mapped = new Set(Object.values(SCREEN_TO_PAGE));
for (const f of fs.readdirSync(PAGES)) {
  if (f.endsWith('-old.jsx')) continue;
  if (!mapped.has(f)) lines.push(`\n[orphan] ${f} — no prototype screen`);
}

fs.writeFileSync(OUT, lines.join('\n'));
console.log('WROTE ' + OUT + ' (' + lines.length + ' lines)');
