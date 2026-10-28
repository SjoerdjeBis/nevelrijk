/* ==========================================================
   Nevelrijk — geluid
   Alles wordt live gesynthetiseerd met de Web Audio API (geen
   bestanden nodig), en gesproken tekst gebruikt de ingebouwde
   Web Speech API van de browser/telefoon (Nederlandse stemmen).
   ========================================================== */
(function () {
  'use strict';

  const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12); // midi -> Hz

  // Het slaapliedje van Oma Brem — het muzikale hart van het spel.
  // De zingende stenen gebruiken precies deze tonen.
  const STONES = [
    { id: 'maan', sym: '☾', name: 'Maan', midi: 72, color: '#a9c8ff' },
    { id: 'ster', sym: '✦', name: 'Ster', midi: 74, color: '#fff1a8' },
    { id: 'blad', sym: '❦', name: 'Blad', midi: 76, color: '#9be3a2' },
    { id: 'golf', sym: '≈', name: 'Golf', midi: 79, color: '#86e0ff' },
    { id: 'vuur', sym: '✸', name: 'Vuur', midi: 81, color: '#ffb27a' },
  ];
  const LULLABY = {
    easy: ['blad', 'golf', 'vuur', 'golf'],
    hard: ['blad', 'golf', 'vuur', 'golf', 'blad', 'ster', 'maan'],
  };

  // Muziekthema's per plek: akkoorden (midi-grondtoon + intervallen), tempo, klankkleur.
  // Bewust donker en zacht: mineur, sus- en add9-akkoorden, trage pads, losse glinsteringen.
  // scale = tonen (boven de grondtoon van het akkoord) waaruit de glinsteringen kiezen.
  const MIN9 = [0, 7, 10, 15], SUS2 = [0, 7, 14], MADD9 = [0, 3, 7, 14], MAJ7 = [0, 7, 11, 16], M7 = [0, 3, 7, 10], DIM = [0, 3, 6, 10];
  const PENT_MIN = [0, 3, 5, 7, 10, 12, 15], AEOL = [0, 2, 3, 7, 8, 12, 14], DOR = [0, 2, 3, 7, 9, 12, 14];
  const THEMES = {
    title:    { bpm: 46, chords: [[45, MADD9], [41, MAJ7], [36, SUS2], [43, SUS2]], arp: 'lullaby', bright: 0.3, scale: AEOL, density: 0.10 },
    workshop: { bpm: 48, chords: [[45, MIN9], [41, MAJ7], [38, MIN9], [40, SUS2]], arp: 'shimmer', bright: 0.28, scale: DOR, density: 0.16 },
    village:  { bpm: 50, chords: [[38, MIN9], [43, SUS2], [46, MAJ7], [45, SUS2]], arp: 'shimmer', bright: 0.3, scale: DOR, density: 0.18 },
    forest:   { bpm: 42, chords: [[40, MADD9], [36, MAJ7], [43, SUS2], [38, MIN9]], arp: 'sparse', bright: 0.22, scale: PENT_MIN, density: 0.12 },
    bridge:   { bpm: 44, chords: [[38, M7], [34, MAJ7], [36, SUS2], [33, MIN9]], arp: 'low', bright: 0.18, scale: AEOL, density: 0.10 },
    hollow:   { bpm: 52, chords: [[42, MADD9], [38, MAJ7], [45, SUS2], [40, MIN9]], arp: 'shimmer', bright: 0.34, scale: DOR, density: 0.22 },
    lake:     { bpm: 40, chords: [[43, SUS2], [39, MAJ7], [41, MIN9], [36, SUS2]], arp: 'sparse', bright: 0.2, scale: AEOL, density: 0.09 },
    island:   { bpm: 38, chords: [[37, MIN9], [33, MAJ7], [35, SUS2], [32, MADD9]], arp: 'sparse', bright: 0.16, scale: PENT_MIN, density: 0.08 },
    tower:    { bpm: 38, chords: [[38, MIN9], [39, MAJ7], [36, DIM], [34, SUS2]], arp: 'eerie', bright: 0.14, scale: AEOL, density: 0.07 },
    stairs:   { bpm: 36, chords: [[33, MIN9], [34, MAJ7], [31, SUS2], [29, MAJ7]], arp: 'eerie', bright: 0.15, scale: PENT_MIN, density: 0.08 },
    finale:   { bpm: 42, chords: [[38, MADD9], [34, MAJ7], [41, SUS2], [45, SUS2]], arp: 'lullaby', bright: 0.28, scale: AEOL, density: 0.08 },
    ending:   { bpm: 46, chords: [[41, MAJ7], [43, SUS2], [45, MADD9], [36, MAJ7]], arp: 'lullaby', bright: 0.4, scale: DOR, density: 0.12 },
    dark:     { bpm: 34, chords: [[33, DIM], [32, MIN9], [33, SUS2], [29, MIN9]], arp: 'eerie', bright: 0.1, scale: PENT_MIN, density: 0.05 },
  };
  const MUSIC_GAIN = 0.32; // muziek staat bewust zacht onder de stemmen

  const A = {
    ctx: null, master: null, musicBus: null, sfxBus: null, ambBus: null, verb: null,
    vol: { music: 0.55, sfx: 0.8, voice: 1 },
    voiceOn: true, voiceRate: 1,
    theme: null, themeName: null, step: 0, nextTime: 0, timer: null,
    amb: null, ambName: null,
    STONES, LULLABY,
    voices: [],
  };

  A.init = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    A.ctx = new AC();
    const c = A.ctx;
    A.master = c.createGain(); A.master.gain.value = 0.9;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 3;
    A.master.connect(comp).connect(c.destination);
    A.verb = makeReverb(c, 3.2);
    const verbGain = c.createGain(); verbGain.gain.value = 0.55;
    A.verb.connect(verbGain).connect(A.master);
    // Echo voor de muziek: maakt losse belletjes ver en mysterieus.
    A.echo = c.createDelay(2); A.echo.delayTime.value = 0.62;
    const fb = c.createGain(); fb.gain.value = 0.38;
    const echoTone = c.createBiquadFilter(); echoTone.type = 'lowpass'; echoTone.frequency.value = 1800;
    const echoOut = c.createGain(); echoOut.gain.value = 0.45;
    A.echo.connect(echoTone).connect(fb).connect(A.echo);
    echoTone.connect(echoOut); echoOut.connect(A.master); echoOut.connect(A.verb);
    A.musicBus = c.createGain(); A.musicBus.gain.value = A.vol.music * MUSIC_GAIN;
    A.sfxBus = c.createGain(); A.sfxBus.gain.value = A.vol.sfx;
    A.ambBus = c.createGain(); A.ambBus.gain.value = A.vol.sfx * 0.6;
    [A.musicBus, A.sfxBus, A.ambBus].forEach((b) => { b.connect(A.master); b.connect(A.verb); });
    A.musicBus.connect(A.echo);
    // iOS: stille buffer om audio te ontgrendelen
    const b = c.createBuffer(1, 1, 22050); const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0);
    document.addEventListener('visibilitychange', () => {
      if (!A.ctx) return;
      if (document.hidden) { A.ctx.suspend(); if (window.speechSynthesis) speechSynthesis.cancel(); }
      else A.ctx.resume();
    });
  };

  function makeReverb(c, seconds) {
    const rate = c.sampleRate, len = Math.floor(rate * seconds);
    const buf = c.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    const conv = c.createConvolver(); conv.buffer = buf; return conv;
  }

  A.setVolumes = function (v) {
    Object.assign(A.vol, v);
    if (!A.ctx) return;
    const t = A.ctx.currentTime;
    A.musicBus.gain.setTargetAtTime(A.vol.music * MUSIC_GAIN, t, 0.2);
    A.sfxBus.gain.setTargetAtTime(A.vol.sfx, t, 0.1);
    A.ambBus.gain.setTargetAtTime(A.vol.sfx * 0.6, t, 0.2);
  };

  /* ---------------- instrumenten ---------------- */
  function env(g, t, a, peak, d, sus, r, len) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + d);
    g.gain.setValueAtTime(Math.max(sus, 0.0001), t + len);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len + r);
  }

  function pad(freq, t, len, bus, vol, bright, soft) {
    const c = A.ctx;
    const g = c.createGain();
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260 + bright * 1100; f.Q.value = 0.5;
    // trage filterbeweging: de klank 'ademt'
    const lfo = c.createOscillator(); lfo.frequency.value = 0.08 + Math.random() * 0.06;
    const lg = c.createGain(); lg.gain.value = f.frequency.value * 0.35; lfo.connect(lg).connect(f.frequency);
    lfo.start(t); lfo.stop(t + len + 4.5);
    [-9, 0, 8].forEach((det, i) => {
      const o = c.createOscillator(); o.type = i === 1 ? 'sine' : (soft ? 'triangle' : 'sawtooth');
      o.frequency.value = freq; o.detune.value = det;
      const og = c.createGain(); og.gain.value = i === 1 ? 0.7 : (soft ? 0.18 : 0.07);
      o.connect(og).connect(f); o.start(t); o.stop(t + len + 4.5);
    });
    f.connect(g).connect(bus);
    env(g, t, soft ? 2.6 : 1.2, vol, 0.8, vol * 0.75, soft ? 3.8 : 2.2, len);
  }
  function drone(freq, t, len, bus, vol) { // zachte, lage grondtoon
    const c = A.ctx;
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
    const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 1.5; o2.detune.value = 4;
    const g = c.createGain(); const g2 = c.createGain(); g2.gain.value = 0.25;
    o.connect(g); o2.connect(g2).connect(g); g.connect(bus);
    env(g, t, 2.5, vol, 1, vol * 0.8, 3.5, len);
    o.start(t); o2.start(t); o.stop(t + len + 4); o2.stop(t + len + 4);
  }

  function pluck(freq, t, bus, vol, dur) {
    const c = A.ctx;
    const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
    const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2.001;
    const g = c.createGain(); const g2 = c.createGain(); g2.gain.value = 0.3;
    o.connect(g); o2.connect(g2).connect(g); g.connect(bus);
    env(g, t, 0.005, vol, 0.25, vol * 0.25, (dur || 1.4), 0.1);
    o.start(t); o2.start(t); o.stop(t + 2.2); o2.stop(t + 2.2);
  }

  function bell(freq, t, bus, vol) { // glazen klokje / muziekdoosje
    const c = A.ctx;
    [[1, 1], [2.76, 0.35], [5.4, 0.12]].forEach(([m, v]) => {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq * m;
      const g = c.createGain(); o.connect(g).connect(bus);
      env(g, t, 0.003, vol * v, 0.4, vol * v * 0.15, 1.6, 0.05);
      o.start(t); o.stop(t + 2.4);
    });
  }

  function noiseBuffer() {
    if (A._noise) return A._noise;
    const c = A.ctx, len = c.sampleRate * 2;
    const b = c.createBuffer(1, len, c.sampleRate); const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return (A._noise = b);
  }
  function noise(t, dur, type, freq, q, vol, bus, attack) {
    const c = A.ctx;
    const s = c.createBufferSource(); s.buffer = noiseBuffer(); s.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 1;
    const g = c.createGain(); s.connect(f).connect(g).connect(bus || A.sfxBus);
    env(g, t, attack || 0.01, vol, dur * 0.3, vol * 0.4, dur * 0.7, 0.01);
    s.start(t, Math.random()); s.stop(t + dur + 0.2);
    return f;
  }

  /* ---------------- muziek sequencer ---------------- */
  // Losse, trage figuurtjes (index in het akkoord, -1 = rust). Veel rust = veel mysterie.
  const ARPS = {
    sparse: [0, -1, -1, -1, 2, -1, -1, -1, -1, -1, 3, -1, -1, -1, -1, -1],
    low: [0, -1, -1, -1, -1, -1, 1, -1, -1, -1, -1, -1, 2, -1, -1, -1],
    eerie: [3, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1, -1],
    shimmer: null, lullaby: null,
  };
  // Het slaapliedje, half zo snel en met lege plekken: een herinnering, geen deuntje.
  const LULLABY_TUNE = [76, -1, 79, -1, 81, -1, 79, -1, 76, -1, -1, -1, 74, -1, 72, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

  A.music = function (name) {
    if (!A.ctx) { A.themeName = name; return; }
    if (name === A.themeName && A.timer) return;
    A.themeName = name;
    const theme = THEMES[name];
    if (A.timer) { clearInterval(A.timer); A.timer = null; }
    // zacht uitfaden
    const old = A.musicBus;
    const t = A.ctx.currentTime;
    old.gain.setTargetAtTime(0.0001, t, 0.6);
    setTimeout(() => { try { old.disconnect(); } catch (e) {} }, 4000);
    A.musicBus = A.ctx.createGain(); A.musicBus.gain.value = 0.0001;
    A.musicBus.connect(A.master); A.musicBus.connect(A.verb); A.musicBus.connect(A.echo);
    A.musicBus.gain.setTargetAtTime(A.vol.music * MUSIC_GAIN, t + 0.8, 2);
    if (!theme) return;
    A.theme = theme; A.step = 0; A.nextTime = t + 0.6;
    A.timer = setInterval(schedule, 90);
  };

  function schedule() {
    const c = A.ctx, th = A.theme; if (!c || !th) return;
    const stepDur = 60 / th.bpm / 2; // achtsten
    const BAR = 16; // twee maten per akkoord: alles beweegt traag
    while (A.nextTime < c.currentTime + 0.4) {
      const bar = Math.floor(A.step / BAR) % th.chords.length;
      const inBar = A.step % BAR;
      const [root, iv] = th.chords[bar];
      const tt = A.nextTime + Math.random() * 0.03;
      if (inBar === 0) {
        iv.forEach((s, i) => pad(NOTE(root + 12 + s), A.nextTime, stepDur * BAR, A.musicBus, i === 0 ? 0.05 : 0.03, th.bright, true));
        drone(NOTE(root), A.nextTime, stepDur * BAR, A.musicBus, 0.07);
      }
      if (th.arp === 'lullaby') {
        // het wiegelied klinkt om de twee rondes, verder alleen af en toe een glinstering
        const loop = Math.floor(A.step / LULLABY_TUNE.length) % 2;
        const n = LULLABY_TUNE[A.step % LULLABY_TUNE.length];
        if (loop === 0 && n > 0) bell(NOTE(n - 12), tt, A.musicBus, 0.035);
        else if (Math.random() < th.density * 0.5) bell(NOTE(root + 24 + th.scale[Math.floor(Math.random() * th.scale.length)]), tt, A.musicBus, 0.018);
      } else if (th.arp === 'shimmer') {
        if (Math.random() < th.density) bell(NOTE(root + 24 + th.scale[Math.floor(Math.random() * th.scale.length)]), tt, A.musicBus, 0.02 + Math.random() * 0.015);
      } else {
        const idx = ARPS[th.arp][inBar];
        if (idx >= 0 && Math.random() > 0.2) {
          const oct = th.arp === 'low' ? 12 : 24;
          pluck(NOTE(root + iv[idx % iv.length] + oct), tt, A.musicBus, 0.035, 2.4);
        }
        if (Math.random() < th.density * 0.4) bell(NOTE(root + 36 + th.scale[Math.floor(Math.random() * th.scale.length)]), tt, A.musicBus, 0.012);
      }
      A.nextTime += stepDur; A.step++;
    }
  }

  /* ---------------- sfeergeluiden ---------------- */
  A.ambience = function (name) {
    if (!A.ctx) { A.ambName = name; return; }
    if (A.ambName === name && A.amb) return;
    A.ambName = name;
    if (A.amb) { A.amb.stop(); A.amb = null; }
    const c = A.ctx;
    const out = c.createGain(); out.gain.value = 0.0001; out.connect(A.ambBus);
    out.gain.setTargetAtTime(1, c.currentTime, 1.5);
    const nodes = []; const timers = [];
    const bed = (type, freq, q, vol) => {
      const s = c.createBufferSource(); s.buffer = noiseBuffer(); s.loop = true;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = c.createGain(); g.gain.value = vol;
      const lfo = c.createOscillator(); lfo.frequency.value = 0.07 + Math.random() * 0.08;
      const lg = c.createGain(); lg.gain.value = freq * 0.35; lfo.connect(lg).connect(f.frequency); lfo.start();
      s.connect(f).connect(g).connect(out); s.start(0, Math.random() * 2);
      nodes.push(s, lfo);
    };
    const every = (min, max, fn) => {
      const tick = () => { fn(c.currentTime + 0.05); timers.push(setTimeout(tick, min + Math.random() * (max - min))); };
      timers.push(setTimeout(tick, min * Math.random()));
    };
    if (name === 'fire') {
      bed('lowpass', 300, 0.5, 0.25);
      every(60, 420, (t) => noise(t, 0.03 + Math.random() * 0.05, 'bandpass', 1500 + Math.random() * 3000, 2, 0.15 * Math.random(), out));
    } else if (name === 'wind') {
      bed('bandpass', 500, 0.6, 0.35);
      every(3000, 9000, (t) => chirp(t, out, 2400 + Math.random() * 1500));
    } else if (name === 'forest') {
      bed('bandpass', 900, 0.5, 0.2);
      every(1500, 5000, (t) => chirp(t, out, 3000 + Math.random() * 1800));
      every(4000, 11000, (t) => owl(t, out));
    } else if (name === 'river') {
      bed('lowpass', 900, 0.4, 0.45); bed('bandpass', 2400, 1.2, 0.08);
    } else if (name === 'lake') {
      bed('lowpass', 420, 0.5, 0.35);
      every(1800, 4200, (t) => noise(t, 0.6, 'lowpass', 600, 0.5, 0.18, out, 0.2));
    } else if (name === 'hollow') {
      bed('bandpass', 700, 0.6, 0.12);
      every(900, 2600, (t) => bubble(t, out));
    } else if (name === 'tower') {
      bed('bandpass', 260, 0.8, 0.35);
      every(5000, 12000, (t) => bell(NOTE(60 + [0, 3, 7, 10][Math.floor(Math.random() * 4)]), t, out, 0.04));
    }
    A.amb = { stop() { timers.forEach(clearTimeout); out.gain.setTargetAtTime(0.0001, c.currentTime, 0.5); setTimeout(() => nodes.forEach((n) => { try { n.stop(); } catch (e) {} }), 3000); } };
  };

  function chirp(t, bus, f) {
    const c = A.ctx;
    for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
      const o = c.createOscillator(); o.type = 'sine';
      const g = c.createGain(); o.connect(g).connect(bus);
      const tt = t + i * 0.11;
      o.frequency.setValueAtTime(f, tt); o.frequency.exponentialRampToValueAtTime(f * 1.4, tt + 0.06);
      env(g, tt, 0.005, 0.05, 0.03, 0.01, 0.04, 0.02); o.start(tt); o.stop(tt + 0.2);
    }
  }
  function owl(t, bus) {
    const c = A.ctx;
    [0, 0.5].forEach((d, i) => {
      const o = c.createOscillator(); o.type = 'sine'; const g = c.createGain(); o.connect(g).connect(bus);
      o.frequency.setValueAtTime(420, t + d); o.frequency.linearRampToValueAtTime(380, t + d + 0.35);
      env(g, t + d, 0.06, i ? 0.05 : 0.04, 0.1, 0.03, 0.25, 0.15); o.start(t + d); o.stop(t + d + 0.8);
    });
  }
  function bubble(t, bus) {
    const c = A.ctx; const o = c.createOscillator(); o.type = 'sine'; const g = c.createGain();
    const f = 300 + Math.random() * 500;
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 2.2, t + 0.08);
    o.connect(g).connect(bus); env(g, t, 0.005, 0.06, 0.04, 0.01, 0.05, 0.02); o.start(t); o.stop(t + 0.2);
  }

  /* ---------------- effecten ---------------- */
  A.sfx = function (name, opt) {
    if (!A.ctx) return;
    const c = A.ctx, t = c.currentTime + 0.01, b = A.sfxBus;
    switch (name) {
      case 'tap': pluck(NOTE(84), t, b, 0.05, 0.2); break;
      case 'step': noise(t, 0.06, 'lowpass', 500 + Math.random() * 200, 1, 0.12, b); break;
      case 'pickup': [79, 84, 88, 91].forEach((n, i) => bell(NOTE(n), t + i * 0.07, b, 0.12)); break;
      case 'combine': [72, 79, 84].forEach((n, i) => bell(NOTE(n), t + i * 0.1, b, 0.12)); noise(t, 0.5, 'highpass', 5000, 1, 0.06, b, 0.1); break;
      case 'fail': { const o = c.createOscillator(); o.type = 'triangle'; const g = c.createGain(); o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.25); o.connect(g).connect(b); env(g, t, 0.01, 0.12, 0.1, 0.05, 0.2, 0.1); o.start(t); o.stop(t + 0.5); break; }
      case 'door': noise(t, 0.9, 'lowpass', 260, 4, 0.35, b, 0.15); { const o = c.createOscillator(); o.type = 'sawtooth'; const g = c.createGain(); const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 8; o.frequency.setValueAtTime(180, t); o.frequency.linearRampToValueAtTime(240, t + 0.5); o.connect(f).connect(g).connect(b); env(g, t, 0.05, 0.05, 0.2, 0.03, 0.3, 0.3); o.start(t); o.stop(t + 1); } break;
      case 'unlock': pluck(NOTE(60), t, b, 0.2, 0.2); noise(t + 0.08, 0.08, 'bandpass', 3000, 3, 0.3, b); pluck(NOTE(67), t + 0.16, b, 0.2, 0.3); break;
      case 'magic': for (let i = 0; i < 9; i++) bell(NOTE(84 + [0, 4, 7, 11, 12, 16, 19, 23, 24][i]), t + i * 0.06, b, 0.07); noise(t, 1.4, 'highpass', 6000, 1, 0.06, b, 0.3); break;
      case 'splash': noise(t, 0.7, 'lowpass', 1400, 0.8, 0.4, b, 0.01); break;
      case 'whoosh': { const f = noise(t, 0.6, 'bandpass', 400, 2, 0.3, b, 0.15); f.frequency.exponentialRampToValueAtTime(2500, t + 0.5); } break;
      case 'stone': { const st = STONES.find((s) => s.id === opt) || STONES[0]; bell(NOTE(st.midi), t, b, 0.22); pad(NOTE(st.midi - 12), t, 0.4, b, 0.04, 0.4); } break;
      case 'note': bell(NOTE(opt), t, b, 0.16); break;
      case 'musicbox': (opt || LULLABY.hard).forEach((id, i) => { const st = STONES.find((s) => s.id === id); bell(NOTE(st.midi), t + i * 0.55, b, 0.16); }); break;
      case 'bubble': for (let i = 0; i < 6; i++) bubble(t + i * 0.09, b); break;
      case 'poof': noise(t, 0.8, 'lowpass', 800, 0.5, 0.35, b, 0.02); break;
      case 'crow': { for (let i = 0; i < 2; i++) { const o = c.createOscillator(); o.type = 'sawtooth'; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1300; f.Q.value = 3; const g = c.createGain(); const tt = t + i * 0.28; o.frequency.setValueAtTime(700, tt); o.frequency.linearRampToValueAtTime(520, tt + 0.18); o.connect(f).connect(g).connect(b); env(g, tt, 0.01, 0.12, 0.06, 0.06, 0.08, 0.1); o.start(tt); o.stop(tt + 0.35); } } break;
      case 'rumble': { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 48; const g = c.createGain(); o.connect(g).connect(b); env(g, t, 0.3, 0.35, 0.5, 0.2, 1, 1); o.start(t); o.stop(t + 3); noise(t, 2, 'lowpass', 180, 1, 0.3, b, 0.4); } break;
      case 'click': noise(t, 0.03, 'bandpass', 2500, 4, 0.3, b); pluck(NOTE(96), t, b, 0.04, 0.1); break;
      case 'chapter': [62, 69, 74, 78, 81].forEach((n, i) => bell(NOTE(n), t + i * 0.18, b, 0.1)); break;
      case 'fire': noise(t, 1.6, 'lowpass', 900, 0.7, 0.4, b, 0.3); break;
      case 'glass': [96, 100, 103].forEach((n, i) => bell(NOTE(n), t + i * 0.03, b, 0.1)); break;
      case 'heart': [72, 76, 79, 84].forEach((n, i) => pluck(NOTE(n), t + i * 0.12, b, 0.12, 1)); break;
      case 'voice': [74, 78, 81, 86].forEach((n, i) => bell(NOTE(n), t + i * 0.16, b, 0.14)); pad(NOTE(62), t, 1.4, b, 0.06, 0.8); break;
    }
  };

  /* ---------------- gesproken tekst ---------------- */
  // Elk personage krijgt een eigen toonhoogte, tempo en (indien beschikbaar) eigen stem.
  const CAST = {
    mira:    { gender: 'f', pitch: 1.15, rate: 1.02 },
    verteller: { gender: 'f', pitch: 0.95, rate: 0.95 },
    kwast:   { gender: 'm', pitch: 1.55, rate: 1.12 },
    oma:     { gender: 'f', pitch: 0.82, rate: 0.88 },
    hanna:   { gender: 'f', pitch: 1.0, rate: 1.0 },
    brokkel: { gender: 'm', pitch: 0.35, rate: 0.82 },
    sabeth:  { gender: 'f', pitch: 0.9, rate: 0.95 },
    teun:    { gender: 'm', pitch: 0.7, rate: 0.85 },
    sluip:   { gender: 'f', pitch: 1.35, rate: 1.05 },
    grijs:   { gender: 'm', pitch: 0.2, rate: 0.78 },
    stenen:  { gender: 'f', pitch: 1.6, rate: 0.8 },
    wieke:   { gender: 'f', pitch: 1.25, rate: 0.92 },
    isolde:  { gender: 'f', pitch: 1.0, rate: 0.85 },
  };
  const FEMALE = /ellen|claire|fleur|lotte|colette|flo|sandy|shelley|grandma|karen|anna|sara|hanna|laura|femke|nl-?be.*f|female|vrouw|zira|samantha/i;
  const MALE = /xander|frank|maarten|bart|eddy|reed|rocko|grandpa|ralph|daniel|male|man|guido|willem/i;

  function loadVoices() {
    if (!window.speechSynthesis) return;
    const all = speechSynthesis.getVoices();
    A.voices = all.filter((v) => /^nl/i.test(v.lang));
  }
  if (window.speechSynthesis) {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  function pickVoice(gender, speaker) {
    const vs = A.voices; if (!vs.length) return null;
    const pref = A.preferredVoice && vs.find((v) => v.name === A.preferredVoice);
    if (speaker === 'mira' && pref) return pref;
    const fem = vs.filter((v) => FEMALE.test(v.name));
    const mal = vs.filter((v) => MALE.test(v.name) && !FEMALE.test(v.name));
    const nlnl = (arr) => arr.find((v) => /nl-NL/i.test(v.lang) && /enhanced|premium|neural|natural/i.test(v.name)) || arr.find((v) => /nl-NL/i.test(v.lang)) || arr[0];
    if (gender === 'f' && fem.length) return nlnl(fem);
    if (gender === 'm' && mal.length) return nlnl(mal);
    return pref || nlnl(vs);
  }

  A.hasVoice = () => !!window.speechSynthesis;
  A.voiceList = () => A.voices.map((v) => v.name + ' (' + v.lang + ')');

  /* ---------- ingesproken stemmen (Azure, vooraf gemaakt) ----------
     tools/stemmen.mjs zet mp3's in audio/voice/ en schrijft manifest.js.
     Staat een zin in het manifest, dan speelt die opname; anders valt
     de game terug op de stem van het toestel. */
  const VOICE_DIR = 'audio/voice/';
  // Klankkleur per personage, bovenop de opname.
  const VFX = {
    grijs:  { lowpass: 2600, verb: 0.9 },
    stenen: { verb: 1.0, highpass: 300 },
    sluip:  { verb: 0.35 },
    isolde: { verb: 0.8, lowpass: 5000 },
    brokkel: { lowshelf: 6 },
    verteller: { verb: 0.15 },
  };
  const bufCache = new Map();
  let current = null; // { stop() }
  const hasRecording = (k) => !!(window.VOICE_MANIFEST && window.VOICE_MANIFEST[k]);
  A.recordedCount = () => (window.VOICE_MANIFEST ? Object.keys(window.VOICE_MANIFEST).length : 0);

  // Online staan de opnames in pakketjes (zie tools/stemmen.mjs); lokaal kunnen ook losse bestanden.
  const packCache = new Map();
  function loadPack(n) {
    if (!packCache.has(n)) {
      const p = fetch('audio/voice-packs/p' + String(n).padStart(2, '0') + '.mp3').then((r) => { if (!r.ok) throw new Error('geen pakketje'); return r.arrayBuffer(); });
      p.catch(() => packCache.delete(n));
      packCache.set(n, p);
      if (packCache.size > 6) packCache.delete(packCache.keys().next().value);
    }
    return packCache.get(n);
  }
  async function fetchRecording(k) {
    const loc = window.VOICE_PACKS && window.VOICE_PACKS[k];
    if (loc) {
      try { const all = await loadPack(loc[0]); return all.slice(loc[1], loc[1] + loc[2]); } catch (e) { /* val terug op los bestand */ }
    }
    const res = await fetch(VOICE_DIR + k + '.mp3');
    if (!res.ok) throw new Error('geen opname');
    return res.arrayBuffer();
  }
  async function loadBuffer(k) {
    if (bufCache.has(k)) return bufCache.get(k);
    const buf = await A.ctx.decodeAudioData(await fetchRecording(k));
    bufCache.set(k, buf);
    if (bufCache.size > 24) bufCache.delete(bufCache.keys().next().value);
    return buf;
  }
  function playRecording(speaker, k) {
    return new Promise((resolve) => {
      let done = false; const fin = () => { if (!done) { done = true; current = null; resolve(true); } };
      const viaElement = () => { // file:// of geen Web Audio: gewoon afspelen, zonder effecten
        const el = new window.Audio(VOICE_DIR + k + '.mp3');
        el.volume = Math.max(0, Math.min(1, A.vol.voice));
        el.playbackRate = A.voiceRate || 1;
        el.onended = fin; el.onerror = () => { done = true; current = null; resolve(false); };
        current = { stop() { el.pause(); fin(); } };
        el.play().catch(() => { done = true; current = null; resolve(false); });
      };
      if (!A.ctx || location.protocol === 'file:') { viaElement(); return; }
      loadBuffer(k).then((buf) => {
        if (done) return;
        const c = A.ctx, t = c.currentTime + 0.02;
        const src = c.createBufferSource(); src.buffer = buf; src.playbackRate.value = A.voiceRate || 1;
        const g = c.createGain(); g.gain.value = A.vol.voice * 1.1;
        let node = src;
        const fx = VFX[speaker] || {};
        if (fx.highpass) { const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = fx.highpass; node.connect(f); node = f; }
        if (fx.lowpass) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = fx.lowpass; node.connect(f); node = f; }
        if (fx.lowshelf) { const f = c.createBiquadFilter(); f.type = 'lowshelf'; f.frequency.value = 220; f.gain.value = fx.lowshelf; node.connect(f); node = f; }
        node.connect(g); g.connect(A.master);
        if (fx.verb) { const vg = c.createGain(); vg.gain.value = fx.verb; g.connect(vg).connect(A.verb); }
        // muziek even zachter terwijl iemand praat
        A.musicBus.gain.setTargetAtTime(A.vol.music * MUSIC_GAIN * 0.55, t, 0.2);
        const restore = () => { if (A.musicBus) A.musicBus.gain.setTargetAtTime(A.vol.music * MUSIC_GAIN, A.ctx.currentTime, 0.6); };
        src.onended = () => { restore(); fin(); };
        current = { stop() { try { src.stop(); } catch (e) {} restore(); fin(); } };
        src.start(t);
      }).catch(() => { if (!done) viaElement(); });
    });
  }

  A.speak = function (speaker, text) {
    if (!A.voiceOn || !text) return Promise.resolve();
    A.stopSpeech();
    const k = window.VoiceKey ? window.VoiceKey.key(speaker, text) : null;
    if (k && hasRecording(k)) return playRecording(speaker, k).then((ok) => (ok ? undefined : speakDevice(speaker, text)));
    return speakDevice(speaker, text);
  };

  function speakDevice(speaker, text) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) return resolve();
      const clean = window.VoiceKey ? window.VoiceKey.clean(text) : text.replace(/<[^>]+>/g, '');
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      const cast = CAST[speaker] || CAST.verteller;
      u.lang = 'nl-NL';
      const v = pickVoice(cast.gender, speaker); if (v) { u.voice = v; u.lang = v.lang; }
      u.pitch = Math.max(0, Math.min(2, cast.pitch));
      u.rate = Math.max(0.5, Math.min(2, cast.rate * 1.1 * A.voiceRate)); // standaard iets vlotter
      u.volume = A.vol.voice;
      let done = false; const fin = () => { if (!done) { done = true; clearInterval(keep); resolve(); } };
      u.onend = fin; u.onerror = fin;
      // Chrome pauzeert lange spraak soms; dit houdt hem wakker.
      const keep = setInterval(() => { if (speechSynthesis.paused) speechSynthesis.resume(); }, 4000);
      setTimeout(fin, 1500 + clean.length * 110); // vangnet
      speechSynthesis.speak(u);
    });
  }
  A.stopSpeech = function () {
    if (current) current.stop();
    if (window.speechSynthesis) speechSynthesis.cancel();
  };

  window.Audio9 = A;
})();
