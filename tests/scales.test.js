import test from 'node:test';
import assert from 'node:assert/strict';
import {COUNT_SCALE, countSampleIndex, buildCountScale, countRamp, classify, contrastRatio, inkFor} from '../js/scales.js';

test('count family consumes the exact approved 41-sample LUT', () => {
  assert.equal(COUNT_SCALE.lut.length, 41);
  assert.deepEqual(COUNT_SCALE.anchors, [COUNT_SCALE.lut[0], COUNT_SCALE.lut[20], COUNT_SCALE.lut[40]]);
  assert.equal(new Set(COUNT_SCALE.lut).size, 41);
});

test('owner rule: every value maps linearly onto the full 41-sample scale (no classes)', () => {
  assert.equal(countSampleIndex(1, 13), 0);
  assert.equal(countSampleIndex(13, 13), 40);
  assert.equal(countSampleIndex(7, 13), 20);
  assert.equal(countSampleIndex(2, 13), 3);
  assert.equal(countSampleIndex(1, 1), 40, 'a selection whose maximum is 1 takes the darkest sample');
  assert.equal(countSampleIndex(0, 13), null);
  assert.equal(countSampleIndex(null, 13), null);
  // Up to 41 distinct values each get their own sample; the mapping never decreases.
  for (const max of [2, 13, 36, 41]) {
    const samples = Array.from({length: max}, (_, i) => countSampleIndex(i + 1, max));
    assert.equal(new Set(samples).size, max, `distinct samples for max ${max}`);
    assert.ok(samples.every((v, i) => i === 0 || v > samples[i - 1]));
  }
  const many = Array.from({length: 120}, (_, i) => countSampleIndex(i + 1, 120));
  assert.equal(new Set(many).size, 41, 'beyond 41 values the whole scale is used');
});

test('classification keeps zero as a measured fact and never collapses missing into a sample', () => {
  const model = buildCountScale([57, 51, 45, 33, 18, 6, 4, 2, 2, 0]);
  assert.equal(model.max, 57);
  assert.equal(model.steps, 41);
  assert.equal(model.method, 'linear-41-sample');
  assert.equal(classify(57, model).fill, '#213E70');
  assert.equal(classify(1, model).fill, '#F4F0E7');
  assert.equal(classify(29, model).fill, COUNT_SCALE.lut[20]);
  assert.equal(classify(29, model).sample, 20);
  const zero = classify(0, model);
  assert.equal(zero.state, 'measured_zero');
  assert.equal(zero.outline, COUNT_SCALE.zeroOutline);
  assert.equal(classify(null, model).state, 'no_data');
  assert.equal(classify(5, model, 'out_of_scope').fill, null);
  assert.equal(buildCountScale([]).max, 0);
  assert.equal(buildCountScale([0, 0]).min, 0);
});

test('legend ramp shows all 41 samples as equal hard stops with 1, middle and max ticks', () => {
  const ramp = countRamp(buildCountScale([13, 9, 1, 0]));
  assert.equal(ramp.steps, 41);
  for (const c of COUNT_SCALE.lut) assert.ok(ramp.gradient.includes(c), c);
  assert.equal((ramp.gradient.match(/#/g) || []).length, 41);
  assert.deepEqual(ramp.ticks.map(t => [t.value, t.sample]), [[1, 0], [7, 20], [13, 40]]);
  assert.deepEqual(countRamp(buildCountScale([2])).ticks.map(t => t.value), [1, 2]);
  assert.deepEqual(countRamp(buildCountScale([1])).ticks.map(t => t.value), [1]);
  assert.deepEqual(countRamp(buildCountScale([])).ticks, []);
});

test('label ink reaches 4.5:1 on every sample except 27–29, which classify flags for a surface chip', () => {
  const model = buildCountScale([41, 30, 10, 1]);
  const weak = COUNT_SCALE.lut.map((fill, i) => [i, contrastRatio(fill, inkFor(fill))]).filter(([, c]) => c < 4.5).map(([i]) => i);
  assert.deepEqual(weak, [27, 28, 29]);
  for (const v of [28, 29, 30]) assert.ok(classify(v, model).inkContrast < 4.5, `value ${v} → sample ${classify(v, model).sample} is flagged`);
  assert.ok(classify(41, model).inkContrast >= 4.5);
  assert.ok(contrastRatio(model.zero.fill, inkFor(model.zero.fill)) >= 4.5);
  assert.equal(inkFor('#213E70'), '#FFFFFF');
  assert.equal(inkFor('#F4F0E7'), '#182327');
});
