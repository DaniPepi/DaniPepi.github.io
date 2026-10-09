'use strict';

(() => {
  const body = document.body;
  if (!body?.classList.contains('metallic-site') || body.dataset.siteInteractions === 'ready') return;
  body.dataset.siteInteractions = 'ready';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const depthElements = new WeakSet();
  const orbitalElements = [...document.querySelectorAll('.team-intro, .contact')];
  let depth = null;
  let depthBounds = null;
  let depthPoint = null;
  let depthFrame = 0;
  let viewportFrame = 0;

  function motionAllowed() {
    return finePointer.matches && !reduced.matches && !document.hidden && !document.querySelector('dialog[open]');
  }

  function resetDepth() {
    if (depthFrame) cancelAnimationFrame(depthFrame);
    depthFrame = 0;
    if (depth) {
      depth.classList.remove('site-depth-active');
      ['--site-depth-x', '--site-depth-y', '--site-orbit-x', '--site-orbit-y', '--site-orbit-turn'].forEach(property => depth.style.removeProperty(property));
    }
    depth = null;
    depthBounds = null;
    depthPoint = null;
  }

  function paintDepth() {
    depthFrame = 0;
    if (!depth || !depthPoint || !depthBounds || !motionAllowed()) { resetDepth(); return; }
    const limit = value => Math.max(-1, Math.min(1, value));
    const x = limit((depthPoint.x - depthBounds.left) / depthBounds.width * 2 - 1);
    const y = limit((depthPoint.y - depthBounds.top) / depthBounds.height * 2 - 1);
    if (depth.hasAttribute('data-site-orbit')) {
      depth.style.setProperty('--site-orbit-x', `${(x * 18).toFixed(2)}px`);
      depth.style.setProperty('--site-orbit-y', `${(y * 12).toFixed(2)}px`);
      depth.style.setProperty('--site-orbit-turn', `${(x * 4).toFixed(2)}deg`);
    } else {
      depth.style.setProperty('--site-depth-x', `${(-y * 3).toFixed(2)}deg`);
      depth.style.setProperty('--site-depth-y', `${(x * 4).toFixed(2)}deg`);
    }
  }

  function addDepth(element, image, orbital = false) {
    if (!element || depthElements.has(element)) return;
    depthElements.add(element);
    if (orbital) element.setAttribute('data-site-orbit', '');
    else if (image) image.classList.add('site-depth-picture');
    element.setAttribute('data-site-depth', orbital ? 'orbit' : 'photo');
    element.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || event.buttons || !motionAllowed()) return;
      if (depth !== element) {
        resetDepth();
        depth = element;
        depthBounds = element.getBoundingClientRect();
        if (!depthBounds.width || !depthBounds.height) { resetDepth(); return; }
        depth.classList.add('site-depth-active');
      }
      depthPoint = { x: event.clientX, y: event.clientY };
      if (!depthFrame) depthFrame = requestAnimationFrame(paintDepth);
    }, { passive: true });
    element.addEventListener('pointerleave', () => { if (depth === element) resetDepth(); }, { passive: true });
    element.addEventListener('pointercancel', resetDepth, { passive: true });
  }

  orbitalElements.forEach(element => addDepth(element, null, true));

  function addMemberDepth() {
    document.querySelectorAll('.member-card img, .journal-photo > img').forEach(image => {
      if (!image.closest('a, button, .deck-card, .blog-strip-item, .trip-visual')) addDepth(image, image);
    });
  }
  addMemberDepth();
  const memberGrid = document.querySelector('#member-grid');
  if (memberGrid && 'MutationObserver' in window) {
    new MutationObserver(addMemberDepth).observe(memberGrid, { childList: true, subtree: true });
  }

  // Photo buttons are created only when a native modal is available. The source
  // figure/caption stays in place, including every original attribution link.
  if (typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal === 'function') {
    const photographs = [...document.querySelectorAll('.article-cover, .article-photo')].map(figure => {
      const image = figure.querySelector(':scope > img');
      if (!image || image.closest('a, button')) return null;
      return { figure, image, caption: figure.querySelector(':scope > figcaption'), opener: null };
    }).filter(Boolean);

    if (photographs.length) {
      const dialog = document.createElement('dialog');
      dialog.id = 'site-photo-viewer';
      dialog.setAttribute('aria-labelledby', 'site-photo-title');
      dialog.innerHTML = '<div class="site-photo-toolbar"><h2 id="site-photo-title">Le fotografie del racconto</h2><div class="site-photo-tools"><output id="site-photo-count" aria-live="polite"></output><button type="button" id="site-photo-close" aria-label="Chiudi la fotografia">×</button></div></div><figure class="site-photo-viewer-figure"><img id="site-photo-full" alt=""><figcaption id="site-photo-caption"></figcaption></figure><div class="site-photo-navigation"><button type="button" id="site-photo-prev" aria-label="Fotografia precedente">←</button><button type="button" id="site-photo-next" aria-label="Fotografia successiva">→</button></div>';
      const fullImage = dialog.querySelector('#site-photo-full');
      const caption = dialog.querySelector('#site-photo-caption');
      const count = dialog.querySelector('#site-photo-count');
      const closeButton = dialog.querySelector('#site-photo-close');
      const previousButton = dialog.querySelector('#site-photo-prev');
      const nextButton = dialog.querySelector('#site-photo-next');
      let selected = 0;
      let previousFocus = null;
      let backdropDown = false;
      let imageTransition = 0;
      previousButton.hidden = photographs.length < 2;
      nextButton.hidden = photographs.length < 2;
      body.append(dialog);

      function selectPhoto(index, animate = true) {
        selected = (index + photographs.length) % photographs.length;
        const photo = photographs[selected];
        const source = photo.image.getAttribute('src');
        fullImage.classList.remove('site-photo-change');
        clearTimeout(imageTransition);
        fullImage.src = source;
        fullImage.alt = photo.image.alt;
        fullImage.decoding = 'async';
        caption.replaceChildren();
        if (photo.image.alt) {
          const description = document.createElement('p');
          description.className = 'site-photo-description';
          description.textContent = photo.image.alt;
          caption.append(description);
        }
        if (photo.caption) [...photo.caption.childNodes].forEach(node => caption.append(node.cloneNode(true)));
        count.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(photographs.length).padStart(2, '0')}`;
        count.setAttribute('aria-label', `Fotografia ${selected + 1} di ${photographs.length}`);
        dialog.dataset.photoIndex = String(selected);
        if (animate && !reduced.matches) {
          // One opacity transition on explicit input; no autoplay or idle loop.
          void fullImage.offsetWidth;
          fullImage.classList.add('site-photo-change');
          imageTransition = setTimeout(() => fullImage.classList.remove('site-photo-change'), 350);
        }
      }

      function openPhoto(index, opener) {
        if (dialog.open || document.querySelector('dialog[open]')) return;
        resetDepth();
        previousFocus = opener;
        selectPhoto(index, false);
        dialog.showModal();
        body.classList.add('site-photo-viewing');
        closeButton.focus({ preventScroll: true });
      }

      function closePhoto() { if (dialog.open) dialog.close(); }
      closeButton.addEventListener('click', closePhoto);
      previousButton.addEventListener('click', () => selectPhoto(selected - 1));
      nextButton.addEventListener('click', () => selectPhoto(selected + 1));
      dialog.addEventListener('cancel', event => { event.preventDefault(); closePhoto(); });
      dialog.addEventListener('close', () => {
        body.classList.remove('site-photo-viewing');
        clearTimeout(imageTransition);
        fullImage.classList.remove('site-photo-change');
        backdropDown = false;
        if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
        previousFocus = null;
      });
      dialog.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey || photographs.length < 2) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          selectPhoto(selected + (event.key === 'ArrowLeft' ? -1 : 1));
        }
      });
      function outsideDialog(event) {
        const rect = dialog.getBoundingClientRect();
        return event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
      }
      dialog.addEventListener('pointerdown', event => { backdropDown = outsideDialog(event); });
      dialog.addEventListener('click', event => { if (backdropDown && outsideDialog(event)) closePhoto(); backdropDown = false; });
      dialog.addEventListener('pointercancel', () => { backdropDown = false; });

      photographs.forEach((photo, index) => {
        const opener = document.createElement('button');
        opener.type = 'button';
        opener.className = 'site-photo-open';
        opener.dataset.sitePhoto = String(index);
        opener.setAttribute('aria-label', `Ingrandisci la fotografia${photo.image.alt ? `: ${photo.image.alt}` : ''}`);
        opener.setAttribute('aria-haspopup', 'dialog');
        opener.setAttribute('aria-controls', dialog.id);
        const magnifier = document.createElement('span');
        magnifier.className = 'site-photo-magnifier';
        magnifier.setAttribute('aria-hidden', 'true');
        magnifier.textContent = '↗';
        photo.image.before(opener);
        opener.append(photo.image, magnifier);
        photo.opener = opener;
        opener.addEventListener('click', () => openPhoto(index, opener));
        addDepth(opener, photo.image);
      });
    }
  }

  const progress = document.createElement('progress');
  progress.id = 'site-reading-progress';
  progress.max = 100;
  progress.value = 0;
  progress.setAttribute('aria-hidden', 'true');
  progress.tabIndex = -1;
  const backTop = document.createElement('button');
  backTop.id = 'site-back-top';
  backTop.type = 'button';
  backTop.textContent = '↑';
  backTop.setAttribute('aria-label', 'Torna all’inizio della pagina');
  backTop.hidden = true;
  body.append(progress, backTop);

  function focusPageStart() {
    const target = document.querySelector('header a[href]') || document.querySelector('main');
    if (!target) return;
    if (!target.matches('a[href], button, [tabindex]')) {
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
    target.focus({ preventScroll: true });
  }
  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
    focusPageStart();
  });

  // Only local fragment links in header navigation take part. Page selection,
  // filter selection and carousel aria-current attributes are never modified.
  const navigation = [...document.querySelectorAll('header nav a[href]')].map(link => {
    try {
      const url = new URL(link.getAttribute('href'), window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash || link.getAttribute('aria-current') === 'page') return null;
      const section = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      return section ? { link, section, originalCurrent: link.getAttribute('aria-current') } : null;
    } catch { return null; }
  }).filter(Boolean);

  function updateViewport() {
    viewportFrame = 0;
    const scroller = document.scrollingElement || document.documentElement;
    const distance = Math.max(0, scroller.scrollHeight - window.innerHeight);
    const top = Math.max(0, window.scrollY);
    progress.hidden = distance <= 1;
    progress.value = distance > 0 ? Math.min(100, top / distance * 100) : 0;
    const showTop = top > 600;
    if (!showTop && document.activeElement === backTop) focusPageStart();
    backTop.hidden = !showTop;

    const header = document.querySelector('body > header');
    const headerHeight = Math.max(0, header?.getBoundingClientRect().height || 0);
    const marker = Math.min(window.innerHeight * .35, headerHeight + 120);
    let active = null;
    navigation.forEach(record => {
      if (record.section.closest('[hidden], [inert]') || record.link.closest('[hidden], [inert]')) return;
      const rect = record.section.getBoundingClientRect();
      if (rect.width && rect.height && rect.top <= marker && rect.bottom > marker) active = record;
    });
    navigation.forEach(record => {
      const current = active === record;
      record.link.classList.toggle('site-current-section', current);
      if (current) record.link.setAttribute('aria-current', 'location');
      else if (record.originalCurrent !== null) record.link.setAttribute('aria-current', record.originalCurrent);
      else record.link.removeAttribute('aria-current');
    });
  }

  function scheduleViewport() { if (!viewportFrame) viewportFrame = requestAnimationFrame(updateViewport); }
  window.addEventListener('scroll', () => { resetDepth(); scheduleViewport(); }, { passive: true });
  window.addEventListener('resize', () => { resetDepth(); scheduleViewport(); }, { passive: true });
  window.addEventListener('hashchange', scheduleViewport);
  window.addEventListener('load', scheduleViewport, { once: true });
  window.addEventListener('blur', resetDepth);
  window.addEventListener('pagehide', () => {
    resetDepth();
    if (viewportFrame) cancelAnimationFrame(viewportFrame);
    viewportFrame = 0;
  });
  window.addEventListener('pageshow', scheduleViewport);
  document.addEventListener('visibilitychange', resetDepth);
  reduced.addEventListener('change', resetDepth);
  finePointer.addEventListener('change', resetDepth);
  if ('MutationObserver' in window) {
    // Account/carousel dialogs can be added after this deferred script starts.
    const dialogObserver = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const dialogs = node.matches('dialog') ? [node] : [...node.querySelectorAll('dialog')];
        dialogs.forEach(dialog => dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
      }));
      if (depth && !motionAllowed()) resetDepth();
    });
    document.querySelectorAll('dialog').forEach(dialog => dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
    dialogObserver.observe(body, { childList: true });
  }
  updateViewport();
})();
