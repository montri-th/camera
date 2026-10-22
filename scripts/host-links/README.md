# Host links — step 1 of the Camera Shops data build

The research master decides which outlets have a host point and which host building they belong to. Since its revision of 2026-10-22 13:13 UTC it carries its own venue join (`07_VENUES`, `02_STORES`, `12_SPATIAL_JOIN`) and building join (`13_BUILDINGS` and the feature file `CityMETER_Camera_Shops_Venue_Buildings_2026-10-22.geojson`). These scripts verify that join against CityMETER production and decode the Locale polygons. They never add, move or upgrade a join. Their outputs are the `--build` input of `scripts/build-camera-data.py` (step 2), which writes the public files in `data/` and `assets/`.

```sh
export CAMERA_RESEARCH=/path/to/research-csv   # one CSV per research master tab (02_STORES.csv, 07_VENUES.csv, 12_SPATIAL_JOIN.csv, 13_BUILDINGS.csv …)
export CAMERA_WORK=/path/to/work                # cache + outputs (created)
cd scripts/host-links
python3 01_production_reference.py   # base/lv0.json, base/lv1/*.json, base/provinces_z8_raw.geojson
python3 02_grocery_candidates.py     # grocery/candidates.json (hypermarket records, for proposals only)
python3 03_verify_master_join.py     # venues_resolved.json (the master's joined venues, verified) + host_link_proposals.{json,csv}
python3 04_build_locales.py          # locales.geojson (production Locales that hold a joined Bangkok venue)
cd ../.. && npm run data:build -- --research "$CAMERA_RESEARCH" --build "$CAMERA_WORK" \
  --buildings /path/to/CityMETER_Camera_Shops_Venue_Buildings_2026-10-22.geojson --lux-logos /path/to/luxurybrands
```

Requirements: Python 3 with `mapbox-vector-tile`, `shapely` (and `pillow` for step 2), `curl`, network access to `landometer.com` (public CityMETER production API). Every response is cached under `CAMERA_WORK`, so a rerun on the same cache is deterministic.

## What step 03 checks

For each venue the master joined (`venue_join_status` = จับคู่ venue แล้ว, 106 venues / 179 outlets in the 13:13 revision):

- the production Shopping Center detail of `citymeter_shopping_center_id` exists;
- the master's latitude/longitude equal the detail point (tolerance 0.0005°; all 106 are exact);
- the point lies inside the production polygon of the research province;
- a Bangkok point gets its production Locale from `base/locatePoint`;
- every outlet of the venue carries the same host id and point, and no held or unjoined outlet carries any.

The script stops on any difference.

## Proposals (never published)

Venues the master has not joined keep missing coordinates in the app. For those, the app's own reviewed crosswalk (`crosswalk_sc.py`, `crosswalk_grocery.py`) proposes a host record. Each proposal is checked against the production polygon of the research province and written to `host_link_proposals.csv` with the master's status and reason, for the research team to accept into the master (28 in the 13:13 revision: 19 Big C / Lotus's hypermarkets, 6 Robinson department stores, and 3 venues the master holds). The next data build picks up a link once the master marks it joined.

## Not covered here

- The research master tab CSVs, the master building file and the 7 venue-logo files that are not in the Luxury Brands install set: they come from the research sheet (Google Sheets / Drive, internal). Put the logo files in `$CAMERA_WORK/venue-logos-dl/`; step 2 accepts a file only when its sha256 equals the sheet's `logo_sha256`.
- Host buildings: step 2 maps the master's building file and checks every feature against `13_BUILDINGS` (id, geometry sha256, heights, linked outlets).
- Province frames (`npm run data:provinces`) and the pictogram font (`scripts/build-pictogram-font.py`) have their own scripts.
