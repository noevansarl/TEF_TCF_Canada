// landing/main.js — ayePREP

/* ========================
   1. Intersection Observer — animations d'entrée
   ======================== */
const animatedElements = document.querySelectorAll('[data-animate]');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
animatedElements.forEach(el => observer.observe(el));

/* ========================
   2. Compteurs animés (stats)
   ======================== */
function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const duration = 2000;
  const start = performance.now();
  const format = (n) => n >= 1000 ? (n / 1000).toFixed(0) + ' 000' : n.toString();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = format(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => statsObserver.observe(el));

/* ========================
   3. Header — sticky + scrolled
   ======================== */
const header = document.getElementById('header');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const scroll = window.scrollY;
  header.classList.toggle('scrolled', scroll > 50);
  lastScroll = scroll;
}, { passive: true });

/* ========================
   4. Menu burger mobile
   ======================== */
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');
const navCta = document.querySelector('.nav__cta');
burger?.addEventListener('click', () => {
  const expanded = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', !expanded);
  navLinks?.classList.toggle('nav__links--open');
  navCta?.classList.toggle('nav__cta--open');
});

/* ========================
   5. Slider témoignages
   ======================== */
const track = document.getElementById('testimonialsTrack');
const dots = document.querySelectorAll('.dot');
let current = 0;
let autoSlide;

function goToSlide(index) {
  const cards = track.querySelectorAll('.testimonial-card');
  if (!cards.length) return;
  const cardWidth = cards[0].offsetWidth + 24; // gap = 24px
  track.style.transform = `translateX(-${index * cardWidth}px)`;
  dots.forEach((d, i) => {
    d.classList.toggle('dot--active', i === index);
    d.setAttribute('aria-selected', i === index);
  });
  current = index;
}

document.getElementById('nextTestimonial')?.addEventListener('click', () => {
  const total = track.querySelectorAll('.testimonial-card').length;
  if (total) goToSlide((current + 1) % total);
  resetAutoSlide();
});
document.getElementById('prevTestimonial')?.addEventListener('click', () => {
  const total = track.querySelectorAll('.testimonial-card').length;
  if (total) goToSlide((current - 1 + total) % total);
  resetAutoSlide();
});
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    goToSlide(parseInt(dot.dataset.index));
    resetAutoSlide();
  });
});

function startAutoSlide() {
  autoSlide = setInterval(() => {
    const total = track?.querySelectorAll('.testimonial-card').length;
    if (total) goToSlide((current + 1) % total);
  }, 5000);
}
function resetAutoSlide() {
  clearInterval(autoSlide);
  startAutoSlide();
}
if (track) startAutoSlide();

/* ========================
   6. Toggle tarifs mensuel/annuel
   ======================== */
const toggleBtns = document.querySelectorAll('.toggle-btn');
toggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    toggleBtns.forEach(b => b.classList.remove('toggle-btn--active'));
    btn.classList.add('toggle-btn--active');
    const period = btn.dataset.period;
    document.querySelectorAll('.price[data-monthly]').forEach(price => {
      const val = period === 'yearly' 
        ? parseFloat(price.dataset.yearly).toFixed(2)
        : parseFloat(price.dataset.monthly).toFixed(2);
      price.textContent = val.replace('.', ',') + '€';
    });
  });
});

/* ========================
   7. Mini timer héro (décompte démo)
   ======================== */
let heroSeconds = 34 * 60 + 12;
const heroTimer = document.getElementById('heroTimer');
setInterval(() => {
  heroSeconds--;
  if (heroSeconds < 0) heroSeconds = 35 * 60;
  const m = Math.floor(heroSeconds / 60).toString().padStart(2, '0');
  const s = (heroSeconds % 60).toString().padStart(2, '0');
  if (heroTimer) heroTimer.textContent = `${m}:${s}`;
}, 1000);

/* ========================
   8. Simulation timer (section simulation CTA)
   ======================== */
let simSeconds = 2 * 3600 + 22 * 60;
const simTimerEl = document.getElementById('simTimer');
setInterval(() => {
  if (simSeconds > 0) simSeconds--;
  const h = Math.floor(simSeconds / 3600).toString().padStart(1, '0');
  const m = Math.floor((simSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = (simSeconds % 60).toString().padStart(2, '0');
  if (simTimerEl) simTimerEl.textContent = `${h}:${m}:${s}`;
}, 1000);
