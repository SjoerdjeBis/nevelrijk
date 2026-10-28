/* ==========================================================
   Nevelrijk — beeld
   Alle graphics zijn met de hand opgebouwde SVG: lagen, verlopen,
   licht en mist. Geen afbeeldingsbestanden nodig, scherp op elk scherm.
   ========================================================== */
(function () {
  'use strict';

  // Deterministische random zodat sterren/gras elke keer hetzelfde liggen.
  function rng(seed) {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  const f1 = (n) => Math.round(n * 10) / 10;

  const Art = { rng };

  /* ---------------- gedeelde defs ---------------- */
  Art.defs = function () {
    return `
    <radialGradient id="g-skin" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#ffe0c4"/><stop offset="1" stop-color="#e9b48f"/></radialGradient>
    <radialGradient id="g-skin-old" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#f6dcc8"/><stop offset="1" stop-color="#d9ab90"/></radialGradient>
    <linearGradient id="g-cloak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f8a6a"/><stop offset="1" stop-color="#1f4f43"/></linearGradient>
    <linearGradient id="g-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d0643a"/><stop offset="1" stop-color="#8d3520"/></linearGradient>
    <radialGradient id="g-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd890" stop-opacity=".9"/><stop offset=".4" stop-color="#ffae55" stop-opacity=".35"/><stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-glow-blue" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#d8ecff" stop-opacity=".9"/><stop offset=".4" stop-color="#8fbfff" stop-opacity=".3"/><stop offset="1" stop-color="#6a9cff" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-glow-green" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#e2ffd8" stop-opacity=".85"/><stop offset=".4" stop-color="#8fe39a" stop-opacity=".3"/><stop offset="1" stop-color="#4fbf6a" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-glow-pink" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe0f0" stop-opacity=".9"/><stop offset=".4" stop-color="#f29ac8" stop-opacity=".3"/><stop offset="1" stop-color="#d06aa8" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-mist" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#dfe7f5" stop-opacity=".55"/><stop offset=".6" stop-color="#c3cfe6" stop-opacity=".2"/><stop offset="1" stop-color="#b8c6e0" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-shadow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-vignette" cx="50%" cy="45%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
    <linearGradient id="g-stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b93a6"/><stop offset="1" stop-color="#4a5063"/></linearGradient>
    <linearGradient id="g-moss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fbf6a"/><stop offset="1" stop-color="#4f7f3f"/></linearGradient>
    <linearGradient id="g-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b4528"/><stop offset=".5" stop-color="#8a5a34"/><stop offset="1" stop-color="#5e3b22"/></linearGradient>
    <linearGradient id="g-wood-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2f1c"/><stop offset="1" stop-color="#2c1b10"/></linearGradient>
    <linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6f6ff" stop-opacity=".9"/><stop offset=".5" stop-color="#9fd0f0" stop-opacity=".35"/><stop offset="1" stop-color="#5f8fc0" stop-opacity=".6"/></linearGradient>
    <linearGradient id="g-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a6"/><stop offset=".5" stop-color="#e2a940"/><stop offset="1" stop-color="#9a6a1c"/></linearGradient>
    <linearGradient id="g-grey-lord" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8ecf6" stop-opacity=".95"/><stop offset=".6" stop-color="#9aa6c0" stop-opacity=".7"/><stop offset="1" stop-color="#7d88a6" stop-opacity="0"/></linearGradient>
    <linearGradient id="g-shade" x1=".15" y1="0" x2=".95" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset=".58" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0a0418" stop-opacity=".46"/></linearGradient>
    <radialGradient id="g-shade-r" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#fff" stop-opacity=".24"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".72" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#1a0818" stop-opacity=".42"/></radialGradient>
    <linearGradient id="g-rim" x1="0" y1="0" x2="1" y2="0"><stop offset=".72" stop-color="#bcd8ff" stop-opacity="0"/><stop offset="1" stop-color="#bcd8ff" stop-opacity=".32"/></linearGradient>
    <radialGradient id="g-iris" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
    <radialGradient id="g-blush" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff7f7a" stop-opacity=".5"/><stop offset="1" stop-color="#ff7f7a" stop-opacity="0"/></radialGradient>
    <filter id="f-blur4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="f-blur12" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
    <filter id="f-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter>
    `;
  };

  /* ---------------- bouwstenen voor landschappen ---------------- */
  Art.sky = function (id, stops) {
    const s = stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('');
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${s}</linearGradient></defs><rect width="1000" height="1500" fill="url(#${id})"/>`;
  };
  Art.stars = function (n, seed, yMax, opacity) {
    const r = rng(seed); let out = '<g class="stars">';
    for (let i = 0; i < n; i++) {
      const x = r() * 1000, y = r() * (yMax || 600), s = r() * 2.2 + 0.4;
      const tw = r() > 0.7 ? ` class="twinkle" style="animation-delay:${f1(r() * 3)}s"` : '';
      out += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(s)}" fill="#fff" opacity="${f1((opacity || 0.8) * (0.4 + r() * 0.6))}"${tw}/>`;
    }
    return out + '</g>';
  };
  Art.moon = function (x, y, r, lit) {
    return `<g>
      <circle cx="${x}" cy="${y}" r="${r * 3.2}" fill="url(#g-glow-blue)" opacity="${lit ? 0.8 : 0.35}"/>
      <circle cx="${x}" cy="${y}" r="${r}" fill="${lit ? '#fbf6e4' : '#cfd7e6'}"/>
      <circle cx="${x - r * 0.3}" cy="${y - r * 0.2}" r="${r * 0.18}" fill="#000" opacity=".07"/>
      <circle cx="${x + r * 0.35}" cy="${y + r * 0.25}" r="${r * 0.25}" fill="#000" opacity=".06"/>
      <circle cx="${x + r * 0.1}" cy="${y - r * 0.45}" r="${r * 0.1}" fill="#000" opacity=".07"/>
    </g>`;
  };
  // Golvende heuvelrug als pad
  Art.ridge = function (y, amp, seed, color, opts) {
    const r = rng(seed); const o = opts || {};
    let d = `M0 ${y}`; const steps = o.steps || 10;
    for (let i = 1; i <= steps; i++) {
      const x = (i / steps) * 1000; const cy = y + (r() - 0.5) * amp * 2; const cx = x - 1000 / steps / 2;
      d += ` Q ${f1(cx)} ${f1(cy - amp * (o.peaky ? r() : 0.3))} ${f1(x)} ${f1(y + (r() - 0.5) * amp)}`;
    }
    d += ` L1000 ${o.bottom || 1500} L0 ${o.bottom || 1500} Z`;
    return `<path d="${d}" fill="${color}"${o.cls ? ` class="${o.cls}"` : ''}${o.opacity ? ` opacity="${o.opacity}"` : ''}/>`;
  };
  Art.pine = function (x, y, h, color, cls) {
    const w = h * 0.42; let p = '';
    for (let i = 0; i < 4; i++) {
      const ty = y - h + i * h * 0.2, by = y - h * 0.62 + i * h * 0.2, ww = w * (0.45 + i * 0.2);
      p += `<path d="M${f1(x)} ${f1(ty)} L${f1(x + ww)} ${f1(by)} L${f1(x - ww)} ${f1(by)} Z"/>`;
    }
    return `<g fill="${color}"${cls ? ` class="${cls}"` : ''}><rect x="${f1(x - h * 0.03)}" y="${f1(y - h * 0.15)}" width="${f1(h * 0.06)}" height="${f1(h * 0.15)}"/>${p}</g>`;
  };
  Art.roundTree = function (x, y, h, trunk, leaf, cls, seed) {
    const r = rng(seed || x * 7 + y); let blobs = '';
    for (let i = 0; i < 7; i++) {
      const bx = x + (r() - 0.5) * h * 0.6, by = y - h * 0.62 + (r() - 0.5) * h * 0.4, br = h * (0.17 + r() * 0.14);
      blobs += `<circle cx="${f1(bx)}" cy="${f1(by)}" r="${f1(br)}"/>`;
    }
    return `<g${cls ? ` class="${cls}"` : ''}><path d="M${f1(x - h * 0.05)} ${y} Q ${f1(x - h * 0.02)} ${f1(y - h * 0.3)} ${f1(x - h * 0.08)} ${f1(y - h * 0.55)} L${f1(x + h * 0.08)} ${f1(y - h * 0.55)} Q ${f1(x + h * 0.03)} ${f1(y - h * 0.3)} ${f1(x + h * 0.06)} ${y} Z" fill="${trunk}"/><g fill="${leaf}">${blobs}</g></g>`;
  };
  Art.grass = function (y0, y1, n, seed, color, h) {
    const r = rng(seed); let d = '';
    for (let i = 0; i < n; i++) {
      const x = r() * 1000, y = y0 + r() * (y1 - y0), hh = (h || 26) * (0.5 + r()), lean = (r() - 0.5) * 14;
      d += `M${f1(x)} ${f1(y)} q ${f1(lean * 0.4)} ${f1(-hh * 0.5)} ${f1(lean)} ${f1(-hh)} M${f1(x + 4)} ${f1(y)} q ${f1(-lean * 0.2)} ${f1(-hh * 0.4)} ${f1(-lean * 0.6)} ${f1(-hh * 0.8)} `;
    }
    return `<path d="${d}" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  };
  Art.mist = function (y, h, opacity, cls, seed) {
    const r = rng(seed || y); let e = '';
    for (let i = 0; i < 6; i++) e += `<ellipse cx="${f1(-100 + i * 240 + r() * 80)}" cy="${f1(y + (r() - 0.5) * h * 0.4)}" rx="${f1(260 + r() * 160)}" ry="${f1(h * (0.4 + r() * 0.3))}" fill="url(#g-mist)"/>`;
    return `<g opacity="${opacity}" class="${cls || 'drift'}">${e}</g>`;
  };
  Art.glow = function (x, y, r, kind, opacity, cls) {
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#g-glow${kind ? '-' + kind : ''})" opacity="${opacity == null ? 1 : opacity}"${cls ? ` class="${cls}"` : ''}/>`;
  };
  Art.shadow = function (x, y, rx, ry, o) {
    return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry || rx * 0.22}" fill="url(#g-shadow)" opacity="${o || 1}"/>`;
  };
  Art.flowers = function (y0, y1, n, seed, colors) {
    const r = rng(seed); let out = '';
    for (let i = 0; i < n; i++) {
      const x = r() * 1000, y = y0 + r() * (y1 - y0), c = colors[Math.floor(r() * colors.length)], s = 3 + r() * 4;
      out += `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x)}" y2="${f1(y - s * 3)}" stroke="#3e6b3a" stroke-width="2"/><circle cx="${f1(x)}" cy="${f1(y - s * 3)}" r="${f1(s)}" fill="${c}"/>`;
    }
    return out;
  };
  Art.fireflies = function (n, seed, box) {
    const r = rng(seed); let out = '';
    for (let i = 0; i < n; i++) {
      const x = box[0] + r() * box[2], y = box[1] + r() * box[3];
      out += `<g class="bob" style="animation-delay:${f1(r() * 4)}s;animation-duration:${f1(3 + r() * 3)}s"><circle cx="${f1(x)}" cy="${f1(y)}" r="14" fill="url(#g-glow)" class="twinkle" style="animation-delay:${f1(r() * 3)}s"/><circle cx="${f1(x)}" cy="${f1(y)}" r="2.5" fill="#fff6c0"/></g>`;
    }
    return out;
  };
  Art.vignette = () => `<rect width="1000" height="1500" fill="url(#g-vignette)" pointer-events="none"/>`;

  /* ---------------- personages ----------------
     Alle figuren staan met hun voeten op (0,0).
     Diepte zonder zware filters: elk vlak krijgt een basiskleur, een
     licht-schaduwverloop (licht van linksboven), een koel randje
     maanlicht rechts en een zachte inktlijn. */

  // Ellips als pad, zodat hij dezelfde schaduwlagen kan krijgen.
  const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  // Een vlak met volume.
  function V(d, fill, o) {
    o = o || {};
    const ink = o.ink || '#1b1226';
    return `<path d="${d}" fill="${fill}"/>`
      + `<path d="${d}" fill="url(#${o.round ? 'g-shade-r' : 'g-shade'})"${o.shade != null ? ` opacity="${o.shade}"` : ''}/>`
      + (o.rim === false ? '' : `<path d="${d}" fill="url(#g-rim)"/>`)
      + (o.line === false ? '' : `<path d="${d}" fill="none" stroke="${ink}" stroke-opacity="${o.io != null ? o.io : 0.55}" stroke-width="${o.sw || 2.5}" stroke-linejoin="round"/>`);
  }
  // Lijnen (plooien, lokken) in één pad.
  const lines = (d, color, w, op) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w || 2.5}" stroke-opacity="${op == null ? 0.5 : op}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // Een oog: oogwit, iris, pupil en twee lichtjes.
  function eye(x, y, s, iris, look) {
    const lx = (look || 0) * s;
    return `<ellipse cx="${x}" cy="${y}" rx="${f1(6.4 * s)}" ry="${f1(7 * s)}" fill="#fbf6f0"/>`
      + `<ellipse cx="${x}" cy="${y - 2.4 * s}" rx="${f1(6.4 * s)}" ry="${f1(3.4 * s)}" fill="#000" opacity=".08"/>`
      + `<circle cx="${f1(x + lx)}" cy="${f1(y + 0.8 * s)}" r="${f1(4.6 * s)}" fill="${iris}"/>`
      + `<circle cx="${f1(x + lx)}" cy="${f1(y + 0.8 * s)}" r="${f1(4.6 * s)}" fill="url(#g-iris)"/>`
      + `<circle cx="${f1(x + lx)}" cy="${f1(y + 1 * s)}" r="${f1(2.3 * s)}" fill="#120a0a"/>`
      + `<circle cx="${f1(x + lx + 1.6 * s)}" cy="${f1(y - 1.4 * s)}" r="${f1(1.5 * s)}" fill="#fff"/>`
      + `<circle cx="${f1(x + lx - 1.6 * s)}" cy="${f1(y + 2.6 * s)}" r="${f1(0.7 * s)}" fill="#fff" opacity=".8"/>`
      + `<path d="M${f1(x - 7 * s)} ${f1(y - 1 * s)} Q${x} ${f1(y - 9.5 * s)} ${f1(x + 7 * s)} ${f1(y - 1.5 * s)}" fill="none" stroke="#2a1410" stroke-width="${f1(2.2 * s)}" stroke-linecap="round"/>`;
  }
  const blush = (x, y, rx) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f1(rx * 0.6)}" fill="url(#g-blush)"/>`;

  Art.mira = function () {
    const SK = '#6a3424';
    return `<g class="mira-figure">
      <ellipse cx="0" cy="0" rx="62" ry="13" fill="url(#g-shadow)"/>
      <g class="body-bob">
        <g class="leg-l">${V('M-18 -92 L-22 -14 Q-24 -2 -10 -2 L-4 -2 L-6 -92 Z', '#3b2b3f', { sw: 2 })}${V('M-30 -10 Q-30 2 -14 2 L-2 2 Q2 -6 -6 -14 L-26 -16 Z', '#5a3a24', { sw: 2 })}${lines('M-26 -8 Q-16 -10 -6 -8', '#f0c08a', 2, 0.35)}</g>
        <g class="leg-r">${V('M6 -92 L4 -14 Q4 -2 16 -2 L22 -2 L18 -92 Z', '#33253a', { sw: 2 })}${V('M2 -10 Q2 2 18 2 L30 2 Q34 -6 26 -14 L6 -16 Z', '#4e321f', { sw: 2 })}${lines('M6 -8 Q16 -10 26 -8', '#f0c08a', 2, 0.35)}</g>
        <!-- haar achter het hoofd + vlecht -->
        ${V('M-38 -250 Q-48 -200 -32 -176 Q-20 -196 -24 -232 Z', 'url(#g-hair)', { ink: '#4a1608', sw: 2 })}
        ${V('M30 -244 Q50 -216 42 -188 Q48 -172 40 -150 Q30 -168 31 -188 Q24 -212 24 -238 Z', 'url(#g-hair)', { ink: '#4a1608', sw: 2 })}
        ${lines('M34 -206 Q42 -200 38 -192 M36 -180 Q44 -174 40 -166', '#4a1608', 2, 0.55)}
        <circle cx="40" cy="-152" r="5.5" fill="#7fd3ff"/><circle cx="38.5" cy="-154" r="1.8" fill="#fff"/>
        <!-- mantel -->
        ${V('M-46 -84 Q-52 -150 -30 -205 Q0 -222 30 -205 Q52 -150 46 -84 Q24 -72 0 -76 Q-24 -72 -46 -84 Z', 'url(#g-cloak)', { ink: '#0c241e' })}
        ${lines('M-32 -176 Q-38 -130 -34 -90 M31 -172 Q36 -130 32 -92 M-24 -126 Q-28 -104 -26 -84 M24 -120 Q27 -100 25 -84', '#0b2a22', 3, 0.5)}
        ${lines('M-26 -196 Q-40 -150 -42 -110', '#8fdcb8', 2.5, 0.25)}
        ${V('M-12 -206 L12 -206 L18 -90 Q0 -84 -18 -90 Z', '#e7d3a8', { ink: '#6a5030', sw: 2 })}
        ${lines('M0 -196 L0 -146 M-6 -112 Q0 -108 6 -112', '#a8885a', 2, 0.5)}
        ${V('M-18 -141 L18 -141 L17 -128 L-17 -128 Z', '#8a5a34', { ink: '#3a2414', sw: 2 })}
        <rect x="-6" y="-140" width="12" height="11" rx="2" fill="url(#g-gold)" stroke="#6a4a12" stroke-width="1.5"/>
        ${V('M-46 -84 Q-24 -72 0 -76 Q24 -72 46 -84 L44 -96 Q22 -86 0 -90 Q-22 -86 -44 -96 Z', '#163a31', { ink: '#0c241e', sw: 2 })}
        <g class="arm-l">${V('M-32 -196 Q-50 -170 -48 -122 L-34 -118 Q-34 -160 -22 -190 Z', '#2f7258', { ink: '#0c241e', sw: 2 })}${lines('M-44 -150 Q-40 -144 -36 -146', '#0b2a22', 2, 0.5)}${V(ell(-41, -116, 9, 9), 'url(#g-skin)', { round: true, ink: SK, sw: 1.8, rim: false })}</g>
        <g class="arm-r">${V('M32 -196 Q50 -170 48 -122 L34 -118 Q34 -160 22 -190 Z', '#2f7258', { ink: '#0c241e', sw: 2 })}${lines('M44 -150 Q40 -144 36 -146', '#0b2a22', 2, 0.5)}${V(ell(41, -116, 9, 9), 'url(#g-skin)', { round: true, ink: SK, sw: 1.8, rim: false })}</g>
        <!-- hals, kraag, kralen -->
        ${V('M-9 -216 L9 -216 L8 -200 Q0 -196 -8 -200 Z', '#e2a882', { ink: SK, sw: 1.6, rim: false })}
        <ellipse cx="0" cy="-212" rx="11" ry="4" fill="#7a3a22" opacity=".35"/>
        ${V('M-30 -206 Q0 -188 30 -206 Q22 -215 0 -212 Q-22 -215 -30 -206 Z', '#2c6650', { ink: '#0c241e', sw: 2 })}
        ${[[-14, -200, '#ffb84d', 3.6], [-6, -196, '#7fd3ff', 3.6], [2, -195, '#ff7a5c', 4.2], [10, -197, '#9be3a2', 3.6], [17, -201, '#ffb84d', 3.2]].map(([x, y, c, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="#1b1226" stroke-opacity=".4" stroke-width="1"/><circle cx="${x - 1.2}" cy="${y - 1.2}" r="1.2" fill="#fff" opacity=".85"/>`).join('')}
        <!-- hoofd -->
        ${V(ell(-35, -244, 5, 7.5), 'url(#g-skin)', { ink: SK, sw: 1.6, rim: false })}${V(ell(35, -244, 5, 7.5), 'url(#g-skin)', { ink: SK, sw: 1.6 })}
        ${V(ell(0, -246, 35, 38), 'url(#g-skin)', { round: true, ink: SK, io: 0.45 })}
        ${V('M-37 -252 Q-36 -292 0 -292 Q38 -292 38 -250 Q30 -270 10 -268 Q-2 -262 -6 -272 Q-20 -262 -37 -252 Z', 'url(#g-hair)', { ink: '#4a1608' })}
        ${lines('M-6 -272 Q-16 -258 -30 -256 M-26 -262 Q-20 -278 -4 -284 M6 -270 Q20 -276 32 -260', '#5e2010', 2, 0.55)}
        ${lines('M-18 -284 Q0 -291 18 -284', '#ffb790', 4, 0.6)}
        <g class="eyes">${eye(-13, -244, 1, '#3e8a6a')}${eye(13, -244, 1, '#3e8a6a')}</g>
        ${lines('M-21 -258 Q-13 -263 -5 -258 M5 -258 Q13 -263 21 -258', '#7a2c18', 2.6, 0.9)}
        ${blush(-22, -230, 8)}${blush(22, -230, 8)}
        <g fill="#b8664a" opacity=".55"><circle cx="-19" cy="-235" r="1"/><circle cx="-15" cy="-232" r="1"/><circle cx="-23" cy="-232" r="0.9"/><circle cx="16" cy="-234" r="1"/><circle cx="20" cy="-232" r="1"/><circle cx="23" cy="-235" r="0.9"/></g>
        ${lines('M1 -241 Q5 -235 0 -232', '#a8604a', 2, 0.8)}
        <path class="mouth" d="M-6 -224 Q0 -219 6 -224 Q0 -222 -6 -224 Z" fill="#8a3b33" stroke="#6a2a24" stroke-width="2" stroke-linejoin="round"/>
      </g>
    </g>`;
  };

  Art.oma = function (faded) {
    const SK = '#6a4030';
    return `<g opacity="${faded ? 0.66 : 1}">
      <ellipse cx="0" cy="0" rx="70" ry="12" fill="url(#g-shadow)"/>
      <!-- krukje -->
      ${lines('M-40 0 L-34 -60 M40 0 L34 -60 M-36 -30 L36 -30', '#5e3b22', 8, 1)}
      ${V('M-42 -66 L42 -66 L40 -56 L-40 -56 Z', '#7a4e2c', { ink: '#2a1408', sw: 2 })}
      <!-- jurk en omslagdoek -->
      ${V('M-48 -56 Q-56 -150 -24 -178 Q0 -188 24 -178 Q56 -150 48 -56 Q0 -40 -48 -56 Z', '#6a5a8a', { ink: '#231a38' })}
      ${lines('M-30 -150 Q-38 -110 -36 -64 M30 -150 Q36 -110 34 -62 M-8 -100 Q-10 -80 -8 -58 M10 -100 Q12 -80 10 -58', '#2c2248', 3, 0.5)}
      ${V('M-48 -56 Q0 -40 48 -56 L50 -40 Q0 -24 -50 -40 Z', '#4c3f68', { ink: '#231a38', sw: 2 })}
      ${V('M-30 -150 Q0 -130 30 -150 L26 -100 Q0 -90 -26 -100 Z', '#e8d9c0', { ink: '#7a6a50', sw: 2 })}
      ${lines('M-20 -138 L-14 -110 M0 -134 L0 -104 M20 -138 L14 -110', '#b8a888', 2, 0.6)}
      ${V('M-26 -170 Q-50 -130 -18 -96 L-6 -104 Q-30 -132 -12 -166 Z', '#7d6ca0', { ink: '#231a38', sw: 2 })}
      ${V('M26 -170 Q50 -130 18 -96 L6 -104 Q30 -132 12 -166 Z', '#7d6ca0', { ink: '#231a38', sw: 2 })}
      ${V(ell(-8, -100, 9, 9), 'url(#g-skin-old)', { round: true, ink: SK, sw: 1.6, rim: false })}${V(ell(8, -100, 9, 9), 'url(#g-skin-old)', { round: true, ink: SK, sw: 1.6 })}
      <!-- hoofd -->
      ${V('M-9 -182 L9 -182 L8 -172 L-8 -172 Z', '#d8ac92', { ink: SK, sw: 1.4, rim: false })}
      ${V(ell(0, -210, 32, 34), 'url(#g-skin-old)', { round: true, ink: SK, io: 0.45 })}
      ${V('M-33 -214 Q-34 -246 0 -248 Q34 -246 33 -214 Q24 -232 0 -232 Q-24 -232 -33 -214 Z', '#e9ecf2', { ink: '#6a7088', sw: 2 })}
      ${lines('M-24 -230 Q-12 -242 0 -240 M6 -240 Q20 -238 26 -228', '#a8b0c4', 2, 0.7)}
      ${V(ell(0, -254, 16, 15), '#e3e6ee', { round: true, ink: '#6a7088', sw: 2 })}
      ${lines('M-10 -258 Q0 -266 10 -258', '#a8b0c4', 2, 0.7)}
      <path d="M-20 -211 Q-13 -206 -6 -211 M6 -211 Q13 -206 20 -211" stroke="#4a2a20" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      ${lines('M-22 -203 Q-18 -201 -16 -203 M16 -203 Q18 -201 22 -203 M-12 -224 Q-6 -226 -2 -224', '#a06a58', 1.6, 0.6)}
      <g fill="none" stroke="#c9a24a" stroke-width="2.2"><circle cx="-13" cy="-210" r="9.5"/><circle cx="13" cy="-210" r="9.5"/><path d="M-3.5 -210 L3.5 -210"/></g>
      <path d="M-18 -214 L-10 -206" stroke="#fff" stroke-width="1.6" opacity=".5"/>
      ${lines('M1 -204 Q4 -198 0 -195', '#a0685a', 2, 0.8)}
      <path d="M-7 -189 Q0 -185 7 -189" stroke="#8a4a3e" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      ${blush(-21, -196, 7)}${blush(21, -196, 7)}
    </g>`;
  };

  Art.kwast = function () { // de kraai
    const INK = '#05070e';
    return `<g>
      <g class="hop">
        ${V('M-38 -40 Q-70 -30 -88 -4 Q-60 -14 -40 -20 Z', '#141826', { ink: INK, sw: 2 })}
        ${lines('M-48 -30 Q-66 -22 -78 -10 M-44 -24 Q-60 -16 -70 -6', '#3a4a78', 2, 0.6)}
        ${V(ell(-4, -44, 40, 30), '#1c2235', { round: true, ink: INK })}
        ${V('M-30 -52 Q-6 -78 26 -56 Q8 -30 -30 -40 Z', '#2a3352', { ink: INK, sw: 2 })}
        ${lines('M-22 -54 Q0 -68 20 -56 M-24 -46 Q-4 -58 14 -48', '#6a8ad0', 2.5, 0.55)}
        ${V(ell(30, -72, 22, 22), '#1c2235', { round: true, ink: INK })}
        ${lines('M18 -86 Q30 -94 44 -84', '#5a78c0', 2.5, 0.5)}
        ${V('M46 -78 L74 -70 L46 -64 Z', '#d6b25a', { ink: '#5a4012', sw: 1.8 })}${V('M46 -71 L72 -70 L46 -64 Z', '#9c7a2c', { ink: '#5a4012', sw: 1.4, rim: false })}
        <circle cx="50" cy="-74" r="1.5" fill="#3a2a10"/>
        <g class="blink"><circle cx="35" cy="-77" r="7" fill="#ffd36e" stroke="#4a3010" stroke-width="1.5"/><circle cx="36.5" cy="-77" r="3.4" fill="#120c06"/><circle cx="38.5" cy="-79.5" r="1.5" fill="#fff"/></g>
        ${lines('M27 -86 Q35 -90 43 -85', '#05070e', 3, 0.9)}
        ${lines('M18 -92 Q24 -106 32 -94 M26 -94 Q33 -108 39 -94', '#1c2235', 4, 1)}
        ${lines('M-6 -16 L-8 2 M8 -16 L10 2', '#c9a54a', 4, 1)}
        ${lines('M-15 2 L-2 2 M3 2 L17 2', '#c9a54a', 3, 1)}
        <g transform="rotate(-20 12 -55)">${V('M6 -58 L18 -58 L18 -51 L6 -51 Z', '#c63d3d', { ink: '#4a0a0a', sw: 1.5 })}<circle cx="12" cy="-49" r="3" fill="url(#g-gold)"/></g>
      </g>
    </g>`;
  };

  Art.hanna = function () { // bakker, bovenlijf in het raam
    const SK = '#7a3a24';
    return `<g>
      ${V('M-62 0 Q-66 -70 -34 -96 Q0 -108 34 -96 Q66 -70 62 0 Z', '#d9774a', { ink: '#4a1a0a' })}
      ${lines('M-44 -70 Q-50 -40 -48 0 M44 -70 Q50 -40 48 0', '#8a3a1a', 3, 0.45)}
      ${V('M-30 -92 Q0 -80 30 -92 L36 0 L-36 0 Z', '#fbf3e2', { ink: '#8a7a60', sw: 2 })}
      ${lines('M-36 -40 L36 -40 M-20 -30 Q0 -26 20 -30', '#d8c8a8', 2.5, 0.8)}
      <g fill="#e8d8b8"><circle cx="-14" cy="-60" r="3"/><circle cx="10" cy="-20" r="2.5"/><circle cx="20" cy="-70" r="2"/></g>
      ${V('M-10 -106 L10 -106 L9 -94 L-9 -94 Z', '#e4a882', { ink: SK, sw: 1.4, rim: false })}
      ${V(ell(0, -132, 36, 38), 'url(#g-skin)', { round: true, ink: SK, io: 0.45 })}
      ${V('M-38 -136 Q-40 -178 0 -180 Q40 -178 38 -136 Q30 -158 0 -158 Q-30 -158 -38 -136 Z', '#6b3f26', { ink: '#2a140a' })}
      ${lines('M-30 -150 Q-24 -166 -8 -170 M6 -170 Q24 -166 30 -150', '#3a1e0e', 2, 0.6)}
      ${V('M-36 -160 Q0 -206 36 -160 Q20 -150 0 -152 Q-20 -150 -36 -160 Z', '#ffffff', { ink: '#8a8aa0', sw: 2 })}
      ${lines('M-22 -176 Q-14 -190 0 -192 M8 -190 Q20 -184 24 -172', '#d0d0e0', 2, 0.9)}
      <g class="blink">${eye(-13, -134, 0.95, '#6a4a2a')}${eye(13, -134, 0.95, '#6a4a2a')}</g>
      ${lines('M-21 -147 Q-13 -151 -5 -147 M5 -147 Q13 -151 21 -147', '#3a1e0e', 2.6, 0.9)}
      ${lines('M1 -128 Q6 -120 0 -117', '#a8604a', 2, 0.8)}
      <path d="M-11 -110 Q0 -101 11 -110 Q0 -105 -11 -110 Z" fill="#8a3b33" stroke="#6a2a24" stroke-width="2" stroke-linejoin="round"/>
      ${blush(-23, -118, 9)}${blush(23, -118, 9)}
      <g fill="#fff" opacity=".7"><circle cx="-26" cy="-158" r="3"/><circle cx="18" cy="-148" r="2"/></g>
    </g>`;
  };

  Art.brokkel = function (mood) { // stenen trol
    const happy = mood === 'happy';
    const INK = '#1c2030';
    return `<g>
      <ellipse cx="0" cy="0" rx="190" ry="26" fill="url(#g-shadow)"/>
      <g class="breathe">
        ${V('M-120 -10 Q-170 -120 -140 -230 Q-120 -330 -20 -350 Q90 -360 140 -270 Q180 -180 150 -60 Q140 -10 100 0 Z', 'url(#g-stone)', { ink: INK, sw: 4 })}
        ${V('M-140 -230 Q-150 -300 -90 -330 Q-60 -300 -100 -250 Z', '#6f7891', { ink: INK, sw: 3 })}
        ${lines('M-110 -120 Q-90 -100 -100 -60 M80 -200 Q100 -160 90 -130 M-60 -300 Q-40 -280 -50 -260 M110 -60 L130 -90', '#30364a', 4, 0.5)}
        <g fill="#a8b0c4" opacity=".35"><ellipse cx="-90" cy="-280" rx="20" ry="8" transform="rotate(-30 -90 -280)"/><ellipse cx="-120" cy="-170" rx="12" ry="26"/></g>
        ${V('M-60 -340 Q20 -380 100 -310 Q40 -320 -10 -320 Q-40 -316 -60 -340 Z', 'url(#g-moss)', { ink: '#1e3a14', sw: 3 })}
        ${V('M60 -330 Q120 -320 140 -270 Q110 -290 70 -300 Z', '#6f9f55', { ink: '#1e3a14', sw: 2.5 })}
        ${lines('M-40 -342 Q-36 -330 -40 -322 M0 -350 Q4 -338 0 -326 M40 -340 Q44 -330 40 -318 M80 -320 Q84 -310 80 -300', '#3a6a2a', 3, 0.7)}
        ${V('M-150 -140 Q-210 -110 -200 -20 L-160 -20 Q-170 -90 -130 -110 Z', '#6c748a', { ink: INK, sw: 3 })}
        ${V('M150 -140 Q210 -110 196 -20 L158 -20 Q166 -90 130 -110 Z', '#646c82', { ink: INK, sw: 3 })}
        ${V(ell(-180, -14, 34, 22), '#7a8298', { round: true, ink: INK, sw: 3 })}${V(ell(178, -14, 34, 22), '#737b91', { round: true, ink: INK, sw: 3 })}
        ${lines('M-198 -14 L-188 -4 M-172 -24 L-168 -6 M162 -22 L168 -6 M186 -24 L190 -6', INK, 3, 0.6)}
        <!-- gezicht -->
        ${lines('M-82 -252 Q-50 -274 -18 -250', '#2c3040', 12, 1)}
        ${lines('M18 -250 Q50 -274 82 -252', '#2c3040', 12, 1)}
        <ellipse cx="-50" cy="-224" rx="26" ry="20" fill="#1c2030" opacity=".55"/><ellipse cx="50" cy="-224" rx="26" ry="20" fill="#1c2030" opacity=".55"/>
        <circle cx="-50" cy="-226" r="36" fill="url(#g-glow)" opacity=".45"/><circle cx="50" cy="-226" r="36" fill="url(#g-glow)" opacity=".45"/>
        <g class="blink"><circle cx="-50" cy="-226" r="15" fill="#ffd36e" stroke="#7a5010" stroke-width="2"/><circle cx="50" cy="-226" r="15" fill="#ffd36e" stroke="#7a5010" stroke-width="2"/><circle cx="-47" cy="-225" r="6.5" fill="#3a2a10"/><circle cx="53" cy="-225" r="6.5" fill="#3a2a10"/><circle cx="-44" cy="-230" r="2.5" fill="#fff"/><circle cx="56" cy="-230" r="2.5" fill="#fff"/></g>
        ${V('M-22 -212 Q0 -166 22 -212 Q8 -190 0 -192 Q-8 -190 -22 -212 Z', '#5b6276', { ink: INK, sw: 2.5 })}
        <ellipse cx="-8" cy="-184" rx="5" ry="3" fill="#1c2030" opacity=".6"/><ellipse cx="8" cy="-184" rx="5" ry="3" fill="#1c2030" opacity=".6"/>
        ${happy
          ? '<path class="mouth" d="M-60 -150 Q0 -100 60 -150 Q0 -120 -60 -150 Z" fill="#2c3040" stroke="#1c2030" stroke-width="3"/><path d="M-34 -138 L-28 -124 L-22 -136 M22 -136 L28 -124 L34 -138" fill="#e8e3d2" stroke="#8a8670" stroke-width="1.5"/>'
          : '<path class="mouth" d="M-60 -140 Q0 -160 60 -140 Q0 -126 -60 -140 Z" fill="#2c3040" stroke="#1c2030" stroke-width="3"/><path d="M-40 -142 L-34 -156 L-28 -144 M28 -144 L34 -156 L40 -142" fill="#e8e3d2" stroke="#8a8670" stroke-width="1.5"/>'}
        <!-- bloemetjes in het mos -->
        <g stroke="#1b1226" stroke-opacity=".35" stroke-width="1"><circle cx="-30" cy="-338" r="7" fill="#ffd1e8"/><circle cx="-30" cy="-338" r="3" fill="#ffd36e"/><circle cx="30" cy="-346" r="6" fill="#d1e3ff"/><circle cx="30" cy="-346" r="2.5" fill="#ffd36e"/><circle cx="90" cy="-318" r="6" fill="#fff"/><circle cx="90" cy="-318" r="2.5" fill="#ffd36e"/></g>
      </g>
    </g>`;
  };

  Art.sabeth = function () { // kruidenvrouw met paddenstoelhoed
    const SK = '#5a3020', INK = '#1a0e22';
    return `<g>
      <ellipse cx="0" cy="0" rx="70" ry="13" fill="url(#g-shadow)"/>
      <g class="breathe">
        ${V('M-56 -4 Q-64 -150 -30 -230 L30 -230 Q64 -150 56 -4 Q0 8 -56 -4 Z', '#5a3b6e', { ink: INK })}
        ${lines('M-40 -180 Q-48 -100 -44 -10 M38 -180 Q46 -100 42 -10 M-14 -120 Q-18 -60 -14 0 M14 -120 Q18 -60 14 0', '#2a1838', 3, 0.5)}
        ${V('M-56 -4 Q0 8 56 -4 L54 -30 Q0 -18 -54 -30 Z', '#3e2850', { ink: INK, sw: 2 })}
        ${lines('M-50 -20 Q-30 -12 -10 -18 Q10 -12 30 -18 Q46 -14 52 -20', '#9be3a2', 2.5, 0.6)}
        ${V('M-20 -228 L20 -228 L28 -120 L-28 -120 Z', '#7b5a8e', { ink: INK, sw: 2 })}
        <g fill="#9be3a2" stroke="#1a0e22" stroke-opacity=".4" stroke-width="1"><circle cx="-36" cy="-60" r="4"/><circle cx="30" cy="-90" r="3"/><circle cx="-20" cy="-150" r="3"/><circle cx="40" cy="-30" r="4"/></g>
        <!-- kruidenzakjes aan de riem -->
        ${V('M-30 -122 Q-40 -96 -26 -92 Q-16 -96 -20 -122 Z', '#a8844a', { ink: '#3a2414', sw: 1.6 })}${V('M8 -122 Q0 -100 12 -96 Q24 -100 18 -122 Z', '#6a8a4a', { ink: '#1e3a14', sw: 1.6 })}
        ${V('M-30 -220 Q-56 -170 -50 -120 L-36 -116 Q-38 -170 -18 -210 Z', '#6a4a7e', { ink: INK, sw: 2 })}
        ${V('M30 -220 Q60 -180 70 -140 L58 -132 Q46 -170 18 -210 Z', '#6a4a7e', { ink: INK, sw: 2 })}
        ${V(ell(-43, -114, 8, 8), '#c99a7a', { round: true, ink: SK, sw: 1.5, rim: false })}${V(ell(64, -132, 8, 8), '#c99a7a', { round: true, ink: SK, sw: 1.5 })}
        <!-- staf met paddenstoel-lampje -->
        ${lines('M70 -140 L80 0', '#5e3b22', 7, 1)}${lines('M71 -120 L79 -10', '#9a6a40', 2, 0.6)}
        ${V('M58 -150 Q78 -184 100 -150 Q79 -144 58 -150 Z', '#7fe0c8', { ink: '#1a5a4a', sw: 2 })}<circle cx="79" cy="-152" r="44" fill="url(#g-glow-green)" class="glowpulse"/>
        <!-- hoofd -->
        ${V('M-30 -262 Q-42 -218 -24 -196 L-22 -250 Z M30 -262 Q42 -218 24 -196 L22 -250 Z', '#1d1a2a', { ink: '#000', sw: 1.5 })}
        ${V('M-8 -236 L8 -236 L7 -226 L-7 -226 Z', '#b88a6a', { ink: SK, sw: 1.4, rim: false })}
        ${V(ell(0, -262, 30, 34), '#c99a7a', { round: true, ink: SK, io: 0.45 })}
        <g class="blink">${eye(-11, -264, 0.85, '#4fae7a', -0.4)}${eye(11, -264, 0.85, '#4fae7a', -0.4)}</g>
        <path d="M-18 -266 Q-11 -262 -4 -266 M4 -266 Q11 -262 18 -266" fill="none" stroke="#c99a7a" stroke-width="4"/>
        ${lines('M-17 -278 L-4 -274 M17 -278 L4 -274', '#1d1a2a', 2.6, 1)}
        ${lines('M1 -258 Q6 -250 0 -247 M-16 -252 Q-12 -250 -9 -252', '#8a5a42', 1.8, 0.7)}
        <path class="mouth" d="M-8 -241 Q0 -237 8 -241" stroke="#6a2e3a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        ${blush(-18, -248, 6)}${blush(18, -248, 6)}
        <!-- hoed -->
        ${V('M-80 -284 Q-60 -360 0 -366 Q60 -360 80 -284 Q0 -300 -80 -284 Z', '#c2453a', { ink: '#4a0e0a', sw: 3 })}
        <g fill="#fbe9d8" stroke="#8a4a3a" stroke-opacity=".4" stroke-width="1.2"><ellipse cx="-40" cy="-316" rx="10" ry="7"/><ellipse cx="12" cy="-344" rx="12" ry="8"/><ellipse cx="50" cy="-310" rx="8" ry="6"/><ellipse cx="-8" cy="-306" rx="6" ry="4"/></g>
        ${V('M-80 -284 Q0 -300 80 -284 Q0 -276 -80 -284 Z', '#8a2a24', { ink: '#4a0e0a', sw: 2 })}
        ${lines('M-60 -288 L-56 -282 M-30 -292 L-28 -284 M0 -294 L0 -286 M30 -292 L28 -284 M60 -288 L56 -282', '#4a0e0a', 1.6, 0.6)}
      </g>
    </g>`;
  };

  Art.teun = function () { // veerman
    const SK = '#6a3a24', INK = '#0e1420';
    return `<g>
      <ellipse cx="0" cy="0" rx="70" ry="13" fill="url(#g-shadow)"/>
      ${lines('M-70 -330 L-56 30', '#4a2f1c', 8, 1)}${lines('M-69 -320 L-57 20', '#8a5a34', 2, 0.6)}
      <g class="breathe">
        ${V('M-52 0 Q-60 -150 -34 -220 Q0 -236 34 -220 Q60 -150 52 0 Q0 10 -52 0 Z', '#3c4a5e', { ink: INK })}
        ${lines('M-36 -190 Q-44 -100 -40 -6 M34 -190 Q42 -100 38 -6 M0 -170 L0 -4', '#1e2634', 3, 0.5)}
        <g fill="#c9a46a" stroke="#3a2414" stroke-width="1.2"><circle cx="-3" cy="-160" r="3.5"/><circle cx="-3" cy="-130" r="3.5"/><circle cx="-3" cy="-100" r="3.5"/></g>
        ${V('M-52 0 Q0 10 52 0 L50 -20 Q0 -10 -50 -20 Z', '#2a3444', { ink: INK, sw: 2 })}
        ${V('M-40 -200 Q-60 -170 -64 -140 L-50 -136 Q-46 -164 -26 -190 Z', '#344052', { ink: INK, sw: 2 })}
        ${V(ell(-60, -138, 10, 10), '#d9a888', { round: true, ink: SK, sw: 1.6, rim: false })}
        ${V('M36 -200 Q50 -160 40 -120 L28 -124 Q34 -160 24 -190 Z', '#344052', { ink: INK, sw: 2 })}
        <!-- kap -->
        ${V('M-46 -214 Q-50 -300 0 -310 Q50 -300 46 -214 Q30 -190 0 -192 Q-30 -190 -46 -214 Z', '#46566c', { ink: INK })}
        ${lines('M-34 -280 Q-40 -250 -36 -220 M34 -280 Q40 -250 36 -220', '#26303e', 3, 0.5)}
        ${V(ell(0, -248, 27, 31), '#d9a888', { round: true, ink: SK, io: 0.45 })}
        ${V('M-27 -244 Q-30 -296 0 -296 Q30 -296 27 -244 Q20 -276 0 -276 Q-20 -276 -27 -244 Z', '#3a4658', { ink: INK, sw: 2 })}
        ${lines('M-12 -232 Q-20 -228 -20 -220 M14 -264 Q18 -258 22 -262 M-22 -266 Q-18 -262 -14 -266', '#9a6a52', 1.6, 0.7)}
        ${V('M-22 -232 Q-26 -190 0 -176 Q26 -190 22 -232 Q12 -222 0 -224 Q-12 -222 -22 -232 Z', '#e8ecf2', { ink: '#7a8090', sw: 2 })}
        ${lines('M-12 -212 Q-10 -196 -4 -186 M0 -218 L0 -184 M12 -212 Q10 -196 4 -186', '#b8bcc8', 1.8, 0.8)}
        <g class="blink"><path d="M-17 -252 Q-10 -256 -4 -252" stroke="#2a1c18" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M4 -252 Q10 -256 17 -252" stroke="#2a1c18" stroke-width="3.5" fill="none" stroke-linecap="round"/></g>
        ${lines('M-19 -263 L-4 -259 M19 -263 L4 -259', '#e8ecf2', 4.5, 1)}
        ${V(ell(0, -240, 5.5, 7.5), '#c88a68', { round: true, ink: SK, sw: 1.5 })}
        <!-- pijp -->
        ${lines('M6 -222 Q26 -218 36 -226', '#3a2416', 4.5, 1)}
        ${V('M32 -240 L44 -240 L43 -226 L33 -226 Z', '#3a2416', { ink: '#000', sw: 1.4 })}
        <circle cx="38" cy="-241" r="3.4" fill="#ff9a52" class="flicker"/>
        <g class="drift" opacity=".35"><circle cx="40" cy="-256" r="5" fill="#dfe6f2"/><circle cx="46" cy="-270" r="7" fill="#dfe6f2"/></g>
      </g>
    </g>`;
  };

  Art.sluip = function () { // nevelvos
    const INK = '#3a4a78';
    return `<g>
      <ellipse cx="0" cy="0" rx="70" ry="10" fill="url(#g-shadow)" opacity=".6"/>
      <g class="breathe">
        ${V('M30 -44 Q90 -70 104 -120 Q120 -152 96 -150 Q100 -110 60 -80 Z', '#cfe0f5', { ink: INK, sw: 2 })}
        ${lines('M50 -66 Q80 -84 92 -112 M60 -58 Q88 -78 100 -104', '#ffffff', 2, 0.6)}
        ${V('M96 -150 Q110 -140 100 -122 Q96 -136 88 -146 Z', '#ffffff', { ink: INK, sw: 1.5, rim: false })}
        ${V(ell(6, -42, 54, 30), '#a9c2e6', { round: true, ink: INK })}
        ${lines('M-20 -56 Q6 -64 30 -54 M-10 -40 Q10 -46 30 -38', '#dfeaff', 2.5, 0.5)}
        ${lines('M-30 -20 L-34 0 M-12 -16 L-12 0 M24 -16 L26 0 M40 -22 L44 0', '#7890bc', 9, 1)}
        ${lines('M-36 0 L-28 0 M-14 0 L-6 0 M24 0 L32 0 M42 0 L50 0', '#5a6a98', 4, 0.8)}
        ${V('M-40 -60 Q-62 -96 -50 -110 Q-30 -84 -20 -70 Z', '#a9c2e6', { ink: INK, sw: 2 })}
        ${V(ell(-50, -72, 32, 26), '#bcd2ef', { round: true, ink: INK })}
        ${V('M-74 -80 L-106 -66 L-76 -56 Z', '#bcd2ef', { ink: INK, sw: 2 })}
        ${V('M-80 -66 Q-90 -60 -76 -56 Q-60 -54 -54 -62 Z', '#ffffff', { ink: INK, sw: 1.4, rim: false })}
        <circle cx="-105" cy="-66" r="4.5" fill="#2a2f44"/><circle cx="-106" cy="-68" r="1.3" fill="#fff"/>
        ${V('M-62 -94 L-70 -130 L-48 -100 Z M-40 -96 L-34 -132 L-26 -98 Z', '#a9c2e6', { ink: INK, sw: 2 })}
        <path d="M-62 -100 L-67 -120 L-54 -102 Z M-38 -100 L-34 -122 L-30 -100 Z" fill="#f3c6d8"/>
        <g class="blink">${eye(-62, -78, 0.75, '#5a9ad8', -1)}</g>
        <circle cx="0" cy="-60" r="80" fill="url(#g-glow-blue)" opacity=".35"/>
      </g>
    </g>`;
  };

  Art.grijs = function (calm) { // de Grijze Heer
    return `<g>
      <circle cx="0" cy="-260" r="260" fill="url(#g-glow-blue)" opacity="${calm ? 0.5 : 0.25}"/>
      <g class="breathe">
        <path d="M-120 40 Q-140 -160 -70 -330 Q0 -380 70 -330 Q140 -160 120 40 Q60 0 0 30 Q-60 0 -120 40 Z" fill="url(#g-grey-lord)"/>
        <path d="M-120 40 Q-140 -160 -70 -330 Q0 -380 70 -330 Q140 -160 120 40 Q60 0 0 30 Q-60 0 -120 40 Z" fill="url(#g-shade)" opacity=".6"/>
        ${lines('M-80 -280 Q-100 -150 -90 20 M80 -280 Q100 -150 90 20 M-30 -250 Q-40 -120 -30 10 M30 -250 Q40 -120 30 10', '#5a6480', 3, 0.35)}
        <path d="M-70 -330 Q-110 -260 -150 -180 Q-120 -190 -90 -230 Z M70 -330 Q110 -260 150 -180 Q120 -190 90 -230 Z" fill="#c5cee0" opacity=".6"/>
        <path d="M-40 -280 Q0 -300 40 -280 L30 -120 Q0 -100 -30 -120 Z" fill="#ffffff" opacity=".15"/>
        <!-- motten die van de mantel loslaten -->
        <g fill="#c8d0e2" opacity=".7" class="drift-2"><path d="M-130 -120 q-8 -10 -1 -14 q4 5 4 12 q5 -8 10 -5 q-2 9 -13 7z"/><path d="M128 -200 q-8 -10 -1 -14 q4 5 4 12 q5 -8 10 -5 q-2 9 -13 7z"/><path d="M110 -60 q-6 -8 -1 -11 q3 4 3 9 q4 -6 8 -4 q-2 7 -10 6z"/></g>
        ${V(ell(0, -370, 44, 54), '#e3e8f2', { round: true, ink: '#5a6480', io: 0.4, rim: false })}
        <ellipse cx="0" cy="-354" rx="30" ry="14" fill="#9aa6c0" opacity=".25"/>
        <g class="blink"><ellipse cx="-16" cy="-372" rx="8" ry="${calm ? 5 : 10}" fill="${calm ? '#7aa8ff' : '#26304a'}"/><ellipse cx="16" cy="-372" rx="8" ry="${calm ? 5 : 10}" fill="${calm ? '#7aa8ff' : '#26304a'}"/>${calm ? '<circle cx="-14" cy="-374" r="2" fill="#fff"/><circle cx="18" cy="-374" r="2" fill="#fff"/>' : ''}</g>
        ${lines('M-28 -390 Q-16 -396 -6 -390 M6 -390 Q16 -396 28 -390', '#7a84a0', 2.5, 0.7)}
        <path class="mouth" d="M-10 -340 Q0 ${calm ? -334 : -344} 10 -340" stroke="#5a6480" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- kroon van grijze motten -->
        <g fill="#b7c0d6" stroke="#5a6480" stroke-opacity=".5" stroke-width="1.2">
          <path d="M-46 -416 q-14 -20 -2 -26 q8 8 8 22 q8 -14 18 -10 q-4 16 -24 14z"/>
          <path d="M-12 -432 q-10 -24 4 -28 q6 10 4 24 q12 -12 20 -6 q-8 14 -28 10z"/>
          <path d="M26 -420 q-6 -22 8 -24 q4 10 0 22 q12 -8 18 0 q-10 10 -26 2z"/>
        </g>
      </g>
    </g>`;
  };

  Art.wieke = function () { // de mot die het Register van Vergeten Dingen bijhoudt
    const INK = '#2a1e30', SK = '#6a5040';
    return `<g>
      <ellipse cx="0" cy="0" rx="90" ry="14" fill="url(#g-shadow)"/>
      <g class="breathe">
        <!-- gevouwen vleugels als een mantel, met oogvlekken -->
        ${V('M-30 -250 Q-120 -230 -110 -120 Q-104 -40 -60 -4 Q-30 0 -14 -20 Z', '#b8a48c', { ink: INK })}
        ${V('M30 -250 Q120 -230 110 -120 Q104 -40 60 -4 Q30 0 14 -20 Z', '#ad9a84', { ink: INK })}
        ${lines('M-40 -230 Q-90 -180 -86 -60 M-30 -200 Q-60 -150 -56 -40 M40 -230 Q90 -180 86 -60 M30 -200 Q60 -150 56 -40', '#6a5a48', 2.5, 0.5)}
        <g><circle cx="-74" cy="-120" r="20" fill="#5a4a6a"/><circle cx="-74" cy="-120" r="12" fill="#e8d8b0"/><circle cx="-72" cy="-122" r="5" fill="#2a1e30"/>
          <circle cx="74" cy="-120" r="20" fill="#5a4a6a"/><circle cx="74" cy="-120" r="12" fill="#e8d8b0"/><circle cx="76" cy="-122" r="5" fill="#2a1e30"/></g>
        <!-- lijf met vestje -->
        ${V('M-36 -10 Q-46 -120 -30 -200 Q0 -214 30 -200 Q46 -120 36 -10 Q0 0 -36 -10 Z', '#efe4d2', { ink: INK })}
        ${V('M-30 -190 Q-40 -110 -30 -20 L-8 -24 L-10 -194 Z M30 -190 Q40 -110 30 -20 L8 -24 L10 -194 Z', '#7a5a8a', { ink: INK, sw: 2 })}
        <g fill="#e2b85a" stroke="#5a4012" stroke-width="1"><circle cx="-12" cy="-150" r="3.2"/><circle cx="-12" cy="-110" r="3.2"/><circle cx="-12" cy="-70" r="3.2"/></g>
        ${lines('M-20 -170 Q-18 -100 -22 -30 M20 -170 Q18 -100 22 -30', '#c8b8a0', 2, 0.6)}
        <!-- vacht-kraag -->
        ${V('M-40 -200 Q-50 -224 -30 -232 Q-20 -246 0 -240 Q20 -246 30 -232 Q50 -224 40 -200 Q20 -186 0 -192 Q-20 -186 -40 -200 Z', '#fbf3e4', { ink: INK, sw: 2 })}
        ${lines('M-30 -214 Q-26 -206 -20 -204 M-10 -220 Q-8 -210 -2 -206 M12 -220 Q12 -210 6 -206 M30 -214 Q26 -206 20 -204', '#d0c0a8', 2, 0.8)}
        <!-- armpjes met veer en boek -->
        ${V('M-30 -180 Q-60 -150 -50 -110 L-38 -112 Q-44 -146 -22 -170 Z', '#7a5a8a', { ink: INK, sw: 2 })}
        ${V(ell(-44, -106, 8, 8), '#e8dcc8', { round: true, ink: SK, sw: 1.5, rim: false })}
        ${V('M-44 -104 L-70 -168 L-62 -170 Z', '#f8f8f0', { ink: '#8a8a80', sw: 1.4 })}
        ${V('M30 -180 Q56 -150 46 -110 L34 -112 Q40 -146 22 -170 Z', '#7a5a8a', { ink: INK, sw: 2 })}
        ${V('M14 -126 L66 -134 L70 -96 L18 -88 Z', '#5a2a2a', { ink: '#1a0808', sw: 2 })}${V('M18 -124 L64 -131 L66 -122 L20 -116 Z', '#f3e3bf', { ink: '#8a7a50', sw: 1, rim: false })}
        ${V(ell(42, -108, 8, 8), '#e8dcc8', { round: true, ink: SK, sw: 1.5 })}
        <!-- hoofd -->
        ${V(ell(0, -270, 38, 34), '#fbf3e4', { round: true, ink: INK })}
        ${lines('M-30 -290 Q-24 -280 -26 -270 M-16 -298 Q-12 -288 -14 -280 M16 -298 Q12 -288 14 -280 M30 -290 Q24 -280 26 -270', '#d8c8b0', 2, 0.8)}
        <!-- gevederde voelsprieten -->
        ${lines('M-12 -300 Q-30 -350 -60 -360 M12 -300 Q30 -350 60 -360', '#5a4a3a', 3, 1)}
        ${lines('M-24 -330 L-34 -326 M-34 -344 L-42 -336 M-46 -354 L-50 -344 M24 -330 L34 -326 M34 -344 L42 -336 M46 -354 L50 -344', '#5a4a3a', 2, 0.8)}
        <g class="blink">${eye(-14, -270, 1.15, '#2a1e30')}${eye(14, -270, 1.15, '#2a1e30')}</g>
        <g fill="none" stroke="#c9a24a" stroke-width="2.4"><circle cx="-14" cy="-270" r="12"/><circle cx="14" cy="-270" r="12"/><path d="M-2 -270 L2 -270 M-26 -272 L-38 -278 M26 -272 L38 -278"/></g>
        <path d="M-20 -276 L-10 -266" stroke="#fff" stroke-width="2" opacity=".5"/>
        <path class="mouth" d="M-6 -248 Q0 -244 6 -248" stroke="#8a5a50" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        ${blush(-26, -254, 7)}${blush(26, -254, 7)}
      </g>
    </g>`;
  };

  Art.isolde = function (smile) { // een spiegelbeeld van Oma's moeder, de eerste glasblazer
    return `<g opacity=".82">
      <circle cx="0" cy="-170" r="190" fill="url(#g-glow-blue)" opacity=".45"/>
      <g class="breathe">
        <path d="M-60 0 Q-70 -140 -36 -210 Q0 -226 36 -210 Q70 -140 60 0 Q30 14 0 6 Q-30 14 -60 0 Z" fill="#9fb8e8" opacity=".75"/>
        <path d="M-60 0 Q-70 -140 -36 -210 Q0 -226 36 -210 Q70 -140 60 0 Q30 14 0 6 Q-30 14 -60 0 Z" fill="url(#g-shade)"/>
        ${lines('M-40 -180 Q-50 -90 -44 -6 M40 -180 Q50 -90 44 -6 M0 -150 L0 0', '#5a70a8', 2.5, 0.5)}
        <!-- glasblazersschort -->
        <path d="M-26 -190 L26 -190 L34 -10 Q0 0 -34 -10 Z" fill="#dfe8ff" opacity=".7"/>
        ${lines('M-24 -120 L24 -120', '#8aa0d0', 2, 0.6)}
        <circle cx="0" cy="-90" r="14" fill="url(#g-glass)" stroke="#fff" stroke-width="1.5" opacity=".9"/>
        <path d="M-36 -200 Q-60 -160 -54 -110 L-42 -108 Q-46 -150 -24 -190 Z M36 -200 Q60 -160 54 -110 L42 -108 Q46 -150 24 -190 Z" fill="#8aa6dc" opacity=".8"/>
        <circle cx="-48" cy="-104" r="8" fill="#e8f0ff" opacity=".85"/><circle cx="48" cy="-104" r="8" fill="#e8f0ff" opacity=".85"/>
        <!-- hoofd met vlechtenkroon -->
        <ellipse cx="0" cy="-246" rx="30" ry="33" fill="#eef3ff" opacity=".92"/>
        <ellipse cx="0" cy="-246" rx="30" ry="33" fill="url(#g-shade-r)"/>
        <path d="M-32 -250 Q-34 -284 0 -286 Q34 -284 32 -250 Q24 -268 0 -268 Q-24 -268 -32 -250 Z" fill="#c8d6f8"/>
        <g fill="none" stroke="#c8d6f8" stroke-width="9" stroke-linecap="round"><path d="M-30 -276 Q0 -300 30 -276"/></g>
        ${lines('M-26 -280 L-20 -288 M-12 -286 L-6 -292 M6 -292 L12 -286 M20 -288 L26 -280', '#8aa0d0', 2, 0.8)}
        ${smile
          ? lines('M-18 -248 Q-12 -253 -6 -248 M6 -248 Q12 -253 18 -248', '#4a5a8a', 2.6, 0.9) + '<path class="mouth" d="M-8 -228 Q0 -222 8 -228" stroke="#6a7aa8" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
          : `<g class="blink">${eye(-12, -248, 0.85, '#7a9ad8', 0)}${eye(12, -248, 0.85, '#7a9ad8', 0)}</g><path class="mouth" d="M-7 -226 Q0 -229 7 -226" stroke="#6a7aa8" stroke-width="2.4" fill="none" stroke-linecap="round"/>`}
        ${lines('M-20 -262 Q-12 -265 -5 -262 M5 -262 Q12 -265 20 -262', '#6a7aa8', 2, 0.7)}
      </g>
    </g>`;
  };

  // Portretten: een uitsnede rond het hoofd van een personage.
  const PORTRAITS = {
    mira: ['mira', '-60 -300 120 120'],
    oma: ['oma', '-55 -270 110 110'],
    kwast: ['kwast', '-30 -110 100 100'],
    hanna: ['hanna', '-58 -190 116 116'],
    brokkel: ['brokkel', '-130 -330 260 260'],
    sabeth: ['sabeth', '-80 -360 160 160'],
    teun: ['teun', '-55 -310 110 110'],
    sluip: ['sluip', '-120 -140 120 120'],
    grijs: ['grijs', '-80 -450 160 160'],
    wieke: ['wieke', '-70 -330 140 140'],
    isolde: ['isolde', '-60 -310 120 120'],
  };
  const BG = { mira: '#2f4a5e', oma: '#4c3f68', kwast: '#3b4a6b', hanna: '#7a4a32', brokkel: '#3a4a3a', sabeth: '#2d4038', teun: '#2a3444', sluip: '#33476e', grijs: '#2a3048', wieke: '#4a3a52', isolde: '#2a3a6a' };
  Art.portrait = function (who) {
    const p = PORTRAITS[who]; if (!p) return '';
    const fn = Art[p[0]];
    const vb = p[1].split(' ').map(Number);
    return `<svg viewBox="${p[1]}" xmlns="http://www.w3.org/2000/svg"><rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${BG[who]}"/>${Art.glow(vb[0] + vb[2] / 2, vb[1] + vb[3] * 0.4, vb[2] * 0.6, '', 0.25)}${fn(who === 'brokkel' ? 'happy' : who === 'grijs' ? true : undefined)}</svg>`;
  };

  /* ---------------- voorwerpen (64x64) ---------------- */
  const I = {
    vogeltje: `<circle cx="32" cy="34" r="26" fill="url(#g-glow-blue)" opacity=".7"/><path d="M14 38 Q18 22 34 22 Q44 14 52 18 L46 24 Q50 34 40 42 Q28 50 14 38 Z" fill="url(#g-glass)" stroke="#dff0ff" stroke-width="2"/><path d="M52 18 L60 16 L54 22 Z" fill="#ffd36e"/><circle cx="44" cy="22" r="2" fill="#2a3a6a"/><path d="M22 36 Q30 30 38 34" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/><path d="M14 38 L6 34 L10 42 Z" fill="#9fd0f0"/>`,
    scherven: `<g fill="url(#g-glass)" stroke="#dff0ff" stroke-width="1.6"><path d="M10 40 L22 30 L26 44 Z"/><path d="M30 20 L44 16 L40 30 Z"/><path d="M34 40 L50 36 L46 52 Z"/><path d="M16 14 L26 12 L22 24 Z"/></g>`,
    zeekaart: `<path d="M8 14 L24 8 L40 14 L56 8 L56 50 L40 56 L24 50 L8 56 Z" fill="#f0dfb8" stroke="#8a6a3a" stroke-width="2"/><path d="M24 8 L24 50 M40 14 L40 56" stroke="#c8b088" stroke-width="2"/><path d="M14 44 Q22 30 30 36 Q38 42 46 24" stroke="#c63d3d" stroke-width="2.5" fill="none" stroke-dasharray="4 3"/><path d="M44 20 l4 4 M48 20 l-4 4" stroke="#c63d3d" stroke-width="2.5"/>`,
    bladzijde: `<path d="M14 6 L50 8 L52 58 L12 56 Z" fill="#efe2c4" stroke="#9a7a4a" stroke-width="2"/><path d="M14 6 Q20 14 16 22 Q22 30 14 36" fill="none" stroke="#9a7a4a" stroke-width="2"/><path d="M22 18 L44 19 M22 26 L46 27 M22 34 L42 35 M22 42 L46 43" stroke="#6a5a3a" stroke-width="2" stroke-linecap="round"/><text x="40" y="54" font-size="10" fill="#7a3a2a" font-family="Fraunces, serif" font-weight="800">1</text>`,
    fles: `<path d="M26 6 L38 6 L38 18 Q50 24 48 40 Q46 58 32 58 Q18 58 16 40 Q14 24 26 18 Z" fill="url(#g-glass)" stroke="#bfe3ff" stroke-width="2"/><rect x="25" y="2" width="14" height="7" rx="2" fill="#8a5a34"/><path d="M24 30 L40 28 L40 46 L24 48 Z" fill="#efe2c4" opacity=".9"/>`,
    brief: `<path d="M12 10 L46 8 L52 54 L16 56 Z" fill="#f3e3bf"/><path d="M12 10 L46 8 L52 54 L16 56 Z" fill="none" stroke="#b48a4e" stroke-width="2"/><path d="M20 20 L42 19 M20 27 L44 26 M21 34 L40 33 M21 41 L44 40" stroke="#7a5a3a" stroke-width="2" stroke-linecap="round"/><circle cx="44" cy="48" r="6" fill="#c63d3d"/>`,
    sleutel: `<circle cx="20" cy="22" r="11" fill="none" stroke="url(#g-gold)" stroke-width="6"/><path d="M28 30 L50 52 M42 44 L48 38 M46 48 L52 42" stroke="url(#g-gold)" stroke-width="6" stroke-linecap="round"/>`,
    muziekdoos: `<rect x="8" y="26" width="48" height="28" rx="4" fill="url(#g-wood)"/><path d="M8 26 L14 12 L50 12 L56 26 Z" fill="#8a5a34"/><path d="M22 18 L42 18" stroke="url(#g-gold)" stroke-width="3"/><circle cx="32" cy="40" r="6" fill="url(#g-gold)"/><path d="M56 36 L62 36 L62 32" stroke="#c9a54a" stroke-width="3" fill="none"/><text x="14" y="52" font-size="9" fill="#ffe9a6">☾✦❦</text>`,
    blaaspijp: `<path d="M8 54 L52 10" stroke="#6a6f80" stroke-width="7" stroke-linecap="round"/><path d="M8 54 L20 42" stroke="url(#g-wood)" stroke-width="10" stroke-linecap="round"/><circle cx="54" cy="8" r="5" fill="#ffb84d"/>`,
    bol: `<circle cx="32" cy="34" r="22" fill="url(#g-glass)" stroke="#bfe3ff" stroke-width="2"/><rect x="24" y="6" width="16" height="8" rx="2" fill="#8a5a34"/><path d="M20 26 Q24 18 32 16" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>`,
    lamp: `<circle cx="32" cy="34" r="30" fill="url(#g-glow)"/><circle cx="32" cy="34" r="22" fill="url(#g-glass)" stroke="#bfe3ff" stroke-width="2"/><rect x="24" y="6" width="16" height="8" rx="2" fill="#8a5a34"/><g fill="#fff6c0"><circle cx="26" cy="32" r="3"/><circle cx="38" cy="28" r="2.5"/><circle cx="34" cy="42" r="3"/><circle cx="24" cy="44" r="2"/></g>`,
    haak: `<path d="M32 6 L32 34 Q32 54 18 52 Q8 50 10 38" stroke="#5c6070" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="32" cy="8" r="5" fill="none" stroke="#5c6070" stroke-width="4"/>`,
    touw: `<ellipse cx="32" cy="34" rx="22" ry="18" fill="none" stroke="#c9a46a" stroke-width="7"/><ellipse cx="32" cy="34" rx="12" ry="9" fill="none" stroke="#a8844a" stroke-width="6"/><path d="M50 44 Q58 54 52 60" stroke="#c9a46a" stroke-width="6" fill="none" stroke-linecap="round"/>`,
    werphaak: `<ellipse cx="22" cy="40" rx="14" ry="11" fill="none" stroke="#c9a46a" stroke-width="6"/><path d="M34 34 Q44 22 44 12" stroke="#c9a46a" stroke-width="4" fill="none"/><path d="M44 6 L44 22 Q44 32 36 30" stroke="#5c6070" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    medaillon: `<path d="M20 6 Q32 20 44 6" stroke="url(#g-gold)" stroke-width="3" fill="none"/><ellipse cx="32" cy="36" rx="18" ry="22" fill="url(#g-gold)"/><ellipse cx="32" cy="36" rx="12" ry="15" fill="#3a8a7a"/><path d="M32 26 Q38 32 32 46 Q26 32 32 26" fill="#9be3a2"/>`,
    brood: `<path d="M6 40 Q4 18 32 16 Q60 18 58 40 Q58 50 32 50 Q6 50 6 40 Z" fill="#d99a52"/><path d="M6 40 Q6 50 32 50 Q58 50 58 40 Q58 46 32 46 Q6 46 6 40Z" fill="#a8682a"/><path d="M18 24 L22 34 M30 20 L32 32 M42 22 L40 34" stroke="#f3d29a" stroke-width="3" stroke-linecap="round"/>`,
    stemvork: `<path d="M24 6 L24 32 Q24 42 32 42 Q40 42 40 32 L40 6" stroke="#dfe6f2" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M32 42 L32 60" stroke="#dfe6f2" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="24" r="22" fill="url(#g-glow-blue)" opacity=".7"/>`,
    vuurbloem: `<path d="M32 60 Q30 44 32 30" stroke="#3e6b3a" stroke-width="4" fill="none"/><path d="M32 34 Q16 30 14 14 Q26 18 32 30 Q38 18 50 14 Q48 30 32 34 Z" fill="#ff7a3d"/><path d="M32 32 Q24 18 32 6 Q40 18 32 32 Z" fill="#ffd36e"/><circle cx="32" cy="22" r="18" fill="url(#g-glow)" opacity=".6"/>`,
    nevelzicht: `<path d="M24 6 L40 6 L38 18 Q54 26 52 42 Q50 58 32 58 Q14 58 12 42 Q10 26 26 18 Z" fill="url(#g-glass)" stroke="#d8ecff" stroke-width="2"/><path d="M14 40 Q14 56 32 56 Q50 56 50 40 Q40 46 32 42 Q22 38 14 40 Z" fill="#9fb8ff"/><circle cx="26" cy="46" r="3" fill="#fff"/><circle cx="38" cy="50" r="2" fill="#fff"/><rect x="24" y="2" width="16" height="6" rx="2" fill="#8a5a34"/>`,
    sterrenzand: `<path d="M14 22 Q12 56 32 58 Q52 56 50 22 Z" fill="#c9a46a"/><path d="M14 22 Q32 14 50 22 Q32 28 14 22 Z" fill="#a8844a"/><g fill="#fff6c0"><circle cx="26" cy="20" r="2"/><circle cx="36" cy="18" r="2.4"/><circle cx="31" cy="22" r="1.5"/><path d="M42 10 l2 4 4 1 -4 1 -2 4 -2 -4 -4 -1 4 -1z"/></g>`,
    maanglas: `<circle cx="32" cy="32" r="30" fill="url(#g-glow-blue)"/><circle cx="32" cy="32" r="20" fill="url(#g-glass)" stroke="#fff" stroke-width="2"/><g fill="#fff6c0"><path d="M32 18 l3 8 8 2 -8 2 -3 8 -3 -8 -8 -2 8 -2z"/></g>`,
    portret: `<rect x="10" y="8" width="44" height="50" rx="3" fill="url(#g-wood)"/><rect x="15" y="13" width="34" height="40" fill="#d9c7a0"/><circle cx="26" cy="28" r="5" fill="#8a6a4a"/><circle cx="38" cy="28" r="5" fill="#6a5a4a"/><path d="M19 46 Q26 34 33 46 M31 46 Q38 34 45 46" fill="#7a5a3a"/>`,
    paddenstoel: `<path d="M26 58 L28 34 L36 34 L38 58 Z" fill="#f3e3cf"/><path d="M8 36 Q10 10 32 8 Q54 10 56 36 Z" fill="#7fe0c8"/><circle cx="32" cy="24" r="24" fill="url(#g-glow-green)"/>`,
  };
  Art.item = function (id) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${I[id] || ''}</svg>`;
  };
  Art.itemRaw = (id) => I[id] || '';

  window.Art = Art;
})();
