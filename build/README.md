# Dihdle build

Everything the site at the repo root is built from. Edit here, rebuild, commit the results.

| File | What it is |
|---|---|
| `template.html` | The Shower or Grower? game (HTML/CSS/JS). `__STARTS__` and `__DAILY__` are filled in at build time. |
| `hub-template.html` | The home page. Shows today's clue. |
| `daily.json` | The daily puzzles: `{ start, target, clue }`. Puzzle #1 = 2026-11-18 (UTC); they cycle. |
| `starts.json` | Start words for practice mode (generated). |
| `make-site.js` | Builds `index.html`, `shower-or-grower/index.html`, favicon, 404 into the repo root. Holds `BASE_URL`, `SHARE_TEXT_URL`, `CUSTOM_DOMAIN`. |
| `build-data.js` | Rebuilds the dictionary (`shower-or-grower/words.csv`, word + SCOWL level) and `starts.json`. Needs `npm install`. |
| `targets.js` | Lists candidate target objects reachable from 3-letter starts, with route counts. Usage: `node targets.js toaster mattress ...` |
| `og.png` | Link-preview image. |

## Common tasks

```bash
cd build
node make-site.js            # after editing template.html, hub-template.html or daily.json
npm install && node build-data.js   # only if the dictionary rules change
node targets.js word1 word2  # check new target words before adding them to daily.json
```

Dictionary: SCOWL via the `wordlist-english` npm package. Level <= 35 = everyday words (used for hints/start words),
<= 55 = accepted when typed.

## Moving to dihdle.io

In `make-site.js` set `BASE_URL = 'https://dihdle.io/'`, `SHARE_TEXT_URL = 'dihdle.io'`, `CUSTOM_DOMAIN = 'dihdle.io'`,
rebuild, commit, then add the DNS records GitHub Pages lists in its docs at the registrar.
