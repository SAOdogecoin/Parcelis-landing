// Parcelis — shared interactions
document.documentElement.classList.add('js-anim');

// --- nav scroll state ---
(() => {
  const nav = document.querySelector('.nav, .nav-v2');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// --- reveal on scroll — per element, triggers as each enters view ---
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const reveal = (el) => el.classList.add('in');
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < (window.innerHeight || document.documentElement.clientHeight);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        reveal(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -20% 0px' });

  setTimeout(() => {
    // Force layout commit so opacity:0 is painted before any reveal fires
    els.forEach(el => el.getBoundingClientRect());

    els.forEach(el => {
      if (inView(el)) {
        // Already on screen at load — show instantly, no animation
        reveal(el);
      } else {
        io.observe(el);
      }
    });
  }, 200);
})();

// --- animated count-up ---
(() => {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const fmt = (n, decimals = 0) => {
    if (decimals === 0) return Math.round(n).toLocaleString();
    return n.toFixed(decimals);
  };
  const setFinal = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    el.textContent = fmt(target, decimals);
  };
  // Always show the final value first so it never reads as "0" if animations don't fire.
  counters.forEach(setFinal);

  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1400;
    const start = performance.now();
    el.textContent = fmt(0, decimals);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(target * eased, decimals);
      if (t < 1) requestAnimationFrame(tick);
      else setFinal(el);
    };
    requestAnimationFrame(tick);
  };
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animate(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => io.observe(el));
})();

// --- how-it-works tabs ---
(() => {
  const tabs = document.querySelectorAll('.how-tab');
  const panels = document.querySelectorAll('.how-panel-content');
  if (!tabs.length) return;
  const select = (id) => {
    tabs.forEach((t) => t.setAttribute('aria-selected', t.dataset.tab === id ? 'true' : 'false'));
    panels.forEach((p) => p.hidden = p.dataset.panel !== id);
  };
  tabs.forEach((t) => t.addEventListener('click', () => select(t.dataset.tab)));
  select(tabs[0].dataset.tab);
})();

// --- use-case tabs ---
(() => {
  const tabs = document.querySelectorAll('.uc-tab');
  const panels = document.querySelectorAll('.uc-panel-content');
  if (!tabs.length) return;
  const select = (id) => {
    tabs.forEach((t) => t.setAttribute('aria-selected', t.dataset.uc === id ? 'true' : 'false'));
    panels.forEach((p) => p.hidden = p.dataset.uc !== id);
  };
  tabs.forEach((t) => t.addEventListener('click', () => select(t.dataset.uc)));
  if (tabs.length) select(tabs[0].dataset.uc);
})();

// --- claims demo ---
(() => {
  const reasons = document.querySelectorAll('.reason');
  const amountInput = document.getElementById('demo-amount');
  const resultAmt = document.getElementById('result-amt');
  const resultReason = document.getElementById('result-reason');
  const resultStatus = document.getElementById('result-status');
  const resultEta = document.getElementById('result-eta');
  if (!reasons.length) return;

  const state = { reason: 'lost', amount: 142 };

  const update = () => {
    if (amountInput && document.activeElement !== amountInput) {
      amountInput.value = state.amount;
    }
    if (resultAmt) resultAmt.textContent = state.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const reasonText = { lost: 'Lost in transit', damaged: 'Damaged on arrival', stolen: 'Porch theft' }[state.reason];
    if (resultReason) resultReason.textContent = reasonText;
    const eta = state.reason === 'damaged' ? '36h' : state.reason === 'stolen' ? '48h' : '24h';
    if (resultEta) resultEta.textContent = eta;
    if (resultStatus) resultStatus.textContent = state.amount > 500 ? 'Manual review' : 'Auto-approved';
  };

  reasons.forEach((r) => {
    r.addEventListener('click', () => {
      reasons.forEach((x) => x.setAttribute('aria-pressed', x === r ? 'true' : 'false'));
      state.reason = r.dataset.reason;
      update();
    });
  });
  if (amountInput) {
    amountInput.addEventListener('input', () => {
      const v = parseFloat(amountInput.value) || 0;
      state.amount = Math.max(0, Math.min(2000, v));
      update();
    });
  }
  update();
})();

// --- zero-word: count 9→0 then crossfade to "zero" ---
(() => {
  const el = document.getElementById('zero-word');
  if (!el) return;
  let triggered = false;
  const run = () => {
    if (triggered) return;
    triggered = true;

    const startCountdown = () => {
      let n = 3;
      el.textContent = n;
      const tick = setInterval(() => {
        n--;
        if (n > 0) {
          el.textContent = n;
        } else {
          clearInterval(tick);
          el.textContent = '0';
          // brief pause then crossfade to word "zero"
          setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease';
            el.style.opacity = '0';
            setTimeout(() => {
              el.textContent = 'zero';
              el.style.opacity = '1';
            }, 500);
          }, 350);
        }
      }, 160);
    };

    // Always wait for parent .reveal transition (1.1s) before counting
    // getComputedStyle returns end-state opacity immediately — unreliable, so unconditional delay
    const parent = el.closest('.reveal');
    setTimeout(startCountdown, parent ? 1200 : 0);
  };
  const io = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) { run(); io.unobserve(el); } }),
    { threshold: 0.12 }
  );
  io.observe(el);
})();

// --- claim-days counter: shows 30–60 first, counts down to 5–7 ---
(() => {
  const el = document.getElementById('claim-days');
  if (!el) return;
  let triggered = false;
  const run = () => {
    if (triggered) return;
    triggered = true;
    const from = [30, 60], to = [5, 7];
    el.textContent = from[0] + '–7';
    el.textContent = from[0] + '–' + from[1];
    // pause on 30-60 then count down
    setTimeout(() => {
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const v1 = Math.round(from[0] + (to[0] - from[0]) * eased);
        const v2 = Math.round(from[1] + (to[1] - from[1]) * eased);
        el.textContent = v1 + '–' + v2;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = to[0] + '–' + to[1];
      };
      requestAnimationFrame(tick);
    }, 500);
  };
  const io = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) { run(); io.unobserve(el); } }),
    { threshold: 0.4 }
  );
  io.observe(el);
})();

// --- nav dropdown (click to toggle) ---
(() => {
  const wraps = document.querySelectorAll('.nav-dropdown-wrap');
  if (!wraps.length) return;
  wraps.forEach(wrap => {
    const trigger = wrap.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = wrap.classList.contains('open');
      wraps.forEach(w => w.classList.remove('open'));
      if (!isOpen) wrap.classList.add('open');
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown-wrap')) {
      wraps.forEach(w => w.classList.remove('open'));
    }
  });
})();

// --- mobile hamburger nav ---
(() => {
  const nav = document.querySelector('.nav-v2');
  if (!nav) return;

  const chevronSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 6 15 12 9 18"/></svg>`;

  // Hamburger button
  const burger = document.createElement('button');
  burger.className = 'nav-hamburger';
  burger.setAttribute('aria-label', 'Open menu');
  burger.innerHTML = '<span></span><span></span><span></span>';
  nav.querySelector('.nav-inner').appendChild(burger);

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'nav-panel-overlay';
  document.body.appendChild(overlay);

  // Full panel
  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  panel.innerHTML = `
    <div class="nav-panel-topbar">
      <a class="brand" href="index.html" aria-label="Parcelis home">
        <img class="brand-logo" src="assets/Logo.png" alt="Parcelis" />
      </a>
      <button class="nav-panel-close" aria-label="Close menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="nav-panel-body">
      <a class="nav-panel-item" href="how-it-works.html">Product</a>
      <a class="nav-panel-item" href="pricing.html">Pricing</a>
      <button class="nav-panel-item nav-panel-toggle" data-target="resources-sub">
        Resources ${chevronSvg}
      </button>
      <div class="nav-panel-submenu" id="resources-sub">
        <a href="resources.html">Blog</a>
        <a href="faq.html">FAQ</a>
        <a href="roi-calculator.html">Self-Insurance Risk</a>
      </div>
      <a class="nav-panel-item" href="about.html">About</a>
    </div>
    <div class="nav-panel-footer">
      <a class="btn nav-panel-btn-ghost" href="#">Log in</a>
      <a class="btn btn-primary" href="#">Get Started</a>
    </div>
  `;
  document.body.appendChild(panel);

  function openPanel() {
    burger.classList.add('open');
    panel.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closePanel() {
    burger.classList.remove('open');
    panel.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Submenu toggle
  panel.querySelectorAll('.nav-panel-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = panel.querySelector('#' + btn.dataset.target);
      const isOpen = sub.classList.contains('open');
      panel.querySelectorAll('.nav-panel-submenu').forEach(s => s.classList.remove('open'));
      panel.querySelectorAll('.nav-panel-toggle').forEach(b => b.classList.remove('expanded'));
      if (!isOpen) { sub.classList.add('open'); btn.classList.add('expanded'); }
    });
  });

  burger.addEventListener('click', () => panel.classList.contains('open') ? closePanel() : openPanel());
  overlay.addEventListener('click', closePanel);
  panel.querySelector('.nav-panel-close').addEventListener('click', closePanel);
  panel.querySelectorAll('.nav-panel-body a').forEach(a => a.addEventListener('click', closePanel));
})();
