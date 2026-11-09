/**
 * Breadcrumb — ประเทศไทย › จังหวัด › ย่าน › ศูนย์การค้า — the CityMETER production hierarchy, through the shared shell
 * (js/shell/breadcrumb.js, citymeter-shell 0.4.2).
 *
 * In Camera Shops the ย่าน level IS the production Locale: data/neighborhoods.geojson carries the production Locale
 * uuid as the feature id (Bangkok; production has no Locale elsewhere), so the crumb links
 * /v3/citymeter/BKK/L/<uuid> and the address names it `at=BKK/L/<uuid>`. A Locale divides the province another way
 * than the districts, so it follows the province directly (demo-platform-review §5.3 rule 5). Production has no
 * camera-shops dataset yet (`cameraShops` is this repository's proposal), so the links carry no `d`.
 *
 * Fourth level: the venue — a CityMETER host (Shopping Center id, or the Grocery record id of a hypermarket host;
 * data/camera.json centers[].kind says which) or a plain venue label — the last crumb, with no production link. Rules:
 *   - the ย่าน crumb appears when a neighborhood is selected or when the venue's representative point lies inside a
 *     Locale (point-in-polygon, never by name);
 *   - a venue outside every Locale skips that level: ประเทศไทย › ภูเก็ต › Central Phuket;
 *   - a store is not a crumb (it is a record, not a container) — the panel heading names it;
 *   - with four crumbs on narrow screens the upper levels collapse behind “…”.
 */
import {provinceByName, provinceByCode} from './model.js?v=20261023-camera-r4';
import {buildBreadcrumb as shellBreadcrumb, renderBreadcrumb, breadcrumbText} from './shell/breadcrumb.js';

/** Production carries no camera-shops dataset yet: crumbs link the place alone (no `?d=`). */
const PRODUCTION_DATASET = '';
const shellProvince = code => { const p = provinceByCode(code); return p ? {code: p.code, th: p.th} : null; };

/**
 * Pure model. `area` is the selected or containing neighborhood feature (or null); `provinceName` is the dataset
 * province filter value (e.g. "กรุงเทพมหานคร") or ''; `venue` is `{id, label, province}` for the open venue/store host
 * (or null). Province precedence: the area's own province (properties.provinceCode) → the filter → the venue's province.
 */
export function buildBreadcrumb({area = null, provinceName = '', venue = null} = {}) {
  const code = provinceByCode(area?.properties?.provinceCode)?.code || provinceByName(provinceName)?.code
    || (venue?.province ? provinceByName(venue.province)?.code : '') || '';
  return shellBreadcrumb({
    province: code,
    unit: area ? {id: area.id || area.properties.id, name: area.properties.name, province: code, kind: 'L'} : null,
    site: venue?.label ? {id: venue.id || '', name: venue.label, province: code} : null,
  }, {dataset: PRODUCTION_DATASET, provinceByCode: shellProvince});
}

export {renderBreadcrumb, breadcrumbText};
