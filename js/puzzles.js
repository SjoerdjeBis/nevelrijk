/* ==========================================================
   Nevelrijk — puzzels
   Elke puzzel opent in een paneel en geeft een Promise<boolean>.
   Makkelijk/moeilijk verandert lengte, aanwijzingen en regels.
   ========================================================== */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const A = window.Audio9, Art = window.Art;
  const P = {};
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // Basispaneel
  function open(title, sub, hintFn) {
    const ov = $('#ov-puzzle');
    $('#pz-title').textContent = title; $('#pz-sub').innerHTML = sub || '';
    const body = $('#pz-body'); body.innerHTML = '';
    ov.hidden = false;
    let closeR;
    const closed = new Promise((r) => { closeR = r; });
    const close = $('#pz-close'), hint = $('#pz-hint');
    const onClose = () => { A.sfx('tap'); finish(false); };
    const onHint = () => { A.sfx('crow'); const t = hintFn(); $('#pz-sub').innerHTML = '🪶 <b>Kwast:</b> ' + t; A.speak('kwast', t); };
    close.addEventListener('click', onClose); hint.addEventListener('click', onHint);
    hint.style.display = hintFn ? '' : 'none';
    function finish(ok) {
      close.removeEventListener('click', onClose); hint.removeEventListener('click', onHint);
      A.stopSpeech();
      setTimeout(() => { ov.hidden = true; closeR(ok); }, ok ? 900 : 0);
    }
    return { body, finish, closed, setSub: (h) => { $('#pz-sub').innerHTML = h; } };
  }

  /* ---------- 1. De Zingende Stenen ---------- */
  P.stones = function (G) {
    const target = A.LULLABY[G.easy ? 'easy' : 'hard'];
    let hintN = 0;
    const pz = open('De Zingende Stenen', G.easy
      ? 'Speel het slaapliedje van Oma na. Tik op de stenen in de goede volgorde.'
      : 'Vijf stenen, één lied. Ze zwijgen, tot iemand hun het oude slaapliedje teruggeeft.',
    /* stem:kwast */ () => {
      hintN++;
      if (!G.has('muziekdoos')) return 'Oma\'s muziekdoosje speelt dat liedje. Zat dat niet in haar kist?';
      if (G.easy || hintN > 1) return 'Druk op Luister. De stenen lichten op in de volgorde van het lied. Doe ze daarna na!';
      return 'Luister goed. Hoe hoger de toon, hoe verder naar rechts de steen staat.';
    });
    const showLid = G.has('muziekdoos');
    const lid = showLid ? (G.easy ? target : target.slice(0, 4)) : [];
    const sym = (id) => A.STONES.find((s) => s.id === id).sym;
    pz.body.innerHTML = `
      ${showLid ? `<div class="notation" aria-label="Tekens op het deksel van het muziekdoosje">${lid.map(sym).join(' ')}${!G.easy ? ' <span class="muted small" style="align-self:center">…rest weggesleten</span>' : ''}</div>` : ''}
      <canvas class="pz-canvas" id="pz-wave" width="760" height="120" aria-hidden="true" style="height:60px"></canvas>
      <div class="stones" role="group" aria-label="Stenen">${A.STONES.map((s) => `<button class="stone-btn" data-id="${s.id}" style="--glow:${s.color};color:${s.color}" aria-label="Steen ${s.name}">${s.sym}<span>${s.name.toUpperCase()}</span></button>`).join('')}
      <button class="btn" id="pz-listen" style="margin:0;border-radius:24px" ${G.has('muziekdoos') ? '' : 'disabled'}>🎵<br><small>Luister</small></button></div>
      <div class="seq-dots" id="pz-dots">${target.map(() => '<i></i>').join('')}</div>`;
    const wave = pz.body.querySelector('#pz-wave'); const wctx = wave.getContext('2d');
    let bars = [];
    function drawWave() {
      wctx.clearRect(0, 0, 760, 120);
      bars.forEach((b, i) => {
        const st = A.STONES.find((s) => s.id === b); const idx = A.STONES.indexOf(st);
        const h = 20 + idx * 20;
        wctx.fillStyle = st.color; wctx.globalAlpha = 0.85;
        wctx.fillRect(10 + i * 70, 116 - h, 50, h);
      });
    }
    let input = []; let locked = false;
    const dots = () => pz.body.querySelectorAll('#pz-dots i').forEach((d, i) => d.classList.toggle('on', i < input.length));
    const light = (id, ms) => { const b = pz.body.querySelector(`.stone-btn[data-id="${id}"]`); b.classList.add('lit'); setTimeout(() => b.classList.remove('lit'), ms || 380); };
    pz.body.querySelectorAll('.stone-btn').forEach((b) => b.addEventListener('click', () => {
      if (locked) return;
      const id = b.dataset.id; A.sfx('stone', id); light(id);
      input.push(id); bars = input.slice(); drawWave();
      const ok = target.slice(0, input.length).every((x, i) => x === input[i]);
      if (!ok) {
        locked = true; setTimeout(() => { A.sfx('fail'); input = []; bars = []; drawWave(); dots(); locked = false; }, 420);
        pz.setSub(G.easy ? 'Die klonk vals. Begin opnieuw — luister nog eens naar het doosje.' : 'De stenen zwijgen weer. Probeer opnieuw.');
      } else if (input.length === target.length) {
        locked = true; dots();
        setTimeout(() => { A.sfx('magic'); pz.setSub('✨ De stenen zingen het lied mee!'); pz.body.querySelectorAll('.stone-btn').forEach((x) => x.classList.add('lit')); pz.finish(true); }, 300);
      }
      dots();
    }));
    pz.body.querySelector('#pz-listen').addEventListener('click', async () => {
      if (locked) return; locked = true; input = []; dots(); bars = [];
      const playLen = G.easy ? target.length : target.length;
      for (let i = 0; i < playLen; i++) {
        const id = target[i];
        A.sfx('stone', id);
        // makkelijk: de juiste steen licht op. moeilijk: alleen de toonhoogte-balk.
        if (G.easy || hintN > 1) light(id, 420);
        bars.push(id); drawWave();
        await new Promise((r) => setTimeout(r, 600));
      }
      setTimeout(() => { bars = []; drawWave(); }, 900);
      locked = false;
    });
    return pz.closed;
  };

  /* ---------- 2. Brokkels raadsels ---------- */
  const RIDDLES = {
    easy: [
      { q: 'Ik heb een hals maar geen hoofd, en ik draag een kurk in plaats van een hoed.', a: 'Een fles', o: ['Een giraf', 'Een kaars', 'Een sjaal'] },
      { q: 'Hoe meer je van mij weghaalt, hoe groter ik word.', a: 'Een gat', o: ['Een berg', 'Een taart', 'Een schaduw'] },
      { q: 'Ik vlieg zonder vleugels en ik huil zonder ogen.', a: 'Een wolk', o: ['Een vogel', 'Een ui', 'Een vlieger'] },
      { q: 'Ik heb tanden, maar ik bijt nooit.', a: 'Een kam', o: ['Een haai', 'Een rots', 'Een trol'] },
      { q: 'Ik word natter, hoe meer ik droog.', a: 'Een handdoek', o: ['Een spons', 'De zon', 'Een regenjas'] },
      { q: 'Ik heb een gezicht en twee handen, maar geen armen en geen benen.', a: 'Een klok', o: ['Een pop', 'Een spiegel', 'Een maan'] },
    ],
    hard: [
      { q: 'Noem mijn naam en je breekt me.', a: 'Stilte', o: ['Glas', 'Een belofte', 'Een geheim', 'IJs', 'Een spiegel'] },
      { q: 'Ik heb steden zonder huizen, bossen zonder bomen en meren zonder water.', a: 'Een landkaart', o: ['Een droom', 'Een schilderij', 'Een spiegel', 'De nacht', 'Een boek'] },
      { q: 'Ik ben altijd vóór je, maar je haalt me nooit in.', a: 'Morgen', o: ['Je schaduw', 'De horizon', 'De wind', 'Je neus', 'Gisteren'] },
      { q: 'Wat de rijke nodig heeft en de arme heeft — en wie mij eet, sterft van de honger.', a: 'Niets', o: ['Goud', 'Brood', 'Liefde', 'Steen', 'Tijd'] },
      { q: 'Ik kom één keer in een minuut, twee keer in een moment, maar nooit in duizend jaar.', a: 'De letter M', o: ['Een seconde', 'Een knipoog', 'Een komeet', 'Een zucht', 'De letter E'] },
      { q: 'Hoe meer er van mij is, hoe minder je ziet.', a: 'Duisternis', o: ['Licht', 'Mist', 'Water', 'Tranen', 'Rook'] },
    ],
  };
  P.riddles = function (G) {
    const set = shuffle(RIDDLES[G.easy ? 'easy' : 'hard']);
    let idx = 0, right = 0; const need = 3;
    const pz = open('Brokkels Raadsels', `Raad er ${need} goed, dan mag je over de brug.`, /* stem:kwast */ () => {
      return G.easy ? 'Denk aan gewone dingen in huis. Wat heeft een hals, of tanden, of handen, maar is geen mens?' : 'Brokkel houdt van woordgrappen. Een woord kan ook iets heel anders betekenen.';
    });
    function show() {
      const r = set[idx % set.length];
      const opts = shuffle([r.a].concat(r.o.slice(0, G.easy ? 3 : 5)));
      pz.body.innerHTML = `<div class="seq-dots">${Array.from({ length: need }, (_, i) => `<i class="${i < right ? 'on' : ''}"></i>`).join('')}</div>
        <p class="riddle">“${r.q}”</p>
        <div class="answers">${opts.map((o) => `<button class="btn" data-a="${o}">${o}</button>`).join('')}</div>`;
      A.speak('brokkel', r.q);
      pz.body.querySelectorAll('.answers .btn').forEach((b) => b.addEventListener('click', () => {
        if (b.dataset.a === r.a) {
          right++; A.sfx('pickup');
          pz.setSub(['Hmpf. Goed.', 'Grrr… ook goed!', 'BROKKEL IS VERSLAGEN!'][right - 1] || 'Goed.');
          A.speak('brokkel', ['Hmpf. Goed.', 'Grrr. Ook goed!', 'Brokkel is verslagen!'][right - 1]);
          idx++;
          if (right >= need) { A.sfx('magic'); pz.body.querySelector('.answers').innerHTML = ''; pz.finish(true); }
          else setTimeout(show, 900);
        } else {
          A.sfx('fail'); b.classList.add('wrong'); b.disabled = true;
          const laugh = /* stem:brokkel */ ['HA! Fout! Nog eentje dan.', 'Hohoho! Dat is het niet.', 'Brokkel lacht stenen uit zijn neus. Fout!'];
          const t = laugh[Math.floor(Math.random() * laugh.length)];
          pz.setSub(t); A.speak('brokkel', t);
          if (!G.easy) { idx++; setTimeout(show, 1100); }
        }
      }));
    }
    show();
    return pz.closed;
  };

  /* ---------- 3. Sabeths drankje: Nevelzicht ---------- */
  const INGR = [
    { id: 'klokje', name: 'Blauw klokje', color: '#6f8cff', svg: '<path d="M32 10 Q16 14 16 40 L48 40 Q48 14 32 10Z" fill="#6f8cff"/><circle cx="32" cy="44" r="4" fill="#ffd36e"/><path d="M32 10 L32 2" stroke="#3e6b3a" stroke-width="3"/>' },
    { id: 'maanmos', name: 'Maanmos', color: '#cfd8e8', svg: '<ellipse cx="32" cy="40" rx="24" ry="12" fill="#b8c4d8"/><g fill="#e8eef8"><circle cx="20" cy="34" r="6"/><circle cx="32" cy="30" r="8"/><circle cx="44" cy="34" r="6"/></g>' },
    { id: 'vuurbloem', name: 'Traan van vuurbloem', color: '#ff7a3d', svg: '<path d="M32 8 Q48 34 32 54 Q16 34 32 8Z" fill="#ff7a3d"/><path d="M32 22 Q40 36 32 46 Q24 36 32 22Z" fill="#ffd36e"/>' },
    { id: 'dauw', name: 'Druppel dauw', color: '#bfefff', svg: '<path d="M32 10 Q46 34 32 50 Q18 34 32 10Z" fill="#bfefff" opacity=".8"/><circle cx="28" cy="34" r="3" fill="#fff"/>' },
    { id: 'veer', name: 'Uilenveer', color: '#a07a50', svg: '<path d="M14 54 Q20 20 50 10 Q44 40 14 54Z" fill="#b08a5a"/><path d="M14 54 L48 12" stroke="#5e3b22" stroke-width="2"/>' },
    { id: 'spoor', name: 'Paddenstoelpoeder', color: '#7fe0c8', svg: '<path d="M14 40 Q32 22 50 40 Z" fill="#7fe0c8"/><rect x="28" y="40" width="8" height="14" fill="#f3e3cf"/><g fill="#e8fff6"><circle cx="22" cy="20" r="2"/><circle cx="38" cy="14" r="2"/><circle cx="46" cy="24" r="2"/></g>' },
  ];
  P.brew = function (G) {
    const target = ['klokje', 'maanmos', 'cw', 'cw', 'cw', 'vuurbloem'];
    const recipe = G.easy
      ? `<b>Nevelzicht</b><ol><li>Eén blauw klokje</li><li>Een plukje maanmos</li><li>Roer 3× met de klok mee ⟳</li><li>Eén traan van de vuurbloem</li></ol>`
      : `<b>Nevelzicht</b> <i>(in Sabeths kriebelhandschrift)</i><ol><li>Eerst iets dat luistert, maar geen oren heeft.</li><li>Dan iets dat slaapt in het maanlicht.</li><li>Roer zoals de schaduw van een zonnewijzer draait. Zo vaak als een klaver blaadjes heeft.</li><li>Als laatste iets dat brandt, maar nooit opbrandt.</li></ol>`;
    const pz = open('Sabeths Ketel', 'Maak het drankje waarmee je door de nevel kunt kijken.', /* stem:kwast */ () =>
      G.easy ? 'Volg het recept precies. Eerst het klokje, dan het maanmos. Dan drie keer met de klok mee roeren. En als laatste de vuurbloem.'
        : 'Een blauw klokje lijkt een beetje op een oortje. De schaduw van een zonnewijzer draait met de klok mee. En een klaver heeft drie blaadjes.');
    pz.body.innerHTML = `<div class="recipe">${recipe}</div>
      <div class="cauldron-wrap"><svg viewBox="0 0 300 170" style="width:100%;max-width:300px" aria-hidden="true">
        <ellipse cx="150" cy="160" rx="110" ry="10" fill="#000" opacity=".4"/>
        <path d="M60 60 Q50 150 150 158 Q250 150 240 60 Z" fill="#2a2a34"/>
        <ellipse id="brew-liquid" cx="150" cy="62" rx="88" ry="20" fill="#3d4a3a"/>
        <g id="brew-bubbles" fill="#fff" opacity=".5"><circle cx="120" cy="60" r="5"/><circle cx="170" cy="56" r="4"/><circle cx="150" cy="66" r="3"/></g>
        <ellipse cx="150" cy="60" rx="96" ry="22" fill="none" stroke="#4a4a58" stroke-width="10"/>
        <path id="brew-swirl" d="M110 62 Q150 44 190 62" stroke="#fff" stroke-width="3" fill="none" opacity="0"/>
      </svg></div>
      <div class="brew-log" id="brew-log" aria-live="polite">De ketel pruttelt zachtjes.</div>
      <div class="ingredients">${INGR.map((i) => `<button class="ingr" data-id="${i.id}"><svg viewBox="0 0 64 64">${i.svg}</svg><small>${i.name}</small></button>`).join('')}</div>
      <div class="stir-row"><button class="btn" data-stir="ccw">⟲ Tegen de klok</button><button class="btn" data-stir="cw">⟳ Met de klok</button></div>`;
    const liquid = pz.body.querySelector('#brew-liquid'), log = pz.body.querySelector('#brew-log'), swirl = pz.body.querySelector('#brew-swirl');
    let step = 0; const colors = ['#3d4a3a', '#4a5ac8', '#8a9ad8', '#8a9ad8', '#9aa8e8', '#b0c0ff', '#e8f0ff'];
    function act(id, label) {
      if (id === target[step]) {
        step++; A.sfx('bubble');
        liquid.setAttribute('fill', colors[step]);
        log.textContent = ['', 'Het klokje kleurt de ketel diepblauw.', 'Het maanmos lost op met een zilveren glans.', 'Het blauw draait mee… (1)', 'Het draait sneller… (2)', 'Er ontstaat een kolk van licht! (3)', 'Een wolkje ruikt naar regen en sterren!'][step];
        if (step === target.length) { A.sfx('magic'); log.textContent = '✨ Het drankje glanst als maanlicht op water. Nevelzicht!'; pz.finish(true); }
      } else {
        A.sfx('poof'); step = 0; liquid.setAttribute('fill', '#5a4a3a');
        log.textContent = `Poef! ${label} laat de ketel zwart roken. Het drankje is mislukt. Begin opnieuw.`;
        setTimeout(() => liquid.setAttribute('fill', colors[0]), 700);
      }
    }
    pz.body.querySelectorAll('.ingr').forEach((b) => b.addEventListener('click', () => act(b.dataset.id, INGR.find((i) => i.id === b.dataset.id).name)));
    pz.body.querySelectorAll('[data-stir]').forEach((b) => b.addEventListener('click', () => {
      swirl.setAttribute('opacity', '.8'); setTimeout(() => swirl.setAttribute('opacity', '0'), 300);
      A.sfx('whoosh'); act(b.dataset.stir, b.dataset.stir === 'cw' ? 'Rechtsom roeren' : 'Linksom roeren');
    }));
    return pz.closed;
  };

  /* ---------- 4. Glasblazen in Oma's oven ---------- */
  P.glass = function (G) {
    const pz = open('Het Maanglas blazen', 'Houd het glas in het vuur tot het oranje gloeit. Blaas dan. Maar niet te hard!', /* stem:kwast */ () =>
      'Eerst warm maken. Houd de knop ingedrukt tot het witte streepje in het gouden vak staat. Laat dan los. Blaas daarna tot de bol tussen de twee ringen zit, en laat weer los!');
    const zone = G.easy ? 0.16 : 0.09;
    pz.body.innerHTML = `<canvas class="pz-canvas" id="gl-c" width="600" height="420" style="aspect-ratio:600/420"></canvas>
      <div class="brew-log" id="gl-log" aria-live="polite">Stap 1: verwarm het sterrenzand.</div>
      <button class="btn btn-primary" id="gl-btn" style="touch-action:none">🔥 Houd vast om te verwarmen</button>`;
    const c = pz.body.querySelector('#gl-c'), x = c.getContext('2d');
    const btn = pz.body.querySelector('#gl-btn'), log = pz.body.querySelector('#gl-log');
    let phase = 'heat', heat = 0, size = 0.15, holding = false, done = false, t = 0;
    const heatTarget = [0.62, 0.62 + zone + 0.06];
    const sizeTarget = [0.62, 0.62 + zone];
    const down = (e) => { e.preventDefault(); holding = true; if (phase === 'blow') A.sfx('whoosh'); };
    const up = (e) => {
      e.preventDefault(); if (!holding) return; holding = false;
      if (phase === 'heat') {
        if (heat >= heatTarget[0] && heat <= heatTarget[1]) { phase = 'blow'; A.sfx('fire'); log.textContent = 'Mooi gloeiend! Stap 2: blaas de bol tot hij tussen de ringen zit.'; btn.textContent = '💨 Houd vast om te blazen'; }
        else if (heat > heatTarget[1]) { A.sfx('fail'); log.textContent = 'Te heet! Het glas druipt weg. Laat het even afkoelen en probeer het opnieuw.'; heat = 0.2; }
        else log.textContent = 'Nog niet heet genoeg. Langer vasthouden!';
      } else if (phase === 'blow') {
        if (size >= sizeTarget[0] && size <= sizeTarget[1]) { phase = 'done'; done = true; A.sfx('magic'); log.textContent = '✨ Een volmaakte bol Maanglas! Er dansen sterretjes in.'; btn.disabled = true; pz.finish(true); }
        else if (size < sizeTarget[0]) log.textContent = 'Nog te klein. Blaas nog een beetje.';
      }
    };
    btn.addEventListener('pointerdown', down); btn.addEventListener('pointerup', up); btn.addEventListener('pointerleave', up); btn.addEventListener('pointercancel', up);
    function draw() {
      if (!pz.body.contains(c) || $('#ov-puzzle').hidden) return;
      t += 0.016;
      if (holding && phase === 'heat') heat = Math.min(1, heat + 0.0055);
      else if (phase === 'heat') heat = Math.max(0, heat - 0.002);
      if (holding && phase === 'blow') {
        size += 0.004 + (G.easy ? 0 : 0.0015);
        if (size > sizeTarget[1] + 0.04) { A.sfx('glass'); log.textContent = 'Pling! Te hard geblazen. De bol knapt. Maak het glas opnieuw warm.'; phase = 'heat'; heat = 0.3; size = 0.15; holding = false; btn.textContent = '🔥 Houd vast om te verwarmen'; }
      }
      x.clearRect(0, 0, 600, 420);
      // oven-gloed
      const g = x.createRadialGradient(300, 240, 10, 300, 240, 260);
      g.addColorStop(0, `rgba(255,${120 + heat * 100 | 0},40,${0.25 + heat * 0.5})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, 600, 420);
      // pijp
      x.strokeStyle = '#7a7f90'; x.lineWidth = 12; x.beginPath(); x.moveTo(20, 240); x.lineTo(300 - 180 * size, 240); x.stroke();
      // bol
      const r = 40 + size * 160;
      const hue = phase === 'heat' ? 20 + heat * 25 : 200;
      const bg = x.createRadialGradient(300 - r * 0.3, 240 - r * 0.3, r * 0.1, 300, 240, r);
      bg.addColorStop(0, phase === 'heat' ? `hsla(${hue},100%,${50 + heat * 30}%,1)` : 'rgba(240,250,255,.95)');
      bg.addColorStop(1, phase === 'heat' ? `hsla(${hue},100%,${25 + heat * 25}%,.9)` : 'rgba(120,170,230,.5)');
      x.fillStyle = bg; x.beginPath(); x.arc(300, 240, r, 0, 7); x.fill();
      if (phase !== 'heat') { for (let i = 0; i < 9; i++) { const a = t * 0.8 + i * 0.7; x.fillStyle = 'rgba(255,250,200,.9)'; x.beginPath(); x.arc(300 + Math.cos(a) * r * 0.6 * (i % 3 + 1) / 3, 240 + Math.sin(a * 1.3) * r * 0.5 * ((i + 1) % 3 + 1) / 3, 3, 0, 7); x.fill(); } }
      // doelringen bij blazen
      if (phase === 'blow' || phase === 'done') {
        x.setLineDash([10, 8]); x.lineWidth = 4; x.strokeStyle = '#ffd36e';
        [sizeTarget[0], sizeTarget[1]].forEach((s) => { x.beginPath(); x.arc(300, 240, 40 + s * 160, 0, 7); x.stroke(); });
        x.setLineDash([]);
      }
      // hittemeter
      x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(40, 30, 520, 26);
      x.fillStyle = 'rgba(255,200,90,.45)'; x.fillRect(40 + heatTarget[0] * 520, 30, (heatTarget[1] - heatTarget[0]) * 520, 26);
      x.fillStyle = '#fff'; x.fillRect(40 + heat * 520 - 3, 24, 6, 38);
      x.fillStyle = '#e8dcc4'; x.font = '600 20px Nunito, sans-serif'; x.fillText('hitte', 44, 84);
      if (!done || t < 50) requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    return pz.closed;
  };

  /* ---------- 5. De Sterrenringen van de Maanlantaarn ---------- */
  P.rings = function (G) {
    const SYMS = ['☾', '✦', '❦', '≈', '✸', '◯', '△', '✧'];
    const n = G.easy ? 3 : 4;
    // Doel: van buiten naar binnen het begin van het slaapliedje: Blad, Golf, Vuur (, Golf)
    const goal = ['❦', '≈', '✸', '≈'].slice(0, n).map((s) => SYMS.indexOf(s));
    let rot = Array.from({ length: n }, () => Math.floor(Math.random() * 8));
    const solved = () => rot.every((r, i) => ((8 - r) % 8) === goal[i]);
    while (solved()) rot = rot.map(() => Math.floor(Math.random() * 8));
    const pz = open('De Sterrenringen', G.easy
      ? 'Draai de ringen zodat bovenaan, van buiten naar binnen, het slaapliedje staat: ❦ ≈ ✸'
      : 'Oma kraste in het hout: <i>“Laat de lantaarn het lied lezen, van buiten naar binnen.”</i> Let op: de ringen haken in elkaar.', /* stem:kwast */ () =>
      G.easy ? 'Tik op een ring om hem een stapje te draaien. Zet bovenaan eerst het Blad op de buitenste ring. Dan de Golf. Dan het Vuur.'
        : 'Het lied begint met Blad, Golf, Vuur, Golf. Als je een ring draait, draait de ring binnenin een stapje terug. Begin dus buiten en werk naar binnen.');
    pz.body.innerHTML = `<svg viewBox="-200 -200 400 400" class="pz-canvas" id="rings" role="group" aria-label="Ringen">
      <circle r="196" fill="#151d34"/>
      ${Array.from({ length: n }, (_, i) => `<g class="ring" data-i="${i}" tabindex="0" role="button" aria-label="Ring ${i + 1}" style="cursor:pointer"></g>`).join('')}
      <circle r="${195 - n * 40}" fill="url(#g-glow)" opacity=".7"/>
      <path d="M0 -199 L-12 -186 L12 -186 Z" fill="#ffd36e"/>
    </svg>
    <p class="muted small">Tik op een ring om hem te draaien. ${G.easy ? '' : 'De ringen zijn gekoppeld!'}</p>
    <div class="row"><button class="btn btn-small" id="ring-reset">↺ Opnieuw schudden</button></div>`;
    const svg = pz.body.querySelector('#rings');
    function draw() {
      svg.querySelectorAll('.ring').forEach((g) => {
        const i = +g.dataset.i; const R = 190 - i * 40, r2 = R - 36;
        let s = `<circle r="${R}" fill="${['#2a3558', '#33406a', '#3c4a7a', '#45558a'][i]}" stroke="#8fa0d8" stroke-width="2"/><circle r="${r2}" fill="#151d34" stroke="#8fa0d8" stroke-width="1" opacity=".9"/>`;
        s += `<g style="transition:transform .35s cubic-bezier(.3,1.4,.5,1);transform:rotate(${rot[i] * 45}deg)">`;
        SYMS.forEach((sym, k) => {
          const a = (k * 45 - 90) * Math.PI / 180, rr = R - 18;
          const hit = ((8 - rot[i]) % 8) === k && k === goal[i];
          s += `<text x="${(Math.cos(a) * rr).toFixed(1)}" y="${(Math.sin(a) * rr + 8).toFixed(1)}" text-anchor="middle" font-size="24" fill="${hit ? '#ffd36e' : '#dfe6ff'}" transform="rotate(${k * 45} ${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)})">${sym}</text>`;
        });
        s += '</g>';
        g.innerHTML = s;
      });
    }
    function turn(i) {
      rot[i] = (rot[i] + 1) % 8;
      if (!G.easy && i + 1 < n) rot[i + 1] = (rot[i + 1] + 7) % 8;
      A.sfx('click'); draw();
      if (solved()) { A.sfx('magic'); pz.setSub('✨ De ringen klikken vast. Het lied staat geschreven!'); svg.style.pointerEvents = 'none'; pz.finish(true); }
    }
    svg.addEventListener('click', (e) => {
      // bepaal welke ring op basis van afstand tot het midden
      const m = svg.getScreenCTM(); const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      const q = p.matrixTransform(m.inverse()); const d = Math.hypot(q.x, q.y);
      for (let i = 0; i < n; i++) { const R = 190 - i * 40; if (d <= R && d > R - 40) { turn(i); return; } }
    });
    svg.addEventListener('keydown', (e) => { const g = e.target.closest('.ring'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); turn(+g.dataset.i); } });
    pz.body.querySelector('#ring-reset').addEventListener('click', () => { rot = rot.map(() => Math.floor(Math.random() * 8)); if (solved()) rot[0] = (rot[0] + 1) % 8; A.sfx('whoosh'); draw(); });
    draw();
    return pz.closed;
  };

  /* ---------- 6. Het glazen vogeltje (stukjes draaien) ---------- */
  // Een plaatje van een glazen vogel, in vakjes geknipt. Tik om een vakje een kwartslag te draaien.
  // Het verloop (licht boven, donker onder) en de sterren helpen om ook 'lege' stukjes goed te draaien.
  const BIRD = `<defs><linearGradient id="bird-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4e88"/><stop offset="1" stop-color="#0c1226"/></linearGradient></defs>
    <rect width="300" height="300" fill="url(#bird-bg)"/>
    <path d="M0 40 Q150 10 300 40" stroke="#8aa8e8" stroke-width="3" fill="none" opacity=".5"/>
    <circle cx="150" cy="150" r="140" fill="url(#g-glow-blue)" opacity=".6"/>
    <path d="M40 190 Q60 110 140 110 Q180 60 230 74 L210 100 Q236 150 190 190 Q130 240 40 190 Z" fill="#9fd0f0" opacity=".85" stroke="#e6f6ff" stroke-width="5"/>
    <path d="M230 74 L272 66 L240 96 Z" fill="#ffd36e" stroke="#c9a54a" stroke-width="3"/>
    <circle cx="208" cy="96" r="9" fill="#1e2c56"/><circle cx="211" cy="93" r="3" fill="#fff"/>
    <path d="M80 170 Q120 130 170 150 Q130 190 80 170 Z" fill="#cfe9ff" stroke="#e6f6ff" stroke-width="3"/>
    <path d="M100 160 Q130 146 156 152 M96 170 Q126 162 150 166" stroke="#7fb8e0" stroke-width="3" fill="none"/>
    <path d="M40 190 L6 168 L20 214 Z" fill="#7fb8e0" stroke="#e6f6ff" stroke-width="3"/>
    <path d="M120 230 L114 268 M150 230 L150 268 M104 268 L126 268 M140 268 L162 268" stroke="#c9a54a" stroke-width="6" stroke-linecap="round"/>
    <path d="M70 140 Q100 110 130 118" stroke="#fff" stroke-width="5" fill="none" opacity=".75" stroke-linecap="round"/>
    <g fill="#fff6c0"><path d="M60 52 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z"/><path d="M250 212 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/><path d="M34 242 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/><circle cx="270" cy="150" r="3"/><circle cx="20" cy="20" r="2.5"/><circle cx="160" cy="30" r="2"/></g>
    <path d="M0 290 Q150 260 300 290 L300 300 L0 300 Z" fill="#0a0e1c" opacity=".8"/>`;
  P.bird = function (G) {
    const n = 3, size = 300 / n;
    // makkelijk: 4 vakjes staan scheef. moeilijk: alle vakjes, en soms op z'n kop.
    let rot = Array.from({ length: n * n }, () => 0);
    const twist = G.easy ? shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 4) : [0, 1, 2, 3, 4, 5, 6, 7, 8];
    twist.forEach((i) => { rot[i] = 1 + Math.floor(Math.random() * 3); });
    const pz = open('Het glazen vogeltje', G.easy
      ? 'Tik op een stukje om het te draaien. Maak het vogeltje weer heel.'
      : 'Negen scherven. Draai ze tot het vogeltje weer klopt.',
    /* stem:kwast */ () => G.easy ? 'Kijk naar het voorbeeld eronder. Draai elk stukje tot het lijkt op het plaatje.' : 'Begin bij de snavel, die is geel. Zoek dan het oog en de pootjes.');
    pz.body.innerHTML = `<div class="tiles" id="bird-tiles" role="group" aria-label="Scherven">${rot.map((r, i) => {
      const x = (i % n) * size, y = Math.floor(i / n) * size;
      return `<button class="tile" data-i="${i}" aria-label="Scherf ${i + 1}"><svg viewBox="${x} ${y} ${size} ${size}" style="transform:rotate(${r * 90}deg)">${BIRD}</svg></button>`;
    }).join('')}</div>
    ${G.easy ? `<p class="muted small" style="margin:.6em 0 .2em">Zo hoort het eruit te zien:</p><svg viewBox="0 0 300 300" class="tile-preview" aria-hidden="true">${BIRD}</svg>` : ''}`;
    const solved = () => rot.every((r) => r % 4 === 0);
    pz.body.querySelectorAll('.tile').forEach((b) => b.addEventListener('click', () => {
      const i = +b.dataset.i; if (solved()) return;
      rot[i] += 1; A.sfx('glass');
      b.querySelector('svg').style.transform = `rotate(${rot[i] * 90}deg)`;
      if (G.easy) b.classList.toggle('ok', rot[i] % 4 === 0);
      if (solved()) { A.sfx('magic'); pz.setSub('✨ Het vogeltje is weer heel!'); pz.body.querySelector('#bird-tiles').classList.add('done'); pz.finish(true); }
    }));
    if (G.easy) pz.body.querySelectorAll('.tile').forEach((b) => b.classList.toggle('ok', rot[+b.dataset.i] % 4 === 0));
    return pz.closed;
  };

  /* ---------- 7. De Spiegeltrap (maanlicht kaatsen) ---------- */
  // Rooster met spiegels. Het maanlicht komt links binnen; tik op een spiegel om hem te kantelen.
  // Het licht moet bovenaan door het luik (☾) naar buiten.
  const LEVELS = {
    easy: { n: 4, start: 2, goal: 3, mirrors: { '2,1': '/', '0,1': '/', '0,3': '/', '2,3': '\\' }, fixed: ['0,3'], pillars: [] },
    hard: { n: 5, start: 4, goal: 3, mirrors: { '4,2': '/', '1,2': '\\', '1,0': '\\', '0,0': '/', '0,3': '/', '4,4': '\\', '2,4': '/', '3,0': '/' }, fixed: [], pillars: ['3,4', '2,0'] },
  };
  P.mirrors = function (G) {
    const L = LEVELS[G.easy ? 'easy' : 'hard'];
    const n = L.n, C = 70, W = n * C;
    const flip = (m) => (m === '/' ? '\\' : '/');
    const state = {};
    Object.keys(L.mirrors).forEach((k) => { state[k] = L.fixed.includes(k) ? L.mirrors[k] : (Math.random() < 0.75 ? flip(L.mirrors[k]) : L.mirrors[k]); });
    function trace() { // geeft de punten van de lichtstraal terug en of hij het luik raakt
      let r = L.start, c = -1, dr = 0, dc = 1; const pts = [[0, L.start * C + C / 2]];
      for (let step = 0; step < 60; step++) {
        r += dr; c += dc;
        if (r < 0 || c < 0 || r >= n || c >= n) {
          pts.push([(c + 0.5 - dc * 0.5) * C, (r + 0.5 - dr * 0.5) * C]);
          return { pts, hit: r < 0 && c === L.goal };
        }
        const k = r + ',' + c;
        if (L.pillars.includes(k)) { pts.push([(c + 0.5 - dc * 0.35) * C, (r + 0.5 - dr * 0.35) * C]); return { pts, hit: false }; }
        const m = state[k];
        if (m) {
          pts.push([(c + 0.5) * C, (r + 0.5) * C]);
          if (m === '/') { [dr, dc] = [-dc, -dr]; } else { [dr, dc] = [dc, dr]; }
        }
      }
      return { pts, hit: false };
    }
    if (trace().hit) { const k = Object.keys(state).find((x) => !L.fixed.includes(x)); state[k] = flip(state[k]); }
    const pz = open('De Spiegeltrap', G.easy
      ? 'Tik op de spiegels om ze te kantelen. Stuur het maanlicht naar het luik ☾ bovenaan.'
      : 'Het maanlicht moet het luik ☾ vinden. Niet elke spiegel hoort op het pad.',
    /* stem:kwast */ () => G.easy ? 'Volg het licht met je vinger. Waar het de verkeerde kant op gaat, tik je op die spiegel.' : 'Werk van achteren naar voren: welke spiegel moet het licht in het luik gooien? En hoe komt het licht daar?');
    pz.body.innerHTML = `<svg viewBox="-40 -50 ${W + 80} ${W + 90}" class="pz-canvas mirror-grid" id="mg" role="group" aria-label="Spiegels"></svg>
      <p class="muted small">Tik op een spiegel om hem te kantelen.</p>`;
    const svg = pz.body.querySelector('#mg');
    let won = false;
    function draw() {
      const t = trace();
      let s = `<rect x="0" y="0" width="${W}" height="${W}" rx="12" fill="#1a2036" stroke="#4a5470" stroke-width="3"/>`;
      for (let i = 1; i < n; i++) s += `<path d="M${i * C} 0 V${W} M0 ${i * C} H${W}" stroke="#2c3450" stroke-width="2"/>`;
      // luik bovenaan en raam links
      s += `<g transform="translate(${(L.goal + 0.5) * C} -24)"><rect x="-28" y="-18" width="56" height="30" rx="6" fill="${t.hit ? '#ffe9a6' : '#2a3048'}" stroke="#c9a54a" stroke-width="3"/><text y="5" text-anchor="middle" font-size="22" fill="${t.hit ? '#3a2a10' : '#c9a54a'}">☾</text></g>`;
      s += `<g transform="translate(-22 ${(L.start + 0.5) * C})"><circle r="20" fill="url(#g-glow-blue)"/><circle r="9" fill="#e8f4ff"/></g>`;
      L.pillars.forEach((k) => { const [r, c] = k.split(',').map(Number); s += `<g transform="translate(${(c + 0.5) * C} ${(r + 0.5) * C})"><rect x="-22" y="-22" width="44" height="44" rx="8" fill="#4a5068" stroke="#1a1f30" stroke-width="3"/><path d="M-14 -8 H14 M-14 6 H14" stroke="#2c3248" stroke-width="3"/></g>`; });
      // de straal
      const d = t.pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      s += `<path d="${d}" stroke="#bfe0ff" stroke-width="14" stroke-opacity=".25" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" stroke="#f4faff" stroke-width="4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
      Object.keys(state).forEach((k) => {
        const [r, c] = k.split(',').map(Number); const fixed = L.fixed.includes(k);
        const a = state[k] === '/' ? -45 : 45;
        s += `<g class="mirror${fixed ? ' fixed' : ''}" data-k="${k}" transform="translate(${(c + 0.5) * C} ${(r + 0.5) * C})" tabindex="${fixed ? -1 : 0}" role="button" aria-label="Spiegel">
          <rect x="-34" y="-34" width="68" height="68" fill="transparent"/>
          <g style="transition:transform .25s;transform:rotate(${a}deg)"><rect x="-28" y="-5" width="56" height="10" rx="4" fill="url(#g-glass)" stroke="${fixed ? '#8a7a50' : '#e6f6ff'}" stroke-width="2.5"/></g>${fixed ? '<circle r="4" fill="#c9a54a"/>' : ''}</g>`;
      });
      svg.innerHTML = s;
      if (t.hit && !won) { won = true; A.sfx('magic'); pz.setSub('✨ Het luik gaat open! Het maanlicht wijst de weg naar boven.'); svg.style.pointerEvents = 'none'; pz.finish(true); }
    }
    const tap = (g) => { if (!g || g.classList.contains('fixed') || won) return; const k = g.dataset.k; state[k] = flip(state[k]); A.sfx('click'); draw(); };
    svg.addEventListener('click', (e) => tap(e.target.closest('.mirror')));
    svg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(e.target.closest('.mirror')); } });
    draw();
    return pz.closed;
  };

  window.Puzzles = P;
})();
