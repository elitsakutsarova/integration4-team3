import fs from 'node:fs';
import path from 'node:path';

const APP_CSS = path.resolve('app/app.css');
const STYLES_DIR = path.resolve('app/styles');
const MODULES_DIR = path.join(STYLES_DIR, 'modules');

const MODULE_GROUPS = {
  'global.css': ['Reset', 'Tokens', 'Base'],
  'map.css': [
    'Map page',
    'Guest map CTA (home without sticker reveal)',
    'Guest add-memo locked overlay',
    'Map container (legacy selector kept for compat)',
    'Zoom controls',
    'Attribution',
    'Scale bar',
    'Leaflet popup reset',
    'Memory pin (polaroid)',
    'Memory pin cluster',
    'Event / festival pin',
    'Event popup',
    'Memory map popup card',
  ],
  'location-detail.css': ['Location detail page'],
  'bottom-nav.css': ['Bottom navigation'],
  'new-memo.css': [
    'New Memo form overlay',
    'Edit memo page',
    'Location picker (memo form)',
    'Memo post success',
  ],
  'profile.css': ['Profile page', 'Guest profile (/profile without account)'],
  'diary.css': [
    'Travel diary viewer',
    'Share diary modal',
    'Recap share sheet (Figma 679:51889)',
    'Recap share success (Figma 679:57771)',
    'Recap select & preview',
  ],
  'auth.css': ['Auth (login / register)'],
  'collect.css': ['Physical sticker collect flow'],
  'sticker-reveal.css': ['Sticker reveal overlay (guest QR scan → map)'],
  'stickers.css': ['Stickers gallery (/stickers)', 'Guest stickers CTA'],
  'connect.css': [
    'Connect devices (WebRTC)',
    'Shared QR component',
    'Demo physical sticker QRs (/demo-stickers)',
  ],
  'discover.css': [
    'Discover page',
    'Discover list pages (View all)',
    'Discover detail pages',
    'Discover saved popup',
    'Featured memos (shared detail sections)',
  ],
  'memo-archive.css': ['Memo Archive page (Figma 392-48844)'],
  'profile-collections.css': [
    'Profile collection pages (Created Memos / Favourites)',
    'Created Memos (Figma 3-12243)',
    'Created memo card (Figma 3-41046)',
  ],
  'search.css': ['Unified search page'],
  'settings.css': [
    'Settings page',
    'Settings logout modal',
    'Delete account modal',
    'Avatar success modal',
    'Account details & credential forms',
    'Language preference page',
    'Privacy preference page',
    'Send feedback page',
    'Change password strength (Figma)',
  ],
  'journals.css': [
    'Journals page',
    'Guest journals locked (/journals without account)',
    'Create journal flow',
    'Journal detail page',
    'Journal recap flow',
  ],
};

function parseSections(content) {
  const lines = content.split('\n');
  const sectionRe = /^\/\* ─── (.+?) ─/;
  const sections = new Map();

  let currentName = null;
  let currentLines = [];

  function flush() {
    if (currentName) {
      sections.set(currentName, currentLines.join('\n').trim());
    }
  }

  for (const line of lines) {
    const match = line.match(sectionRe);
    if (match) {
      flush();
      currentName = match[1];
      currentLines = [line];
      continue;
    }
    if (currentName) currentLines.push(line);
  }
  flush();
  return sections;
}

const content = fs.readFileSync(APP_CSS, 'utf8');
const sections = parseSections(content);

fs.mkdirSync(MODULES_DIR, { recursive: true });

for (const [fileName, sectionNames] of Object.entries(MODULE_GROUPS)) {
  const chunks = [];
  for (const name of sectionNames) {
    const chunk = sections.get(name);
    if (!chunk) {
      throw new Error(`Missing section: ${name}`);
    }
    chunks.push(chunk);
  }

  const isGlobalFile = fileName === 'global.css';
  const targetDir = isGlobalFile ? STYLES_DIR : MODULES_DIR;
  fs.writeFileSync(path.join(targetDir, fileName), `${chunks.join('\n\n')}\n`);
}

console.log(`Split app.css into ${Object.keys(MODULE_GROUPS).length} files under app/styles/`);
