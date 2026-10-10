import {loadAccountConfig} from './account-core.js?v=2';

// The guest diary stays in this browser. Account choices travel only through
// the authenticated Firestore listener and never overwrite guest storage.
const publishEvent = 'click-viaggia:globe-diary';
const requestEvent = 'click-viaggia:globe-diary-request';
let state = {source: 'loading', visited: []};
let account = null, hasUser = false, pending = [], disposed = false;

function validCodes(values) {
  return Array.isArray(values)
    ? [...new Set(values.filter(code => typeof code === 'string' && /^[a-z]{2}$/.test(code)))].sort()
    : [];
}
function broadcast() {
  if (!disposed) window.dispatchEvent(new CustomEvent(publishEvent, {detail: {...state, visited: [...state.visited]}}));
}
function select(source, values = []) {
  state = {source, visited: validCodes(values)};
  broadcast();
}
function requestState() { broadcast(); }
function pageShow() { broadcast(); }
function pageHide(event) {
  if (event.persisted) return;
  disposed = true;
  account?.dispose();
  window.removeEventListener(requestEvent, requestState);
  window.removeEventListener('pageshow', pageShow);
  window.removeEventListener('pagehide', pageHide);
}
window.addEventListener(requestEvent, requestState);
window.addEventListener('pageshow', pageShow);
window.addEventListener('pagehide', pageHide);
broadcast();

try {
  const config = await loadAccountConfig();
  if (!disposed && !config.enabled) select('guest');
  if (!disposed && config.enabled) {
    const {connectAccount} = await import('./map-auth.js?v=2');
    if (!disposed) {
      account = await connectAccount({
        ready(value) {
          if (disposed) return;
          // Clear the previous account before the next user's snapshot arrives.
          if (!value) { pending = []; select('loading'); }
          else if (hasUser) select('account', pending);
        },
        user(value) {
          if (disposed) return;
          hasUser = Boolean(value); pending = [];
          select(hasUser ? 'loading' : 'guest');
        },
        data(values) { if (!disposed && hasUser) pending = validCodes(values); },
        error() { if (!disposed) { pending = []; select('unavailable'); } }
      });
      if (disposed) account?.dispose();
      else if (!account) select('guest');
    }
  }
} catch {
  if (!disposed) select('unavailable');
}
