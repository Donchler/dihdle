// Assembles the GitHub Pages site for dihdle.io into ../site
//   /                     hub (today's clue + link)
//   /shower-or-grower/    the game + its dictionary
const fs = require('fs');
const path = require('path');

// ---- Where the site lives. Switch to dihdle.io (and set CUSTOM_DOMAIN) once the domain is bought.
const BASE_URL = 'https://donchler.github.io/dihdle/';
const SHARE_TEXT_URL = 'donchler.github.io/dihdle';
const CUSTOM_DOMAIN = null;   // e.g. 'dihdle.io' -> writes the CNAME file

const B = __dirname;
const OUT = path.join(B, '..');   // repo root = the published site
const daily = JSON.stringify(require('./daily.json'));
const starts = fs.readFileSync(path.join(B, 'starts.json'), 'utf8');

fs.mkdirSync(path.join(OUT, 'shower-or-grower'), { recursive: true });

// Game: same template as the prototype, with site-specific tweaks.
let game = fs.readFileSync(path.join(B, 'template.html'), 'utf8')
  .replace('__STARTS__', starts)
  .replace('__DAILY__', daily)
  .replace("const SHARE_URL = 'dihdle.last-axis-1605.chatgpt.site';", `const SHARE_URL = '${SHARE_TEXT_URL}';`)
  .replace('<div class="brand"><b>Dihdle</b>', '<div class="brand"><a href="../" style="color:inherit;text-decoration:none"><b>Dihdle</b></a>')
  .replace('<title>Shower or Grower? · Dihdle</title>', `<title>Shower or Grower? · Dihdle</title>
<meta name="description" content="Grow a 3-letter word into today's secret object. Every clue sounds dirty. Every answer is clean.">
<meta property="og:title" content="Shower or Grower? · Dihdle">
<meta property="og:description" content="Grow a 3-letter word into today's secret object. Sounds dirty. Think clean.">
<meta property="og:image" content="${BASE_URL}og.png">
<meta property="og:url" content="${BASE_URL}shower-or-grower/">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">`);
for (const must of [`SHARE_URL = '${SHARE_TEXT_URL}'`, 'href="../" style', 'og:image']) {
  if (!game.includes(must)) throw new Error('game patch failed: ' + must);
}
fs.writeFileSync(path.join(OUT, 'shower-or-grower', 'index.html'), game);

// Hub
fs.writeFileSync(path.join(OUT, 'index.html'), fs.readFileSync(path.join(B, 'hub-template.html'), 'utf8')
  .replace('__DAILY__', daily).replaceAll('https://dihdle.io/', BASE_URL)
  .replace('href="/favicon.svg"', 'href="favicon.svg"').replace('href="/shower-or-grower/"', 'href="shower-or-grower/"'));

// Static extras
fs.copyFileSync(path.join(B, 'og.png'), path.join(OUT, 'og.png'));
if (CUSTOM_DOMAIN) fs.writeFileSync(path.join(OUT, 'CNAME'), CUSTOM_DOMAIN + '\n');
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
fs.writeFileSync(path.join(OUT, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#5b2a86"/><text x="32" y="46" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="40" text-anchor="middle" fill="#ff9e7a">D</text></svg>`);
fs.writeFileSync(path.join(OUT, '404.html'), `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Not found · Dihdle</title>
<style>body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#fff1ea;color:#3a1a4a;font:18px system-ui,sans-serif;text-align:center}a{color:#5b2a86;font-weight:800}</style></head>
<body><div><h1 style="font-size:44px;margin:0">Nothing here.</h1><p>That page shrank away.</p><p><a href="${BASE_URL}">Back to Dihdle</a></p></div></body></html>`);
console.log('site built into repo root');
