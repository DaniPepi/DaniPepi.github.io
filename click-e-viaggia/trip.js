'use strict';
const shareButton = document.querySelector('#share-trip');
const shareStatus = document.querySelector('#share-status');
const appointmentButton = document.querySelector('#appointment-button');
const contactDialog = document.querySelector('#appointment-dialog');
const canonical = document.querySelector('link[rel="canonical"]').href;
shareButton.addEventListener('click', async () => {
  const data = { title: document.title, text: document.querySelector('h1').textContent.trim(), url: canonical };
  try {
    if (navigator.share) {
      await navigator.share(data);
      shareStatus.textContent = 'Scheda condivisa.';
    } else {
      await navigator.clipboard.writeText(canonical);
      shareStatus.textContent = 'Link copiato. Puoi inviarlo a chi desideri.';
    }
  } catch (error) {
    if (error.name === 'AbortError') return;
    const input = document.querySelector('#share-link');
    input.hidden = false;
    input.value = canonical;
    input.focus();
    input.select();
    shareStatus.textContent = 'Copia questo link per condividere la scheda.';
  }
});
let appointmentUrl = '';
function validAppointment(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value);
    if (url.protocol === 'mailto:') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url.pathname);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}
appointmentButton.addEventListener('click', () => {
  if (appointmentUrl) {
    const url = new URL(appointmentUrl);
    if (url.hostname === 'wa.me') {
      const destination = document.body.dataset.destination || 'QUESTO VIAGGIO';
      url.searchParams.set('text', `Ciao team Click&Viaggia, vorrei prendere un appuntamento per informazioni sul VIAGGIO “${destination.toUpperCase()}”. Quando possiamo sentirci?`);
    }
    window.location.assign(url.href);
  } else {
    contactDialog.showModal();
  }
});
contactDialog.querySelector('button').addEventListener('click', () => contactDialog.close());
fetch('./data/contact.json', { cache: 'no-store' }).then(response => {
  if (!response.ok) throw new Error('Contatti non disponibili');
  return response.json();
}).then(data => {
  if (validAppointment(data.appointmentUrl)) appointmentUrl = data.appointmentUrl;
}).catch(() => {});

