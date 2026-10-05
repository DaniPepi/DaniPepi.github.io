'use strict';
const shareButton = document.querySelector('#share-article');
const shareStatus = document.querySelector('#article-share-status');
const canonical = document.querySelector('link[rel="canonical"]').href;
shareButton.addEventListener('click', async () => {
  const data = {title: document.title, text: document.querySelector('h1').textContent.trim(), url: canonical};
  try {
    if (navigator.share) {
      await navigator.share(data);
      shareStatus.textContent = 'Articolo condiviso.';
    } else {
      await navigator.clipboard.writeText(canonical);
      shareStatus.textContent = 'Link copiato. Puoi condividerlo con chi desideri.';
    }
  } catch (error) {
    if (error.name === 'AbortError') return;
    const input = document.querySelector('#article-share-link');
    input.hidden = false;
    input.value = canonical;
    input.focus();
    input.select();
    shareStatus.textContent = 'Copia questo link per condividere il racconto.';
  }
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
