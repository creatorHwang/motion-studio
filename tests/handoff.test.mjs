import test from 'node:test';
import assert from 'node:assert/strict';
import { readFinderHandoff } from '../handoff.js';

test('accepts a bounded public video handoff from Finder', () => {
  const value = readFinderHandoff('?from=finder&intent=video&topic=%EA%B0%80%EC%9D%84%20%EC%97%AC%ED%96%89&category=%EC%97%AC%ED%96%89');
  assert.deepEqual(value, { version: '1.0', source: 'finder', intent: 'video', topic: '가을 여행', category: '여행' });
});

test('rejects unrelated and incomplete handoffs', () => {
  assert.equal(readFinderHandoff('?from=other&intent=video&topic=test'), null);
  assert.equal(readFinderHandoff('?from=finder&intent=blog&topic=test'), null);
  assert.equal(readFinderHandoff('?from=finder&intent=video'), null);
});

test('never accepts an API key field into the handoff object', () => {
  const value = readFinderHandoff('?from=finder&intent=video&topic=test&apiKey=secret');
  assert.equal(value.topic, 'test');
  assert.equal('apiKey' in value, false);
});

