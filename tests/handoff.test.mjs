import test from 'node:test';
import assert from 'node:assert/strict';
import { getServiceTunnelState, readFinderHandoff } from '../handoff.js';

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

test('shows a return action only when the visitor came from Finder', () => {
  assert.equal(getServiceTunnelState(null).finderLabel, '파인더에서 주제 찾기');
  assert.equal(getServiceTunnelState({ source: 'finder' }).finderLabel, '파인더로 돌아가기');
  assert.equal(getServiceTunnelState(null).finderUrl, 'https://finder.thehansu.net/#opportunities');
});

test('routes the prompt library tunnel through the THE한수 hub', () => {
  assert.equal(getServiceTunnelState(null).promptLibraryUrl, 'https://thehansu.net/');
});

