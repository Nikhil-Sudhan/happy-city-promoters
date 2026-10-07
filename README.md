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

Update `portfolio/src/config.js` with the verified phone number, office address, and WhatsApp number. The email `happycitymts@gmail.com` was verified on the official Contact page on 8 October 2026. The explorer link automatically uses the local development server in development and `/plot-explorer/` in production. Until WhatsApp is configured, submitting the enquiry form downloads an enquiry text file and clearly states that it was **not sent**. When configured, the form opens a prefilled WhatsApp message for the visitor to review and send. No enquiry information is saved by this website.

The 13 project names and locations were sourced from https://www.happycitypromoters.com/ on 7 October 2026 (search-indexed page; direct retrieval was blocked by the site's server). No approval claims, prices, testimonials, years of experience, or availability have been invented. Confirm all project information before publishing. Project names remain proper names in both languages; Tamil copy should receive a business/native-speaker editorial review before launch.

The supplied official logo is used unchanged in both website headers and the portfolio footer. The original 5400 × 900 JPEG is stored at public/images/happy-city-logo.jpg in each project. Landscape images are illustrative Unsplash photographs, labeled as such, and must be replaced with actual project photographs when available:

- https://images.unsplash.com/photo-1500382017468-9049fed747ef
- https://images.unsplash.com/photo-1472396961693-142e6e269027
- https://images.unsplash.com/photo-1441974231531-c6227db76b6e

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
