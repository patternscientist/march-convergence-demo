# StoryMap meeting-demo checklist

## Before publishing to GitHub Pages

- [ ] Run `py scripts/validate.py`.
- [ ] Run `py -m http.server 8000` and inspect the main page.
- [ ] Open `http://localhost:8000/test/storymap-frame.html` and inspect the iframe-sized experience.
- [ ] Test All, Buses, Trains, and Planes.
- [ ] Hover and tap representative origins, including New York City and Buffalo–Syracuse–Rochester.
- [ ] Test Pause / Resume and reduced-motion behavior.
- [ ] Open the records table and confirm it filters with the map.
- [ ] Check browser console for errors.

## Publish

- [ ] Create public repository `patternscientist/march-convergence-demo`.
- [ ] Upload the package contents to the repository root.
- [ ] Enable Pages from `main` / root.
- [ ] Confirm the public HTTPS URL loads all assets and JSON.
- [ ] Confirm the page can load inside an iframe.

## Embed in StoryMaps

- [ ] Add content → Embed.
- [ ] Paste the GitHub Pages URL.
- [ ] Choose live interactive content.
- [ ] Use a large block.
- [ ] Enable direct reader interaction.
- [ ] Enable open in new tab.
- [ ] Add the prepared alternative text from the README.
- [ ] Start with Live on small screens, then verify phone/tablet previews.

## Surrounding StoryMap copy

Before the embed:

> Six days before the March, the transportation office summarized what it believed was definitely coming to Washington: hundreds of buses, chartered trains, and planes converging from across the country. These were planning estimates—not a final attendance count.

After the embed:

> The densest concentration lies along the Northeast corridor, especially New York. The long western and southern arcs show the national reach of the mobilization, but the paths are symbolic links between representative origins and Washington—not reconstructed travel routes.

## Meeting demonstration

1. Show the animation inside the StoryMap.
2. Filter All → Buses → Trains → Planes.
3. Inspect New York City, a state-centroid entry, and the grouped Buffalo–Syracuse–Rochester entry.
4. Open the accessible records table.
5. Open the full-screen GitHub Pages page.
6. Explain that the temporary URL proves the integration; institutional hosting would improve ownership, permanence, governance, and maintenance.

## Questions for the project manager

- Is temporary GitHub Pages hosting acceptable through the prototype/review period?
- Which Stanford or King Institute host should ultimately own the page?
- Who will maintain the deployed files?
- Will the institutional host permit iframe embedding from StoryMaps?
- Should the final animation query an ArcGIS hosted feature-layer view or use a versioned data snapshot?
- What credit and licensing language should appear?
- Should the GitHub staging site be redirected, archived, or removed after migration?
