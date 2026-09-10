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

// Motion is progressive enhancement: the complete page stays visible without JS.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionAnimations = new Set();
let revealObserver;
let motionFrame = 0;
function playMotion(element, keyframes, options) {
  if (motionPreference.matches || !element.animate) return;
  const animation = element.animate(keyframes, options);
  motionAnimations.add(animation);
  animation.onfinish = () => motionAnimations.delete(animation);
}
function updateScrollMotion() {
  motionFrame = 0;
  if (motionPreference.matches) return;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector('.reading-progress').style.transform = `scaleX(${height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0})`;
  const panorama = document.querySelector('.city-panorama');
  const rect = panorama.getBoundingClientRect();
  if (rect.bottom > 0 && rect.top < window.innerHeight) {
    const offset = Math.max(-35, Math.min(35, (window.innerHeight / 2 - rect.top - rect.height / 2) * .075));
    panorama.style.setProperty('--city-shift', `${offset}px`);
  }
}
function queueScrollMotion() {
  if (!motionPreference.matches && !motionFrame) motionFrame = requestAnimationFrame(updateScrollMotion);
}
function startMotion() {
  if (motionPreference.matches) return;
  document.querySelectorAll('.headline-line').forEach((line, index) => {
    playMotion(line, [{opacity:0, transform:'translateY(30px)', filter:'blur(5px)'},{opacity:1, transform:'translateY(0)', filter:'blur(0)'}], {duration:850,delay:90 + index * 140,easing:'cubic-bezier(.2,.65,.3,1)',fill:'backwards'});
  });
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const siblings = [...element.parentElement.children];
        const stagger = element.matches('.service,.resource,.proof-grid>div') ? (siblings.indexOf(element) % 3) * 85 : 0;
        playMotion(element,[{opacity:0,transform:'translateY(26px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,delay:stagger,easing:'cubic-bezier(.2,.65,.3,1)',fill:'backwards'});
        revealObserver.unobserve(element);
      });
    },{threshold:.12});
    document.querySelectorAll('.section-head,.case,.service,.resource,.about-grid,.contact-grid,.proof-grid>div').forEach(element=>revealObserver.observe(element));
  }
  queueScrollMotion();
}
window.addEventListener('scroll',queueScrollMotion,{passive:true});
window.addEventListener('resize',queueScrollMotion,{passive:true});
motionPreference.addEventListener('change',()=>{
  revealObserver?.disconnect();
  motionAnimations.forEach(animation=>animation.cancel());
  motionAnimations.clear();
  if (motionFrame) cancelAnimationFrame(motionFrame);
  motionFrame=0;
  document.querySelector('.city-panorama').style.removeProperty('--city-shift');
  if (!motionPreference.matches) startMotion();
});
startMotion();
