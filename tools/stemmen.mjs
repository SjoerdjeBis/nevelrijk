#!/usr/bin/env node
/* ==========================================================
   Nevelrijk — stemmen maken met Azure Speech
   ----------------------------------------------------------
   Haalt alle gesproken zinnen uit de game, laat ze inspreken door
   Azure en zet de mp3's in audio/voice/. De game speelt ze daarna
   vanzelf af (en valt terug op de toestelstem als een zin ontbreekt).

   Gebruik (vanuit de projectmap):
     node tools/stemmen.mjs lijst      telt zinnen en tekens, maakt niets
     node tools/stemmen.mjs stemmen    toont welke Nederlandse stemmen Azure heeft
     node tools/stemmen.mjs test       één proefzin per personage → audio/voice-test/
     node tools/stemmen.mjs alles      maakt alle ontbrekende zinnen
     node tools/stemmen.mjs opnieuw    maakt álles opnieuw (na het wijzigen van stemmen)
     node tools/stemmen.mjs herneem a,b  spreekt alleen deze zinnen (sleutels) opnieuw in

   Sleutel en regio: zet ze in tools/.env (wordt nergens heen gestuurd
   behalve naar Azure):
     AZURE_SPEECH_KEY=...
     AZURE_SPEECH_REGION=westeurope
   ========================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VoiceKey = require(path.join(ROOT, 'js/voicekey.js'));
// Een andere stemmenset kiezen: node tools/stemmen.mjs test --config=tools/stemmen.config.mai.json
const configArg = process.argv.find((a) => a.startsWith('--config='));
const CONFIG_FILE = configArg ? path.resolve(configArg.slice(9)) : path.join(ROOT, 'tools/stemmen.config.json');
const CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
const OUT = path.join(ROOT, 'audio/voice');
const SOURCES = ['js/scenes.js', 'js/puzzles.js', 'js/engine.js'];

/* ---------------- .env lezen ---------------- */
function loadEnv() {
  const f = path.join(ROOT, 'tools/.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && m[2] && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

/* ---------------- een kleine JS-tokenizer ----------------
   Genoeg om strings, commentaar, regexen en haakjes te herkennen. */
// Geeft de index direct na een string terug. Template-strings mogen ${…} bevatten,
// met daarin weer accolades, strings en template-strings.
function skipString(src, i) {
  const q = src[i]; let j = i + 1;
  while (j < src.length) {
    const ch = src[j];
    if (ch === '\\') { j += 2; continue; }
    if (ch === q) return j + 1;
    if (q === '`' && ch === '$' && src[j + 1] === '{') {
      j += 2; let depth = 1;
      while (j < src.length && depth) {
        const d = src[j];
        if (d === '\'' || d === '"' || d === '`') { j = skipString(src, j); continue; }
        if (d === '{') depth++; else if (d === '}') depth--;
        j++;
      }
      continue;
    }
    j++;
  }
  return j;
}
function tokenize(src) {
  const toks = []; let i = 0;
  const sig = () => { for (let k = toks.length - 1; k >= 0; k--) if (toks[k].t !== 'comment') return toks[k]; return null; };
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i); const end = e < 0 ? src.length : e; toks.push({ t: 'comment', v: src.slice(i, end) }); i = end; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2) + 2; toks.push({ t: 'comment', v: src.slice(i, e) }); i = e; continue; }
    if (c === '\'' || c === '"' || c === '`') {
      const end = skipString(src, i);
      toks.push({ t: 'str', raw: src.slice(i, end), expr: c === '`' && /\$\{/.test(src.slice(i, end)) }); i = end; continue;
    }
    if (c === '/') { // regex of deling?
      const p = sig();
      const isRe = !p || (p.t === 'punc' && '(,=:[!&|?{};+-*%<>~^'.includes(p.v)) || (p.t === 'word' && /^(return|typeof|case|in|of)$/.test(p.v));
      if (isRe) {
        let j = i + 1, cls = false;
        while (j < src.length) { if (src[j] === '\\') { j += 2; continue; } if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; else if (src[j] === '/' && !cls) break; j++; }
        j++; while (/[a-z]/i.test(src[j] || '')) j++;
        toks.push({ t: 'regex', v: src.slice(i, j) }); i = j; continue;
      }
    }
    if (/[A-Za-z_$]/.test(c)) { let j = i; while (/[\w$]/.test(src[j] || '')) j++; toks.push({ t: 'word', v: src.slice(i, j) }); i = j; continue; }
    if (/[0-9]/.test(c)) { let j = i; while (/[\w.]/.test(src[j] || '')) j++; toks.push({ t: 'num', v: src.slice(i, j) }); i = j; continue; }
    toks.push({ t: 'punc', v: c }); i++;
  }
  return toks.filter((t) => t.t !== 'comment' || /stem:/.test(t.v));
}
const OPEN = '([{', CLOSE = ')]}';
// Geeft tokens van één expressie terug vanaf index i (stopt bij , ; of een sluitend haakje op diepte 0).
function exprAt(toks, i) {
  const out = []; let d = 0;
  for (; i < toks.length; i++) {
    const t = toks[i];
    if (t.t === 'punc') {
      if (OPEN.includes(t.v)) d++;
      else if (CLOSE.includes(t.v)) { if (d === 0) break; d--; }
      else if ((t.v === ',' || t.v === ';') && d === 0) break;
    }
    out.push({ tok: t, idx: i });
  }
  return out;
}
// Argumenten van een aanroep; i wijst naar '('.
function argsAt(toks, i) {
  const args = []; let j = i + 1;
  while (j < toks.length) {
    const e = exprAt(toks, j); args.push(e);
    j = e.length ? e[e.length - 1].idx + 1 : j;
    if (toks[j] && toks[j].v === ',') { j++; continue; }
    break;
  }
  return args;
}
function literals(toks, expr) {
  const res = [];
  for (const { tok, idx } of expr) {
    if (tok.t !== 'str' || tok.expr) continue;
    // buren overslaan die alleen een /* stem:… */-opmerking zijn
    let pi = idx - 1; while (pi >= 0 && toks[pi].t === 'comment') pi--;
    const prev = toks[pi], next = toks[idx + 1];
    if ((prev && prev.v === '+') || (next && next.v === '+')) continue; // stukje van een samengestelde zin
    if (next && (next.v === ':' && prev && prev.v !== '?')) continue; // sleutel in een object
    if (prev && prev.t === 'punc' && prev.v === '=' && toks[pi - 1] && toks[pi - 1].v === '=') continue; // vergelijking
    if (next && next.t === 'punc' && next.v === '=' ) continue;
    if (prev && prev.t === 'punc' && prev.v === '[' && next && next.v === ']') continue; // obj['x']
    let s; try { s = Function('"use strict";return ' + tok.raw)(); } catch (e) { continue; }
    if (typeof s !== 'string' || /^[a-z][A-Za-z0-9_]*$/.test(s)) continue; // vlaggen en id's, geen zinnen
    if (/[a-zà-ÿ]{2}/i.test(VoiceKey.clean(s))) res.push(s);
  }
  return res;
}

// Hints geeft Kwast, of Mira zelf zolang ze Kwast nog niet kent.
const PROP_SPEAKER = { desc: ['mira'], look: ['mira'], vague: ['kwast', 'mira'], direct: ['kwast', 'mira'], q: ['brokkel'] };
function extract() {
  const lines = new Map();
  const add = (speaker, text, where) => {
    const k = VoiceKey.key(speaker, text);
    if (!lines.has(k)) lines.set(k, { key: k, speaker, text: VoiceKey.clean(text), where });
  };
  for (const file of SOURCES) {
    const toks = tokenize(fs.readFileSync(path.join(ROOT, file), 'utf8'));
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i], n = toks[i + 1];
      if (t.t === 'comment') { // /* stem:wie */ <expressie>   (meerdere: /* stem:kwast,mira */)
        const who = t.v.match(/stem:([\w,]+)/)[1].split(',');
        literals(toks, exprAt(toks, i + 1)).forEach((s) => who.forEach((w) => add(w, s, file)));
        continue;
      }
      if (t.t !== 'word') continue;
      if (n && n.v === ':' && PROP_SPEAKER[t.v] && !(toks[i - 1] && toks[i - 1].v === '?')) {
        literals(toks, exprAt(toks, i + 2)).forEach((s) => PROP_SPEAKER[t.v].forEach((w) => add(w, s, file)));
        continue;
      }
      if (!n || n.v !== '(') continue;
      const prev = toks[i - 1];
      if ((t.v === 'M' || t.v === 'K' || t.v === 'KW') && !(prev && prev.v === '.')) { // M = Mira, K/KW = Kwast
        const a = argsAt(toks, i + 1);
        if (a[0]) literals(toks, a[0]).forEach((s) => add(t.v === 'M' ? 'mira' : 'kwast', s, file));
      } else if (t.v === 'say' || t.v === 'speak') {
        const a = argsAt(toks, i + 1);
        const sp = a[0] && a[0].length === 1 && a[0][0].tok.t === 'str' ? Function('return ' + a[0][0].tok.raw)() : null;
        if (sp && a[1]) literals(toks, a[1]).forEach((s) => add(sp, s, file));
      } else if (t.v === 'choose') {
        const a = argsAt(toks, i + 1);
        const sp = a[1] && a[1].length === 1 && a[1][0].tok.t === 'str' ? Function('return ' + a[1][0].tok.raw)() : 'mira';
        if (a[2]) literals(toks, a[2]).forEach((s) => add(sp, s, file));
      }
    }
  }
  return [...lines.values()];
}

/* ---------------- Azure ---------------- */
const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Drie puntjes worden door sommige stemmen als heel lange stilte uitgesproken.
// Midden in een zin wordt het een komma, aan het eind een punt.
function spoken(text) {
  return text.replace(/^\s*\.\.\.\s*/, '').replace(/\.\.\.(?=\s*[a-zà-ÿ])/g, ',').replace(/\.\.\./g, '.').replace(/([,.])\s*([,.])/g, '$1');
}
function ssml(speaker, text) {
  text = spoken(text);
  const c = CONFIG.cast[speaker] || CONFIG.cast.verteller;
  const lang = c.voice.slice(0, 5);
  let inner = `<prosody pitch="${c.pitch || '0%'}" rate="${c.rate || '0%'}">${xml(text)}</prosody>`;
  if (c.style) inner = `<mstts:express-as style="${c.style}"${c.styledegree ? ` styledegree="${c.styledegree}"` : ''}>${inner}</mstts:express-as>`;
  if (c.multilingual) inner = `<lang xml:lang="nl-NL">${inner}</lang>`;
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${lang}"><voice name="${c.voice}">${inner}</voice></speak>`;
}
async function synth(speaker, text, file) {
  const key = process.env.AZURE_SPEECH_KEY, region = process.env.AZURE_SPEECH_REGION || 'westeurope';
  const body = ssml(speaker, text); // fouten hierin zijn geen netwerkfouten
  for (let attempt = 0; attempt < 6; attempt++) {
    let res;
    try {
      res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'nevelrijk-stemmen' },
        body,
      });
    } catch (e) { // verbinding even weg: wachten en opnieuw proberen
      console.log(`  geen verbinding (${e.cause ? e.cause.code : e.message}), opnieuw…`);
      await sleep(5000 * (attempt + 1)); continue;
    }
    if (res.status === 429 || res.status >= 500) { const w = (+res.headers.get('retry-after') || 0) * 1000 || 4000 * (attempt + 1); console.log(`  even wachten (${res.status})…`); await sleep(w); continue; }
    if (!res.ok) throw new Error(`Azure gaf ${res.status}: ${(await res.text()).slice(0, 300)}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    return;
  }
  throw new Error('Azure blijft bezet. Probeer het later opnieuw.');
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function writeManifest() {
  const keys = fs.readdirSync(OUT).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)).sort();
  const map = Object.fromEntries(keys.map((k) => [k, 1]));
  // Volgorde zoals de zinnen in de code staan: de game laadt de volgende zinnen alvast vooruit.
  const order = lines.map((l) => l.key).filter((k) => map[k]);
  fs.writeFileSync(path.join(OUT, 'manifest.js'), `/* Gemaakt door tools/stemmen.mjs — niet met de hand bewerken. */\nwindow.VOICE_MANIFEST = ${JSON.stringify(map)};\nwindow.VOICE_ORDER = ${JSON.stringify(order)};\n`);
  return keys.length;
}
function needKey() {
  if (process.env.AZURE_SPEECH_KEY) return;
  console.error('\nGeen Azure-sleutel gevonden.\nMaak het bestand tools/.env met:\n  AZURE_SPEECH_KEY=<je sleutel>\n  AZURE_SPEECH_REGION=<je regio, bijv. westeurope>\n');
  process.exit(1);
}

/* ---------------- opdrachten ---------------- */
loadEnv();
const cmd = process.argv[2] || 'lijst';
const lines = extract();
const chars = lines.reduce((n, l) => n + l.text.length, 0);

if (cmd === 'lijst') {
  const per = {};
  lines.forEach((l) => { per[l.speaker] = (per[l.speaker] || 0) + 1; });
  fs.writeFileSync(path.join(ROOT, 'tools/stemmen-lijst.json'), JSON.stringify(lines, null, 1));
  console.log(`${lines.length} zinnen, ${chars} tekens.`);
  console.log(Object.entries(per).sort((a, b) => b[1] - a[1]).map(([s, n]) => `  ${s.padEnd(10)} ${n}`).join('\n'));
  const have = fs.existsSync(OUT) ? lines.filter((l) => fs.existsSync(path.join(OUT, l.key + '.mp3'))).length : 0;
  console.log(`Al ingesproken: ${have}. Alle zinnen staan in tools/stemmen-lijst.json.`);
} else if (cmd === 'stemmen') {
  needKey();
  const region = process.env.AZURE_SPEECH_REGION || 'westeurope';
  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`, { headers: { 'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY } });
  if (!res.ok) { console.error('Azure gaf', res.status, await res.text()); process.exit(1); }
  const all = await res.json();
  const nl = all.filter((v) => /^nl-/.test(v.Locale) || (v.SecondaryLocaleList || []).includes('nl-NL'));
  nl.forEach((v) => console.log(`${v.ShortName.padEnd(42)} ${v.Gender.padEnd(7)} ${v.Locale}${v.StyleList ? '  stijlen: ' + v.StyleList.join(', ') : ''}`));
} else if (cmd === 'test') {
  needKey();
  const set = path.basename(CONFIG_FILE, '.json').replace(/^stemmen\.config\.?/, '') || 'standaard';
  const dir = path.join(ROOT, 'audio/voice-test', set); fs.mkdirSync(dir, { recursive: true });
  const bySpeaker = {};
  lines.forEach((l) => { if (!bySpeaker[l.speaker] && l.text.length > 40 && l.text.length < 160) bySpeaker[l.speaker] = l; });
  let html = '<!doctype html><meta charset="utf-8"><title>Stemtest</title><body style="font:16px system-ui;background:#141a2e;color:#eee;padding:20px">';
  for (const [sp, l] of Object.entries(bySpeaker)) {
    console.log(`${sp}: ${l.text.slice(0, 70)}…`);
    try { await synth(sp, l.text, path.join(dir, sp + '.mp3')); } catch (e) { console.log('  MISLUKT: ' + e.message); html += `<p><b>${sp}</b>: mislukt (${e.message.slice(0, 120)})</p>`; continue; }
    html += `<p><b>${sp}</b> (${(CONFIG.cast[sp] || CONFIG.cast.verteller).voice})<br>${l.text}<br><audio controls src="${sp}.mp3"></audio></p>`;
    await sleep(CONFIG.pauseMs);
  }
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log(`\nKlaar. Open audio/voice-test/${set}/index.html om te luisteren.`);
} else if (cmd === 'alles' || cmd === 'opnieuw') {
  needKey();
  fs.mkdirSync(OUT, { recursive: true });
  const todo = lines.filter((l) => cmd === 'opnieuw' || !fs.existsSync(path.join(OUT, l.key + '.mp3')));
  console.log(`${todo.length} van ${lines.length} zinnen te maken (${todo.reduce((n, l) => n + l.text.length, 0)} tekens).`);
  let k = 0;
  for (const l of todo) {
    k++;
    process.stdout.write(`[${k}/${todo.length}] ${l.speaker}: ${l.text.slice(0, 60)}\n`);
    await synth(l.speaker, l.text, path.join(OUT, l.key + '.mp3'));
    if (k % 10 === 0) writeManifest();
    await sleep(CONFIG.pauseMs);
  }
  // opnames die niet meer in de game staan opruimen
  const keep = new Set(lines.map((l) => l.key));
  fs.readdirSync(OUT).filter((f) => f.endsWith('.mp3') && !keep.has(f.slice(0, -4))).forEach((f) => fs.unlinkSync(path.join(OUT, f)));
  console.log(`\nKlaar: ${writeManifest()} opnames in audio/voice/.`);
} else if (cmd === 'manifest') {
  console.log(`Manifest: ${writeManifest()} opnames.`);
} else if (cmd === 'herneem') {
  // node tools/stemmen.mjs herneem <sleutel,sleutel,...>  of  herneem bestand.json (lijst met sleutels)
  needKey();
  const arg = process.argv.slice(3).find((a) => !a.startsWith('--')) || '';
  const keys = new Set(fs.existsSync(arg) ? JSON.parse(fs.readFileSync(arg, 'utf8')) : arg.split(','));
  const todo = lines.filter((l) => keys.has(l.key));
  console.log(`${todo.length} zinnen opnieuw inspreken.`);
  let k = 0;
  for (const l of todo) { k++; process.stdout.write(`[${k}/${todo.length}] ${l.speaker}: ${l.text.slice(0, 60)}\n`); await synth(l.speaker, l.text, path.join(OUT, l.key + '.mp3')); await sleep(CONFIG.pauseMs); }
  console.log(`Klaar: ${writeManifest()} opnames.`);
} else {
  console.log('Onbekende opdracht. Kies: lijst, stemmen, test, alles, opnieuw, herneem of manifest.');
}
