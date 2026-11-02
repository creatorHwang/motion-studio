import { HANDOFF_TARGET, isIntegratedMotionLocation, saveLibrarianHandoff } from './motion-handoff.js';

const dialog = document.querySelector('#librarian-dialog');
const openButton = document.querySelector('#prompt-library-tunnel');
const sendButton = document.querySelector('#handoff-send');
const preview = document.querySelector('#handoff-preview');
const status = document.querySelector('#handoff-status');
const langInputs = [...document.querySelectorAll('input[name="handoff-lang"]')];
const integrated = isIntegratedMotionLocation(location.href);

function selection() {
  const lang = langInputs.find(input => input.checked)?.value === 'en' ? 'en' : 'ko';
  const motionSelect = document.querySelector('#motion-select');
  const option = motionSelect.selectedOptions[0];
  const label = option?.textContent || '';
  const motionName = label.split(' / ')[0].replace(/^\d+\s*·\s*/, '').trim();
  return {
    lang,
    topic: document.querySelector('#subject').value,
    motionId: Number(motionSelect.value),
    motionName,
    prompt: document.querySelector(lang === 'ko' ? '#prompt-ko' : '#prompt-en').value
  };
}

function refreshPreview() {
  preview.value = selection().prompt;
  if (!integrated) {
    status.textContent = 'THE한수 /motion/ 편입 후 사용할 수 있습니다. 현재 서브도메인에서는 저장하거나 이동하지 않습니다.';
    sendButton.disabled = true;
  } else {
    status.textContent = '프롬프트는 이 탭에 임시 저장되며 프롬프트 사서가 한 번 읽은 뒤 삭제합니다.';
    sendButton.disabled = false;
  }
}

openButton.addEventListener('click', () => {
  refreshPreview();
  dialog.showModal();
});
langInputs.forEach(input => input.addEventListener('change', refreshPreview));

sendButton.addEventListener('click', () => {
  try {
    const result = saveLibrarianHandoff(sessionStorage, selection());
    const notices = [];
    if (result.truncated.topic) notices.push('주제는 120자로 줄였습니다.');
    if (result.truncated.prompt) notices.push('프롬프트는 8,000자로 줄였습니다.');
    status.textContent = notices.join(' ') || '프롬프트를 저장했습니다. 프롬프트 사서로 이동합니다.';
    location.assign(HANDOFF_TARGET);
  } catch (error) {
    status.textContent = `전달할 수 없습니다: ${error.message}`;
  }
});
