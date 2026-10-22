# Host links — step 1 of the Camera Shops data build

These scripts turn the research master's venue labels into verified CityMETER host records, Locale polygons and host-building decisions. Their outputs are the `--build` input of `scripts/build-camera-data.py` (step 2), which writes the public files in `data/` and `assets/`.

```sh
export CAMERA_RESEARCH=/path/to/research-csv   # one CSV per research master tab (02_STORES.csv, 07_VENUES.csv, …)
export CAMERA_WORK=/path/to/work                # cache + outputs (created)
export LUXURY_REPO=/path/to/luxurybrands        # montri-th/luxurybrands checkout (shared host footprints)
cd scripts/host-links
python3 01_production_reference.py   # base/lv0.json, base/lv1/*.json, base/provinces_z8_raw.geojson
python3 02_grocery_candidates.py     # grocery/candidates.json (hypermarket hosts, for review)
python3 03_build_crosswalk.py        # venues_resolved.json   (every venue → host, province-checked, Bangkok Locale via locatePoint)
python3 04_build_locales.py          # locales.geojson        (production Locales that hold a camera venue)
python3 05_build_host_buildings.py   # host_buildings_citymeter.json (accepted / rejected footprints, with reasons)
cd ../.. && npm run data:build -- --research "$CAMERA_RESEARCH" --build "$CAMERA_WORK" --lux-buildings "$LUXURY_REPO/data/venue-buildings.geojson" --lux-logos "$LUXURY_REPO"
```

Requirements: Python 3 with `mapbox-vector-tile`, `shapely` (and `pillow` for step 2), `curl`, network access to `landometer.com` (public CityMETER production API). Every response is cached under `CAMERA_WORK`, so a rerun on the same cache is deterministic; on 2026-10-22 the five scripts reproduced the release inputs byte-for-byte and step 2 reproduced every public data file unchanged.

## Decision records

- `crosswalk_sc.py` — reviewed research venue label → CityMETER Shopping Center id, with a basis code per entry (`name`, `alias`, `dup`, `sole`, `address`) and `UNMATCHED` (11 labels with the reason no record was accepted). The 30 links already in the sheet (`07_VENUES.citymeter_shopping_center_id`) are used as given and re-verified.
- `crosswalk_grocery.py` — reviewed label → CityMETER Grocery record for the 20 BIG CAMERA outlets in Big C / Lotus's hypermarkets (address match; one `sole`).

`03_build_crosswalk.py` re-checks every match: production detail coordinates must fall inside the production polygon of the research province, and sheet coordinates (when present) must agree within 0.0005°. Nothing is matched by distance.

## Not covered here

- The research master tab CSVs and the 7 venue-logo files that are not in the Luxury Brands install set: they come from the research sheet (Google Sheets / Drive, internal). Put the logo files in `$CAMERA_WORK/venue-logos-dl/`; step 2 accepts a file only when its sha256 equals the sheet's `logo_sha256`.
- Province frames (`npm run data:provinces`) and the pictogram font (`scripts/build-pictogram-font.py`) have their own scripts.
