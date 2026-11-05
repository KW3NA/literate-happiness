// Generates i18n locale bundles for all official South African languages.
// - Parses en.ts into a nested key tree (source of truth).
// - Applies hand-written core + assessment-UI translations from
//   scripts/locales-data.json; untranslated keys keep the English value and
//   are covered at runtime by i18next fallbackLng 'en'.
// Usage: node scripts/generate-locales.js
const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'i18n', 'locales');
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'locales-data.json'), 'utf8'));

// ---- parse en.ts (two-level object of single-quoted strings) ----
const enSrc = fs.readFileSync(path.join(LOCALES_DIR, 'en.ts'), 'utf8');
const enTree = {};
let section = null;
for (const raw of enSrc.split('\n')) {
  const line = raw.trim();
  if (line.startsWith('//') || line.startsWith('/*')) continue;
  const sec = line.match(/^(\w+):\s*\{\s*$/);
  if (sec) { section = sec[1]; enTree[section] = {}; continue; }
  if (line === '},' && section) { section = null; continue; }
  const kv = line.match(/^(\w+):\s*'((?:[^'\\]|\\.)*)',?\s*$/);
  if (kv && section) enTree[section][kv[1]] = kv[2].replace(/\\'/g, "'");
}

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const emitObj = (obj, indent) => {
  let out = '';
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') out += `${indent}${k}: '${esc(v)}',\n`;
    else out += `${indent}${k}: {\n${emitObj(v, indent + '  ')}${indent}},\n`;
  }
  return out;
};

const mergeInto = (tree, patch) => {
  for (const [sec, keys] of Object.entries(patch)) {
    if (!tree[sec]) continue;
    for (const [k, v] of Object.entries(keys)) {
      if (typeof v === 'string' && tree[sec][k] !== undefined) tree[sec][k] = v;
    }
  }
};

const NEW_LANGS = ['xh', 'tn', 've', 'ts', 'nso', 'st', 'nr', 'ss'];

for (const code of NEW_LANGS) {
  const lang = DATA[code];
  const tree = JSON.parse(JSON.stringify(enTree));
  if (lang.core) mergeInto(tree, lang.core);
  if (lang.assessmentUi) mergeInto(tree, { assessment: lang.assessmentUi });
  const body = `// ${lang.name} (${code}) translations.\n` +
    `// Core UI + assessment strings translated; remaining values fall back to\n` +
    `// English until reviewed. Regenerated via scripts/generate-locales.js.\n` +
    `export default {\n${emitObj(tree, '  ')}\n};\n`;
  fs.writeFileSync(path.join(LOCALES_DIR, `${code}.ts`), body);
  console.log('wrote', `${code}.ts`);
}

// ---- add missing assessment UI keys to existing af.ts / zu.ts ----
for (const code of ['af', 'zu']) {
  const extras = DATA[code] && DATA[code].assessmentUi;
  if (!extras) continue;
  const file = path.join(LOCALES_DIR, `${code}.ts`);
  let src = fs.readFileSync(file, 'utf8');
  const missing = Object.entries(extras).filter(([k]) => !new RegExp(`^\\s*${k}:`, 'm').test(src));
  if (!missing.length) { console.log(`${code}.ts already complete`); continue; }
  const add = missing.map(([k, v]) => `    ${k}: '${esc(v)}',`).join('\n');
  // insert before the closing brace of the assessment section
  const idx = src.search(/\n  \},\n  (learn|tools|help)/);
  if (idx === -1) { console.warn(`could not patch ${code}.ts`); continue; }
  src = src.slice(0, idx + 1) + add + '\n' + src.slice(idx + 1);
  fs.writeFileSync(file, src);
  console.log('updated', `${code}.ts`, `(+${missing.length} keys)`);
}
console.log('done');
