const preloader = document.getElementById('preloader');
const preFill = document.getElementById('preloaderFill');
const prePct = document.getElementById('preloaderPct');

// ===== HERO PARTICLES =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: -1000, y: -1000 };
let canvasWidth = 0;
let canvasHeight = 0;
let pixelRatio = 1;
let particleFrame = 0;
let canvasInView = true;
let particlesRunning = false;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORS = ['102,228,255', '167,139,250', '240,244,255'];

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  canvasWidth = bounds.width;
  canvasHeight = bounds.height;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(canvasWidth * pixelRatio);
  canvas.height = Math.round(canvasHeight * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  initParticles();
}

function initParticles() {
  particles = [];
  const maxParticles = window.innerWidth < 700 ? 34 : 58;
  const count = Math.min(maxParticles, Math.floor(canvasWidth / 12));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - .5) * .32,
      vy: (Math.random() - .5) * .32,
      r: Math.random() * 1.4 + .7,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      a: Math.random() * .36 + .16
    });
  }
}

function drawParticles() {
  if (!particlesRunning) return;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared < 14400) {
        const distance = Math.sqrt(distanceSquared);
        ctx.strokeStyle = `rgba(${particles[i].c},${(1 - distance / 120) * .16})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  particles.forEach(p => {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const md = Math.hypot(dx, dy);
    if (md < 140 && md > 0) {
      p.x += (dx / md) * .22;
      p.y += (dy / md) * .22;
    }
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvasWidth) p.vx *= -1;
    if (p.y < 0 || p.y > canvasHeight) p.vy *= -1;

    ctx.fillStyle = `rgba(${p.c},${p.a})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  if (!reduceMotion) particleFrame = requestAnimationFrame(drawParticles);
}

function startParticles() {
  resizeCanvas();
  if (reduceMotion) {
    particlesRunning = true;
    drawParticles();
    particlesRunning = false;
    return;
  }
  particlesRunning = canvasInView;
  if (particlesRunning) drawParticles();
}

const particleObserver = new IntersectionObserver(([entry]) => {
  canvasInView = entry.isIntersecting;
  particlesRunning = canvasInView && !reduceMotion;
  if (!particlesRunning && particleFrame) {
    cancelAnimationFrame(particleFrame);
    particleFrame = 0;
  }
  if (particlesRunning && !particleFrame) drawParticles();
}, { threshold: 0.05 });
particleObserver.observe(canvas);

let resizeFrame = 0;
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    resizeCanvas();
    if (reduceMotion) {
      particlesRunning = true;
      drawParticles();
      particlesRunning = false;
    }
  });
});
canvas.parentElement.addEventListener('pointermove', e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
canvas.parentElement.addEventListener('pointerleave', () => { mouse.x = -1000; mouse.y = -1000; });

// ===== NAVBAR SCROLL & PROGRESS =====
const navbar = document.getElementById('navbar');
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
});

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const themeToggle = document.getElementById('themeToggle');
const themeColor = document.querySelector('meta[name="theme-color"]');

function setTheme(theme) {
  const isLight = theme === 'light';
  document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
  const action = isLight ? 'Aktifkan tema gelap' : 'Aktifkan tema terang';
  themeToggle.setAttribute('aria-label', action);
  themeToggle.setAttribute('title', action);
  themeColor.setAttribute('content', isLight ? '#f4f6fb' : '#050816');
  try {
    localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
  } catch {}
}

setTheme(document.documentElement.dataset.theme);
themeToggle.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('mobile-open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    const tabName = link.dataset.openTab;
    if (tabName) {
      document.querySelector(`.tab-btn[data-tab="${tabName}"]`)?.click();
    }
    hamburger.classList.remove('open');
    navLinks.classList.remove('mobile-open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = 'home';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
});

// ===== APP INIT (setelah preloader) =====
function bootApp() {
  initTyping();
  initReveal();
  initCounters();
}

// ===== TYPING EFFECT =====
function initTyping() {
const roles = ['pengembangan web', 'rekayasa perangkat lunak', 'pembuatan website', 'Laravel dan PHP'];
const typingEl = document.getElementById('typingText');
let roleIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const word = roles[roleIndex];
  if (!deleting) {
    charIndex++;
    typingEl.textContent = word.slice(0, charIndex);
    if (charIndex === word.length) { deleting = true; setTimeout(typeLoop, 1800); return; }
  } else {
    charIndex--;
    typingEl.textContent = word.slice(0, charIndex);
    if (charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; }
  }
  setTimeout(typeLoop, deleting ? 60 : 100);
}
typeLoop();
}

// ===== SCROLL REVEAL =====
function initReveal() {
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// ===== COUNTER ANIMATION =====
function initCounters() {
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    const duration = 1600;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));
}

// ===== HERO GSAP PARALLAX =====
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual && !reduceMotion) {
  heroVisual.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const bounds = heroVisual.getBoundingClientRect();
    const horizontal = (e.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (e.clientY - bounds.top) / bounds.height - 0.5;
    if (window.gsap) {
      window.gsap.to(heroVisual, {
        rotationY: horizontal * 4,
        rotationX: vertical * -4,
        duration: .55,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    } else {
      heroVisual.style.transform = `perspective(900px) rotateY(${horizontal * 4}deg) rotateX(${vertical * -4}deg)`;
    }
  });
  heroVisual.addEventListener('pointerleave', () => {
    if (window.gsap) {
      window.gsap.to(heroVisual, { rotationY: 0, rotationX: 0, duration: .7, ease: 'power2.out' });
    } else {
      heroVisual.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
    }
  });
}

document.querySelectorAll('.tech-item').forEach(item => {
  item.addEventListener('pointermove', event => {
    const bounds = item.getBoundingClientRect();
    item.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
    item.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
  });
});

// ===== SKILL CATEGORY FILTER =====
const skillFilters = document.querySelectorAll('.skill-filter');
const skillItems = document.querySelectorAll('.tech-item');

skillFilters.forEach(button => {
  button.addEventListener('click', () => {
    skillFilters.forEach(filterButton => {
      filterButton.classList.remove('active');
      filterButton.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');

    const category = button.dataset.skillFilter;
    skillItems.forEach(item => {
      item.hidden = category !== 'all' && item.dataset.skillCategory !== category;
    });
  });
});

// ===== PROJECT FILTERS =====
const projectFilters = document.querySelectorAll('.project-filter');
const projectCards = document.querySelectorAll('.project-card');

projectFilters.forEach(button => {
  button.addEventListener('click', () => {
    projectFilters.forEach(filterButton => {
      filterButton.classList.remove('active');
      filterButton.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');

    const category = button.dataset.projectFilter;
    projectCards.forEach(card => {
      const shouldShow = category === 'all' || card.dataset.category === category;
      card.hidden = !shouldShow;
      if (shouldShow) card.classList.add('visible');
    });
  });
});

// ===== PROJECT DETAIL DIALOG =====
const projectDialog = document.getElementById('projectDialog');
const dialogCover = document.getElementById('projectDialogCover');
const dialogCategory = document.getElementById('projectDialogCategory');
const dialogTitle = document.getElementById('projectDialogTitle');
const dialogDescription = document.getElementById('projectDialogDescription');
const dialogTech = document.getElementById('projectDialogTech');
const demoLink = document.getElementById('projectDemoLink');
const githubLink = document.getElementById('projectGithubLink');
const demoNote = document.getElementById('projectDemoNote');

document.querySelectorAll('[data-project-detail]').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.project-card');
    const cover = card.querySelector('.project-cover');
    const title = card.querySelector('h3').textContent.trim();
    const category = card.dataset.category;
    const demoUrl = card.dataset.demo;
    const githubUrl = card.dataset.github;

    dialogCover.className = `dialog-cover ${[...cover.classList].find(name => name.startsWith('cover-')) || ''}`;
    dialogCategory.textContent = category === 'dinamis' ? 'Web Dinamis' : 'Web Statis';
    dialogTitle.textContent = title;
    dialogDescription.textContent = card.querySelector('.project-body > p').textContent.trim();
    dialogTech.replaceChildren(...[...card.querySelectorAll('.project-tech span')].map(tag => {
      const badge = document.createElement('span');
      badge.textContent = tag.textContent;
      return badge;
    }));

    if (demoUrl) {
      demoLink.href = demoUrl;
      demoLink.removeAttribute('aria-disabled');
      demoLink.removeAttribute('tabindex');
      demoNote.hidden = true;
    } else {
      demoLink.removeAttribute('href');
      demoLink.setAttribute('aria-disabled', 'true');
      demoLink.tabIndex = -1;
      demoNote.hidden = false;
    }

    githubLink.href = githubUrl || `https://github.com/search?q=${encodeURIComponent(title)}&type=repositories`;
    projectDialog.showModal();
  });
});

document.querySelector('.dialog-close').addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('click', event => {
  if (event.target === projectDialog) projectDialog.close();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && projectDialog.open) projectDialog.close();
});

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const status = document.getElementById('formStatus');
  const formData = new FormData(e.target);
  const subject = encodeURIComponent(`Pesan portofolio dari ${formData.get('name')}`);
  const body = encodeURIComponent(`${formData.get('message')}\n\nDari: ${formData.get('name')} (${formData.get('email')})`);
  status.textContent = 'Draf email dibuka di aplikasi email kamu.';
  window.location.href = `mailto:anandawimaulana05@gmail.com?subject=${subject}&body=${body}`;
});

if (window.lucide) lucide.createIcons();

function finishLoading() {
  if (preloader) preloader.classList.add('done');
  document.body.style.overflow = '';
  startParticles();
  bootApp();
}

function runPreloader() {
  if (!preloader || !preFill || !prePct) {
    finishLoading();
    return;
  }

  const duration = reduceMotion ? 450 : 1900;
  const start = performance.now();
  document.body.style.overflow = 'hidden';

  function updateProgress(now) {
    const progress = Math.min((now - start) / duration, 1);
    const percentage = Math.round(progress * 100);
    preFill.style.width = `${percentage}%`;
    prePct.textContent = `${percentage}%`;

    if (progress < 1) {
      requestAnimationFrame(updateProgress);
      return;
    }

    finishLoading();
  }

  requestAnimationFrame(updateProgress);
}

runPreloader();
