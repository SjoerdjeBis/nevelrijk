/* ==========================================================
   Nevelrijk — menu's, profielen, instellingen, dagboek
   ========================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const G = window.G, A = window.Audio9, Art = window.Art, Store = G.Store;
  const COLORS = ['#ffbf5e', '#7fd3ff', '#9be3a2', '#e58d9b', '#c9a0ff', '#ff8f6a'];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ENDING_NAMES = { nieuw: 'Het Nieuwe Lied', oud: 'Het Oude Licht', nevel: 'Het Nevelrijk' };

  /* ---------- titelscherm-illustratie ---------- */
  function titleArt() {
    return `<svg viewBox="0 0 1000 1500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      ${Art.sky('t-sky', ['#050a1e', '#141f4a', '#3a3a78', '#a0628a', '#e09a7a'])}
      ${Art.stars(160, 5, 900)}
      ${Art.moon(740, 560, 62, true)}
      ${Art.ridge(860, 70, 3, '#2a2c5e', { steps: 6 })}
      <g><path d="M470 900 L480 470 L520 470 L530 900 Z" fill="#14183a"/><path d="M458 480 L542 480 L532 436 L468 436 Z" fill="#191e44"/><path d="M464 436 L500 370 L536 436 Z" fill="#14183a"/><rect x="484" y="442" width="32" height="30" fill="#2a3060"/></g>
      <rect x="0" y="890" width="1000" height="610" fill="#141c44"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="${640 + Math.sin(i) * 40}" y="${910 + i * 16}" width="${80 + (i % 3) * 30}" height="4" rx="2" fill="#fff" opacity="${0.4 - i * 0.02}" class="ripple" style="animation-delay:${i * 0.2}s"/>`).join('')}
      ${Art.mist(920, 150, 0.9, 'drift', 7)}
      ${Art.ridge(1080, 50, 19, '#0d1230', { steps: 7 })}
      ${[60, 160, 880, 960].map((x, i) => Art.pine(x, 1120, 320 + i * 40, '#080b22')).join('')}
      <path d="M0 1500 L0 1170 Q250 1110 480 1180 Q700 1260 1000 1250 L1000 1500 Z" fill="#070a1c"/>
      <g transform="translate(330 1170) scale(.85)"><g class="actor">${Art.mira()}</g></g>
      <g transform="translate(372 1062)">${Art.glow(0, 0, 120, '', 0.95, 'glowpulse')}<circle r="16" fill="#fff6c0"/></g>
      <g transform="translate(230 1166) scale(.62)">${Art.kwast()}</g>
      ${Art.vignette()}
    </svg>`;
  }

  /* ---------- schermen ---------- */
  function show(name) { G.showScreen(name); }
  function toTitle() {
    G.FX.stop('scene');
    A.stopSpeech(); A.music('title'); A.ambience(null);
    show('title');
    G.FX.start('title', $('#title-fx'), 'fireflies');
  }

  function renderProfiles() {
    const list = $('#profile-list');
    const ps = Store.data.profiles;
    if (!ps.length) { list.innerHTML = '<li class="muted">Nog geen profielen. Maak er eentje aan!</li>'; return; }
    list.innerHTML = ps.map((p) => {
      const auto = p.auto;
      const sub = auto ? `${esc(auto.sceneName || '')} · ${fmtTime(auto.playtime)}` : 'Nog geen avontuur bezig';
      const ends = (p.endings || []).length ? ` · ${p.endings.length}/3 eindes` : '';
      return `<li class="profile-item"><span class="lantern-dot" style="color:${p.color}"></span>
        <button class="main" data-id="${p.id}"><b>${esc(p.name)}</b><small>${sub}${ends}</small></button>
        <button class="icon-btn" data-del="${p.id}" aria-label="Verwijder profiel ${esc(p.name)}">🗑</button></li>`;
    }).join('');
  }
  function fmtTime(sec) { const m = Math.round((sec || 0) / 60); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} u ${m % 60} min`; }
  function fmtDate(t) { return new Date(t).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }

  let current = null;
  function openSlots(p) {
    current = p; G.profile = p; G.applySettings();
    $('#slots-title').textContent = 'Hoi, ' + p.name + '!';
    const items = [];
    if (p.auto) items.push(`<li class="slot-item"><span class="lantern-dot" style="color:${p.color}"></span><button class="main" data-load="auto"><b>▶ Verder spelen</b><small>${esc(p.auto.sceneName || '')} · ${fmtTime(p.auto.playtime)} · ${fmtDate(p.auto.savedAt)}</small></button></li>`);
    items.push(`<li class="slot-item"><span class="lantern-dot" style="color:#fff"></span><button class="main" data-new="1"><b>✦ Nieuw avontuur</b><small>${p.auto ? 'Je automatische opslag wordt vervangen. Handmatige opslagplekken blijven bewaard.' : 'Begin bij het begin.'}</small></button></li>`);
    p.slots.forEach((s, i) => {
      if (s) items.push(`<li class="slot-item"><span class="lantern-dot" style="color:#7fd3ff"></span><button class="main" data-load="${i}"><b>Plek ${i + 1}</b><small>${esc(s.sceneName || '')} · ${fmtTime(s.playtime)} · ${fmtDate(s.savedAt)}</small></button></li>`);
    });
    if (p.endings && p.endings.length) items.push(`<li class="muted small" style="padding:6px 4px">Gevonden eindes: ${p.endings.map((e) => '✧ ' + ENDING_NAMES[e]).join(' · ')}</li>`);
    $('#slot-list').innerHTML = items.join('');
    show('slots');
  }

  async function startGame(p, save) {
    A.init();
    G.FX.stop('title');
    await G.start(p, save);
  }

  /* ---------- instellingen ---------- */
  function renderSettings() {
    const p = G.profile; if (!p) return;
    const s = p.settings;
    const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-set="${key}" data-val="${v}" aria-pressed="${s[key] === v}">${l}</button>`).join('')}</div>`;
    const tog = (key) => `<span class="toggle"><input type="checkbox" data-tog="${key}" ${s[key] ? 'checked' : ''} aria-label="${key}"><span></span></span>`;
    const voices = A.voices.length ? `<select data-sel="voiceName" style="max-width:52%;padding:8px;border-radius:10px;background:#0d1426;color:var(--ink);border:1px solid var(--line)"><option value="">Automatisch</option>${A.voices.map((v) => `<option value="${esc(v.name)}" ${s.voiceName === v.name ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select>` : '<small>Geen Nederlandse stem gevonden op dit apparaat</small>';
    $('#settings-body').innerHTML = `
      <div class="setting"><label>Muziek</label><input type="range" min="0" max="1" step="0.05" value="${s.music}" data-range="music" aria-label="Volume muziek"></div>
      <div class="setting"><label>Geluidseffecten</label><input type="range" min="0" max="1" step="0.05" value="${s.sfx}" data-range="sfx" aria-label="Volume effecten"></div>
      <div class="setting"><label>Gesproken tekst<small>Elk personage heeft een eigen stem</small></label>${tog('voice')}</div>
      <div class="setting"><label>Spreeksnelheid</label><input type="range" min="0.6" max="1.6" step="0.05" value="${s.voiceRate}" data-range="voiceRate" aria-label="Spreeksnelheid"></div>
      ${A.recordedCount() ? '' : `<div class="setting"><label>Stem van Mira</label>${voices}</div>`}
      <div class="setting"><label></label><button class="btn btn-small" id="test-voice">🔊 Test stem</button></div>
      <div class="setting"><label>Tekstgrootte</label>${seg('textSize', [['m', 'A'], ['l', 'A+'], ['xl', 'A++']])}</div>
      <div class="setting"><label>Tekstsnelheid</label>${seg('textSpeed', [['langzaam', 'Traag'], ['normaal', 'Normaal'], ['direct', 'Direct']])}</div>
      <div class="setting"><label>Automatisch doorgaan<small>Na het voorlezen verder naar de volgende zin</small></label>${tog('autoAdvance')}</div>
      <div class="setting"><label>Namen altijd tonen<small>Laat zien waar je op kunt tikken</small></label>${tog('labels')}</div>
      <div class="setting"><label>Leesbaar lettertype<small>Fijn bij dyslexie</small></label>${tog('dyslexic')}</div>
      <div class="setting"><label>Hoog contrast</label>${tog('highContrast')}</div>
      <div class="setting"><label>Minder beweging</label>${tog('reduceMotion')}</div>
      <div class="setting"><label>Kleur keert terug<small>De wereld wordt kleurrijker naarmate je verder komt</small></label>${tog('colorFx')}</div>
      <p class="muted small">Instellingen horen bij profiel <b>${esc(p.name)}</b> en worden direct bewaard.</p>`;
  }
  function bindSettings() {
    const body = $('#settings-body');
    const save = () => { Store.save(); G.applySettings(); };
    body.addEventListener('input', (e) => {
      const r = e.target.dataset.range; if (!r) return;
      G.profile.settings[r] = +e.target.value; save();
    });
    body.addEventListener('change', (e) => {
      const t = e.target.dataset.tog; if (t) { G.profile.settings[t] = e.target.checked; save(); A.sfx('tap'); }
      const sel = e.target.dataset.sel; if (sel) { G.profile.settings[sel] = e.target.value; save(); }
    });
    body.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      A.init();
      if (b.dataset.set) { G.profile.settings[b.dataset.set] = b.dataset.val; save(); renderSettings(); A.sfx('tap'); }
      if (b.id === 'test-voice') { const was = A.voiceOn; A.voiceOn = true; A.speak('mira', 'Hallo! Ik ben Mira, de kleindochter van Oma Brem.').then(() => { A.voiceOn = was; }); }
    });
  }

  /* ---------- dagboek ---------- */
  function renderJournal() {
    const s = G.state; if (!s) return;
    const open = s.journal.filter((j) => !j.done), done = s.journal.filter((j) => j.done);
    const VO = [['brokkel', 'Brokkel'], ['sabeth', 'Sabeth'], ['teun', 'Teun'], ['sluip', 'Sluip']];
    const chap = G.chapters[s.chapter];
    $('#journal-body').innerHTML = `
      <p class="muted">Hoofdstuk ${s.chapter}: <b>${chap ? chap.title : ''}</b> · ${fmtTime(s.playtime)} gespeeld</p>
      <h3>Te doen</h3><ul>${open.map((j) => `<li>${j.text}</li>`).join('') || '<li class="done">Niets open. Kijk rond!</li>'}</ul>
      ${G.flag('sabethTruth') ? `<h3>Stemmen voor het nieuwe lied (${s.voices.length}/3 nodig)</h3><div class="voices">${VO.map(([id, n]) => `<span class="voice-chip ${s.voices.includes(id) ? 'on' : ''}">${s.voices.includes(id) ? '♪' : '·'} ${n}</span>`).join('')}</div>` : ''}
      ${s.choices.length ? `<h3>Jouw keuzes</h3><ul>${s.choices.map((c) => `<li>${c.text}</li>`).join('')}</ul>` : ''}
      ${done.length ? `<h3>Gedaan</h3><ul>${done.map((j) => `<li class="done">${j.text}</li>`).join('')}</ul>` : ''}`;
  }

  /* ---------- opslaan / laden ---------- */
  function openSaves(mode) {
    const p = G.profile;
    $('#saves-title').textContent = mode === 'save' ? 'Opslaan' : 'Laden';
    const rows = [];
    if (mode === 'load' && p.auto) rows.push(`<li class="slot-item"><span class="lantern-dot" style="color:${p.color}"></span><button class="main" data-act="load" data-i="auto"><b>Automatisch</b><small>${esc(p.auto.sceneName)} · ${fmtDate(p.auto.savedAt)}</small></button></li>`);
    p.slots.forEach((s, i) => {
      const sub = s ? `${esc(s.sceneName)} · ${fmtTime(s.playtime)} · ${fmtDate(s.savedAt)}` : 'Leeg';
      if (mode === 'save' || s) rows.push(`<li class="slot-item"><span class="lantern-dot" style="color:${s ? '#7fd3ff' : '#555'}"></span><button class="main" data-act="${mode}" data-i="${i}"><b>Plek ${i + 1}</b><small>${sub}</small></button></li>`);
    });
    if (!rows.length) rows.push('<li class="muted">Nog niets opgeslagen.</li>');
    $('#saves-list').innerHTML = rows.join('');
    $('#ov-saves').hidden = false;
  }

  function closeOverlays() { document.querySelectorAll('.overlay:not(#ov-card):not(#ov-puzzle)').forEach((o) => { o.hidden = true; }); }

  /* ---------- koppelen ---------- */
  function bind() {
    G.bind();
    bindSettings();

    $('#btn-start').addEventListener('click', () => {
      A.init(); A.music('title'); A.sfx('chapter');
      renderProfiles(); show('profiles');
    });
    $('#btn-new-profile').addEventListener('click', () => {
      A.sfx('tap');
      $('#np-name').value = '';
      const sw = $('#np-colors');
      sw.innerHTML = COLORS.map((c, i) => `<button type="button" class="swatch" role="radio" aria-checked="${i === 0}" aria-label="Kleur ${i + 1}" data-c="${c}" style="background:radial-gradient(circle at 40% 35%,#fff 0 10%,${c} 50%)"></button>`).join('');
      show('newprofile');
      setTimeout(() => $('#np-name').focus(), 50);
    });
    $('#np-colors').addEventListener('click', (e) => {
      const b = e.target.closest('.swatch'); if (!b) return;
      document.querySelectorAll('.swatch').forEach((s) => s.setAttribute('aria-checked', s === b)); A.sfx('tap');
    });
    $('#np-cancel').addEventListener('click', () => { renderProfiles(); show('profiles'); });
    $('#form-new-profile').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#np-name').value.trim() || 'Speler';
      const c = (document.querySelector('.swatch[aria-checked="true"]') || {}).dataset;
      const diff = 'hard'; // één niveau
      const p = Store.create(name, c ? c.c : COLORS[0], diff);
      A.sfx('pickup');
      startGame(p, null);
    });
    $('#profile-list').addEventListener('click', (e) => {
      const del = e.target.closest('[data-del]');
      if (del) {
        const p = Store.profile(del.dataset.del);
        if (del.dataset.confirm) { Store.remove(p.id); renderProfiles(); A.sfx('poof'); }
        else { del.dataset.confirm = '1'; del.textContent = 'Zeker?'; del.style.width = 'auto'; del.style.padding = '0 10px'; setTimeout(() => { if (del.isConnected) { delete del.dataset.confirm; del.textContent = '🗑'; del.style.width = ''; del.style.padding = ''; } }, 3000); }
        return;
      }
      const b = e.target.closest('.main'); if (!b) return;
      A.sfx('tap'); openSlots(Store.profile(b.dataset.id));
    });
    $('#slot-list').addEventListener('click', (e) => {
      const b = e.target.closest('.main'); if (!b) return;
      A.sfx('tap');
      if (b.dataset.new) {
        if (current.auto && !b.dataset.confirm) { b.dataset.confirm = '1'; b.querySelector('b').textContent = '✦ Echt opnieuw beginnen? Tik nog eens.'; return; }
        current.auto = null; Store.save(); startGame(current, null);
      } else if (b.dataset.load === 'auto') startGame(current, current.auto);
      else startGame(current, current.slots[+b.dataset.load]);
    });
    $('#slots-back').addEventListener('click', () => { renderProfiles(); show('profiles'); });
    $('#slots-settings').addEventListener('click', () => { renderSettings(); $('#ov-settings').hidden = false; });

    // HUD
    $('#hud-menu').addEventListener('click', () => { A.sfx('tap'); G.autosave(); $('#ov-menu').hidden = false; });
    $('#hud-journal').addEventListener('click', () => { A.sfx('tap'); renderJournal(); $('#ov-journal').hidden = false; $('#hud-journal').classList.remove('pulse'); });
    $('#hud-reveal').addEventListener('click', () => { $('#hud-reveal').classList.remove('pulse'); G.reveal(); });
    $('#hud-hint').addEventListener('click', () => { A.init(); G.hint(); });

    $('#ov-menu').addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act]'); if (!b) { if (e.target.id === 'ov-menu') closeOverlays(); return; }
      A.sfx('tap');
      const act = b.dataset.act;
      if (act === 'resume') closeOverlays();
      if (act === 'save') { closeOverlays(); openSaves('save'); }
      if (act === 'load') { closeOverlays(); openSaves('load'); }
      if (act === 'settings') { closeOverlays(); renderSettings(); $('#ov-settings').hidden = false; }
      if (act === 'quit') { G.autosave(); closeOverlays(); renderProfiles(); toTitle(); }
    });
    $('#saves-list').addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'save') { G.saveSlot(+b.dataset.i); closeOverlays(); }
      else {
        const s = b.dataset.i === 'auto' ? G.profile.auto : G.profile.slots[+b.dataset.i];
        if (!s) return; closeOverlays(); A.sfx('whoosh');
        G.busy = false; G.hideDialog();
        await G.start(G.profile, s);
      }
    });
    document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => { A.sfx('tap'); closeOverlays(); }));
    document.querySelectorAll('.overlay:not(#ov-card):not(#ov-puzzle)').forEach((o) => o.addEventListener('click', (e) => { if (e.target === o) closeOverlays(); }));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const open = document.querySelector('.overlay:not([hidden]):not(#ov-card):not(#ov-puzzle)');
        if (open) { closeOverlays(); return; }
        if ($('#screen-game').classList.contains('active') && $('#ov-puzzle').hidden) $('#ov-menu').hidden = false;
      }
      if (!$('#screen-game').classList.contains('active') || document.querySelector('.overlay:not([hidden])')) return;
      if (e.key === 'h' || e.key === 'H') G.hint();
      if (e.key === 'r' || e.key === 'R') G.reveal();
      if (e.key === 'j' || e.key === 'J') { renderJournal(); $('#ov-journal').hidden = false; }
    });
    // Volledig scherm: knoppen op het titelscherm, in de balk bovenin en in het menu; toets F.
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-fs]') || e.target.closest('[data-act="fullscreen"]')) { A.sfx('tap'); toggleFullscreen(); if (e.target.closest('#ov-menu')) closeOverlays(); }
    });
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'f' || e.key === 'F') && !e.target.closest('input, textarea')) toggleFullscreen();
    });
    ['fullscreenchange', 'webkitfullscreenchange'].forEach((ev) => document.addEventListener(ev, updateFsButtons));
    updateFsButtons();
    window.addEventListener('pagehide', () => G.autosave());
    document.addEventListener('visibilitychange', () => { if (document.hidden) G.autosave(); });
  }

  /* ---------- volledig scherm ---------- */
  const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  const fsSupported = () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  const isStandalone = () => window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
  function toggleFullscreen() {
    if (fsElement()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    if (!fsSupported()) { fsHint(); return; }
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    Promise.resolve(req.call(el, { navigationUI: 'hide' })).then(() => {
      // op telefoons het scherm rechtop houden, als dat mag
      if (screen.orientation && screen.orientation.lock) screen.orientation.lock('portrait').catch(() => {});
    }).catch(fsHint);
    // Sommige ingebouwde browsers weigeren zonder iets te melden: dan toch uitleg tonen.
    setTimeout(() => { if (!fsElement()) fsHint(); }, 1500);
  }
  function fsHint() {
    // iPhone (Safari) kent geen volledig scherm voor websites; via het beginscherm wel.
    const ios = /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const msg = ios
      ? 'Op een iPhone of iPad: tik onderin op Deel (het vierkantje met de pijl) en kies <b>Zet op beginscherm</b>. Open Nevelrijk daarna vanaf je beginscherm: dan speel je zonder balken.'
      : 'Volledig scherm lukt hier niet. Probeer het spel in een gewone browser te openen, of zet het op je beginscherm.';
    let box = document.querySelector('.fs-hint');
    if (!box) { box = document.createElement('div'); box.className = 'fs-hint'; box.setAttribute('role', 'status'); document.body.appendChild(box); box.addEventListener('click', () => box.remove()); }
    box.innerHTML = msg; clearTimeout(fsHint.t); fsHint.t = setTimeout(() => box.remove(), 9000);
  }
  function updateFsButtons() {
    const on = !!fsElement();
    document.querySelectorAll('[data-fs]').forEach((b) => {
      b.hidden = isStandalone() && !on; // al zonder balken geopend vanaf het beginscherm
      b.textContent = on ? '🗗' : '⛶';
      b.setAttribute('aria-label', on ? 'Volledig scherm uit' : 'Volledig scherm');
      b.title = on ? 'Volledig scherm uit (F)' : 'Volledig scherm (F)';
    });
    document.querySelectorAll('[data-fs-label]').forEach((b) => { b.textContent = on ? 'Volledig scherm uit' : 'Volledig scherm'; });
    setTimeout(() => window.dispatchEvent(new Event('resize')), 150);
  }

  /* ---------- start ---------- */
  Store.load();
  $('#global-defs-inner').innerHTML = Art.defs();
  $('#title-art').innerHTML = titleArt();
  bind();
  G.FX.start('title', $('#title-fx'), 'fireflies');
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  window.UI = { toTitle, renderJournal };
})();
