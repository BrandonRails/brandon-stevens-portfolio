'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu(returnFocus = false) {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMenu();
});
const wideScreen = window.matchMedia('(min-width: 851px)');
wideScreen.addEventListener('change', () => closeMenu());
if ('IntersectionObserver' in window) {
  const sections = document.querySelectorAll('main section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigation.querySelectorAll('a').forEach(link => {
        const active = link.getAttribute('href') === '#' + entry.target.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, {rootMargin: '-15% 0px -65% 0px'});
  sections.forEach(section => observer.observe(section));
}
const form = document.querySelector('#contactForm');
const status = document.querySelector('#formStatus');
const submitButton = form.querySelector('button[type="submit"]');
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity() || submitButton.disabled) return;
  const label = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.textContent = 'Sending…';
  status.className = 'form-status';
  status.textContent = '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(form.action, {
      method: 'POST', body: new FormData(form),
      headers: {Accept: 'application/json'}, signal: controller.signal
    });
    if (!response.ok) throw new Error('Submission failed');
    status.className = 'form-status success';
    status.textContent = "Message sent. Thank you for reaching out—I'll be in touch.";
    form.reset();
  } catch (error) {
    status.className = 'form-status error';
    status.textContent = error.name === 'AbortError'
      ? 'Delivery could not be confirmed. Please email BrandonStevensPM@gmail.com before trying again.'
      : 'Your message could not be sent. Please try again or email BrandonStevensPM@gmail.com.';
  } finally {
    clearTimeout(timeout);
    submitButton.disabled = false;
    submitButton.innerHTML = label;
  }
});
