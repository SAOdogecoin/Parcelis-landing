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

// --- reveal on scroll ---
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const reveal = (el) => el.classList.add('in');
  // Anything already on-screen at load gets revealed immediately.
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.top < (window.innerHeight || document.documentElement.clientHeight);
  };
  const initial = [...els].filter(inView);
  initial.forEach((el, i) => setTimeout(() => reveal(el), i * 60));
  const remaining = [...els].filter((e) => !initial.includes(e));
  if (!remaining.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        reveal(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  remaining.forEach((el) => io.observe(el));
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
