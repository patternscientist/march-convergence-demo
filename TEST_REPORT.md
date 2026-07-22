# Extraction and interaction test report

## Source integrity

- Source file: `StoryMap-prototype.html`
- Source SHA-256: `e89fb4da721feba3bd4fdcba266973ecc16339b4e1aea799671243301cea57c0`
- Extracted origin-and-mode records: 55
- Record counts: 34 bus, 10 train, 11 plane
- Charter totals: 984 buses, 21 trains, 14 planes

## Automated package validation

`py scripts/validate.py` passes and checks:

- required fields;
- unique stable IDs;
- record count;
- per-mode record counts;
- charter totals;
- required deployment files.

## Static-server path test

A local Python HTTP server returned HTTP 200 for:

- `/`
- `/assets/convergence.css`
- `/assets/convergence.js`
- `/config.js`
- `/data/mobilization-origins.json`
- `/test/storymap-frame.html`

## Headless Chromium interaction and layout test

The page was rendered with its production HTML, CSS, and JavaScript and an inlined copy of the same JSON snapshot at these viewport sizes:

- 1440 × 1000
- 900 × 1000
- 390 × 844

At all tested sizes:

- no JavaScript or console errors occurred;
- no page-level horizontal overflow occurred;
- the filter status reported 34 bus, 10 train, 11 plane, and 55 all-mode entries;
- the filtered table showed the same records as the map mode;
- the New York City bus point displayed `564 buses chartered` and its geometry caveat;
- Pause / Resume updated `aria-pressed` correctly.

The execution environment blocks headless browsers from navigating to local HTTP or `file:` URLs, so browser interaction testing used a functionally equivalent in-memory page with the production assets and identical JSON. Static HTTP delivery was tested separately with `curl`. The final public GitHub Pages URL still needs one real-browser and one StoryMaps-iframe pass after deployment.


## v2 accessibility and embed hardening

- Individual origins are keyboard-focusable SVG buttons with descriptive accessible names.
- Enter and Space toggle details; Escape closes them.
- Mode filtering removes hidden origins from the keyboard tab order.
- Transparent, responsive hit areas improve touch targeting without enlarging the visible marks.
- `?embed=1` supplies a compact StoryMap presentation that removes duplicate surrounding prose while retaining the interactive and accessible core.
