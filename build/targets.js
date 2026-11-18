// For each candidate clean "object" target, find 3-letter common starts with a word chain to it.
const fs = require('fs');
const lines = fs.readFileSync(__dirname + '/../shower-or-grower/words.csv', 'utf8').trim().split('\n').slice(1);
const sig = (w) => [...w].sort().join('');
const SIGS = new Map();
for (const l of lines) { const [w, c] = l.split(','); const s = sig(w); if (!SIGS.has(s)) SIGS.set(s, { c: [], o: [] }); SIGS.get(s)[c === '1' ? 'c' : 'o'].push(w); }
const isSub = (a, b) => { const r = [...b]; for (const ch of a) { const i = r.indexOf(ch); if (i < 0) return false; r.splice(i, 1); } return true; };
const AZ = 'abcdefghijklmnopqrstuvwxyz';
const addL = (s, c) => { for (let i = 0; i < s.length; i++) if (s[i] > c) return s.slice(0, i) + c + s.slice(i); return s + c; };
function routes(startSig, T, commonOnly) {
  const memo = new Map();
  const f = (s) => {
    if (s === T) return 1;
    if (memo.has(s)) return memo.get(s);
    let n = 0;
    for (const c of new Set(AZ)) { const t = addL(s, c); const e = SIGS.get(t); if (e && isSub(t, T) && (!commonOnly || e.c.length)) n += f(t); }
    memo.set(s, n); return n;
  };
  return f(startSig);
}
const cands = process.argv.slice(2).length ? process.argv.slice(2) : `cucumber cucumbers zucchini eggplant popsicle lollipop sausage sausages baguette plunger plungers toaster blender mattress candles carrots cupcakes sprinkler telescope thermometer flashlight screwdriver corkscrew stapler joystick microphone keyboard doorknob paintbrush lipstick cherries melons coconuts peaches trombone bagpipes bicycle scissors nutcracker trampoline waterbed hammock teapot kettle chopsticks drumsticks lighthouse toothbrush toothpaste shampoo saucepan spatula sprinkles doughnut sandwich tortilla burrito churros muffins pickles pickle turnip parsnip parsnips bananas plantain dumplings meatballs nuts walnuts peanuts chestnuts pancakes pretzel pretzels hotdogs bratwurst salami pepperoni rolling pin firehose hosepipe snorkel periscope rocket rockets missile torpedo drill drills hammer hammers wrench crowbar crowbars spanner stopper corks bottle bottles faucet nozzle pistons piston plumber gearstick handbrake dipstick tailpipe muffler exhaust carburetor jumper jumpers cables trunk saddle stirrups saddles harness spurs whip whips leash collars ladder ladders blowdryer hairbrush tweezers vibrate massager loofah sponges bathtub showerhead caulk caulking grout plunge dildo`.split(/\s+/);
const out = [];
for (const T of cands) {
  const Ts = sig(T); const e = SIGS.get(Ts); if (!e) { continue; }
  if (T.length < 6) continue;
  const starts = [];
  for (const [s, ee] of SIGS) if (s.length === 3 && ee.c.length && isSub(s, Ts)) {
    const rc = routes(s, Ts, true), ra = routes(s, Ts, false);
    if (ra > 0) starts.push({ w: ee.c[0], rc, ra });
  }
  starts.sort((a, b) => b.rc - a.rc || b.ra - a.ra);
  if (starts.length) out.push(`${T.padEnd(12)} len ${T.length}  ` + starts.slice(0, 6).map((s) => `${s.w}(${s.rc}/${s.ra})`).join(' '));
}
console.log(out.join('\n'));
