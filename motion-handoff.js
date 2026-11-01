export const HANDOFF_KEY = 'hansu_handoff';
export const HANDOFF_TARGET = '/?go=polish&from=motion';

const clean = (value, max) => String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').slice(0, max);

export function isIntegratedMotionLocation(input) {
  const url = input instanceof URL ? input : new URL(input, 'https://thehansu.net');
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  return (url.hostname === 'thehansu.net' || local) && /^\/motion(?:\/|$)/.test(url.pathname);
}

export function createLibrarianHandoff(input, options = {}) {
  const lang = input?.lang;
  if (lang !== 'ko' && lang !== 'en') throw new TypeError('lang must be ko or en');
  const rawPrompt = String(input?.prompt ?? '').normalize('NFKC').trim();
  if (!rawPrompt) throw new TypeError('prompt is required');
  const rawTopic = String(input?.topic ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ');
  const prompt = rawPrompt.slice(0, 8000);
  const topic = rawTopic.slice(0, 120);
  const motionId = Number(input?.motionId);
  if (!Number.isInteger(motionId) || motionId < 1 || motionId > 24) throw new TypeError('motionId is invalid');
  const motionName = clean(input?.motionName, 80);
  if (!motionName) throw new TypeError('motionName is required');
  return {
    value: {
      v: 1,
      from: 'motion',
      at: new Date(options.now ?? Date.now()).toISOString(),
      lang,
      topic,
      motionId,
      motionName,
      prompt
    },
    truncated: { topic: rawTopic.length > 120, prompt: rawPrompt.length > 8000 }
  };
}

export function saveLibrarianHandoff(storage, input, options = {}) {
  const result = createLibrarianHandoff(input, options);
  storage.setItem(HANDOFF_KEY, JSON.stringify(result.value));
  return result;
}

export function consumeLibrarianHandoff(storage) {
  const raw = storage.getItem(HANDOFF_KEY);
  if (raw == null) return null;
  storage.removeItem(HANDOFF_KEY);
  const parsed = JSON.parse(raw);
  return createLibrarianHandoff(parsed, { now: parsed.at }).value;
}
