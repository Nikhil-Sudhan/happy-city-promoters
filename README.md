# Happy City Promoters — two websites

Two separate Vite projects live in this directory. The root build packages them into one deployable `dist/` folder, with the portfolio at `/` and the 3D explorer at `/plot-explorer/`.

## Run locally

Requires Node.js 20.17+ and npm.

```sh
npm install
npm run dev
```

This starts both websites. On Windows, you can also double-click `start-websites.cmd` after dependencies are installed. Press Ctrl+C in the terminal to stop them.

To run just one website:

```sh
npm run dev:portfolio
# or
npm run dev:explorer
```

- Portfolio: http://127.0.0.1:5173
- 3D explorer: http://127.0.0.1:5174
- Build both: `npm run build`
- Check explorer geometry and data validation: `npm test`

## 1. Portfolio (`portfolio/`)

An orange, ivory, and sage website with English/Tamil switching, larger-text control, mobile navigation, project filters, project details, buying guidance, FAQ, and an enquiry form.

Contact details in `portfolio/src/config.js` were verified on the official contact page on 8 October 2026: +91 96003 06517, happycitymts@gmail.com, RM Colony Main Road, Dindigul 624001. WhatsApp is unset because support on this number has not been confirmed. Submitting the form opens a prefilled email for the visitor to review and send; no enquiry is automatically delivered or saved. If a verified WhatsApp number is configured, it takes precedence.

The 13 project names and locations are sourced from https://www.happycitypromoters.com/. No approval claims, prices, testimonials, or availability have been invented. Project names remain proper names in both languages; Tamil copy should receive a business/native-speaker editorial review before launch.

The supplied 5400 × 900 official logo is unchanged in both website headers and the portfolio footer. All stock landscape photographs have been removed. The two office photographs are unmodified files from the official gallery, served locally with explicit office captions; they are not plot photographs. See `portfolio/src/media-sources.json` for source URLs and SHA-256 checksums.

Seven original Google Maps embeds from official project pages are recorded in `portfolio/src/location-data.json`. Visitors load one map at a time on request; the links to Google Maps and the original project page remain available if an embed is blocked. Google's attribution remains in the iframe. No API key is needed for these existing published embeds, and no Google photos or map tiles are scraped or cached.

The maps are company-published locations, not independently verified site entrances or surveyed boundaries. The College Town II page points to the broad Agaram area; Paradise and Mahatma publish the same pin. The UI therefore asks visitors to confirm the entrance with the team. No authenticated site photographs were found for individual plots, so project cards use location details and maps rather than unrelated imagery. Street View is recorded imagery, not live video; availability varies.

## 2. Plot explorer (`plot-explorer/`)

A real Three.js 3D scene with orbit, pan, zoom, reset, top view, plot hover details, a keyboard-accessible plot list, search, availability filters, selection, estimated cost, editable names/prices/areas/status/interest counts, local interest bookmarking, layout export/import, and geographic GeoJSON export.

The example contains 16 plots, A1–A8 opposite B1–B8, with a central road, trees, and a site boundary. **The project, layout, prices, interest counts, and scenery are demonstration data.** The default centre is approximately central Dindigul, not a verified project location. Built-in scenery is illustrative and does not regenerate to match a newly drawn site boundary.

### Edit and save

1. Choose **Edit layout**.
2. Select a plot and use its pencil button to rename or edit it. Names must be unique. Changing the numerical area does not resize the shape: it can represent a surveyed area.
3. **Draw boundary** or **Draw a plot** switches to top view. Click at least three corners, then **Finish shape**. Escape, Cancel, and Undo point are supported. Local drawing snaps to 0.5 m.
4. The site boundary must contain all existing plots. Plot polygons must be simple, non-degenerate, and within the boundary. The prototype does not check plot-to-plot overlaps or road easements; review these before treating a layout as authoritative.
5. Changes save in localStorage in this browser and origin. Export a JSON backup to transfer to another browser or device. Import accepts only this app's validated layout format (not arbitrary GeoJSON). An import replaces the current layout; export before importing if necessary.
6. **GeoJSON** exports site/plot boundaries using the coordinates configured in Settings. The local conversion is a small-area approximation, not cadastral/survey software. Use survey-verified coordinates and an appropriate geospatial backend for legal boundaries.

Interest counts are seeded demo numbers plus a visitor's single local bookmark. No shared customer analytics, backend, enquiry delivery, or authenticated admin exists. **Edit mode is not access control.** A public launch with real management needs authentication, server-side validation, database storage, and a real lead collection service.

### Google Maps and 360° imagery

Open **Settings** and enter the actual site centre and a browser API key, or copy `.env.example` to `.env.local` and fill in `VITE_GOOGLE_MAPS_API_KEY`. Enable Maps JavaScript API and billing in the relevant Google Cloud project. Apply HTTP-referrer and API restrictions. Browser keys are public by design; never use a server credential here. Keys entered in settings stay only in memory and are excluded from saved layouts and exports. Environment keys are part of the client build. Reload before switching keys after Google has already loaded.

- **Satellite & boundaries** loads an actual Google map and overlays site and plot polygons. Click an uncovered location to relocate the site's centre (all plot offsets move with it). In Edit layout mode, map drawing buttons let you draw geographically located site/plot polygons directly on the imagery.
- **360° Street View** searches for a recorded panorama within 100 m. It displays the imagery date when supplied and handles missing coverage. A panorama may show a nearby road, not the plot interior.
- **Google 3D** loads Google's Map3DElement for the site's surroundings. Detailed surface coverage varies by location. Custom plot overlays are currently in the satellite view; the independent Three.js view always works without a key.
- Neither Google view is a live camera or a real-time feed. To show an exact plot interior where Street View is absent, arrange an on-site 360° photo capture; a custom panorama provider can be added later.

Google integration is implemented but cannot be tested end-to-end without a valid key, billing, and actual site coordinates. Official references:

- https://developers.google.com/maps/documentation/javascript/streetview
- https://developers.google.com/maps/documentation/javascript/3d/coverage
- https://developers.google.com/maps/documentation/javascript/reference/3d-map

## Deployment

The repository includes `vercel.json` for the connected Vercel GitHub project. Keep the Vercel **Root Directory** at the repository root (leave the field empty), and use `main` as the production branch. The file specifies `npm ci`, `npm run build`, and output directory `dist`.

The root build compiles both workspaces and runs `scripts/package-sites.mjs`, which verifies production asset paths and rejects localhost URLs in the deployment output:

- `/` → portfolio, including the original logo and verified contact email.
- `/plot-explorer/` → 3D explorer.

Pushing to the Vercel-connected production branch triggers its deployment workflow. Any Google Maps key should be set as `VITE_GOOGLE_MAPS_API_KEY` in Vercel environment variables, restricted to the final site domain. Keep `VITE_PORTFOLIO_URL` unset for the combined deployment.

For separate hosting instead, set `VITE_BASE_PATH=/` for the explorer, set `VITE_PORTFOLIO_URL` to the portfolio URL, update `business.explorerUrl` to the explorer URL, and build each workspace separately. Then publish each workspace's `dist/` directory.

Fonts load from Google Fonts; downloaded imagery and the Three.js bundle are served locally. The 3D view needs WebGL/hardware acceleration; if unavailable, plot browsing and editing remain accessible through the list.
