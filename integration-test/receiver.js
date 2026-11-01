import { HANDOFF_KEY, consumeLibrarianHandoff } from '../motion-handoff.js';

const output = document.querySelector('#result');
try {
  const value = consumeLibrarianHandoff(sessionStorage);
  output.textContent = JSON.stringify({ value, removed: sessionStorage.getItem(HANDOFF_KEY) === null }, null, 2);
} catch (error) {
  output.textContent = JSON.stringify({ error: error.message, removed: sessionStorage.getItem(HANDOFF_KEY) === null }, null, 2);
}
