// Builds the Stretch word data from SCOWL (wordlist-english).
//  common   = SCOWL levels 10-35 (everyday words; used for start words, hints, example chains)
//  extended = SCOWL levels 40-55 (accepted when typed, never shown as a start)
const fs = require('fs');

const lvl = (l) => [
  ...require(`wordlist-english/english-words-${l}.json`),
  ...require(`wordlist-english/american-words-${l}.json`),
];
const clean = (arr) => arr.filter((w) => /^[a-z]{3,15}$/.test(w));

// Kept out of every list. Slurs and words that would make a start/hint awkward.
const BLOCK = new Set(`
fag fags faggot faggots dyke dykes nigger niggers nigga coon coons spic spics kike kikes chink chinks gook gooks
wop wops retard retards retarded tranny trannies slut sluts whore whores cunt cunts twat twats wank wanks wanker
rape raped rapes rapist rapists homo homos jap japs paki pakis gyp gyps gypped negro negroes
`.trim().split(/\s+/));

const common = new Set(clean([10, 20, 35].flatMap(lvl)).filter((w) => !BLOCK.has(w)));
const extended = new Set(clean([40, 50, 55].flatMap(lvl)).filter((w) => !BLOCK.has(w) && !common.has(w)));

const sig = (w) => [...w].sort().join('');
const sigs = new Map(); // sig -> isCommon
for (const w of common) sigs.set(sig(w), true);
for (const w of extended) if (!sigs.has(sig(w))) sigs.set(sig(w), false);

const AZ = 'abcdefghijklmnopqrstuvwxyz';
const addLetter = (s, c) => { const i = s.split('').findIndex((x) => x > c); return i < 0 ? s + c : s.slice(0, i) + c + s.slice(i); };
const children = (s, pool) => [...AZ].map((c) => addLetter(s, c)).filter((t, i, a) => pool(t) && a.indexOf(t) === i);

function longest(pool) {
  const memo = new Map();
  const f = (s) => {
    if (memo.has(s)) return memo.get(s);
    let best = 1;
    for (const t of children(s, pool)) best = Math.max(best, 1 + f(t));
    memo.set(s, best);
    return best;
  };
  return f;
}
const anyLong = longest((t) => sigs.has(t));
const commonLong = longest((t) => sigs.get(t) === true);

const starts = [];
for (const w of common) {
  if (w.length !== 3) continue;
  const s = sig(w);
  const firstSteps = children(s, (t) => sigs.get(t) === true).length;
  const maxAll = anyLong(s) + 2;     // chain length in words -> letters = words + 2
  const maxCommon = commonLong(s) + 2;
  if (firstSteps >= 4 && maxCommon >= 8 && maxAll <= 13) starts.push({ w, firstSteps, maxAll, maxCommon });
}
starts.sort((a, b) => a.w.localeCompare(b.w));

// Deterministic shuffle so the daily order is fixed.
let seed = 20261118;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
for (let i = starts.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [starts[i], starts[j]] = [starts[j], starts[i]]; }

console.log('common', common.size, 'extended', extended.size, 'starts', starts.length);
console.log('max letters histogram', starts.reduce((h, s) => ((h[s.maxAll] = (h[s.maxAll] || 0) + 1), h), {}));
console.log('first 12:', starts.slice(0, 12).map((s) => `${s.w}(${s.maxCommon}/${s.maxAll}, ${s.firstSteps} opts)`).join(' '));


fs.mkdirSync(__dirname + '/../shower-or-grower', { recursive: true });
const levelOf = new Map();
for (const l of [55, 50, 40, 35, 20, 10]) for (const w of clean(lvl(l))) levelOf.set(w, l);   // lowest level wins
const lines = ['word,level', ...[...common, ...extended].sort().map((w) => `${w},${levelOf.get(w)}`)];
fs.writeFileSync(__dirname + '/../shower-or-grower/words.csv', lines.join('\n') + '\n');
fs.writeFileSync(__dirname + '/starts.json', JSON.stringify(starts.map((s) => s.w)));
console.log('words.csv bytes', fs.statSync(__dirname + '/../shower-or-grower/words.csv').size);
