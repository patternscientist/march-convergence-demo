# March on Washington convergence animation — meeting demo

A focused, iframe-ready extraction of the **“Definitely coming to Washington”** visualization from the supplied `StoryMap-prototype.html` source of truth.

## Status

This is a temporary public technical demonstration for Stanford MLK Institute project review. It is not the final institutional deployment.

The package intentionally excludes the licensed cover photograph, documentary scans, the King chronology, and all unrelated prototype sections.

## What it preserves

- symbolic curved flows into Washington;
- particle density and line weight scaled by charter counts;
- All / Buses / Trains / Planes filters;
- hover, tap, and keyboard-focus details for each origin;
- source-arithmetic warning and planning-snapshot caveats;
- a filtered accessible records table;
- reduced-motion behavior and a visible pause control.

## Historical interpretation

The underlying records come from an August 22, 1963 transportation-planning memorandum. The moving arcs are **not** reconstructed routes and do **not** encode departure times. They visualize convergence from representative origins to Washington.

The memo prints 1,004 buses, while its itemized bus entries total 984. The animation uses the 984 itemized entries and keeps the printed totals visible.

## Run locally

From this directory:

```powershell
py -m http.server 8000
```

Open `http://localhost:8000/`.

Do not open `index.html` directly as a `file:` URL because the page fetches its JSON data file.

## Validate

```powershell
py scripts/validate.py
```

The validator checks the schema, unique IDs, record count, per-mode counts, and charter totals.

## GitHub Pages

1. Create a **public** repository named `march-convergence-demo`.
2. Upload the contents of this folder to the repository root.
3. In **Settings → Pages**, choose **Deploy from a branch**.
4. Select `main` and `/(root)`.
5. Open `https://patternscientist.github.io/march-convergence-demo/` after deployment completes.

The `.nojekyll` file ensures GitHub Pages serves the static files without Jekyll processing.

## StoryMaps embed

Use the normal root URL in StoryMaps:

```text
https://patternscientist.github.io/march-convergence-demo/
```

The page automatically detects when it is inside an iframe and switches to its compact StoryMap layout. Opening the same URL in a new browser tab shows the complete standalone presentation. `?embed=1` remains available for directly previewing the compact layout.

Add the root URL through **Add content → Embed**. Use the live interactive display, enable direct interaction and the open-in-new-tab control, then test desktop, tablet, and phone previews.

Suggested alternative text:

> Animated schematic map showing buses, chartered trains, and planes that March on Washington organizers recorded as definitely coming to Washington in an August 22, 1963 planning memorandum. Controls filter the display by transportation mode, and each origin can be inspected for its count and geographic caveat.

See `STORYMAP_EMBED_CHECKLIST.md` for the full meeting workflow.

## Data modes

`config.js` currently uses the bundled JSON snapshot. A later institutional build may set `dataMode` to `arcgis` and provide a public read-only feature-layer URL. If the ArcGIS request fails, the page automatically falls back to the bundled JSON.

## Licensing

No software or data license has been assigned in this staging package. Public availability of the repository does not itself grant reuse permission. The project manager or Institute should decide final licensing and credit language.
