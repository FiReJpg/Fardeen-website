const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const themeButton = document.querySelector('.theme-toggle');
let explicitTheme = false;
try { explicitTheme = ['light', 'dark'].includes(localStorage.getItem('truck-ventures-theme')); } catch {}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  themeButton.title = themeButton.getAttribute('aria-label');
  document.querySelector('meta[name="theme-color"]').content = dark ? '#101b1b' : '#f9f9f3';
}
applyTheme(document.documentElement.dataset.theme || 'light');
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  explicitTheme = true;
  applyTheme(theme);
  try { localStorage.setItem('truck-ventures-theme', theme); } catch {}
});
systemTheme.addEventListener('change', event => {
  if (!explicitTheme) applyTheme(event.matches ? 'dark' : 'light');
});

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.navigation')) closeMenu();
});
window.matchMedia('(min-width: 851px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const navLinks = [...navigation.querySelectorAll('a')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const current = link.hash === `#${entry.target.id}`;
        link.classList.toggle('active', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-20% 0px -55% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
}

document.querySelector('#year').textContent = new Date().getFullYear();

// Observe individual blocks, so tall sections remain readable on smaller screens.
// Opacity and the independent translate property leave hover transforms intact.
const motionItems = [...document.querySelectorAll([
  '.hero-content > *', '.benefits > div', '.about-photo', '.about-copy > *',
  '.section-heading > *', '.service-card', '.equipment-card', '.equipment-note',
  '.coverage-grid > div', '.process-grid > article', '.faq-grid > div:first-child > *',
  '.faq-list > details', '.contact-copy > *', '.contact-form', '.footer-main > *',
  '.footer-bottom > :not(.footer-copyright)'
].join(','))];
let motionObserver;

function configureScrollMotion() {
  motionObserver?.disconnect();
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    motionItems.forEach(item => item.classList.remove('motion-item', 'is-visible'));
    return;
  }
  motionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
  }, { rootMargin: '-105px 0px -40px 0px', threshold: 0.03 });

  motionItems.forEach(item => {
    const rect = item.getBoundingClientRect();
    const siblings = [...item.parentElement.children];
    item.style.setProperty('--motion-order', String(siblings.indexOf(item) % 4));
    item.classList.add('motion-item');
    item.classList.toggle('is-visible', rect.bottom > 105 && rect.top < window.innerHeight - 40);
    motionObserver.observe(item);
  });
}
configureScrollMotion();
reducedMotion.addEventListener('change', configureScrollMotion);

const hero = document.querySelector('.hero');
const heroSlides = [...document.querySelectorAll('.hero-image')];
const slideDots = [...document.querySelectorAll('.slide-dot')];
const slideControls = document.querySelector('.hero-controls');
const pauseButton = document.querySelector('.slide-pause');
let currentSlide = 0;
let slideTimer;
let userPaused = false;
let heroVisible = true;
let heroHovered = false;
let heroFocused = false;
let availableSlides = [];

function scheduleSlideshow() {
  clearTimeout(slideTimer);
  pauseButton.hidden = reducedMotion.matches;
  pauseButton.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
  pauseButton.setAttribute('aria-pressed', String(userPaused));
  pauseButton.firstElementChild.textContent = userPaused ? '▶' : 'Ⅱ';
  if (availableSlides.length < 2 || userPaused || reducedMotion.matches || !heroVisible || heroHovered || heroFocused || document.hidden) return;
  slideTimer = setTimeout(() => {
    const next = (availableSlides.indexOf(currentSlide) + 1) % availableSlides.length;
    showSlide(availableSlides[next]);
  }, 6500);
}

function showSlide(index) {
  if (!availableSlides.includes(index)) return;
  currentSlide = index;
  heroSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
  slideDots.forEach((dot, i) => {
    dot.classList.toggle('is-active', i === index);
    dot.setAttribute('aria-pressed', String(i === index));
  });
  const position = String(availableSlides.indexOf(index) + 1).padStart(2, '0');
  document.querySelector('.slide-count').textContent = `${position} / ${String(availableSlides.length).padStart(2, '0')}`;
  scheduleSlideshow();
}

Promise.all(heroSlides.map(slide => {
  if (slide.complete) return Promise.resolve(slide.naturalWidth > 0);
  return new Promise(resolve => {
    slide.addEventListener('load', () => resolve(true), { once: true });
    slide.addEventListener('error', () => resolve(false), { once: true });
  });
})).then(loaded => {
  availableSlides = loaded.flatMap((success, index) => success ? [index] : []);
  slideDots.forEach((dot, index) => { dot.hidden = !loaded[index]; });
  slideControls.hidden = availableSlides.length < 2;
  if (availableSlides.length) showSlide(availableSlides[0]);
});
slideDots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
pauseButton.addEventListener('click', () => {
  userPaused = !userPaused;
  if (!userPaused) { heroHovered = false; heroFocused = false; }
  scheduleSlideshow();
});
slideControls.addEventListener('pointerenter', event => {
  if (event.pointerType === 'mouse') { heroHovered = true; scheduleSlideshow(); }
});
slideControls.addEventListener('pointerleave', () => { heroHovered = false; scheduleSlideshow(); });
slideControls.addEventListener('focusin', () => { heroFocused = true; scheduleSlideshow(); });
slideControls.addEventListener('focusout', () => {
  requestAnimationFrame(() => { heroFocused = slideControls.contains(document.activeElement); scheduleSlideshow(); });
});
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    scheduleSlideshow();
  }).observe(hero);
}
document.addEventListener('visibilitychange', scheduleSlideshow);
reducedMotion.addEventListener('change', scheduleSlideshow);

// SVG motion follows the same routes at every screen size. Pause its clock
// offscreen and in background tabs, and keep a static diagram for reduced motion.
const routeDiagrams = [...document.querySelectorAll('.dispatch-visual')].map(element => ({
  element,
  svg: element.querySelector('svg'),
  onscreen: false
}));

function updateRouteMotion() {
  routeDiagrams.forEach(({ element, svg, onscreen }) => {
    const running = onscreen && !reducedMotion.matches && !document.hidden;
    element.classList.toggle('is-traveling', running);
    if (typeof svg.pauseAnimations === 'function') {
      if (running) svg.unpauseAnimations();
      else svg.pauseAnimations();
    }
  });
}

if ('IntersectionObserver' in window) {
  const routeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      routeDiagrams.find(diagram => diagram.element === entry.target).onscreen = entry.isIntersecting;
    });
    updateRouteMotion();
  }, { threshold: 0.1 });
  routeDiagrams.forEach(({ element }) => routeObserver.observe(element));
} else {
  routeDiagrams.forEach(diagram => { diagram.onscreen = true; });
}
document.addEventListener('visibilitychange', updateRouteMotion);
reducedMotion.addEventListener('change', updateRouteMotion);
updateRouteMotion();

const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
const submitButton = form.querySelector('.submit-button');
const submitLabel = submitButton.querySelector('.submit-label');
const formNote = form.querySelector('.form-note');
const formConfig = window.TRUCK_VENTURES_FORM || {};
const accessKey = typeof formConfig.accessKey === 'string' ? formConfig.accessKey.trim() : '';
const formReady = Boolean(accessKey);
let isSubmitting = false;

submitButton.disabled = !formReady;
formNote.textContent = formReady
  ? 'Your inquiry is sent securely through Web3Forms. We’ll use your details to respond.'
  : 'Contact form activation is pending. Please check back shortly.';

const fields = [
  { id: 'full-name', error: 'name-error', validate: input => input.value.trim().length >= 2, message: 'Please enter your full name.' },
  { id: 'phone', error: 'phone-error', validate: input => /^[+\d\s().-]+$/.test(input.value.trim()) && input.value.replace(/\D/g, '').length >= 10 && input.value.replace(/\D/g, '').length <= 15, message: 'Enter a valid phone number with 10–15 digits.' },
  { id: 'email', error: 'email-error', validate: input => input.value.trim() !== '' && input.validity.valid, message: 'Please enter a valid email address.' },
  { id: 'equipment-type', error: 'equipment-error', validate: input => input.value !== '', message: 'Please select your equipment type.' },
  { id: 'consent', error: 'consent-error', validate: input => input.checked, message: 'Please agree to be contacted about this inquiry.' }
];

function validateField(field) {
  const input = document.getElementById(field.id);
  const valid = field.validate(input);
  document.getElementById(field.error).textContent = valid ? '' : field.message;
  input.setAttribute('aria-invalid', String(!valid));
  return valid;
}

fields.forEach(field => {
  const input = document.getElementById(field.id);
  input.addEventListener('input', () => {
    status.hidden = true;
    if (input.hasAttribute('aria-invalid')) validateField(field);
  });
  input.addEventListener('blur', () => {
    if (input.value.trim() || input.getAttribute('aria-invalid') === 'true') validateField(field);
  });
});
form.addEventListener('input', () => { status.hidden = true; });
function showFormStatus(message, state, focus = true) {
  status.dataset.state = state;
  status.setAttribute('role', state === 'error' ? 'alert' : 'status');
  status.textContent = message;
  status.hidden = false;
  if (focus) {
    status.focus({ preventScroll: true });
    status.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (isSubmitting) return;
  if (!formReady) {
    showFormStatus('This contact form is not activated yet. No inquiry has been sent.', 'error');
    return;
  }
  const results = fields.map(validateField);
  const firstInvalid = results.indexOf(false);
  if (firstInvalid !== -1) {
    status.hidden = true;
    document.getElementById(fields[firstInvalid].id).focus();
    return;
  }
  if (form.elements.botcheck.checked) {
    showFormStatus('Unable to submit this inquiry. Please reload the page and try again.', 'error');
    return;
  }
  if (!navigator.onLine) {
    showFormStatus('You appear to be offline. Please reconnect and try again. Your details are still here.', 'error');
    return;
  }

  // The verified access key controls the recipient. The visitor's email is
  // Web3Forms' Reply-To address, so Truck Ventures can reply to the inquiry.
  const payload = {
    access_key: accessKey,
    subject: formConfig.subject || 'New dispatch inquiry | Truck Ventures',
    from_name: formConfig.fromName || 'Truck Ventures Website',
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    phone: form.elements.phone.value.trim(),
    equipment: form.elements.equipment.value,
    fleet_size: form.elements.fleetSize.value || 'Not specified',
    message: form.elements.message.value.trim() || 'Callback requested. No additional message provided.',
    contact_permission: 'I agree to be contacted about my dispatch inquiry.',
    botcheck: false
  };
  const controls = [...form.elements].map(control => ({ control, disabled: control.disabled }));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  isSubmitting = true;
  form.setAttribute('aria-busy', 'true');
  controls.forEach(({ control }) => { control.disabled = true; });
  submitButton.classList.add('is-loading');
  submitLabel.textContent = 'Sending inquiry…';
  showFormStatus('Sending your inquiry. Please wait…', 'pending', false);

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success !== true) {
      const message = response.status === 429
        ? 'Too many inquiries have been submitted recently. Please wait and try again later.'
        : 'Your inquiry could not be sent. Your details have been kept. Please try again later.';
      showFormStatus(message, 'error');
      return;
    }

    form.reset();
    fields.forEach(field => {
      document.getElementById(field.id).removeAttribute('aria-invalid');
      document.getElementById(field.error).textContent = '';
    });
    showFormStatus('Thank you! Your inquiry has been sent to Truck Ventures. We’ll be in touch using the details you provided.', 'success');
  } catch {
    // A lost response can happen after the service accepts an inquiry. Do not
    // auto-retry or show a false success, and keep all input for the visitor.
    showFormStatus('We couldn’t confirm your submission. Your details are still here. Check your connection and wait a moment before retrying to avoid duplicate inquiries.', 'error');
  } finally {
    clearTimeout(timeout);
    isSubmitting = false;
    form.removeAttribute('aria-busy');
    controls.forEach(({ control, disabled }) => { control.disabled = disabled; });
    submitButton.classList.remove('is-loading');
    submitLabel.textContent = 'Request a callback';
  }
});
