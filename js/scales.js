/**
 * Analytical scale used by the neighborhood layer, the province frames and the charts.
 *
 * Family: LDS 0.9.7 `count` (sequential, totals — not a rate or density).
 * Source: machine.analyticalScales.scales[scaleId="count"], scaleVersion
 * 4ff5c1fb4be71ecd13c48685b38371b528bcd4ce369ce964a75354c2eb4d0980.
 * DATAVIZ-02/03: the exact approved light LUT is consumed unchanged on both
 * themes; no interpolation between samples.
 *
 * Owner rule (2026-10-22): a colour scale always uses the full 41-sample LDS
 * scale. A measured count v of the current selection takes LUT sample
 * round(40 × (v − 1) / (max − 1)) — linear over [1, max], no classes; when
 * max is 1 every measured value takes the darkest sample. Zero is a measured
 * fact (EVID-05 `measured_zero`), never a sample of the ramp, and areas without
 * a defined boundary are `out_of_scope`.
 */
export const COUNT_SCALE = Object.freeze({
  scaleId: 'count',
  kind: 'sequential',
  unit: 'ร้านไม่ซ้ำ',
  labelTh: 'จำนวนรวม',
  anchors: ['#F4F0E7', '#7DBAC0', '#213E70'],
  lut: Object.freeze([
    '#F4F0E7', '#EEEDE5', '#E8EBE3', '#E3E8E1', '#DDE5DF', '#D7E3DD', '#D1E0DB', '#CBDDD9',
    '#C5DAD7', '#C0D8D6', '#BAD5D4', '#B4D2D2', '#AED0D0', '#A8CDCE', '#A2CACC', '#9CC8CA',
    '#96C5C8', '#90C2C6', '#8ABFC4', '#83BDC2', '#7DBAC0', '#78B3BC', '#73ADB8', '#6EA7B4',
    '#69A0B0', '#649AAC', '#5F93A8', '#5A8DA4', '#5587A0', '#50809C', '#4C7A98', '#477494',
    '#436E90', '#3E688C', '#3A6288', '#355C84', '#315680', '#2D507C', '#294A78', '#254474',
    '#213E70',
  ]),
  noData: '#D5DAD6',
  zeroOutline: '#7D877F',
  scaleVersion: '4ff5c1fb4be71ecd13c48685b38371b528bcd4ce369ce964a75354c2eb4d0980',
  themePolicy: 'identical-light-values-on-both-themes',
});

/** Label ink on a class fill: the darker/lighter foundation text that reaches the higher contrast. */
export function inkFor(fill) {
  const dark = '#182327', light = '#FFFFFF';
  return contrastRatio(fill, dark) >= contrastRatio(fill, light) ? dark : light;
}

/** LUT sample of a measured count: linear over [1, max]; null for zero, negative or missing values. */
export function countSampleIndex(value, max) {
  if (!Number.isFinite(value) || value <= 0) return null;
  const last = COUNT_SCALE.lut.length - 1;
  const top = Number.isFinite(max) ? Math.max(1, max) : 1;
  if (top <= 1) return last;
  return Math.min(last, Math.max(0, Math.round((last * (Math.min(value, top) - 1)) / (top - 1))));
}

/**
 * Scale model for the current selection. `values` are the measured distinct-banner
 * counts of every defined area (including measured zeros); areas outside the
 * defined set are out_of_scope and are not passed here.
 */
export function buildCountScale(values) {
  const measured = (Array.isArray(values) ? values : []).filter(v => Number.isFinite(v) && v > 0);
  const max = measured.length ? Math.max(...measured) : 0;
  return {
    scaleId: COUNT_SCALE.scaleId,
    unit: COUNT_SCALE.unit,
    method: 'linear-41-sample',
    steps: COUNT_SCALE.lut.length,
    min: max ? 1 : 0,
    max,
    zero: {fill: COUNT_SCALE.lut[0], outline: COUNT_SCALE.zeroOutline, label: '0'},
  };
}

/**
 * Legend geometry: all 41 samples as equal hard-stop segments of one bar, and
 * the value ticks (1, the middle value, max) with the sample each one takes.
 */
export function countRamp(model) {
  const lut = COUNT_SCALE.lut, n = lut.length;
  const at = i => `${((i * 100) / n).toFixed(3)}%`;
  const gradient = `linear-gradient(to right, ${lut.map((c, i) => `${c} ${at(i)} ${at(i + 1)}`).join(', ')})`;
  const max = model?.max || 0;
  const values = max > 2 ? [1, Math.round((1 + max) / 2), max] : max === 2 ? [1, 2] : max === 1 ? [1] : [];
  return {gradient, steps: n, ticks: values.map(value => ({value, sample: countSampleIndex(value, max)}))};
}

/**
 * Resolve one value to its EVID-05 state and visual treatment.
 * - measured: finite nonzero → its LUT sample (countSampleIndex)
 * - measured_zero: 0 → lowest fill + zero outline
 * - out_of_scope / no_data: null fill (caller draws bare basemap or hatch)
 */
export function classify(value, model, state = 'measured') {
  if (state === 'out_of_scope') return {state, fill: null, ink: null, label: 'นอกขอบเขตข้อมูล'};
  if (state === 'no_data' || value == null || !Number.isFinite(value)) {
    return {state: 'no_data', fill: COUNT_SCALE.noData, ink: null, label: 'ไม่มีข้อมูล'};
  }
  if (value <= 0) return {state: 'measured_zero', fill: model.zero.fill, ink: inkFor(model.zero.fill), outline: model.zero.outline, label: '0'};
  const sample = countSampleIndex(value, model.max || value);
  const fill = COUNT_SCALE.lut[sample], ink = inkFor(fill);
  // Samples 27–29 reach < 4.5:1 with both foundation inks: text drawn on them goes on a surface chip (inkContrast tells the caller).
  return {state: 'measured', fill, ink, inkContrast: contrastRatio(fill, ink), label: String(value), sample};
}

/** Relative luminance (sRGB) for the build-time contrast check used in tests. */
export function contrastRatio(hexA, hexB) {
  const lum = hex => {
    const c = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [a, b] = [lum(hexA), lum(hexB)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
