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

// --- reveal on scroll — all elements per section trigger at once ---
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  // group .reveal elements by their nearest section/article ancestor
  const groups = new Map();
  els.forEach(el => {
    const parent = el.closest('section, article') || document.body;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });

  const revealGroup = (group) => group.forEach(el => el.classList.add('in'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        revealGroup(groups.get(e.target) || []);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  // Wait for paint, then force a layout commit on all .reveal elements
  // so the browser registers opacity:0 before any IO fires.
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => el.getBoundingClientRect());
    groups.forEach((_, parent) => io.observe(parent));
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
    let n = 9;
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
