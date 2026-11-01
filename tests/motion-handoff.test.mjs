import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HANDOFF_KEY,
  HANDOFF_TARGET,
  consumeLibrarianHandoff,
  createLibrarianHandoff,
  isIntegratedMotionLocation,
  saveLibrarianHandoff
} from '../motion-handoff.js';

const memoryStorage = () => {
  const data = new Map();
  return {
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: key => data.delete(key)
  };
};

test('creates the bounded v1 librarian handoff', () => {
  const result = createLibrarianHandoff({ lang: 'ko', topic: ' 도심   러닝 ', motionId: 11, motionName: 'FPV 드론 숏', prompt: '프롬프트' }, { now: '2026-11-26T09:00:00.000Z' });
  assert.deepEqual(result.value, { v: 1, from: 'motion', at: '2026-11-26T09:00:00.000Z', lang: 'ko', topic: '도심 러닝', motionId: 11, motionName: 'FPV 드론 숏', prompt: '프롬프트' });
  assert.deepEqual(result.truncated, { topic: false, prompt: false });
});

test('truncates topic and prompt and reports both changes', () => {
  const result = createLibrarianHandoff({ lang: 'en', topic: '가'.repeat(121), motionId: 1, motionName: '팬', prompt: 'x'.repeat(8001) });
  assert.equal(result.value.topic.length, 120);
  assert.equal(result.value.prompt.length, 8000);
  assert.deepEqual(result.truncated, { topic: true, prompt: true });
});

test('rejects empty prompts, invalid language and invalid motion ids', () => {
  assert.throws(() => createLibrarianHandoff({ lang: 'ko', topic: '', motionId: 1, motionName: '팬', prompt: '' }), /prompt/);
  assert.throws(() => createLibrarianHandoff({ lang: 'jp', topic: '', motionId: 1, motionName: '팬', prompt: 'x' }), /lang/);
  assert.throws(() => createLibrarianHandoff({ lang: 'ko', topic: '', motionId: 25, motionName: '팬', prompt: 'x' }), /motionId/);
});

test('stores, consumes and immediately removes one handoff', () => {
  const storage = memoryStorage();
  saveLibrarianHandoff(storage, { lang: 'ko', topic: '주제', motionId: 3, motionName: '돌리 인', prompt: '본문' });
  assert.ok(storage.getItem(HANDOFF_KEY));
  const value = consumeLibrarianHandoff(storage);
  assert.equal(value.prompt, '본문');
  assert.equal(storage.getItem(HANDOFF_KEY), null);
  assert.equal(consumeLibrarianHandoff(storage), null);
});

test('enables storage transfer only under the integrated motion path or local test path', () => {
  assert.equal(isIntegratedMotionLocation('https://thehansu.net/motion/'), true);
  assert.equal(isIntegratedMotionLocation('https://motion.thehansu.net/'), false);
  assert.equal(isIntegratedMotionLocation('http://127.0.0.1:8765/motion/'), true);
  assert.equal(HANDOFF_TARGET, '/?go=polish&from=motion');
});
