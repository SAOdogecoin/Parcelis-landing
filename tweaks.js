// Parcelis tweaks panel — plain JS, no React dependency
(() => {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "palette": "royal",
    "density": "comfortable",
    "headline_em": "that pays for itself.",
    "showFloatingClaim": false
  }/*EDITMODE-END*/;

  let state = { ...TWEAK_DEFAULTS };
  let panel = null;
  let visible = false;

  const palettes = {
    royal: { '--ink': '#0d1240', '--navy-800': '#1e2099', '--navy-900': '#141a7a', '--navy-950': '#0a0d3a', '--pop-500': '#ff8a66', '--pop-400': '#ffb19a', '--pop-600': '#d96a48' },
    midnight: { '--ink': '#0a0d2a', '--navy-800': '#16195e', '--navy-900': '#0d1140', '--navy-950': '#05071f', '--pop-500': '#ff8a66', '--pop-400': '#ffb19a', '--pop-600': '#d96a48' },
    deep: { '--ink': '#10134d', '--navy-800': '#252abc', '--navy-900': '#181c93', '--navy-950': '#0a0d3a', '--pop-500': '#ff8a66', '--pop-400': '#ffb19a', '--pop-600': '#d96a48' }
  };

  function applyPalette(name) {
    const p = palettes[name] || palettes.navy;
    Object.entries(p).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }

  function applyDensity(d) {
    document.documentElement.setAttribute('data-density', d);
  }

  function applyHeadlineEm(text) {
    const em = document.querySelector('.hero h1 em');
    if (em) em.textContent = text;
  }

  function applyFloatingClaim(show) {
    const el = document.querySelector('.claim-pop');
    if (el) el.style.display = show ? '' : 'none';
  }

  function applyAll() {
    applyPalette(state.palette);
    applyDensity(state.density);
    applyHeadlineEm(state.headline_em);
    applyFloatingClaim(state.showFloatingClaim);
  }
  applyAll();

  function persist(partial) {
    state = { ...state, ...partial };
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: partial }, '*'); } catch (e) {}
    applyAll();
    renderPanel();
  }

  function renderPanel() {
    if (!panel) return;
    panel.innerHTML = `
      <header>
        <div class="t">Tweaks</div>
        <button class="x" aria-label="Close">✕</button>
      </header>
      <div class="grp">
        <label>Palette</label>
        <div class="seg">
          ${['royal','midnight','deep'].map(p => `<button data-k="palette" data-v="${p}" class="${state.palette===p?'on':''}">${p}</button>`).join('')}
        </div>
      </div>
      <div class="grp">
        <label>Density</label>
        <div class="seg">
          ${['comfortable','compact'].map(p => `<button data-k="density" data-v="${p}" class="${state.density===p?'on':''}">${p}</button>`).join('')}
        </div>
      </div>
      <div class="grp">
        <label>Hero accent line</label>
        <input type="text" class="txt" data-k="headline_em" value="${state.headline_em.replace(/"/g,'&quot;')}" />
      </div>
      <div class="grp">
        <label class="row">
          <span>Floating claim badge</span>
          <input type="checkbox" data-k="showFloatingClaim" ${state.showFloatingClaim?'checked':''} />
        </label>
      </div>
    `;
    panel.querySelectorAll('.seg button').forEach(b => b.onclick = () => persist({ [b.dataset.k]: b.dataset.v }));
    panel.querySelector('.txt').oninput = (e) => persist({ headline_em: e.target.value });
    panel.querySelector('[data-k="showFloatingClaim"]').onchange = (e) => persist({ showFloatingClaim: e.target.checked });
    panel.querySelector('.x').onclick = hide;
  }

  function show() {
    if (!panel) {
      panel = document.createElement('aside');
      panel.id = 'tweaks-panel';
      panel.innerHTML = '';
      document.body.appendChild(panel);
      injectStyles();
    }
    panel.style.display = 'block';
    visible = true;
    renderPanel();
  }

  function hide() {
    if (panel) panel.style.display = 'none';
    visible = false;
    try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
  }

  function injectStyles() {
    if (document.getElementById('tweaks-style')) return;
    const s = document.createElement('style');
    s.id = 'tweaks-style';
    s.textContent = `
      #tweaks-panel { position: fixed; right: 20px; bottom: 20px; z-index: 9999;
        width: 280px; background: #fff; color: #0d1240;
        border-radius: 16px; box-shadow: 0 30px 60px -20px rgba(10,16,36,0.25), 0 0 0 1px rgba(10,16,36,0.06);
        font-family: var(--font-sans, system-ui); padding: 16px; display: block; }
      #tweaks-panel header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
      #tweaks-panel .t { font-weight: 600; font-size: 14px; letter-spacing: -0.01em; }
      #tweaks-panel .x { background: transparent; border: 0; cursor: pointer; color: #5b6491; font-size: 14px; }
      #tweaks-panel .grp { display: grid; gap: 6px; margin-bottom: 12px; }
      #tweaks-panel label { font-family: var(--font-mono, ui-monospace); font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: #5b6491; }
      #tweaks-panel .seg { display: flex; gap: 4px; background: #f5f6fb; padding: 3px; border-radius: 10px; }
      #tweaks-panel .seg button { flex: 1; padding: 7px 8px; border: 0; background: transparent; border-radius: 7px; cursor: pointer; font-size: 12px; color: #5b6491; text-transform: capitalize; }
      #tweaks-panel .seg button.on { background: #0d1240; color: #ff8a66; }
      #tweaks-panel .txt { width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid rgba(13,18,64,0.16); border-radius: 8px; font: inherit; font-size: 13px; color: #0d1240; }
      #tweaks-panel .row { display: flex; justify-content: space-between; align-items: center; text-transform: none; letter-spacing: 0; font-size: 13px; color: #0d1240; font-family: inherit; }
    `;
    document.head.appendChild(s);
  }

  window.addEventListener('message', (e) => {
    const t = e.data && e.data.type;
    if (t === '__activate_edit_mode') show();
    else if (t === '__deactivate_edit_mode') hide();
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
})();
