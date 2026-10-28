/* ==========================================================
   Nevelrijk — engine
   Staat, opslag, scènes, lopen, hotspots, dialoog, inventaris.
   Scènescripts zijn async functies: `await G.say(...)`.
   ========================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const A = window.Audio9;
  const Art = window.Art;

  /* ================= opslag ================= */
  const KEY = 'nevelrijk.v1';
  const DEFAULT_SETTINGS = {
    music: 0.55, sfx: 0.8, voice: true, voiceRate: 1, textSize: 'm', textSpeed: 'normaal',
    autoAdvance: false, reduceMotion: false, highContrast: false, dyslexic: false, labels: false, colorFx: true, voiceName: '',
  };
  const Store = {
    data: { profiles: [], last: null },
    load() {
      try { const raw = localStorage.getItem(KEY); if (raw) this.data = JSON.parse(raw); } catch (e) { console.warn('Opslag niet beschikbaar', e); }
      if (!this.data.profiles) this.data.profiles = [];
      this.data.profiles.forEach((p) => { p.settings = Object.assign({}, DEFAULT_SETTINGS, p.settings); p.slots = p.slots || [null, null, null]; p.endings = p.endings || []; });
      return this.data;
    },
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); return true; } catch (e) { console.warn('Opslaan mislukt', e); return false; }
    },
    profile(id) { return this.data.profiles.find((p) => p.id === id); },
    create(name, color, difficulty) {
      const p = { id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, color, difficulty, created: Date.now(), settings: Object.assign({}, DEFAULT_SETTINGS), auto: null, slots: [null, null, null], endings: [] };
      this.data.profiles.push(p); this.data.last = p.id; this.save(); return p;
    },
    remove(id) { this.data.profiles = this.data.profiles.filter((p) => p.id !== id); this.save(); },
  };

  /* ================= spelstaat ================= */
  function newState(profile) {
    return {
      v: 2, scene: 'werkplaats', entry: 'start', pos: null, face: 1,
      inv: [], flags: {}, kindness: 0, voices: [], journal: [], choices: [],
      chapter: 0, playtime: 0, created: Date.now(), difficulty: profile.difficulty, seen: {},
    };
  }

  // Opslag van een oudere versie van het spel bruikbaar houden.
  // Nieuwe onderdelen beginnen gewoon 'nog niet gedaan'; alleen wat echt niet meer bestaat wordt rechtgezet.
  function migrate(s) {
    s.flags = s.flags || {}; s.seen = s.seen || {}; s.inv = s.inv || []; s.voices = s.voices || [];
    s.journal = s.journal || []; s.choices = s.choices || [];
    if (!G.scenes[s.scene]) { s.scene = 'werkplaats'; s.pos = null; } // plek bestaat niet meer
    s.inv = s.inv.filter((id) => G.items[id]); // voorwerpen die niet meer bestaan
    if ((s.v || 1) < 2) {
      // Versie 1 had 4 hoofdstukken; de toren was toen hoofdstuk 4 (nu 5).
      if (s.flags.reachedTower && s.chapter === 4) s.chapter = 5;
      s.v = 2;
    }
  }

  const G = {
    Store, state: null, profile: null, scene: null, busy: false, selected: null,
    scenes: {}, items: {}, combos: [], hints: null, chapters: {},
    actor: { x: 500, y: 1300, face: 1, el: null, walking: false },
  };

  /* ---------- helpers voor scripts ---------- */
  G.flag = (k) => !!(G.state.flags[k]);
  G.get = (k) => G.state.flags[k];
  G.set = (k, v) => { G.state.flags[k] = v === undefined ? true : v; G.dirty(); };
  G.has = (id) => G.state.inv.includes(id);
  G.give = function (id, silent) {
    if (!G.state.inv.includes(id)) G.state.inv.push(id);
    G.state.seen['new_' + id] = true;
    if (!silent) { A.sfx('pickup'); G.toast(G.items[id] ? G.items[id].name : id, id); }
    G.renderInventory(); G.dirty(true);
  };
  G.take = function (id) {
    G.state.inv = G.state.inv.filter((x) => x !== id);
    if (G.selected === id) G.selected = null;
    G.renderInventory(); G.dirty();
  };
  G.kind = function (n, why) {
    G.state.kindness += n;
    if (n > 0) A.sfx('heart');
    G.dirty();
  };
  G.addVoice = function (id) {
    if (G.state.voices.includes(id)) return;
    G.state.voices.push(id); A.sfx('voice');
    const names = { brokkel: 'Brokkels bromstem', sabeth: 'Sabeths fluisterlied', teun: 'Teuns roeiwijs', sluip: 'Sluips nevelzang', wieke: 'Wiekes fluitstem', isolde: 'Isoldes glaslied' };
    G.toast('✧ Een stem voor het nieuwe lied: ' + (names[id] || id));
    G.applyColor(); G.dirty(true);
  };
  G.choice = function (id, text) { // log van verhaalkeuzes voor dagboek + einde
    G.state.choices = G.state.choices.filter((c) => c.id !== id);
    G.state.choices.push({ id, text, t: Date.now() }); G.dirty();
  };
  G.task = function (id, text) {
    if (G.state.journal.find((j) => j.id === id)) return;
    G.state.journal.push({ id, text, done: false, ch: G.state.chapter });
    const b = $('#hud-journal'); b.classList.add('pulse'); setTimeout(() => b.classList.remove('pulse'), 5000);
    G.dirty();
  };
  G.done = function (id) { const j = G.state.journal.find((x) => x.id === id); if (j && !j.done) { j.done = true; G.dirty(); } };
  G.wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- toast ---------- */
  let toastT = null;
  G.toast = function (msg, itemId) {
    const t = $('#toast');
    t.innerHTML = (itemId ? Art.item(itemId) : '') + '<span></span>';
    t.querySelector('span').textContent = msg;
    t.classList.add('show'); clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2400);
    G.sr(msg);
  };
  G.sr = function (msg) { const s = $('#sr-live'); s.textContent = ''; setTimeout(() => { s.textContent = msg; }, 30); };

  /* ================= opslaan ================= */
  let saveT = null;
  G.dirty = function (now) {
    clearTimeout(saveT);
    saveT = setTimeout(G.autosave, now ? 50 : 700);
  };
  G.snapshot = function () {
    const s = JSON.parse(JSON.stringify(G.state));
    s.pos = [Math.round(G.actor.x), Math.round(G.actor.y)]; s.face = G.actor.face;
    s.savedAt = Date.now(); s.sceneName = G.scenes[s.scene] ? G.scenes[s.scene].name : s.scene;
    return s;
  };
  G.autosave = function () {
    if (!G.state || !G.profile || G.state.ended) return;
    G.profile.auto = G.snapshot(); Store.save();
    const el = $('#menu-autosave'); if (el) el.textContent = 'Automatisch opgeslagen om ' + new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  };
  G.saveSlot = function (i) { G.profile.slots[i] = G.snapshot(); Store.save(); A.sfx('glass'); G.toast('Opgeslagen in plek ' + (i + 1)); };

  /* ================= instellingen ================= */
  G.applySettings = function () {
    const s = G.profile ? G.profile.settings : DEFAULT_SETTINGS;
    const app = document.documentElement;
    app.classList.toggle('text-l', s.textSize === 'l'); app.classList.toggle('text-xl', s.textSize === 'xl');
    app.classList.toggle('reduce-motion', !!s.reduceMotion);
    app.classList.toggle('high-contrast', !!s.highContrast);
    app.classList.toggle('dyslexic', !!s.dyslexic);
    $('#scene').classList.toggle('hot-labels-all', !!s.labels);
    A.setVolumes({ music: s.music, sfx: s.sfx });
    A.voiceOn = !!s.voice; A.voiceRate = s.voiceRate || 1; A.preferredVoice = s.voiceName || '';
    G.applyColor();
  };
  G.reduceMotion = () => !!(G.profile && G.profile.settings.reduceMotion) || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Kleur keert terug in de wereld naarmate Mira stemmen verzamelt (de nevel trekt kleur weg).
  G.applyColor = function () {
    const svg = $('#scene'); if (!G.state || !svg) return;
    const s = G.profile.settings;
    if (!s.colorFx || G.state.flags.ending) { svg.style.filter = ''; return; }
    const lvl = G.colorLevel ? G.colorLevel() : 1;
    svg.style.filter = lvl >= 0.999 ? '' : `saturate(${(0.68 + 0.32 * lvl).toFixed(2)})`;
  };

  /* ================= scènes ================= */
  G.register = function (id, def) { def.id = id; G.scenes[id] = def; };

  G.start = async function (profile, save) {
    G.profile = profile; Store.data.last = profile.id; Store.save();
    G.state = save ? JSON.parse(JSON.stringify(save)) : newState(profile);
    G.state.difficulty = G.state.difficulty || profile.difficulty;
    if (save) migrate(G.state);
    G.selected = null; G.busy = false;
    G.applySettings();
    G.showScreen('game');
    G.renderInventory();
    startClock();
    if (!save) {
      await G.runChapter(1);
      await G.goto('werkplaats', 'start', true);
    } else {
      await G.goto(G.state.scene, null, true, G.state.pos);
    }
  };

  G.showScreen = function (name) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + name));
    if (name !== 'game') FX.stop('scene');
  };

  let clockT = null;
  function startClock() {
    clearInterval(clockT);
    clockT = setInterval(() => {
      if (!G.state || document.hidden || !$('#screen-game').classList.contains('active')) return;
      G.state.playtime += 5;
      if (G.state.playtime % 30 === 0) G.autosave();
    }, 5000);
  }

  G.goto = async function (id, entry, instant, pos) {
    const sc = G.scenes[id]; if (!sc) { console.error('Onbekende scène', id); return; }
    const fade = $('#fade');
    if (!instant) { fade.classList.add('on'); A.sfx('whoosh'); await G.wait(420); }
    const prev = G.state.scene;
    G.state.scene = id; G.scene = sc;
    const from = entry || prev;
    let p = pos;
    if (!p) p = (sc.entries && (sc.entries[from] || sc.entries.default)) || [500, 1300];
    G.actor.x = p[0]; G.actor.y = p[1];
    G.actor.face = (sc.faces && sc.faces[from]) || (p[0] > 600 ? -1 : 1);
    G.render(true);
    $('#hud-scene').textContent = sc.name;
    $('#stage-wrap').style.setProperty('--tint', sc.tint || '#1a2240');
    A.music(sc.music || 'village'); A.ambience(sc.ambience || null);
    FX.start('scene', $('#scene-fx'), sc.fx || null);
    G.applyColor();
    fade.classList.remove('on');
    G.dirty(true);
    const first = !G.state.seen['v_' + id];
    G.state.seen['v_' + id] = true;
    if (sc.enter) { G.busy = true; try { await sc.enter(G, first, from); } finally { G.busy = false; G.render(); } }
  };

  G.render = function (full) {
    const sc = G.scene; if (!sc) return;
    if (full) $('#layer-bg').innerHTML = sc.bg(G);
    $('#layer-props').innerHTML = sc.props ? sc.props(G) : '';
    $('#layer-fg').innerHTML = (sc.fg ? sc.fg(G) : '') + Art.vignette();
    renderActor(full);
    renderHotspots();
  };
  G.refresh = () => G.render(false);

  /* ---------- Mira ---------- */
  function scaleAt(y) {
    const w = G.scene.walk || {}; const y0 = w.y0 || 1100, y1 = w.y1 || 1400;
    const s0 = w.s0 || 0.8, s1 = w.s1 || 1.05;
    const t = Math.max(0, Math.min(1, (y - y0) / (y1 - y0)));
    return s0 + (s1 - s0) * t;
  }
  function renderActor(full) {
    const layer = $('#layer-actor');
    if (G.scene.noActor || G.state.flags.hideMira) { layer.innerHTML = ''; G.actor.el = null; return; }
    if (full || !G.actor.el || !layer.contains(G.actor.el)) {
      layer.innerHTML = `<g id="actor" class="actor">${Art.mira()}</g>`;
      G.actor.el = $('#actor');
    }
    placeActor();
  }
  function placeActor() {
    const a = G.actor; if (!a.el) return;
    const s = scaleAt(a.y) * (G.scene.actorScale || 1);
    a.el.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) scale(${(s * a.face).toFixed(3)} ${s.toFixed(3)})`);
  }
  // Welk deel van de 1000 brede scène is echt zichtbaar? (smalle telefoons snijden de zijkanten af)
  G.visibleX = function () {
    const r = $('#scene').getBoundingClientRect();
    if (!r.width || !r.height) return [0, 1000];
    const scale = r.height / 1500; const w = r.width / scale;
    if (w >= 1000) return [0, 1000];
    return [(1000 - w) / 2, (1000 + w) / 2];
  };
  function clampWalk(x, y) {
    const w = G.scene.walk || {};
    const vis = G.visibleX();
    let nx = Math.max(Math.max(w.x0 || 60, vis[0] + 50), Math.min(Math.min(w.x1 || 940, vis[1] - 50), x));
    let ny = Math.max(w.y0 || 1100, Math.min(w.y1 || 1400, y));
    if (G.scene.clamp) [nx, ny] = G.scene.clamp(nx, ny, G);
    return [nx, ny];
  }
  G.walkTo = function (tx, ty) {
    return new Promise((resolve) => {
      const a = G.actor;
      if (!a.el) { resolve(); return; }
      [tx, ty] = clampWalk(tx, ty);
      const dx = tx - a.x, dy = ty - a.y; const dist = Math.hypot(dx, dy);
      if (dist < 6) { resolve(); return; }
      if (Math.abs(dx) > 4) a.face = dx > 0 ? 1 : -1;
      const speed = 460 * scaleAt(a.y);
      const dur = G.reduceMotion() ? Math.min(250, dist / speed * 1000) : dist / speed * 1000;
      const sx = a.x, sy = a.y, t0 = performance.now();
      a.el.classList.add('walking'); a.walking = true;
      let lastStep = 0; const token = (G._walkToken = (G._walkToken || 0) + 1);
      const tick = (now) => {
        if (token !== G._walkToken) { resolve(); return; }
        const k = Math.min(1, (now - t0) / dur);
        a.x = sx + dx * k; a.y = sy + dy * k; placeActor();
        if (now - lastStep > 260) { A.sfx('step'); lastStep = now; }
        if (k < 1) requestAnimationFrame(tick);
        else { a.el && a.el.classList.remove('walking'); a.walking = false; resolve(); }
      };
      requestAnimationFrame(tick);
    });
  };
  G.face = function (x) { if (!G.actor.el) return; G.actor.face = x > G.actor.x ? 1 : -1; placeActor(); };
  G.reach = async function () { if (!G.actor.el) return; G.actor.el.classList.add('reach'); await G.wait(350); G.actor.el && G.actor.el.classList.remove('reach'); };

  /* ---------- hotspots ---------- */
  function hotList() { return (G.scene.hotspots ? G.scene.hotspots(G) : []).filter((h) => !h.hidden); }
  function renderHotspots() {
    const list = hotList(); G._hot = list;
    const vis = G.visibleX();
    let out = '';
    list.forEach((h, i) => {
      let shape;
      if (h.d) shape = `<path class="hot-shape" d="${h.d}"/>`;
      else if (h.r) shape = `<circle class="hot-shape" cx="${h.x}" cy="${h.y}" r="${h.r}"/>`;
      else shape = `<rect class="hot-shape" x="${h.x}" y="${h.y}" width="${h.w}" height="${h.h}" rx="18"/>`;
      const c = center(h);
      let arrow = '';
      if (h.exit) {
        const rot = { up: 0, right: 90, down: 180, left: 270 }[h.exit] || 0;
        const ax = Math.max(vis[0] + 46, Math.min(vis[1] - 46, c[0]));
        arrow = `<g transform="translate(${ax} ${c[1]})"><g class="hot-arrow"><g transform="rotate(${rot})"><circle r="34" fill="rgba(10,16,32,.45)" stroke="rgba(220,235,255,.7)" stroke-width="3"/><path d="M0 -16 L14 4 L5 4 L5 16 L-5 16 L-5 4 L-14 4 Z" fill="#e6f0ff"/></g></g></g>`;
      }
      const lx = Math.max(vis[0] + 90, Math.min(vis[1] - 90, c[0]));
      out += `<g class="hot${h.exit ? ' hot-exit' : ''}" data-i="${i}" tabindex="0" role="button" aria-label="${h.name}">${shape}${arrow}<text class="hot-name" x="${lx}" y="${h.exit ? c[1] - 46 : c[1]}" text-anchor="middle">${h.name}</text></g>`;
    });
    $('#layer-hot').innerHTML = out;
  }
  function center(h) {
    if (h.cx != null) return [h.cx, h.cy];
    if (h.r) return [h.x, h.y];
    if (h.d) { const n = h.d.match(/-?\d+(\.\d+)?/g).map(Number); let sx = 0, sy = 0, k = 0; for (let i = 0; i + 1 < n.length; i += 2) { sx += n[i]; sy += n[i + 1]; k++; } return [sx / k, sy / k]; }
    return [h.x + h.w / 2, h.y + h.h / 2];
  }

  const NOPE = /* stem:mira */ [
    'Dat werkt zo niet.', 'Hmm, nee. Dat lijkt me geen goed idee.', 'Daar gebeurt niks mee.',
    'Ik denk niet dat die twee bij elkaar horen.', 'Misschien ergens anders?',
  ];
  G.nope = () => NOPE[Math.floor(Math.random() * NOPE.length)];

  async function activate(h) {
    if (G.busy) return;
    G.busy = true;
    showLabel(h);
    try {
      const item = G.selected;
      if (h.walk !== false) {
        const c = center(h);
        const w = h.walk || [c[0], (G.scene.walk && G.scene.walk.y0) || 1200];
        await G.walkTo(w[0], w[1]);
        G.face(c[0]);
      }
      if (item) {
        G.select(null);
        const fn = h.use && (h.use[item] || h.use['*']);
        if (fn) await fn(G, item);
        else await G.say('mira', G.nope());
      } else if (h.exit && !h.tap) {
        await G.goto(h.to, h.entry);
      } else if (h.tap) {
        await h.tap(G);
      } else if (h.look) {
        await G.say('mira', typeof h.look === 'function' ? h.look(G) : h.look);
      }
    } catch (e) { console.error(e); }
    finally { G.busy = false; hideDialog(); G.refresh(); G.dirty(); }
  }
  G.activate = activate;

  function showLabel(h) {
    const lab = $('#hot-label'); const svg = $('#scene');
    const c = center(h); const pt = svgToScreen(c[0], h.exit ? c[1] - 40 : c[1]);
    const r = svg.getBoundingClientRect(); const stage = $('#stage').getBoundingClientRect();
    lab.textContent = h.name; lab.style.left = (pt.x - stage.left) + 'px'; lab.style.top = (pt.y - stage.top) + 'px';
    lab.classList.add('show'); clearTimeout(showLabel.t); showLabel.t = setTimeout(() => lab.classList.remove('show'), 1400);
  }
  function svgToScreen(x, y) {
    const svg = $('#scene'); const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(m);
  }
  function screenToSvg(cx, cy) {
    const svg = $('#scene'); const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    const p = svg.createSVGPoint(); p.x = cx; p.y = cy; return p.matrixTransform(m.inverse());
  }

  function bindStage() {
    const svg = $('#scene');
    svg.addEventListener('click', (e) => {
      A.init();
      if (dlg.waiting) { dlg.advance(); return; }
      if (G.busy) { if (G.actor.walking) return; return; }
      const hot = e.target.closest('.hot');
      if (hot) { activate(G._hot[+hot.dataset.i]); return; }
      // lopen naar een lege plek
      const p = screenToSvg(e.clientX, e.clientY);
      if (G.selected) { G.select(null); }
      G.walkTo(p.x, p.y);
    });
    svg.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.hot')) { e.preventDefault(); if (dlg.waiting) { dlg.advance(); return; } activate(G._hot[+e.target.closest('.hot').dataset.i]); }
    });
    svg.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const hot = e.target.closest('.hot'); const lab = $('#hot-label');
      if (!hot) { lab.classList.remove('show'); return; }
      const h = G._hot[+hot.dataset.i]; if (!h) return;
      const stage = $('#stage').getBoundingClientRect();
      lab.textContent = (G.selected ? 'Gebruik ' + G.items[G.selected].name.toLowerCase() + ' op ' : '') + h.name;
      lab.style.left = (e.clientX - stage.left) + 'px'; lab.style.top = (e.clientY - stage.top - 10) + 'px'; lab.classList.add('show');
    });
    $('#dialog').addEventListener('click', (e) => { if (e.target.closest('.choice')) return; if (dlg.waiting) dlg.advance(); });
    document.addEventListener('keydown', (e) => {
      if (!$('#screen-game').classList.contains('active')) return;
      if (dlg.waiting && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') && !e.target.closest('.choice')) { e.preventDefault(); dlg.advance(); }
    });
  }

  G.reveal = function () {
    const svg = $('#scene'); svg.classList.add('revealing', 'hot-labels-all');
    A.sfx('magic');
    clearTimeout(G.reveal.t);
    G.reveal.t = setTimeout(() => { svg.classList.remove('revealing'); if (!G.profile.settings.labels) svg.classList.remove('hot-labels-all'); }, 2600);
  };

  /* ================= dialoog ================= */
  const NAMES = { mira: 'Mira', verteller: '', kwast: 'Kwast', oma: 'Oma Brem', hanna: 'Bakker Hanna', brokkel: 'Brokkel', sabeth: 'Sabeth', teun: 'Teun de Veerman', sluip: 'Sluip', grijs: 'De Grijze Heer', stenen: 'De Zingende Stenen', wieke: 'Wieke de Mot', isolde: 'Het Spiegelbeeld' };
  G.names = NAMES;
  const dlg = { waiting: false, resolve: null, typing: null, full: '' };
  dlg.advance = function () {
    if (dlg.typing) { finishTyping(); return; }
    if (!dlg.waiting) return;
    dlg.waiting = false; A.stopSpeech();
    const r = dlg.resolve; dlg.resolve = null; r && r();
  };
  function finishTyping() { clearInterval(dlg.typing); dlg.typing = null; $('#dlg-text').innerHTML = dlg.full; }
  function hideDialog() { $('#dialog').hidden = true; if (G.actor.el) G.actor.el.classList.remove('talking'); }
  G.hideDialog = hideDialog;

  function showDialog(who, html) {
    const d = $('#dialog'); d.hidden = false;
    const name = NAMES[who] !== undefined ? NAMES[who] : who;
    const nameEl = $('#dlg-name');
    nameEl.textContent = (who === 'mira' && G.profile && G.state.flags.playerNameShown) ? name : name;
    nameEl.style.display = name ? '' : 'none';
    $('#dlg-portrait').innerHTML = Art.portrait(who);
    $('#dlg-choices').innerHTML = '';
    const text = $('#dlg-text');
    dlg.full = html;
    const speed = { langzaam: 38, normaal: 22, snel: 8, direct: 0 }[G.profile ? G.profile.settings.textSpeed : 'normaal'];
    clearInterval(dlg.typing); dlg.typing = null;
    if (!speed || G.reduceMotion()) { text.innerHTML = html; }
    else {
      // typemachine-effect dat HTML-tags heel laat
      const plain = html; let i = 0; text.innerHTML = '';
      dlg.typing = setInterval(() => {
        i += 1; while (plain[i - 1] === '<') { i = plain.indexOf('>', i) + 1; }
        text.innerHTML = plain.slice(0, i);
        if (i >= plain.length) finishTyping();
      }, speed);
    }
    if (G.actor.el) G.actor.el.classList.toggle('talking', who === 'mira');
  }

  G.say = function (who, html) {
    return new Promise((resolve) => {
      showDialog(who, html);
      $('#dlg-next').style.display = '';
      dlg.waiting = true; dlg.resolve = () => { resolve(); };
      G.sr((NAMES[who] ? NAMES[who] + ': ' : '') + html.replace(/<[^>]+>/g, ''));
      const sp = A.speak(who, html);
      if (G.profile && G.profile.settings.autoAdvance) {
        sp.then(() => G.wait(700)).then(() => { if (dlg.resolve && dlg.full === html) dlg.advance(); });
      }
    }).then(() => { if (G.actor.el) G.actor.el.classList.remove('talking'); });
  };
  // Meerdere regels achter elkaar: G.talk([['mira','...'],['kwast','...']])
  G.talk = async function (lines) { for (const [w, t] of lines) await G.say(w, t); };

  // Keuzes. options: [{text, tag, value, if}]. Geeft value (of index) terug.
  G.choose = function (options, who, prompt) {
    const opts = options.filter((o) => o.if === undefined || o.if);
    return new Promise((resolve) => {
      showDialog(who || 'mira', prompt || '');
      if (!prompt) finishTyping();
      $('#dlg-next').style.display = 'none';
      if (prompt) A.speak(who || 'mira', prompt);
      const box = $('#dlg-choices');
      box.innerHTML = '';
      opts.forEach((o, i) => {
        const b = document.createElement('button');
        b.className = 'choice' + (o.seen ? ' seen' : '');
        b.innerHTML = o.text + (o.tag ? ` <span class="tag">${o.tag}</span>` : '');
        b.addEventListener('click', (e) => {
          e.stopPropagation(); A.sfx('tap'); A.stopSpeech(); box.innerHTML = '';
          resolve(o.value !== undefined ? o.value : i);
        });
        box.appendChild(b);
      });
      setTimeout(() => { const f = box.querySelector('.choice'); if (f && !('ontouchstart' in window)) f.focus(); }, 60);
    });
  };

  /* ================= inventaris ================= */
  G.select = function (id) {
    G.selected = id;
    const info = $('#inv-info');
    if (id) {
      info.innerHTML = `<b>${G.items[id].name}</b> — tik op iets om het te gebruiken, of nog eens om te bekijken.`;
    } else info.textContent = G.state && G.state.inv.length ? 'Tik op een voorwerp om het te kiezen. Kies er twee om ze te combineren.' : 'Tik op iets in de wereld om het te bekijken of te gebruiken.';
    document.querySelectorAll('.inv-slot').forEach((s) => s.classList.toggle('selected', s.dataset.id === id));
  };
  G.renderInventory = function () {
    const inv = $('#inventory');
    if (!G.state.inv.length) { inv.innerHTML = '<span class="inv-empty">Je rugzak is nog leeg.</span>'; G.select(null); return; }
    inv.innerHTML = G.state.inv.map((id) => {
      const it = G.items[id] || { name: id };
      const isNew = G.state.seen['new_' + id];
      return `<button class="inv-slot${isNew ? ' new' : ''}${G.selected === id ? ' selected' : ''}" data-id="${id}" role="option" aria-label="${it.name}">${Art.item(id)}</button>`;
    }).join('');
    G.select(G.selected && G.has(G.selected) ? G.selected : null);
  };
  async function invTap(id) {
    A.init();
    if (dlg.waiting) { dlg.advance(); return; }
    if (G.busy) return;
    delete G.state.seen['new_' + id];
    const slot = document.querySelector(`.inv-slot[data-id="${id}"]`); if (slot) slot.classList.remove('new');
    A.sfx('tap');
    if (G.selected === id) { // bekijken
      G.select(null); G.busy = true;
      try {
        const it = G.items[id];
        if (it.examine) await it.examine(G); else await G.say('mira', typeof it.desc === 'function' ? it.desc(G) : it.desc);
      } finally { G.busy = false; hideDialog(); G.refresh(); }
      return;
    }
    if (G.selected && G.selected !== id) { // combineren
      const a = G.selected, b = id; G.select(null); G.busy = true;
      try {
        const combo = G.combos.find((c) => (c.a === a && c.b === b) || (c.a === b && c.b === a));
        if (combo) await combo.run(G); else { A.sfx('fail'); await G.say('mira', G.nope()); }
      } finally { G.busy = false; hideDialog(); G.refresh(); }
      return;
    }
    G.select(id);
  }
  function bindInventory() {
    $('#inventory').addEventListener('click', (e) => { const s = e.target.closest('.inv-slot'); if (s) invTap(s.dataset.id); });
  }

  /* ================= kaarten (hoofdstukken, eindes) ================= */
  G.card = function ({ kicker, title, text, btn, music }) {
    return new Promise((resolve) => {
      const ov = $('#ov-card');
      $('#card-kicker').textContent = kicker || '';
      $('#card-title').textContent = title || '';
      $('#card-text').innerHTML = (Array.isArray(text) ? text.map((p) => p.startsWith('<') ? p : `<p>${p}</p>`).join('') : text || '');
      $('#card-btn').textContent = btn || 'Verder';
      ov.hidden = false;
      if (music) A.music(music);
      A.sfx('chapter');
      // De verteller leest de titel en elke alinea apart (zo past elke alinea op één opname).
      const parts = [title].concat(Array.isArray(text) ? text : [text]).filter((p) => p && !/^\s*<(?!em)/.test(p)); // geen statistieken of lijstjes voorlezen
      let alive = true;
      (async () => { for (const p of parts) { if (!alive) break; await A.speak('verteller', p); if (alive) await G.wait(350); } })();
      const b = $('#card-btn');
      const h = () => { alive = false; b.removeEventListener('click', h); A.stopSpeech(); A.sfx('tap'); ov.hidden = true; resolve(); };
      b.addEventListener('click', h);
      setTimeout(() => b.focus(), 100);
    });
  };
  G.runChapter = async function (n) {
    if (G.state.chapter >= n) return;
    G.state.chapter = n;
    const c = G.chapters[n]; if (!c) return;
    await G.card({ kicker: 'Hoofdstuk ' + n, title: c.title, text: c.text, btn: 'Begin', music: c.music });
    if (G.scene) A.music(G.scene.music);
    G.dirty(true);
  };

  /* ================= hints ================= */
  G.hint = async function () {
    if (G.busy || !G.hints) return;
    G.busy = true;
    try {
      const h = G.hints(G);
      const who = G.flag('kwastJoined') ? 'kwast' : 'mira';
      const key = 'hintLevel_' + h.id;
      const lvl = G.state.seen[key] || 0;
      // eerst een raadselachtige hint, bij nog eens vragen een duidelijke (met de weg erheen)
      const clear = lvl > 0;
      const lines = clear ? [h.route, h.direct || h.vague] : [h.vague];
      G.state.seen[key] = lvl + 1;
      if (who === 'kwast') A.sfx('crow');
      for (const t of lines.filter(Boolean)) await G.say(who, t);
      if (lvl === 0 && h.direct) await G.say(who, '<em>(Vraag nog eens als je een duidelijkere hint wilt.)</em>');
    } finally { G.busy = false; hideDialog(); }
  };

  /* ================= deeltjes (canvas) ================= */
  const FX = {
    runs: {},
    start(key, canvas, kind) {
      this.stop(key); if (!kind || !canvas) { if (canvas) { const c = canvas.getContext('2d'); c.clearRect(0, 0, canvas.width, canvas.height); } return; }
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const resize = () => { const r = canvas.getBoundingClientRect(); canvas.width = r.width * dpr; canvas.height = r.height * dpr; };
      resize();
      const kinds = Array.isArray(kind) ? kind : [kind];
      const reduce = G.reduceMotion();
      const parts = [];
      const mk = (k) => {
        const W = canvas.width, H = canvas.height;
        const p = { k, x: Math.random() * W, y: Math.random() * H, t: Math.random() * 100, s: (0.5 + Math.random()) * dpr };
        if (k === 'embers') { p.y = H * (0.6 + Math.random() * 0.4); p.vy = -(0.3 + Math.random() * 0.8) * dpr; p.vx = (Math.random() - 0.5) * 0.3; p.life = 1; }
        if (k === 'fireflies') { p.vx = 0; p.vy = 0; p.y = H * (0.3 + Math.random() * 0.6); }
        if (k === 'dust') { p.vx = (Math.random() - 0.5) * 0.1; p.vy = 0.05 + Math.random() * 0.1; }
        if (k === 'motes') { p.vx = (Math.random() - 0.5) * 0.2; p.vy = -0.1 - Math.random() * 0.2; }
        if (k === 'spores') { p.vx = (Math.random() - 0.5) * 0.3; p.vy = -0.2 - Math.random() * 0.3; p.hue = Math.random() > 0.5 ? 160 : 290; }
        if (k === 'sparkle') { p.life = Math.random(); }
        return p;
      };
      const counts = { embers: 26, fireflies: 22, dust: 40, motes: 30, spores: 34, sparkle: 30 };
      kinds.forEach((k) => { for (let i = 0; i < (reduce ? 6 : counts[k] || 20); i++) parts.push(mk(k)); });
      const run = { on: true };
      this.runs[key] = run;
      const loop = () => {
        if (!run.on) return;
        const W = canvas.width, H = canvas.height;
        if (canvas.getBoundingClientRect().width * dpr !== W) resize();
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        for (const p of parts) {
          p.t += 0.016;
          if (p.k === 'embers') {
            p.x += p.vx + Math.sin(p.t * 2) * 0.3; p.y += p.vy; p.life -= 0.004;
            if (p.life <= 0 || p.y < H * 0.2) Object.assign(p, mk('embers'));
            ctx.fillStyle = `rgba(255,${150 + Math.random() * 60 | 0},80,${p.life * 0.8})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.6 * p.s, 0, 7); ctx.fill();
          } else if (p.k === 'fireflies') {
            p.x += Math.sin(p.t * 0.7 + p.s * 9) * 0.6 * dpr; p.y += Math.cos(p.t * 0.5 + p.s * 5) * 0.4 * dpr;
            const a = 0.4 + 0.6 * Math.max(0, Math.sin(p.t * 1.7 + p.s * 20));
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10 * p.s);
            g.addColorStop(0, `rgba(255,250,190,${a})`); g.addColorStop(1, 'rgba(255,220,120,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 10 * p.s, 0, 7); ctx.fill();
          } else if (p.k === 'dust' || p.k === 'motes' || p.k === 'spores') {
            p.x += p.vx * dpr + Math.sin(p.t + p.s * 10) * 0.15; p.y += p.vy * dpr;
            if (p.y > H + 5) p.y = -5; if (p.y < -5) p.y = H + 5; if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
            const a = 0.25 + 0.25 * Math.sin(p.t * 1.3 + p.s * 7);
            ctx.fillStyle = p.k === 'spores' ? `hsla(${p.hue},90%,75%,${a + 0.2})` : p.k === 'motes' ? `rgba(200,220,255,${a})` : `rgba(255,230,190,${a * 0.8})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, (p.k === 'spores' ? 2 : 1.2) * p.s, 0, 7); ctx.fill();
          } else if (p.k === 'sparkle') {
            p.life += 0.01; if (p.life > 1) { Object.assign(p, mk('sparkle')); p.life = 0; }
            const a = Math.sin(p.life * Math.PI);
            ctx.fillStyle = `rgba(220,235,255,${a * 0.9})`;
            const r = 2.5 * p.s * a; ctx.beginPath(); ctx.moveTo(p.x, p.y - r * 2); ctx.lineTo(p.x + r * 0.5, p.y); ctx.lineTo(p.x, p.y + r * 2); ctx.lineTo(p.x - r * 0.5, p.y); ctx.fill();
            ctx.beginPath(); ctx.moveTo(p.x - r * 2, p.y); ctx.lineTo(p.x, p.y + r * 0.5); ctx.lineTo(p.x + r * 2, p.y); ctx.lineTo(p.x, p.y - r * 0.5); ctx.fill();
          }
        }
        ctx.globalCompositeOperation = 'source-over';
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    },
    stop(key) { if (this.runs[key]) { this.runs[key].on = false; delete this.runs[key]; } },
  };
  G.FX = FX;

  G.bind = function () {
    bindStage(); bindInventory();
    let rt = null;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (G.scene && $('#screen-game').classList.contains('active')) renderHotspots(); }, 150); });
  };
  G.isDialogWaiting = () => dlg.waiting;
  G.advanceDialog = () => dlg.advance();

  window.G = G;
})();
