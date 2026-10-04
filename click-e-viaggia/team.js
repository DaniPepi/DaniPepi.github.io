'use strict';
const memberGrid = document.querySelector('#member-grid');
function validMember(member) {
  return member && typeof member.name === 'string' && member.name.trim() && typeof member.bio === 'string' && member.bio.trim() && typeof member.role === 'string' && typeof member.photo === 'string' && /^assets\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(member.photo);
}
fetch('./data/team.json', { cache: 'no-store' }).then(response => {
  if (!response.ok) throw new Error('Team non disponibile');
  return response.json();
}).then(data => {
  if (!Array.isArray(data.members)) throw new Error('Configurazione non valida');
  const members = data.members.filter(validMember);
  if (!members.length) return;
  memberGrid.replaceChildren(...members.map(member => {
    const card = document.createElement('article');
    card.className = 'member-card';
    const image = document.createElement('img');
    image.src = member.photo;
    image.alt = 'Ritratto di ' + member.name;
    image.width = 600;
    image.height = 750;
    image.loading = 'lazy';
    image.addEventListener('error', () => { image.hidden = true; });
    const role = document.createElement('p');
    role.className = 'eyebrow';
    role.textContent = member.role;
    const name = document.createElement('h3');
    name.textContent = member.name;
    const bio = document.createElement('p');
    bio.textContent = member.bio;
    card.append(image, role, name, bio);
    return card;
  }));
}).catch(() => {
  memberGrid.textContent = 'Le presentazioni del team non sono disponibili in questo momento. Riprova più tardi.';
});

