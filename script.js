(() => {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const navigation = document.querySelector('.navigation');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('main section[id], main section#home')];

  // Theme preference is intentionally local to this page; no external services are used.
  try {
    if (localStorage.getItem('deepankar-portfolio-theme') === 'light') body.classList.add('light-mode');
  } catch (_) { /* Local storage may be unavailable in private browsing. */ }

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    try { localStorage.setItem('deepankar-portfolio-theme', isLight ? 'light' : 'dark'); } catch (_) { /* Ignore storage restrictions. */ }
  });

  const setMenuOpen = (isOpen) => {
    navigation.classList.toggle('open', isOpen);
    mobileMenu.setAttribute('aria-expanded', String(isOpen));
  };

  mobileMenu.addEventListener('click', () => {
    setMenuOpen(mobileMenu.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  document.addEventListener('click', (event) => {
    if (!navigation.contains(event.target) && !mobileMenu.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.forEach((candidate) => candidate.classList.remove('active'));
      link.classList.add('active');
      setMenuOpen(false);
    });
  });

  // Reveal sections as they enter the viewport; reduced-motion users see content immediately.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.querySelectorAll('.section-pad > *, .project-card, .hero-content').forEach((element) => element.classList.add('reveal'));
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  }

  // Keep the nav state matched to the visible section.
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id || 'home';
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}` || (id === 'experience' && link.getAttribute('href') === '#about')));
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0, .1, .25, .5] });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
