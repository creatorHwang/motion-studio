const limit = (value, max) => String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').slice(0, max);

export function readFinderHandoff(search) {
  const params = new URLSearchParams(search);
  if (params.get('from') !== 'finder' || params.get('intent') !== 'video') return null;
  const topic = limit(params.get('topic'), 120);
  const category = limit(params.get('category'), 60);
  if (!topic) return null;
  return { version: '1.0', source: 'finder', intent: 'video', topic, category };
}

export function applyFinderHandoff(handoff, root = document) {
  if (!handoff) return false;
  const subject = root.querySelector('#subject');
  const scene = root.querySelector('#scene');
  const banner = root.querySelector('#brief-banner');
  const title = root.querySelector('#brief-title');
  if (!subject || !scene || !banner || !title) return false;
  subject.value = handoff.topic;
  scene.value = `${handoff.category ? handoff.category + ' 분야의 ' : ''}${handoff.topic} 트렌드를 설명하는 영상 장면`;
  title.textContent = `파인더에서 선택한 주제 · ${handoff.topic}`;
  banner.hidden = false;
  subject.dispatchEvent(new Event('input', { bubbles: true }));
  scene.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

if (typeof document !== 'undefined') applyFinderHandoff(readFinderHandoff(location.search));

