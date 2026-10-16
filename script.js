/* Interactive portfolio — lightweight, accessible and framework-free */
(() => {
  'use strict';

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

  const themeButton = $('#themeToggle');
  const menuButton = $('#menuToggle');
  const topNav = $('#topNav');
  const backButton = $('#backToTop');
  const year = $('#copyrightYear');
  const filters = $$('.filter-btn');
  const cards = $$('.case-card[data-categories]');
  const emptyState = $('#filterEmpty');
  const navLinks = $$('.top-nav .nav-link');

  if (year) year.textContent = String(new Date().getFullYear());

  function setTheme(theme) {
    const dark = theme === 'dark';
    document.body.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    if (themeButton) {
      themeButton.setAttribute('aria-label', dark ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối');
      themeButton.setAttribute('title', dark ? 'Giao diện sáng' : 'Giao diện tối');
    }
    try { localStorage.setItem('portfolio-theme', theme); } catch (_) { /* storage unavailable */ }
  }

  let preferredTheme = 'light';
  try {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'dark' || saved === 'light') preferredTheme = saved;
  } catch (_) { /* file:// or storage disabled */ }
  setTheme(preferredTheme);

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
    });
  }

  function closeMenu() {
    if (!topNav || !menuButton) return;
    topNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Mở menu');
  }

  if (menuButton && topNav) {
    menuButton.addEventListener('click', () => {
      const willOpen = !topNav.classList.contains('open');
      topNav.classList.toggle('open', willOpen);
      menuButton.setAttribute('aria-expanded', String(willOpen));
      menuButton.setAttribute('aria-label', willOpen ? 'Đóng menu' : 'Mở menu');
    });

    $$('.top-nav a, .side-nav a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', event => {
      if (!topNav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 990) closeMenu();
    }, {passive:true});
  }

  filters.forEach(button => {
    button.addEventListener('click', () => {
      const value = button.dataset.filter || 'all';
      filters.forEach(other => {
        const selected = other === button;
        other.classList.toggle('selected', selected);
        other.setAttribute('aria-pressed', String(selected));
      });
      let visibleCount = 0;
      cards.forEach(card => {
        const categories = (card.dataset.categories || '').split(/\s+/);
        const show = value === 'all' || categories.includes(value);
        card.hidden = !show;
        if (show) visibleCount++;
      });
      if (emptyState) emptyState.hidden = visibleCount > 0;
    });
  });

  function updateBackButton() {
    if (backButton) backButton.classList.toggle('visible', window.scrollY > 520);
  }
  window.addEventListener('scroll', updateBackButton, {passive:true});
  updateBackButton();
  if (backButton) backButton.addEventListener('click', () => {
    window.scrollTo({top:0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });

  const sections = ['home', 'about', 'skills', 'projects', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      const candidates = entries.filter(e => e.isIntersecting);
      if (!candidates.length) return;
      candidates.sort((a,b) => b.intersectionRatio - a.intersectionRatio);
      const sectionId = candidates[0].target.id;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === '#' + sectionId;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin:'-22% 0px -55% 0px', threshold:[0,.2,.5,1]});
    sections.forEach(section => observer.observe(section));
  }

  // Internal project links always reveal their card, including after filtering.
  $$('a[href="#ai-case"], a[href="#travel-case"]').forEach(link => {
    link.addEventListener('click', () => {
      const target = $(link.getAttribute('href'));
      if (!target || !target.hidden) return;
      const all = filters.find(button => button.dataset.filter === 'all');
      if (all) all.click();
    });
  });
})();
