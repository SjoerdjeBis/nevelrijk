/* ==========================================================
   Nevelrijk — verhaal, plekken, personages
   ----------------------------------------------------------
   Het verhaal in het kort (spoilers!):
   De Maanlantaarn houdt elke nacht de nevel buiten het dal.
   Maar hij brandt op herinneringen — elke nacht één, van iemand
   in het dal. Wat vergeten wordt, wordt nevel. De lantaarn maakt
   dus zelf de nevel die hij tegenhoudt. De allereerste herinnering
   die hij at, was Aldo: het broertje van Oma Brem. Iedereen vergat
   hem, en hij werd de kern van de nevel: de Grijze Heer.
   Oma ontdekte het, doofde de lantaarn en ging naar de toren.
   Mira kan het oude licht weer aansteken, de nevel laten komen,
   of een nieuw glas blazen dat op een gedeeld lied brandt.
   ========================================================== */
(function () {
  'use strict';
  const G = window.G, Art = window.Art, A = window.Audio9, P = window.Puzzles;
  const say = (w, t) => G.say(w, t);
  const M = (t) => G.say('mira', t);
  const K = (t) => { A.sfx('crow'); return G.say('kwast', t); };

  /* ================= voorwerpen ================= */
  G.items = {
    brief: { name: 'Oma\'s brief', examine: (G) => readLetter(G) },
    sleutel: { name: 'Koperen sleuteltje', desc: 'Een klein koperen sleuteltje. Het is nog warm van de kattenmand. Het past vast op Oma\'s kist.' },
    muziekdoos: { name: 'Muziekdoosje', examine: async (G) => {
      A.sfx('musicbox', A.LULLABY.hard);
      G.set('heardSong');
      await M('Het slaapliedje. Op het deksel staan tekens: <b>❦ ≈ ✸ ≈</b> … De rest is weggesleten. Ik moet goed luisteren.');
    } },
    blaaspijp: { name: 'Oma\'s blaaspijp', desc: 'Oma\'s oude blaaspijp. Hiermee blies ze al het glas in het dal.' },
    bol: { name: 'Lege glazen bol', desc: 'Een glazen bol met een kurk. Leeg, maar er zou iets lichts in passen.' },
    lamp: { name: 'Vuurvliegjeslamp', desc: 'De vuurvliegjes knipperen tevreden in hun bol. Een zacht, levend lampje.' },
    haak: { name: 'IJzeren haak', desc: 'De pothaak van de oven. Stevig en krom.' },
    touw: { name: 'Touw', desc: 'Een flinke rol scheepstouw van Teun.' },
    werphaak: { name: 'Werphaak', desc: 'Touw met een haak eraan. Daar kun je dingen mee uit diepe plekken vissen.' },
    medaillon: { name: 'Groen medaillon', desc: 'Een gouden medaillon met een groen blaadje erop. Binnenin zit een piepklein schilderijtje van een vrouw met een hoed.' },
    brood: { name: 'Vers brood', desc: 'Het ruikt naar karwij en honing. Hanna bakt het lekkerste brood van het dal.' },
    stemvork: { name: 'Zilveren stemvork', desc: 'Hij zoemt zachtjes, ook als je er niet tegen tikt. Er staat een torentje op.' },
    vuurbloem: { name: 'Vuurbloem', desc: 'Een bloem die brandt maar nooit verbrandt. Warm als een kampvuur in je hand.' },
    nevelzicht: { name: 'Drankje: Nevelzicht', desc: 'Een flesje dat glanst als maanlicht op water. Wie het drinkt, kijkt dwars door nevel heen.' },
    sterrenzand: { name: 'Sterrenzand', desc: 'Zand van het strandje bij het Nevelmeer. Elk korreltje glinstert als een ster. Oma zei altijd: hier blaas je het mooiste glas van.' },
    maanglas: { name: 'Maanglas', desc: 'Mijn eigen glas. Er dansen sterretjes in. Het voelt alsof het wacht op een liedje.' },
    vogeltje: { name: 'Glazen vogeltje', desc: 'Een blauw glazen vogeltje met een gele snavel. Onder zijn pootje staat een A.' },
    zeekaart: { name: 'Zeekaart', desc: 'Wiekes kaart van de Grijze Riffen. Een rood stippellijntje wijst de weg naar de toren.' },
    fles: { name: 'Fles uit de mast', examine: async (G) => {
      await M('In de fles zit een opgerold papiertje. Ik trek de kurk eruit…');
      G.take('fles'); G.give('bladzijde', true);
      await readPage(G);
    } },
    bladzijde: { name: 'Eerste bladzijde', examine: (G) => readPage(G) },
    portret: { name: 'Oud portretje', examine: async (G) => {
      await M('Twee kinderen voor deze werkplaats. Het meisje met de vlechten is vast Oma. Naast haar staat een jongen… maar zijn gezicht is weg. Alsof iemand het heeft uitgegumd.');
      await M('Achterop staat: <em>“B. en A. — de zomer van het eerste licht.”</em> Wie is A.?');
      G.set('sawPortrait');
    } },
  };

  G.combos = [
    { a: 'haak', b: 'touw', run: async (G) => {
      G.take('haak'); G.take('touw'); A.sfx('combine'); G.give('werphaak', true); G.toast('Werphaak gemaakt!', 'werphaak');
      await M('Ik knoop het touw stevig aan de haak. Een werphaak! Daar kan ik iets mee uit de diepte vissen.');
    } },
    { a: 'sterrenzand', b: 'blaaspijp', run: async (G) => { await M('Om glas te blazen heb ik een hete oven nodig. Oma\'s oven, thuis in de werkplaats…'); } },
    { a: 'vuurbloem', b: 'sterrenzand', run: async (G) => { await M('Lekker warm voor mijn handen. Maar niet heet genoeg voor glas. Daar heb ik een oven voor nodig.'); } },
    { a: 'bol', b: 'sterrenzand', run: async (G) => { await M('Ik heb liever een nieuw glas dan een bol vol zand.'); } },
    { a: 'muziekdoos', b: 'stemvork', run: async (G) => { A.sfx('musicbox', ['blad', 'golf', 'vuur']); await M('De stemvork zoemt mee met het liedje. Ze horen bij elkaar.'); } },
    { a: 'medaillon', b: 'portret', run: async (G) => { await M('Twee mensen die iemand mist. Ik moet dit medaillon terugbrengen.'); } },
  ];

  /* ================= hoofdstukken ================= */
  G.chapters = {
    1: { title: /* stem:verteller */ 'De Gedoofde Lantaarn', music: 'title', text: /* stem:verteller */ [
      'In het dal van Nevelrijk brandt elke nacht de Maanlantaarn. Zijn licht houdt de nevel weg. Want de nevel pakt dingen af: namen, liedjes en gezichten.',
      'Vannacht is de lantaarn uitgegaan.',
      'En Oma Brem, de glasblazer van het dal, is verdwenen.',
    ] },
    2: { title: /* stem:verteller */ 'Over de Brug', music: 'bridge', text: /* stem:verteller */ [
      'Achter de brug begint het wilde deel van het dal. Daar geven de paddenstoelen licht, en wonen de oude verhalen.',
      'De nevel is hier dikker. En ergens daarachter ligt het meer.',
    ] },
    3: { title: /* stem:verteller */ 'Het Nevelmeer', music: 'lake', text: /* stem:verteller */ [
      'Midden in het meer staat de Maantoren, zwart tegen de sterren.',
      'Alleen de veerman kan je erheen brengen. Maar hij ziet de weg niet meer.',
    ] },
    4: { title: /* stem:verteller */ 'Het Eiland van Vergeten Dingen', music: 'island', text: /* stem:verteller */ [
      'Alles wat in het dal vergeten wordt, spoelt ergens aan. Op een klein, stil eiland in het meer.',
      'Daar woont iemand die alles opschrijft. Zodat er toch één iemand is die het onthoudt.',
    ] },
    5: { title: /* stem:verteller */ 'De Maantoren', music: 'tower', text: /* stem:verteller */ [
      'De toren is heel, heel oud. Hij zoemt zachtjes, alsof hij een liedje neuriet.',
      'Boven, achter de laatste trap, wacht het antwoord. En misschien wacht daar ook iemand.',
    ] },
    6: { title: /* stem:verteller */ 'De Spiegeltrap', music: 'stairs', text: /* stem:verteller */ [
      'Binnen in de toren draait een trap omhoog, rond en rond. Aan de muren hangen spiegels.',
      'Oude spiegels onthouden alles wat ze ooit gezien hebben. Ook dingen die mensen zijn vergeten.',
    ] },
  };

  // Hoeveel kleur heeft de wereld terug? (De nevel trekt kleur weg.)
  G.colorLevel = function () {
    const s = G.state; if (!s) return 1;
    let lvl = 0.05 + Math.min(0.35, (s.chapter - 1) * 0.1) + s.voices.length * 0.15;
    if (G.flag('ringsDone')) lvl += 0.05;
    return Math.max(0, Math.min(1, lvl));
  };

  /* ================= hulpjes ================= */
  function kwastPerch(G, x, y, flip) {
    if (!G.flag('kwastJoined')) return '';
    return `<g transform="translate(${x} ${y}) scale(${flip ? -0.9 : 0.9} 0.9)">${Art.kwast()}</g>`;
  }
  function kwastHot(G, x, y) {
    if (!G.flag('kwastJoined')) return null;
    return { id: 'kwast', name: 'Kwast', x: x - 50, y: y - 110, w: 100, h: 110, walk: false, tap: (G) => kwastTalk(G) };
  }
  async function kwastTalk(G) {
    const lines = /* stem:kwast */ [
      'Kraa. Je mag me altijd om hulp vragen, hoor. Daarvoor is die veer bovenin je scherm.',
      'Weet je wat ik mis? Glimmende dingen. Oma gaf me altijd een kraaltje als ik braaf was. Ik ben altijd braaf.',
      'Dat rode lintje? Dat is een medaille. Voor moed. Of voor mooi zijn. Een van de twee.',
      'Ik ben géén huisdier. Ik ben een slimme raadgever. Met veren.',
      'Als ik de nevel ruik, krijg ik kippenvel. Kraaienvel. Je snapt wat ik bedoel.',
      G.flag('gaveBead') ? 'Ik heb de blauwe kraal nog steeds. Kijk maar. Nee, niet aankomen.' : 'Mensen hebben zo weinig veren. Hebben jullie het nooit koud?',
    ];
    const i = (G.state.seen.kwastLine || 0) % lines.length; G.state.seen.kwastLine = i + 1;
    await K(lines[i]);
    const r = await G.choose([{ text: '🪶 Geef me een hint, Kwast.', value: 'hint' }, { text: 'Bedankt, Kwast.', value: 'ok' }]);
    if (r === 'hint') { G.hideDialog(); G.busy = false; await G.hint(); G.busy = true; }
  }

  async function readLetter(G) {
    await say('oma', `<em>Lieve Mira,</em><br>Als je dit leest, is de Maanlantaarn uit. Dat heb ik gedaan. Schrik niet, en word niet boos. Ik heb iets ontdekt. Ik leg het je later uit.`);
    await say('oma', `Het sleuteltje van mijn kist ligt waar iemand met negen levens altijd droomt. Neem mee wat erin ligt.`);
    await say('oma', `Volg het slaapliedje. Het begint bij de stenen in het Fluisterbos. En vertrouw Kwast, ook al is hij een opschepper.<br><em>Ik hou van je. Oma</em>`);
    G.task('sleutel', 'Vind het sleuteltje van Oma\'s kist.');
    G.task('stenen', 'Volg het slaapliedje naar de stenen in het Fluisterbos.');
  }

  // Hoe kom je ergens? Kwast zegt het erbij als je niet op de goede plek staat.
  const ROUTE = /* stem:kwast */ {
    werkplaats: 'Dat is thuis, in Oma\'s werkplaats. Die ligt links van het dorpsplein.',
    dorp: 'Dat is op het dorpsplein, midden in het dorp.',
    bos: 'Dat is in het Fluisterbos. Vanaf het dorpsplein ga je omhoog.',
    brug: 'Dat is bij de brug van Brokkel. Vanaf het dorpsplein ga je naar rechts.',
    holte: 'Dat is in de Paddenstoelenholte, aan de overkant van de brug.',
    veer: 'Dat is bij het Nevelmeer. Vanaf de Paddenstoelenholte ga je naar beneden.',
    eiland: 'Dat is op het Eiland van Vergeten Dingen. Daar brengt Teun je met zijn boot.',
    toren: 'Dat is bij de Maantoren. Teun vaart je erheen als je de zeekaart hebt.',
    trap: 'Dat is binnen in de toren, op de Spiegeltrap.',
    torenkamer: 'Dat is helemaal boven in de toren, in de lantaarnkamer.',
  };

  // Alle doelen die er nu toe doen. Kwast kiest het doel dat het best past bij waar je bent.
  // at: plek(ken) waar je het doet ('*' = overal, bijv. in je rugzak); opt: niet nodig om het spel uit te spelen.
  function hintGoals(G) {
    const f = (k) => G.flag(k), h = (i) => G.has(i);
    const g = [];
    const add = (when, goal) => { if (when) g.push(goal); };
    const glassNeeded = f('sabethTruth') && !h('maanglas') && !f('maanglasPlaced');
    add(!f('letterRead'), { id: 'brief', at: ['werkplaats'], vague: 'Oma laat nooit zomaar iets slingeren. Kijk eens op haar werkbank.', direct: 'Tik op de brief op Oma\'s werkbank.' });
    add(f('letterRead') && !f('chestOpen') && !h('sleutel'), { id: 'key', at: ['werkplaats'], vague: 'Wie heeft er negen levens en droomt de hele dag? Kijk bij de oven.', direct: 'Het sleuteltje ligt in de kattenmand van Spinsel, bij de oven.' });
    add(h('sleutel') && !f('chestOpen'), { id: 'chest', at: ['werkplaats'], vague: 'Sleutel. Kist. Ik zeg niks meer.', direct: 'Kies het sleuteltje in je rugzak en tik dan op de kist.' });
    add(f('letterRead') && !h('bol') && !f('gotLamp'), { id: 'bol', at: ['werkplaats'], vague: 'In Oma\'s werkplaats liggen meer nuttige dingen. Iets van glas, misschien?', direct: 'Pak de lege glazen bol van de plank.' });
    add(f('letterRead') && !f('kwastJoined'), { id: 'kwast', at: ['dorp'], vague: 'Buiten, op de wegwijzer, zit een heel knap en slim iemand.', direct: 'Praat met de kraai op de wegwijzer.' });
    add(h('muziekdoos') && !f('heardSong') && !f('stonesDone'), { id: 'song', at: ['*'], vague: 'Het slaapliedje… heeft Oma dat niet ergens in een doosje bewaard?', direct: 'Tik twee keer op het muziekdoosje in je rugzak. Dan hoor je het liedje.' });
    add(!f('stonesDone') && (f('heardSong') || f('boxGiven')), { id: 'stones', at: ['bos'], vague: 'De stenen in het bos willen het lied horen.', direct: 'Tik op de stenen. Druk op Luister en speel het liedje na.' });
    add(f('stonesDone') && !h('stemvork') && !f('forkTaken'), { id: 'fork', at: ['bos'], vague: 'Boven de middelste steen zweeft nog iets zilverigs.', direct: 'Pak de zilveren stemvork boven de middelste steen.' });
    add(h('bol') && !f('gotLamp'), { id: 'lamp', at: ['bos'], vague: 'Het wordt donker waar we heen gaan. In het bos dansen kleine lampjes rond.', direct: 'Kies de lege glazen bol en tik op de vuurvliegjes bij de oude boomstronk.' });
    add(f('kwastJoined') && !f('bridgePassed') && !h('brood') && !f('brokkelFed'), { id: 'bridge', at: ['brug', 'dorp'], vague: 'Trollen kun je blij maken. Met raadsels. Of met eten. Vooral met eten.', direct: 'Daag Brokkel uit voor raadsels. Of haal een brood bij bakker Hanna op het plein.' });
    add(!f('bridgePassed') && h('brood'), { id: 'bridge2', at: ['brug'], vague: 'Brokkel ziet eruit alsof hij in geen jaren iets lekkers heeft gehad.', direct: 'Kies het brood en tik op Brokkel.' });
    add(f('bridgePassed') && !f('sabethMet'), { id: 'sabeth', at: ['holte'], vague: 'Achter de brug woont iemand die alles van de nevel weet.', direct: 'Praat met Sabeth bij haar paddenstoelhuis.' });
    const needMed = f('sabethMet') && !f('medaillonBack');
    add(needMed && !h('medaillon') && !h('werphaak') && !h('touw'), { id: 'touw', at: ['veer'], vague: 'Om iets uit een put te vissen heb je iets langs nodig. Teun de veerman heeft veel touw.', direct: 'Pak het touw op de meerpaal bij de steiger.' });
    add(needMed && !h('medaillon') && !h('werphaak') && !h('haak'), { id: 'haak', at: ['werkplaats'], vague: 'Touw alleen is niet genoeg. Er moet iets kroms aan.', direct: 'Pak de ijzeren haak bij de oven.' });
    add(needMed && h('haak') && h('touw'), { id: 'combo', at: ['*'], vague: 'Haak. Touw. Je hebt twee handen.', direct: 'Tik op de haak in je rugzak en daarna op het touw. Dan maak je ze aan elkaar vast.' });
    add(needMed && h('werphaak') && !h('medaillon'), { id: 'well', at: ['dorp'], vague: 'Sabeth is iets kwijt. Iets wat glimt. Ik zag het vallen, in een diep gat op het plein…', direct: 'Kies de werphaak en tik op de put.' });
    add(h('medaillon'), { id: 'giveback', at: ['holte'], vague: 'Dat medaillon is niet van jou.', direct: 'Kies het medaillon en tik op Sabeth.' });
    add(f('brewAllowed') && !h('nevelzicht') && !f('teunCanSee'), { id: 'brew', at: ['holte'], vague: 'Sabeth zei dat je haar ketel mag gebruiken.', direct: 'Tik op de ketel en volg het recept voor Nevelzicht.' });
    add(h('nevelzicht') && !f('teunCanSee'), { id: 'teun', at: ['veer'], vague: 'Teun ziet de weg niet door de nevel. Jij hebt iets waarmee je door nevel kijkt.', direct: 'Kies het drankje Nevelzicht en tik op Teun.' });
    add(f('teunCanSee') && !f('ferryPaid'), { id: 'pay', at: ['veer'], vague: 'Teun wil betaald worden. Niet met geld.', direct: 'Praat met Teun en kies hoe je hem betaalt.' });
    add(glassNeeded && !h('sterrenzand'), { id: 'zand', at: ['veer'], vague: 'Sabeth had het over nieuw glas. Glas begint met zand. Mooi zand.', direct: 'Pak het glinsterende sterrenzand aan de oever bij de steiger.' });
    add(glassNeeded && !h('vuurbloem') && !f('ovenLit'), { id: 'bloem', at: ['holte'], vague: 'Oma\'s oven is koud. Wat brandt er zonder op te branden?', direct: 'Pluk een vuurbloem in Sabeths tuin.' });
    add(glassNeeded && h('vuurbloem') && !f('ovenLit'), { id: 'oven', at: ['werkplaats'], vague: 'De oven wacht op vuur.', direct: 'Kies de vuurbloem en tik op Oma\'s oven.' });
    add(glassNeeded && f('ovenLit') && h('sterrenzand'), { id: 'blow', at: ['werkplaats'], vague: 'Oven heet, zand in je zak, pijp in je hand. Wat doet een glasblazer?', direct: 'Kies het sterrenzand en tik op de hete oven.' });
    add(f('ferryPaid') && !f('islandVisited'), { id: 'cross', at: ['veer'], vague: 'Teun wacht bij zijn boot. Tijd om te varen!', direct: 'Tik op Teuns boot bij de steiger.' });
    add(f('islandVisited') && !h('zeekaart') && !f('reachedTower') && !f('wiekeMet'), { id: 'wieke', at: ['eiland'], vague: 'Die mot met de bril weet vast meer.', direct: 'Praat met Wieke de mot.' });
    add(f('wiekeMet') && !f('birdDone'), { id: 'bird', at: ['eiland'], vague: 'Een glasblazer kan scherven weer heel maken.', direct: 'Tik op de kist met scherven. Draai alle stukjes tot het vogeltje klopt.' });
    add(h('zeekaart') && !f('reachedTower'), { id: 'cross2', at: ['veer', 'eiland'], vague: 'Met de kaart vindt Teun de weg wel.', direct: 'Stap in de boot en kies: naar de Maantoren.' });
    add(f('reachedTower') && !f('towerOpen'), { id: 'door', at: ['toren'], vague: 'Die deur heeft geen klink. Maar er staat wel iets op. Iets wat zoemt.', direct: 'Gebruik de zilveren stemvork op de torendeur.' });
    add(f('towerOpen') && !f('hatchOpen'), { id: 'hatch', at: ['trap'], vague: 'Maanlicht en spiegels. Stuur het licht naar het luik.', direct: 'Tik op de spiegels. Kantel ze tot het licht bij het luik ☾ komt.' });
    add(f('hatchOpen') && !f('ringsDone'), { id: 'rings', at: ['torenkamer'], vague: 'De lantaarn werkt met de ringen op de sokkel.', direct: 'Tik op de sterrenringen en zet het slaapliedje erop: ❦ ≈ ✸ (≈).' });
    const v = G.state.voices.length;
    add(f('ringsDone') && v < 3, { id: 'voices', at: ['*'], vague: 'Een lied voor het hele dal zing je niet alleen. Je hebt nog niet genoeg stemmen.', direct: 'Je krijgt stemmen door lief te zijn voor anderen. Brokkel (brood), Sabeth (medaillon), Teun (een herinnering), Sluip (de vos in het bos), Wieke (de bladzijde) en Isolde (in de spiegel).' });
    add(f('ringsDone') && !h('maanglas') && !f('maanglasPlaced'), { id: 'glas', at: ['werkplaats'], vague: 'Het oude glas is gebarsten. Een nieuw lied heeft nieuw glas nodig.', direct: 'Blaas Maanglas in Oma\'s oven. Daarvoor heb je sterrenzand, een vuurbloem en de blaaspijp nodig.' });
    // extra's: niet nodig om het spel uit te spelen, wel voor stemmen en het mooiste einde
    add(f('kwastJoined') && !f('sluipFree'), { id: 'sluip', opt: true, voice: true, at: ['bos'], vague: 'Hoor je dat? Er zit iemand vast in die braamstruik.', direct: 'Gebruik de haak of de werphaak op de braamstruik.' });
    add(f('islandVisited') && !f('bottleTaken'), { id: 'fles', opt: true, at: ['eiland'], vague: 'Boven in die oude mast glinstert iets.', direct: 'Tik op het schipwrak. Kwast kan het halen, of gebruik je werphaak.' });
    add(h('fles'), { id: 'flesopen', opt: true, at: ['*'], vague: 'Er zit iets in die fles. Papier, geloof ik.', direct: 'Tik twee keer op de fles in je rugzak.' });
    add(h('bladzijde') && !f('pageBack'), { id: 'page', opt: true, voice: true, at: ['eiland'], vague: 'Een boek zonder begin is maar een half boek.', direct: 'Geef de eerste bladzijde terug aan Wieke.' });
    add(f('isoldeBlamed') && !f('isoldeForgiven'), { id: 'isolde', opt: true, voice: true, at: ['trap'], vague: 'Dat spiegelbeeld keek zo verdrietig. Misschien moet je nog iets zeggen.', direct: 'Praat nog eens met Isolde en zeg sorry.' });
    add(f('sabethAccused') && !f('sabethForgiven'), { id: 'sabethsorry', opt: true, voice: true, at: ['holte'], vague: 'Je was een beetje boos op Sabeth. Was dat wel eerlijk?', direct: 'Praat met Sabeth en zeg sorry.' });
    add(f('heerAppeared') && !f('ending') && v >= 3 && (h('maanglas') || f('maanglasPlaced')), { id: 'final', at: ['torenkamer'], vague: 'Het is aan jou, Mira. Ik ben maar een kraai.', direct: 'Praat met de Grijze Heer en maak je keuze.' });
    return g;
  }

  G.hints = function (G) {
    const sc = G.state.scene;
    const goals = hintGoals(G);
    const atHere = (x) => x.at.includes(sc), anywhere = (x) => x.at.includes('*');
    const here = (x) => atHere(x) || anywhere(x);
    const main = goals.filter((x) => !x.opt), extra = goals.filter((x) => x.opt);
    // 1. iets voor het verhaal op deze plek, 2. iets met je rugzak, 3. de volgende stap elders,
    // 4. een extraatje (alleen als het verhaal even niets vraagt)
    // zoek je nog stemmen, dan eerst een stem die je hier kunt verdienen
    const voiceHere = main.some((x) => x.id === 'voices') && extra.find((x) => x.voice && atHere(x));
    const pick = voiceHere || main.find(atHere) || main.find(anywhere) || main[0] || extra.find(here) || extra[0];
    if (!pick) return { id: 'free', vague: 'Kijk maar rustig rond. Ik weet het ook even niet.', direct: 'Kijk maar rustig rond. Ik weet het ook even niet.' };
    const target = pick.at[0];
    return Object.assign({}, pick, { route: here(pick) ? null : ROUTE[target] });
  };

  /* ==========================================================
     1. DE WERKPLAATS
     ========================================================== */
  G.register('werkplaats', {
    name: 'Oma\'s werkplaats', tint: '#5a3a22', music: 'workshop', ambience: 'fire', fx: 'dust',
    walk: { y0: 1150, y1: 1420, x0: 90, x1: 900, s0: 0.92, s1: 1.08 },
    entries: { start: [430, 1300], dorp: [840, 1260], default: [500, 1300] },
    bg(G) {
      let planks = '';
      for (let i = 0; i < 14; i++) planks += `<rect x="${i * 74}" y="0" width="72" height="1120" fill="${i % 2 ? '#3a2618' : '#34220f'}"/><line x1="${i * 74}" y1="0" x2="${i * 74}" y2="1120" stroke="#1e130a" stroke-width="3"/>`;
      let floor = '';
      for (let i = 0; i < 12; i++) floor += `<line x1="${500 + (i - 6) * 40}" y1="1120" x2="${500 + (i - 6) * 210}" y2="1500" stroke="#2a1a0e" stroke-width="3"/>`;
      let bricks = '';
      for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) { const x = 110 + c * 52 + (r % 2) * 26, y = 640 + r * 52; if (x < 400) bricks += `<rect x="${x}" y="${y}" width="48" height="48" rx="6" fill="${['#8a4a32', '#7a3f2a', '#94533a'][(r + c) % 3]}"/>`; }
      return `
        <defs><linearGradient id="ws-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3a22"/><stop offset="1" stop-color="#2e1d10"/></linearGradient>
        <clipPath id="ws-win"><circle cx="560" cy="360" r="150"/></clipPath>
        <radialGradient id="ws-warm" cx="45%" cy="60%" r="70%"><stop offset="0" stop-color="#ffb060" stop-opacity=".35"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient></defs>
        ${planks}
        <rect x="0" y="0" width="1000" height="90" fill="#24160c"/><rect x="0" y="80" width="1000" height="20" fill="#4a3020"/>
        <!-- raam -->
        <g clip-path="url(#ws-win)">
          ${Art.sky('ws-sky', ['#0b1430', '#1d2a55', '#40477a'])}
          ${Art.stars(60, 3, 520)}
          ${Art.moon(640, 280, 30, false)}
          <rect x="400" y="420" width="320" height="100" fill="#1a2444"/>
          <path d="M400 430 Q500 410 560 425 Q640 440 720 420 L720 520 L400 520 Z" fill="#141c38"/>
          <path d="M540 425 L548 300 L556 290 L564 300 L572 425 Z" fill="#0a0f22"/><circle cx="556" cy="296" r="6" fill="#2a3358"/>
          ${Art.mist(440, 80, 0.7, 'drift', 4)}
        </g>
        <circle cx="560" cy="360" r="156" fill="none" stroke="#5e3b22" stroke-width="16"/>
        <path d="M560 205 L560 515 M405 360 L715 360" stroke="#5e3b22" stroke-width="10"/>
        <path d="M404 360 Q480 300 560 360" fill="none" stroke="#fff" stroke-width="2" opacity=".1"/>
        <!-- hangende kruiden -->
        ${[150, 240, 760, 850].map((x, i) => `<g class="sway" style="animation-delay:${i}s"><line x1="${x}" y1="100" x2="${x}" y2="170" stroke="#2a1a0e" stroke-width="3"/><path d="M${x - 20} 170 Q${x} 260 ${x + 20} 170 Z" fill="${['#5e7a3a', '#7a6a3a', '#6a7f4a', '#8a5a3a'][i]}"/></g>`).join('')}
        <!-- plank met flessen -->
        <rect x="40" y="430" width="300" height="18" fill="url(#g-wood)"/><path d="M60 448 L80 490 M320 448 L300 490" stroke="#4a2f1c" stroke-width="8"/>
        ${[['#6fd3ff', 80], ['#ff8f6a', 130], ['#9be3a2', 180], ['#e58df0', 290]].map(([c, x]) => `<g><path d="M${x - 16} 430 Q${x - 20} 380 ${x - 6} 370 L${x - 6} 350 L${x + 6} 350 L${x + 6} 370 Q${x + 20} 380 ${x + 16} 430 Z" fill="${c}" opacity=".75"/><circle cx="${x}" cy="400" r="40" fill="${c}" opacity=".12"/><path d="M${x - 8} 390 Q${x - 10} 410 ${x - 6} 420" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/></g>`).join('')}
        <!-- oven -->
        <path d="M90 1120 L90 700 Q90 560 255 560 Q420 560 420 700 L420 1120 Z" fill="#6a3424"/>
        <g clip-path="url(#ws-oven)">${bricks}</g>
        <defs><clipPath id="ws-oven"><path d="M90 1120 L90 700 Q90 560 255 560 Q420 560 420 700 L420 1120 Z"/></clipPath></defs>
        <path d="M70 1120 L440 1120 L440 1090 L70 1090 Z" fill="#4a2a1c"/>
        <path d="M170 1060 L170 900 Q170 820 255 820 Q340 820 340 900 L340 1060 Z" fill="#160c08"/>
        <path d="M200 520 L310 520 L300 560 L210 560 Z" fill="#4a2a1c"/><rect x="225" y="100" width="60" height="420" fill="#5a3020"/>
        <!-- werkbank -->
        <rect x="430" y="900" width="300" height="26" rx="4" fill="url(#g-wood)"/>
        <path d="M450 926 L450 1110 M710 926 L710 1110" stroke="#4a2f1c" stroke-width="18"/>
        <path d="M450 1040 L710 1040" stroke="#4a2f1c" stroke-width="10"/>
        <g><rect x="640" y="850" width="18" height="50" fill="#e8dcc4"/><path d="M649 850 Q640 830 649 812 Q658 830 649 850Z" fill="#ffcf6a" class="flicker"/>${Art.glow(649, 835, 160, '', 0.8, 'glowpulse')}</g>
        <path d="M470 895 L540 895 L534 880 L476 880 Z" fill="#7a7f90"/><circle cx="580" cy="888" r="12" fill="url(#g-glass)"/><circle cx="604" cy="892" r="8" fill="#ff8f6a" opacity=".7"/>
        <!-- deur -->
        <path d="M860 1130 L860 640 Q860 580 925 580 Q990 580 990 640 L990 1130 Z" fill="url(#g-wood-dark)"/>
        <path d="M880 1130 L880 650 Q880 600 925 600 Q970 600 970 650 L970 1130 Z" fill="url(#g-wood)"/>
        <path d="M880 760 L970 760 M880 960 L970 960" stroke="#3a2416" stroke-width="8"/>
        <circle cx="895" cy="880" r="8" fill="url(#g-gold)"/>
        <!-- vloer -->
        <rect x="0" y="1120" width="1000" height="380" fill="url(#ws-floor)"/>${floor}
        <ellipse cx="500" cy="1330" rx="300" ry="70" fill="#7a3a3a" opacity=".55"/><ellipse cx="500" cy="1330" rx="250" ry="52" fill="none" stroke="#e8b06a" stroke-width="4" opacity=".4" stroke-dasharray="12 10"/>
        <rect width="1000" height="1500" fill="url(#ws-warm)"/>
      `;
    },
    props(G) {
      const f = (k) => G.flag(k);
      let s = '';
      // ovenvuur
      if (f('ovenLit')) s += `<g><path d="M180 1060 Q200 960 230 1000 Q250 900 280 990 Q300 940 330 1060 Z" fill="#ff8a3d" class="flicker"/><path d="M210 1060 Q230 1000 255 1020 Q275 980 300 1060Z" fill="#ffd36e" class="flicker" style="animation-delay:.4s"/>${Art.glow(255, 980, 260, '', 0.9, 'glowpulse')}</g>`;
      else s += `<g opacity=".6"><circle cx="230" cy="1050" r="10" fill="#3a1a10"/><circle cx="270" cy="1052" r="8" fill="#4a2010"/><circle cx="252" cy="1048" r="5" fill="#a83a1a" class="glowpulse"/></g>`;
      // haak
      if (!G.has('haak') && !f('haakTaken')) s += `<g><path d="M430 700 L470 700" stroke="#4a4f60" stroke-width="6"/><path d="M462 700 L462 760 Q462 790 440 786 Q424 782 428 764" stroke="#5c6070" stroke-width="8" fill="none" stroke-linecap="round"/></g>`;
      // bol op plank
      if (!f('bolTaken')) s += `<g transform="translate(236 392)"><circle r="30" fill="url(#g-glass)" stroke="#bfe3ff" stroke-width="2"/><rect x="-10" y="-40" width="20" height="12" rx="3" fill="#8a5a34"/><path d="M-16 -8 Q-12 -20 0 -22" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/></g>`;
      // brief
      if (!f('letterTaken')) s += `<g transform="translate(500 892) rotate(-6)"><path d="M-26 -14 L26 -16 L28 6 L-24 8 Z" fill="#f3e3bf" stroke="#b48a4e" stroke-width="2"/><circle cx="18" cy="2" r="5" fill="#c63d3d"/>${Art.glow(0, -4, 60, '', 0.6, 'glowpulse')}</g>`;
      // kattenmand
      s += `<g><ellipse cx="260" cy="1205" rx="100" ry="34" fill="#8a6a3a"/><ellipse cx="260" cy="1192" rx="88" ry="24" fill="#a8844a"/><ellipse cx="260" cy="1192" rx="72" ry="16" fill="#c65a5a"/><path d="M180 1200 Q260 1250 340 1200" stroke="#6a4a2a" stroke-width="3" fill="none"/>
        <text x="260" y="1236" text-anchor="middle" font-size="18" fill="#3a2414" font-family="Fraunces, serif" font-style="italic">Spinsel</text></g>`;
      // kist
      const open = f('chestOpen');
      s += `<g transform="translate(790 1110)">${Art.shadow(0, 8, 110, 18)}
        <rect x="-90" y="-80" width="180" height="88" rx="8" fill="url(#g-wood)"/><path d="M-90 -40 L90 -40" stroke="#3a2416" stroke-width="6"/>
        ${open ? '<path d="M-90 -80 L-80 -150 L80 -150 L90 -80 Z" fill="#5e3b22"/><rect x="-80" y="-84" width="160" height="10" fill="#1a0e08"/>' : '<path d="M-92 -80 Q0 -120 92 -80 Z" fill="#6b4528"/>'}
        <rect x="-12" y="-62" width="24" height="26" rx="4" fill="url(#g-gold)"/><circle cx="0" cy="-50" r="4" fill="#3a2416"/>
        <path d="M-90 -76 L-90 6 M90 -76 L90 6" stroke="url(#g-gold)" stroke-width="6"/></g>`;
      return s;
    },
    hotspots(G) {
      const f = (k) => G.flag(k);
      return [
        { id: 'raam', name: 'Raam', x: 410, y: 210, w: 300, h: 300, walk: [560, 1170], tap: async (G) => {
          if (!f('ringsDone')) await M('Daar, midden in het meer: de Maantoren. Zonder licht! Zo heb ik hem nog nooit gezien. En de nevel kruipt steeds dichterbij.');
          else await M('De toren staat daar nog steeds, wachtend op mijn keuze.');
        } },
        { id: 'brief', name: 'Brief', hidden: f('letterTaken'), x: 450, y: 850, w: 110, h: 80, walk: [510, 1170], tap: async (G) => {
          await G.reach(); G.set('letterTaken'); G.give('brief');
          await M('Een brief, met Oma\'s rode zegel. Voor mij!');
          await readLetter(G); G.set('letterRead');
        } },
        { id: 'mand', name: 'Kattenmand', x: 160, y: 1150, w: 200, h: 100, walk: [330, 1260], tap: async (G) => {
          if (f('keyFound')) { await M('Spinsels mand. Spinsel zelf is nergens te bekennen. Die is vast met Oma mee.'); return; }
          if (!f('letterRead')) { await M('De mand van Spinsel, Oma\'s kat. Leeg en koud. Waar is iedereen?'); return; }
          await G.reach(); G.set('keyFound'); G.give('sleutel'); G.done('sleutel');
          await M('Onder het kussen… ja! Een koperen sleuteltje. Het ruikt een beetje naar kat.');
        } },
        { id: 'kist', name: 'Oma\'s kist', x: 690, y: 960, w: 200, h: 160, walk: [760, 1190], tap: async (G) => {
          if (f('chestOpen')) { await M('De kist is leeg, op wat zaagsel na.'); return; }
          await M('Oma\'s houten kist. Op slot. Daar heb ik een sleutel voor nodig.');
        }, use: { sleutel: async (G) => {
          A.sfx('unlock'); G.take('sleutel'); G.set('chestOpen'); G.refresh(); await G.wait(400);
          G.give('muziekdoos', true); G.give('blaaspijp', true); G.give('portret', true); A.sfx('pickup');
          G.toast('3 voorwerpen gevonden');
          await M('Klik! In de kist liggen Oma\'s <b>muziekdoosje</b>, haar oude <b>blaaspijp</b>… en een oud <b>portretje</b> van twee kinderen.');
          await M('Ik neem alles mee. Misschien speel ik het muziekdoosje eens af — tik er twee keer op in mijn rugzak.');
        } } },
        { id: 'plank', name: 'Glazen bol', hidden: f('bolTaken'), x: 196, y: 340, w: 80, h: 90, walk: [260, 1160], tap: async (G) => {
          await G.reach(); G.set('bolTaken'); G.give('bol');
          await M('Een lege glazen bol. Die heb ik zelf geblazen, toen ik klein was. Hij is een beetje scheef. Oma heeft hem toch bewaard.');
        } },
        { id: 'flessen', name: 'Flessen', x: 40, y: 340, w: 150, h: 100, walk: [200, 1160], look: 'Oma\'s gekleurde flessen. Als het kaarslicht erop valt, maken ze kleine regenbogen.' },
        { id: 'haak', name: 'IJzeren haak', hidden: G.has('haak') || f('haakTaken'), x: 418, y: 680, w: 70, h: 120, walk: [420, 1160], tap: async (G) => {
          await G.reach(); G.set('haakTaken'); G.give('haak');
          await M('Oma\'s ijzeren haak. Daar hing ze de ketel mee boven het vuur. Ik neem hem mee. Je weet maar nooit.');
        } },
        { id: 'oven', name: 'Glasoven', x: 160, y: 800, w: 190, h: 270, walk: [260, 1170], tap: async (G) => {
          if (!f('ovenLit')) { await M(f('sabethTruth') ? 'De oven is koud. Voor glas moet hij gloeiend heet zijn. Wat brandt er zonder op te branden…?' : 'Oma\'s glasoven. Koud. Dat heb ik nog nooit meegemaakt.'); return; }
          if (G.has('maanglas') || f('maanglasPlaced')) { await M('De vuurbloem brandt nog vrolijk. Het Maanglas is klaar.'); return; }
          if (!G.has('sterrenzand')) { await M('De oven gloeit! Nu heb ik nog goed zand nodig voor het glas. Het zand bij het meer glinstert als sterren…'); return; }
          await M('Oven heet, sterrenzand bij de hand. Kies het sterrenzand en gebruik het op de oven.');
        }, use: {
          vuurbloem: async (G) => {
            G.take('vuurbloem'); G.set('ovenLit'); A.sfx('fire'); G.refresh();
            await M('Ik leg de vuurbloem in de oven. Fwoesj! Het vuur springt op, warm en goudgeel. Net als vroeger.');
            G.task('glas', 'Blaas een nieuw glas: Maanglas.');
          },
          sterrenzand: async (G) => {
            if (!f('ovenLit')) { await M('De oven is koud. Zand smelt niet in een koude oven.'); return; }
            if (!G.has('blaaspijp')) { await M('Ik heb Oma\'s blaaspijp nodig.'); return; }
            await M('Nu moet het goed gaan. Ik doe het precies zoals Oma het me leerde.');
            const ok = await P.glass(G);
            if (ok) {
              G.take('sterrenzand'); G.give('maanglas'); G.done('glas'); G.kind(0);
              await M('Mijn eigen Maanglas. Er dansen sterretjes in. Oma zou trots zijn… hoop ik.');
              if (G.flag('kwastJoined')) await K('Niet slecht, voor iemand zonder snavel.');
            } else await M('Even op adem komen. Ik probeer het straks opnieuw.');
          },
        } },
        { id: 'deur', name: 'Naar buiten', exit: 'right', to: 'dorp', x: 870, y: 620, w: 110, h: 500, walk: [900, 1220] },
      ];
    },
    async enter(G, first) {
      if (first) {
        await G.wait(500);
        await M('Brr… wat is het koud. Oma? De oven is uit. Oma laat de oven nóóit uitgaan.');
        await M('En buiten… het is zo donker. De Maanlantaarn brandt niet!');
        await M('Ik moet uitzoeken wat er aan de hand is. <em>(Tik op dingen om ze te bekijken. Tik op de grond om te lopen.)</em>');
        G.task('oma', 'Vind Oma Brem.');
        G.task('brief', 'Kijk rond in Oma\'s werkplaats.');
        document.querySelector('#hud-reveal').classList.add('pulse');
        setTimeout(() => document.querySelector('#hud-reveal').classList.remove('pulse'), 6000);
      }
    },
  });

  /* ==========================================================
     2. HET DORPSPLEIN
     ========================================================== */
  G.register('dorp', {
    name: 'Het dorpsplein', tint: '#3a3a78', music: 'village', ambience: 'wind', fx: 'motes',
    walk: { y0: 1120, y1: 1420, x0: 70, x1: 930, s0: 0.82, s1: 1.04 },
    entries: { werkplaats: [140, 1300], bos: [500, 1140], brug: [880, 1280], default: [500, 1300] },
    bg(G) {
      let cob = ''; const r = Art.rng(77);
      for (let i = 0; i < 160; i++) { const y = 1080 + r() * 420, x = r() * 1000, s = 12 + (y - 1080) * 0.06; cob += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(s * 1.4).toFixed(1)}" ry="${(s * 0.55).toFixed(1)}" fill="${r() > 0.5 ? '#3d4258' : '#353a4e'}"/>`; }
      const house = (x, y, w, h, roof, wall, win) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${wall}"/><path d="M${x - 20} ${y} L${x + w / 2} ${y - h * 0.55} L${x + w + 20} ${y} Z" fill="${roof}"/>${win ? `<rect x="${x + w * 0.3}" y="${y + h * 0.3}" width="${w * 0.4}" height="${h * 0.3}" rx="6" fill="#ffcf7a"/>${Art.glow(x + w / 2, y + h * 0.45, w * 0.7, '', 0.55)}` : ''}</g>`;
      return `
        ${Art.sky('dp-sky', ['#0a1230', '#23306a', '#5a4a8a', '#c07a7a'])}
        ${Art.stars(90, 11, 600)}
        ${Art.moon(780, 220, 46, false)}
        ${Art.ridge(720, 60, 5, '#2a2f5a', { steps: 6 })}
        <path d="M900 690 L906 600 L912 590 L918 600 L924 690 Z" fill="#141a38"/>
        ${Art.mist(700, 90, 0.6, 'drift', 8)}
        ${Art.ridge(800, 40, 9, '#1d2246', { steps: 9 })}
        ${[120, 220, 780, 880].map((x, i) => Art.pine(x, 820, 160 + i * 20, '#141a36')).join('')}
        ${house(600, 640, 160, 200, '#3a2a4a', '#4a4060', true)}
        ${house(770, 600, 200, 260, '#2e2440', '#3e3654', true)}
        ${house(360, 660, 120, 160, '#3a2a4a', '#4a4462', false)}
        <!-- bakkerij -->
        <rect x="0" y="560" width="330" height="560" fill="#7a5a4a"/>
        <path d="M-30 560 L165 380 L360 560 Z" fill="#8a3a2e"/><path d="M-30 560 L165 380 L360 560" fill="none" stroke="#5e241c" stroke-width="10"/>
        <rect x="230" y="420" width="50" height="110" fill="#5e3e30"/>
        <g class="sway-slow"><rect x="70" y="600" width="190" height="60" rx="10" fill="#5e3b22"/><text x="165" y="642" text-anchor="middle" font-family="Fraunces, serif" font-weight="800" font-size="34" fill="#ffd9a0">Bakkerij</text></g>
        <rect x="100" y="760" width="170" height="160" rx="10" fill="#2a1a10"/>
        <path d="M30 1120 L30 900 Q30 860 70 860 L70 1120 Z" fill="#3a2416"/>
        <!-- pad naar het bos -->
        <path d="M430 820 Q500 780 570 820 L620 1100 L380 1100 Z" fill="#2c3048"/>
        <rect x="0" y="1080" width="1000" height="420" fill="#2c3046"/>
        ${cob}
        <path d="M380 1100 Q500 1060 620 1100" fill="#3a3e58"/>
        <!-- prikbord -->
        <g><path d="M640 1100 L640 900 M760 1100 L760 900" stroke="#4a2f1c" stroke-width="12"/><rect x="620" y="860" width="160" height="120" rx="6" fill="#6b4528"/>
        <rect x="634" y="874" width="60" height="70" fill="#f3e3bf" transform="rotate(-4 664 909)"/><rect x="704" y="880" width="62" height="54" fill="#e8d8f0" transform="rotate(5 735 907)"/><rect x="660" y="944" width="70" height="28" fill="#f3e3bf"/>
        <circle cx="664" cy="878" r="4" fill="#c63d3d"/><circle cx="735" cy="884" r="4" fill="#3d7ac6"/></g>
        <!-- wegwijzer -->
        <g><rect x="852" y="880" width="16" height="260" fill="#5e3b22"/>
        <path d="M860 920 L960 920 L985 945 L960 970 L860 970 Z" fill="#8a5a34"/><text x="912" y="954" text-anchor="middle" font-size="22" font-family="Nunito" font-weight="800" fill="#2a1a10">Brug</text>
        <path d="M860 990 L760 990 L740 1015 L760 1040 L860 1040 Z" fill="#7a4e2c"/><text x="805" y="1024" text-anchor="middle" font-size="20" font-family="Nunito" font-weight="800" fill="#2a1a10">Bos</text></g>
        <!-- put -->
        <g>${Art.shadow(470, 1170, 140, 26)}
          <path d="M370 1050 L370 1160 Q470 1196 570 1160 L570 1050 Z" fill="url(#g-stone)"/>
          <ellipse cx="470" cy="1050" rx="100" ry="28" fill="#6a7088"/><ellipse cx="470" cy="1050" rx="80" ry="20" fill="#0a0c16"/>
          <path d="M380 1080 Q470 1110 560 1080 M376 1120 Q470 1150 564 1120" stroke="#3d4254" stroke-width="3" fill="none"/>
          <path d="M386 1050 L386 900 M554 1050 L554 900" stroke="#4a2f1c" stroke-width="12"/>
          <path d="M360 910 L470 850 L580 910 Z" fill="#5a2a2a"/><path d="M386 930 L554 930" stroke="#4a2f1c" stroke-width="8"/>
          <path d="M470 930 L470 990" stroke="#c9a46a" stroke-width="3"/><path d="M455 990 L485 990 L480 1015 L460 1015 Z" fill="#6b4528"/>
        </g>
      `;
    },
    props(G) {
      let s = '';
      // Hanna in het raam
      s += `<g><rect x="100" y="760" width="170" height="160" rx="10" fill="#ffcf7a" opacity=".9"/>${Art.glow(185, 840, 200, '', 0.6)}<g transform="translate(185 932) scale(.72)">${Art.hanna()}</g>
        <path d="M100 760 L270 760 L270 920 L100 920 Z" fill="none" stroke="#3a2416" stroke-width="10"/><path d="M185 760 L185 840" stroke="#3a2416" stroke-width="6"/>
        <rect x="88" y="912" width="194" height="20" rx="4" fill="#5e3b22"/>${!G.flag('gotBread') ? '<g transform="translate(240 900) scale(.7)"><path d="M-30 0 Q-32 -24 0 -26 Q32 -24 30 0 Z" fill="#d99a52"/></g>' : ''}</g>`;
      // Kwast op de wegwijzer (of nog niet ontmoet: alleen)
      s += `<g transform="translate(870 880) scale(${G.flag('kwastJoined') ? 0 : 1})">${Art.kwast()}</g>`;
      if (G.flag('kwastJoined')) s += kwastPerch(G, 870, 880);
      return s;
    },
    hotspots(G) {
      const f = (k) => G.flag(k);
      const list = [
        { id: 'hanna', name: 'Bakker Hanna', x: 100, y: 760, w: 170, h: 170, walk: [250, 1180], tap: async (G) => hannaTalk(G) },
        { id: 'put', name: 'Put', x: 370, y: 960, w: 200, h: 200, walk: [470, 1220], tap: async (G) => {
          if (f('medaillonFound')) { await M('Een diepe, koude put. Ik heb eruit gevist wat erin hoorde te liggen.'); return; }
          await M(f('sabethMet') ? 'Diep beneden glinstert iets groens. Is dat… Sabeths medaillon? Ik kan er niet bij met mijn handen.' : 'De dorpsput. Heel diep. Er glinstert iets op de bodem, maar ik kan er niet bij.');
        }, use: {
          werphaak: async (G) => {
            A.sfx('splash'); await G.wait(600);
            G.set('medaillonFound'); G.give('medaillon');
            await M('Ik laat de werphaak zakken… beetje naar links… hebbes! Een gouden medaillon met een groen blaadje.');
            if (f('sabethMet')) await M('Dit moet het medaillon van Sabeth zijn.'); else G.task('medaillon', 'Zoek uit van wie het groene medaillon is.');
          },
          touw: async (G) => { await M('Met alleen een touw vis ik niks op. Er moet iets kroms aan.'); },
          haak: async (G) => { await M('De haak is te kort. Als ik er nou een touw aan had…'); },
          '*': async (G, it) => { await M('Dat gooi ik er niet in. Dan ben ik dat ook kwijt.'); },
        } },
        { id: 'prikbord', name: 'Prikbord', x: 620, y: 860, w: 160, h: 120, walk: [700, 1170], tap: async (G) => {
          await M('<b>“KWIJT: de weg naar de Paddenstoelenholte. Gevonden? Graag terugbrengen.”</b>');
          await M('<b>“De brug is dicht wegens TROL. Niet voeren!”</b> …er staat iemand bij gekrabbeld: <em>“of juist wel?”</em>');
          await M('En een tekening van de lantaarn. Eronder staat: <b>“Waarom vergeet ik steeds dingen?”</b> Wie heeft dat geschreven?');
        } },
        { id: 'bos', name: 'Naar het Fluisterbos', exit: 'up', to: 'bos', x: 410, y: 800, w: 180, h: 200, walk: [500, 1130] },
        { id: 'huis', name: 'Naar de werkplaats', exit: 'left', to: 'werkplaats', x: 0, y: 1180, w: 110, h: 220, walk: [80, 1300] },
        { id: 'brug', name: 'Naar de brug', exit: 'right', to: 'brug', x: 900, y: 1160, w: 100, h: 240, walk: [930, 1290] },
      ];
      if (!f('kwastJoined')) list.push({ id: 'kraai', name: 'Kraai', x: 820, y: 780, w: 110, h: 110, walk: [800, 1180], tap: async (G) => meetKwast(G) });
      else list.push(kwastHot(G, 870, 880));
      return list;
    },
    async enter(G, first) {
      if (first) {
        await M('Het plein is stil. Alleen bij de bakkerij brandt nog licht.');
        A.sfx('crow');
      }
    },
  });

  async function meetKwast(G) {
    A.sfx('crow');
    await K('Kraaa! Eindelijk. Ik zit hier al sinds middernacht te wachten. Mijn veren zijn helemaal klam.');
    await M('Kwast! Oma\'s kraai! Weet jij waar Oma is?');
    await K('Natuurlijk weet ik dat. Ik weet alles. Ze is naar de toren gevlogen. Nou ja, gevlogen… geroeid. Mensen kunnen niet vliegen. Zielig, hoor.');
    const r = await G.choose([
      { text: 'Waarom is de lantaarn uit, Kwast?', value: 'why' },
      { text: 'Ga je met me mee?', value: 'join' },
    ]);
    if (r === 'why') {
      await K('Dat mag ik niet zeggen. Ze heeft het me laten beloven. Met een kraaltje erbij. Een blauwe.');
      await K('Maar ze zei wel: <em>“Als Mira komt, help haar dan.”</em> Dus. Hier ben ik. Hulpvaardig en beeldschoon.');
    } else {
      await K('Mee? Ik? Met een mens, door de nevel? …Ja, goed. Oma zou het willen. En jij verdwaalt anders binnen vijf minuten.');
    }
    G.set('kwastJoined'); G.kind(0); G.refresh();
    await K('Weet je niet wat je moet doen? Druk dan op mijn veer bovenin. 🪶 Dan help ik je. Gratis. Nou ja, een kraaltje mag altijd.');
    G.done('brief');
    G.task('stenen', 'Volg het slaapliedje naar de stenen in het Fluisterbos.');
  }

  async function hannaTalk(G) {
    const f = (k) => G.flag(k);
    if (!f('metHanna')) {
      G.set('metHanna');
      await say('hanna', 'Hé, goedenavond, meisje! Jij bent toch… eh… het kleinkind van Brem. Ach, hoe heet je ook alweer? Ik weet het bijna.');
      await M('Mira, Hanna. Je kent me al sinds ik een baby was.');
      await say('hanna', 'Mira! Natuurlijk. Mira. Sorry, liefje. Ik vergeet de laatste tijd zoveel. Vanmorgen wist ik niet meer of ik al gebakken had. Nu heb ik twéé ovens vol!');
      if (!G.has('brood') && !f('brokkelFed')) {
        await say('hanna', 'Hier, neem een brood mee. Karwij en honing. Je ziet eruit alsof je een lange nacht voor je hebt.');
        G.give('brood'); G.set('gotBread');
      }
      return;
    }
    const opts = [
      { text: 'Weet jij waarom de lantaarn uit is?', value: 'lamp' },
      { text: 'Mag ik nog een brood?', value: 'brood', if: !G.has('brood') && !f('brokkelFed') },
      { text: 'Ken jij iemand die met A begint? Een vriend van Oma, van vroeger?', value: 'a', if: f('sawPortrait') },
      { text: 'Tot ziens, Hanna.', value: 'bye' },
    ];
    const r = await G.choose(opts, 'hanna', 'Ach, Mira! Nog iets, liefje?');
    if (r === 'lamp') await say('hanna', 'Ik weet het niet, kind. Maar het gekke is… vannacht kan ik juist beter nadenken. Alsof er een raampje open staat in mijn hoofd. Raar, hè?');
    else if (r === 'brood') { await say('hanna', 'Natuurlijk! Ik heb er nog zat. Ik wist niet meer dat ik al gebakken had.'); G.give('brood'); G.set('gotBread'); }
    else if (r === 'a') await say('hanna', 'A…? Er was iets, ja. Een jongen die altijd bij de toren speelde. Maar als ik eraan denk, glipt het weg. Net als een droom als je wakker wordt.');
  }

  /* ==========================================================
     3. HET FLUISTERBOS
     ========================================================== */
  const STONE_POS = [[230, 1010, 0.85], [360, 950, 0.75], [500, 930, 0.7], [640, 950, 0.75], [770, 1010, 0.85]];
  G.register('bos', {
    name: 'Het Fluisterbos', tint: '#1d4a3c', music: 'forest', ambience: 'forest', fx: 'fireflies',
    walk: { y0: 1120, y1: 1420, x0: 90, x1: 910, s0: 0.82, s1: 1.04 },
    entries: { dorp: [500, 1380], default: [500, 1360] },
    bg(G) {
      return `
        ${Art.sky('fb-sky', ['#04121a', '#0b2a33', '#164040', '#1d4a3c'])}
        ${Art.stars(40, 21, 400, 0.6)}
        ${[60, 200, 330, 680, 820, 940].map((x, i) => Art.pine(x, 900, 500 + (i % 3) * 80, '#0a2026')).join('')}
        ${Art.mist(820, 120, 0.5, 'drift-2', 31)}
        ${[120, 280, 720, 880].map((x, i) => Art.pine(x, 1000, 400 + (i % 2) * 120, '#0d2a2c')).join('')}
        <!-- maanstraal -->
        <path d="M380 0 L620 0 L820 1150 L180 1150 Z" fill="#cfe8ff" opacity=".08"/>
        <path d="M440 0 L560 0 L700 1150 L300 1150 Z" fill="#cfe8ff" opacity=".07"/>
        <rect x="0" y="1060" width="1000" height="440" fill="#173a2e"/>
        ${Art.ridge(1080, 20, 41, '#1d4636', { steps: 8 })}
        <ellipse cx="500" cy="1050" rx="380" ry="90" fill="#2a5a44"/>
        <ellipse cx="500" cy="1040" rx="320" ry="64" fill="#36704f" opacity=".7"/>
        ${Art.grass(1080, 1480, 160, 51, '#2f6a4a', 34)}
        ${Art.flowers(1120, 1460, 40, 61, ['#cfe3ff', '#ffd1e8', '#fff1a8'])}
        <!-- grote stammen voorgrond -->
        <path d="M-40 1500 L-40 0 L110 0 Q80 400 120 900 Q140 1300 70 1500 Z" fill="#0b1c1a"/>
        <path d="M1040 1500 L1040 0 L900 0 Q930 500 880 1000 Q870 1300 940 1500 Z" fill="#0b1c1a"/>
        <path d="M60 1360 Q140 1300 200 1380 Q130 1400 60 1360Z M880 1340 Q820 1300 760 1370 Q840 1390 880 1340Z" fill="#0b1c1a"/>
        <!-- oude stronk -->
        <g><path d="M760 1150 L770 1040 Q820 1020 870 1040 L880 1150 Z" fill="#3a2a1c"/><ellipse cx="820" cy="1040" rx="52" ry="16" fill="#5e4430"/><ellipse cx="820" cy="1040" rx="36" ry="10" fill="none" stroke="#3a2a1c" stroke-width="3"/>
        <path d="M770 1150 Q740 1160 730 1150 M880 1150 Q910 1160 920 1150" stroke="#3a2a1c" stroke-width="10" stroke-linecap="round"/></g>
      `;
    },
    props(G) {
      const f = (k) => G.flag(k);
      let s = '';
      // stenen
      A.STONES.forEach((st, i) => {
        const [x, y, sc] = STONE_POS[i];
        s += `<g transform="translate(${x} ${y}) scale(${sc})">${Art.shadow(0, 4, 70, 14)}
          <path d="M-48 0 Q-58 -140 -20 -200 Q10 -214 36 -190 Q60 -120 50 0 Z" fill="url(#g-stone)"/>
          <path d="M-30 -170 Q-10 -200 20 -186" stroke="#a8b0c4" stroke-width="5" fill="none" opacity=".5"/>
          <path d="M-48 0 Q-20 -40 -50 -70 Z" fill="url(#g-moss)" opacity=".8"/>
          ${f('stonesDone') ? Art.glow(0, -100, 130, 'blue', 0.7, 'glowpulse') : ''}
          <text x="0" y="-90" text-anchor="middle" font-size="64" fill="${st.color}" opacity="${f('stonesDone') ? 1 : 0.35}">${st.sym}</text></g>`;
      });
      if (f('stonesDone') && !G.has('stemvork') && !f('forkTaken')) s += `<g transform="translate(500 900)"><g class="bob">${Art.glow(0, 0, 100, 'blue', 0.9)}<path d="M-12 -30 L-12 0 Q-12 12 0 12 Q12 12 12 0 L12 -30 M0 12 L0 36" stroke="#eef4ff" stroke-width="7" fill="none" stroke-linecap="round"/></g></g>`;
      // vuurvliegjes
      if (!f('gotLamp')) s += `<g>${Art.fireflies(14, 71, [740, 860, 180, 160])}</g>`;
      // braamstruik met vos
      s += `<g transform="translate(190 1170)">`;
      s += `<g fill="#1f3a26">${[[-80, -40, 60], [-20, -80, 70], [50, -50, 64], [90, -20, 50], [-50, 0, 60], [20, -10, 66]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${f('sluipFree') ? r * 0.85 : r}"/>`).join('')}</g>`;
      if (!f('sluipFree')) s += `<g transform="translate(40 30) scale(-.85 .85)">${Art.sluip()}</g>`;
      s += `
        <g stroke="#4a2a2a" stroke-width="4" fill="none">${f('sluipFree') ? '<path d="M-80 -20 Q-40 -60 0 -30 M10 -60 Q50 -90 90 -40"/>' : '<path d="M-110 -10 Q-40 -120 40 -60 Q80 -30 120 -60 M-90 -60 Q0 -10 100 -90 M-60 10 Q0 -60 80 10"/>'}</g>
        <g fill="#7a1a3a">${[[-60, -60], [0, -100], [60, -70], [-20, -20], [80, -30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/>`).join('')}</g></g>`;
      s += kwastPerch(G, 820, 1036, true);
      return s;
    },
    hotspots(G) {
      const f = (k) => G.flag(k);
      const list = [
        { id: 'stenen', name: 'Zingende Stenen', x: 170, y: 800, w: 660, h: 220, walk: [500, 1140], tap: async (G) => {
          if (f('stonesDone')) { await say('stenen', '<em>…slaap, kleine vonk, de nacht is lang…</em>'); await M('Ze neuriën nog steeds. Zachtjes.'); return; }
          if (!G.state.seen.stonesIntro) {
            G.state.seen.stonesIntro = true;
            await M('Vijf oude stenen in een halve kring. Er staan tekens op: een maan, een ster, een blad, een golf en een vlam.');
            await say('stenen', '<em>Wie… wekt ons? Wij zingen alleen het lied dat wij kennen. Het lied van Brem.</em>');
            if (!G.has('muziekdoos') && !f('boxGiven')) { await M('Het lied van Oma… haar slaapliedje? Dat zit in haar muziekdoosje. Maar dat ligt nog thuis.'); return; }
          }
          const ok = await P.stones(G);
          if (ok) {
            G.set('stonesDone'); G.done('stenen'); G.refresh();
            A.sfx('magic');
            await say('stenen', '<em>Slaap, kleine vonk, de nacht is lang… Brem\'s lied. Brem\'s kind. Neem wat zij voor jou heeft achtergelaten.</em>');
            await M('Kijk! Boven de middelste steen zweeft iets zilverigs.');
          }
        } },
        { id: 'vork', name: 'Zilveren stemvork', hidden: !f('stonesDone') || G.has('stemvork') || f('forkTaken'), x: 440, y: 830, w: 120, h: 140, walk: [500, 1140], tap: async (G) => {
          await G.reach(); G.set('forkTaken'); G.give('stemvork'); A.sfx('note', 81);
          await M('Een zilveren stemvork. Hij zoemt in mijn hand. Er staat een torentje op. De Maantoren!');
          G.task('toren', 'Ga naar de Maantoren in het meer.');
          await K('Een stemvork? Kun je die opeten? Nee? Jammer.');
        } },
        { id: 'stronk', name: 'Vuurvliegjes', hidden: f('gotLamp'), x: 730, y: 850, w: 200, h: 200, walk: [760, 1180], tap: async (G) => {
          await M('Honderden vuurvliegjes dansen boven de oude boomstronk. Als kleine vonkjes. Kon ik ze maar ergens in meenemen…');
        }, use: { bol: async (G) => {
          await M('Willen jullie met me mee? Het wordt donker waar ik heen ga. Ik zorg goed voor jullie, beloofd.');
          A.sfx('magic'); await G.wait(500);
          G.take('bol'); G.give('lamp'); G.set('gotLamp'); G.refresh();
          await M('Ze vliegen zomaar naar binnen! Een levend lampje. Dank jullie wel.');
        } } },
        { id: 'braam', name: f('sluipFree') ? 'Braamstruik' : 'Vos in de braamstruik', x: 70, y: 1040, w: 240, h: 160, walk: [330, 1220], tap: async (G) => {
          if (f('sluipFree')) { await M('Een lege braamstruik. Er hangen nog wat blauwige plukjes vacht aan de doorns.'); return; }
          if (!G.state.seen.foxIntro) {
            G.state.seen.foxIntro = true;
            await M('Er zit iets in de braamstruik! Een vos… maar hij is lichtblauw, en je kunt er een beetje doorheen kijken. Alsof hij van nevel is.');
            await say('sluip', 'Kaii… niet aankomen, mensenkind. De doorns hebben mijn staart. Hoe meer ik trek, hoe vaster ik zit.');
            await K('Laat hem lekker zitten, Mira. Vossen eten kraaien. Dat weet iedereen.');
            const r = await G.choose([
              { text: 'Ik help je, vosje. Even stilzitten.', value: 'help' },
              { text: 'Kwast heeft gelijk. Sorry, vos.', value: 'leave' },
            ]);
            if (r === 'leave') { G.choice('vos', 'Je liet de nevelvos eerst in de braamstruik zitten.'); await say('sluip', 'Iedereen loopt maar voorbij. Iedereen vergeet me altijd…'); await M('<em>(Misschien kom ik later terug.)</em>'); return; }
          }
          await M('Die doorns prikken te erg. Ik heb iets nodig om de takken weg te trekken. Iets kroms, van ijzer.');
        }, use: {
          haak: async (G) => freeSluip(G),
          werphaak: async (G) => freeSluip(G),
        } },
        { id: 'terug', name: 'Terug naar het plein', exit: 'down', to: 'dorp', x: 380, y: 1400, w: 240, h: 100, walk: [500, 1420] },
      ];
      const kh = kwastHot(G, 820, 1036); if (kh) list.push(kh);
      return list;
    },
    async enter(G, first) {
      if (first) {
        await M('Het Fluisterbos. Overdag ruist het hier. Maar \'s nachts fluistert het echt. Ik versta alleen nooit wat.');
        if (G.flag('kwastJoined')) await K('Zie je die stenen? Oma kwam hier vaak. Dan zong ze voor ze. Mensen zijn raar.');
      }
    },
  });


  async function freeSluip(G) {
    await M('Stilzitten… ik trek de takken weg met de haak… voorzichtig…'); A.sfx('whoosh');
    G.set('sluipFree'); G.kind(1); G.choice('vosvrij', 'Je bevrijdde Sluip, de nevelvos, uit de braamstruik.'); G.refresh();
    await say('sluip', 'Vrij! Mijn staart! Ik ben Sluip. Ik ben gemaakt van nevel, maar ik ben geen nevel. Snap je?');
    await M('Een beetje?');
    await say('sluip', 'Dit vergeet ik nooit, Mira. Vossen onthouden altijd wie hen hielp. Ga je naar de toren? Dan zie je me daar.');
    A.sfx('whoosh');
    await K('…Hij heeft mij niet eens opgegeten. Ik ben bijna beledigd.');
  }

  /* ==========================================================
     4. DE BRUG VAN BROKKEL
     ========================================================== */
  G.register('brug', {
    name: 'De Brokkelbrug', tint: '#5a3a6a', music: 'bridge', ambience: 'river', fx: 'motes',
    walk: { y0: 1140, y1: 1420, x0: 70, x1: 930, s0: 0.84, s1: 1.04 },
    entries: { dorp: [120, 1300], holte: [860, 1200], default: [200, 1300] },
    clamp(x, y, G) { // zonder doorgang blokkeert de trol de brug
      if (!G.flag('bridgePassed') && x > 520) x = 520;
      return [x, y];
    },
    bg(G) {
      const r = Art.rng(131);
      // rotslagen in een klifwand: schuine strepen en losse brokken
      const strata = (x0, x1, y0, y1, seed, dir) => {
        const q = Art.rng(seed); let s = '';
        for (let y = y0; y < y1; y += 34 + q() * 30) {
          const tilt = dir * (8 + q() * 14);
          s += `<path d="M${x0} ${y.toFixed(0)} Q${((x0 + x1) / 2).toFixed(0)} ${(y + tilt).toFixed(0)} ${x1} ${(y + tilt * 0.4).toFixed(0)}" stroke="#141224" stroke-width="${(2 + q() * 3).toFixed(1)}" opacity="${(0.35 + q() * 0.3).toFixed(2)}" fill="none"/>`;
        }
        for (let i = 0; i < 9; i++) { const x = x0 + q() * (x1 - x0), y = y0 + q() * (y1 - y0); s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l${(18 + q() * 30).toFixed(0)} ${(-6 - q() * 10).toFixed(0)} l${(10 + q() * 16).toFixed(0)} ${(14 + q() * 12).toFixed(0)} z" fill="#a8a0c8" opacity=".14"/>`; }
        return s;
      };
      // de stenen van de boog: wigvormige blokken langs de onderkant
      let vous = '';
      // dezelfde bochten als de brugpaden hieronder (kwadratische Bézier)
      const qb = (a, c, b, t) => (1 - t) * (1 - t) * a + 2 * t * (1 - t) * c + t * t * b;
      const archX = (t) => qb(300, 505, 710, t), archY = (t) => qb(1150, 1010, 1150, t);
      const deckX = (t) => qb(240, 500, 770, t), deckY = (t) => qb(1080, 900, 1070, t);
      for (let i = 0; i < 15; i++) {
        const t0 = i / 15, t1 = (i + 1) / 15;
        const a = [archX(t0), archY(t0)], b = [archX(t1), archY(t1)];
        // wig: van de onderkant van de boog loodrecht naar buiten
        const nx = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy); return [dy / l * 34, -dx / l * 34]; };
        const n = nx(a, b);
        vous += `<path d="M${a[0].toFixed(0)} ${a[1].toFixed(0)} L${b[0].toFixed(0)} ${b[1].toFixed(0)} L${(b[0] + n[0]).toFixed(0)} ${(b[1] + n[1]).toFixed(0)} L${(a[0] + n[0]).toFixed(0)} ${(a[1] + n[1]).toFixed(0)} Z" fill="${['#8a8fa8', '#7d8299', '#93988f'][i % 3]}" stroke="#2a2a3c" stroke-width="3"/>`;
      }
      // borstwering (blokken bovenop de brug)
      let wall = '';
      for (let i = 0; i < 12; i++) {
        const t = (i + 0.5) / 12, x = deckX(t), y = deckY(t);
        wall += `<rect x="${(x - 20).toFixed(0)}" y="${(y - 38).toFixed(0)}" width="40" height="42" rx="5" fill="${i % 2 ? '#8b90a6' : '#80859c'}" stroke="#2a2a3c" stroke-width="3"/><rect x="${(x - 20).toFixed(0)}" y="${(y - 38).toFixed(0)}" width="40" height="42" rx="5" fill="url(#g-shade)"/>`;
      }
      // klimop die van de brug hangt
      let ivy = '';
      [0.08, 0.22, 0.75, 0.9].map((t) => [archX(t), archY(t) - 4]).forEach(([x, y], k) => {
        const len = 60 + r() * 70;
        ivy += `<path d="M${x} ${y} q${(r() - 0.5) * 20} ${len / 2} ${(r() - 0.5) * 14} ${len}" stroke="#2f5a3a" stroke-width="3" fill="none"/>`;
        for (let j = 0; j < 6; j++) ivy += `<ellipse cx="${(x + (r() - 0.5) * 14).toFixed(0)}" cy="${(y + j * len / 6).toFixed(0)}" rx="7" ry="4.5" fill="${j % 2 ? '#4f8a52' : '#3d7044'}" transform="rotate(${(r() * 60 - 30).toFixed(0)} ${(x).toFixed(0)} ${(y + j * len / 6).toFixed(0)})"/>`;
      });
      return `
        <defs>
          <linearGradient id="br-cliff-l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4568"/><stop offset=".55" stop-color="#2e2a46"/><stop offset="1" stop-color="#16142a"/></linearGradient>
          <linearGradient id="br-cliff-r" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3658"/><stop offset=".5" stop-color="#26223c"/><stop offset="1" stop-color="#121022"/></linearGradient>
          <linearGradient id="br-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6ff" stop-opacity=".95"/><stop offset=".35" stop-color="#8fb8ea" stop-opacity=".85"/><stop offset="1" stop-color="#4a6aa8" stop-opacity=".55"/></linearGradient>
          <linearGradient id="br-water-side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1a2244" stop-opacity=".7"/><stop offset=".2" stop-color="#1a2244" stop-opacity="0"/><stop offset=".8" stop-color="#1a2244" stop-opacity="0"/><stop offset="1" stop-color="#1a2244" stop-opacity=".7"/></linearGradient>
          <linearGradient id="br-gorge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1834" stop-opacity="0"/><stop offset="1" stop-color="#06050e"/></linearGradient>
          <radialGradient id="br-spray" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#e8f2ff" stop-opacity=".75"/><stop offset=".5" stop-color="#b8cff0" stop-opacity=".3"/><stop offset="1" stop-color="#9ab4e0" stop-opacity="0"/></radialGradient>
          <clipPath id="br-fall"><path d="M438 548 Q500 538 566 548 L600 1500 L404 1500 Z"/></clipPath>
        </defs>
        ${Art.sky('br-sky', ['#0a0c24', '#221f50', '#4a3a6e', '#7a5a78'])}
        ${Art.stars(80, 31, 520)}
        ${Art.moon(220, 220, 40, false)}
        <!-- verre bergen in de nevel -->
        ${Art.ridge(560, 70, 13, '#2c2a56', { steps: 6, peaky: true })}
        ${Art.mist(600, 90, 0.7, 'drift', 35)}
        ${Art.ridge(620, 40, 17, '#24224a', { steps: 8 })}
        <!-- de kloof: achterwand -->
        <path d="M330 600 Q500 560 680 590 L680 1500 L330 1500 Z" fill="#1a1834"/>
        <path d="M330 600 Q500 560 680 590 L680 1500 L330 1500 Z" fill="url(#br-gorge)"/>
        <!-- maanboog in de nevel van de waterval -->
        <path d="M360 1010 Q500 760 640 1010" stroke="#ffd8f0" stroke-width="10" fill="none" opacity=".10"/>
        <path d="M372 1012 Q500 784 628 1012" stroke="#d8f0ff" stroke-width="10" fill="none" opacity=".10"/>
        <path d="M384 1014 Q500 808 616 1014" stroke="#e8ffd8" stroke-width="8" fill="none" opacity=".08"/>
        <!-- de waterval -->
        <path d="M438 548 Q500 538 566 548 L600 1500 L404 1500 Z" fill="url(#br-water)"/>
        <g clip-path="url(#br-fall)" fill="none" stroke-linecap="round">
          ${Array.from({ length: 14 }, (_, i) => { const x = 440 + i * 9.5 + (i % 3) * 2, w = 2 + (i % 4); const dash = 60 + (i % 4) * 25, gap = 90 + (i % 3) * 40;
            return `<path class="fall-flow" style="--d:-${dash + gap}px;animation-delay:-${(i * 0.37).toFixed(2)}s;animation-duration:${(0.7 + (i % 5) * 0.12).toFixed(2)}s" d="M${x} 540 L${(x + (x - 502) * 0.18).toFixed(0)} 1500" stroke="#f4faff" stroke-width="${w}" stroke-opacity="${(0.35 + (i % 3) * 0.15).toFixed(2)}" stroke-dasharray="${dash} ${gap}"/>`; }).join('')}
        </g>
        <path d="M438 548 Q500 538 566 548 L600 1500 L404 1500 Z" fill="url(#br-water-side)"/>
        <!-- schuimrand bovenaan -->
        <path d="M430 552 Q452 532 476 550 Q500 530 526 550 Q550 532 574 552" stroke="#ffffff" stroke-width="10" fill="none" opacity=".85" stroke-linecap="round"/>
        <ellipse cx="502" cy="548" rx="80" ry="14" fill="url(#br-spray)"/>
        <!-- klif links -->
        <path d="M0 620 Q120 600 250 630 Q330 650 360 700 Q390 820 370 960 Q350 1100 380 1500 L0 1500 Z" fill="url(#br-cliff-l)"/>
        ${strata(0, 370, 680, 1480, 141, 1)}
        <path d="M0 620 Q120 600 250 630 Q330 650 360 700 Q300 680 230 668 Q120 650 0 660 Z" fill="#4f7a4a" opacity=".85"/>
        <path d="M360 700 Q390 820 370 960" stroke="#a8b4e0" stroke-width="4" fill="none" opacity=".25"/>
        <!-- klif rechts -->
        <path d="M1000 580 Q880 570 760 600 Q680 630 650 690 Q620 820 640 960 Q660 1100 630 1500 L1000 1500 Z" fill="url(#br-cliff-r)"/>
        ${strata(640, 1000, 650, 1480, 151, -1)}
        <path d="M1000 580 Q880 570 760 600 Q680 630 650 690 Q720 660 800 642 Q900 626 1000 632 Z" fill="#46703f" opacity=".8"/>
        ${Art.pine(80, 650, 230, '#151330')}${Art.pine(190, 640, 180, '#151330')}${Art.pine(290, 660, 140, '#1a1838')}
        ${Art.pine(900, 610, 260, '#151330')}${Art.pine(790, 620, 200, '#151330')}${Art.pine(710, 650, 130, '#1a1838')}
        <!-- nevel in de kloof, onder de brug -->
        <ellipse cx="500" cy="1250" rx="230" ry="110" fill="url(#br-spray)" class="glowpulse"/>
        ${Art.mist(1180, 150, 0.95, 'drift', 33)}
        <!-- de stenen boogbrug -->
        <g>
          <path d="M240 1080 Q500 900 770 1070 L770 1150 L710 1150 Q505 1010 300 1150 L240 1150 Z" fill="#6a6f86"/>
          <path d="M240 1080 Q500 900 770 1070 L770 1150 L710 1150 Q505 1010 300 1150 L240 1150 Z" fill="url(#g-shade)"/>
          ${vous}
          <path d="M300 1150 Q505 1010 710 1150" stroke="#1a1a2a" stroke-width="5" fill="none"/>
          <path d="M240 1080 Q500 900 770 1070" stroke="#a8aec4" stroke-width="7" fill="none"/>
          ${wall}
          <path d="M${deckX(0.02).toFixed(0)} ${(deckY(0.02) - 38).toFixed(0)} Q500 ${(900 - 38).toFixed(0)} ${deckX(0.98).toFixed(0)} ${(deckY(0.98) - 38).toFixed(0)}" stroke="#c8cee4" stroke-width="3" fill="none" opacity=".45"/>
          <g fill="#5a8a4e" opacity=".9">${[0.12, 0.5, 0.86].map((t, k) => `<ellipse cx="${deckX(t).toFixed(0)}" cy="${(deckY(t) - 38).toFixed(0)}" rx="${[24, 30, 20][k]}" ry="7"/>`).join('')}</g>
          ${ivy}
          <!-- pijlers in de klif -->
          <path d="M230 1150 L230 1240 L310 1240 L300 1150 Z M780 1150 L780 1230 L700 1230 L710 1150 Z" fill="#5a5f76" stroke="#2a2a3c" stroke-width="3"/>
        </g>
        <!-- grond aan deze kant -->
        <path d="M0 1120 Q300 1100 520 1150 L520 1500 L0 1500 Z" fill="#2a3040"/>
        <path d="M480 1150 Q700 1110 1000 1140 L1000 1500 L480 1500 Z" fill="#283040"/>
        <path d="M0 1150 L1000 1150 L1000 1500 L0 1500 Z" fill="#30364a"/>
        <path d="M0 1150 L1000 1150 L1000 1500 L0 1500 Z" fill="url(#g-shade)" opacity=".6"/>
        ${Art.grass(1150, 1480, 90, 81, '#3a4a4a', 24)}
        ${Art.flowers(1170, 1450, 18, 83, ['#cfe3ff', '#ffd1e8'])}
        <path d="M500 1150 L520 1500 M540 1160 L700 1500" stroke="#262a3c" stroke-width="4"/>
        <!-- bordje -->
        <g transform="translate(140 1150)"><rect x="-6" y="-120" width="12" height="120" fill="#4a2f1c"/><rect x="-70" y="-160" width="140" height="56" rx="6" fill="#7a4e2c" transform="rotate(-5)"/><rect x="-70" y="-160" width="140" height="56" rx="6" fill="url(#g-shade)" transform="rotate(-5)"/><text x="0" y="-122" text-anchor="middle" font-size="26" font-family="Fraunces" font-weight="800" fill="#2a1a10" transform="rotate(-5)">TOL!</text></g>
      `;
    },
    props(G) {
      const f = (k) => G.flag(k);
      let s = '';
      const mood = f('brokkelFriend') ? 'happy' : '';
      if (f('bridgePassed')) s += `<g transform="translate(830 1140) scale(.62)">${Art.brokkel(mood)}</g>`;
      else s += `<g transform="translate(680 1250) scale(.78)">${Art.brokkel(mood)}</g>`;
      s += kwastPerch(G, 140, 1004, false);
      return s;
    },
    hotspots(G) {
      const f = (k) => G.flag(k);
      const bx = f('bridgePassed') ? [720, 880, 220, 260] : [540, 980, 300, 300];
      const list = [
        { id: 'brokkel', name: 'Brokkel de trol', x: bx[0], y: bx[1], w: bx[2], h: bx[3], walk: f('bridgePassed') ? [700, 1220] : [470, 1260], tap: (G) => brokkelTalk(G), use: {
          brood: async (G) => brokkelFeed(G),
          '*': async (G, it) => { await say('brokkel', 'Wat moet Brokkel daarmee? Brokkel eet geen ' + G.items[it].name.toLowerCase() + '. Brokkel eet… eigenlijk eet Brokkel al heel lang niks.'); },
        } },
        { id: 'water', name: 'Waterval', x: 420, y: 540, w: 170, h: 380, walk: false, look: 'Het water valt heel diep naar beneden. Je hoort het pas na een tijdje plonzen. In de nevel hangt een zwakke regenboog van maanlicht.' },
        { id: 'bord', name: 'Bordje', x: 70, y: 990, w: 140, h: 80, walk: [160, 1220], look: 'TOL! staat erop, in grote, scheve letters. Iemand heeft er een klein bloemetje naast getekend.' },
        { id: 'dorp', name: 'Terug naar het plein', exit: 'left', to: 'dorp', x: 0, y: 1180, w: 100, h: 220, walk: [60, 1300] },
      ];
      if (f('bridgePassed')) list.push({ id: 'over', name: 'Over de brug', exit: 'right', to: 'holte', x: 880, y: 1150, w: 120, h: 240, walk: [920, 1240] });
      const kh = kwastHot(G, 140, 1004); if (kh) list.push(kh);
      return list;
    },
    async enter(G, first) {
      if (first) {
        A.sfx('rumble');
        await say('brokkel', 'HALT! Wie wil er over de brug van BROKKEL? Niemand mag erover zonder TOL te betalen!');
        await K('O nee. Een trol. Die ruiken naar natte kelder. En ze praten heel HARD.');
      }
    },
  });

  async function brokkelTalk(G) {
    const f = (k) => G.flag(k);
    if (f('bridgePassed')) {
      if (f('brokkelFriend')) {
        await say('brokkel', 'Mira-vriendin! Brokkel past nu op de brug voor jou. Niemand mag erover als jij het niet wilt. Behalve konijnen. Konijnen zijn lief.');
        if (!G.state.voices.includes('brokkel')) { await brokkelVoice(G); }
        return;
      }
      const r = await G.choose([
        { text: 'Brokkel… waarom ben je hier eigenlijk helemaal alleen?', value: 'why' },
        { text: 'Het spijt me dat ik onaardig deed.', value: 'sorry', if: f('brokkelRude') && !f('brokkelSorry') },
        { text: 'Tot later, Brokkel.', value: 'bye' },
      ], 'brokkel', 'Hmpf. Jij weer.');
      if (r === 'why') {
        await say('brokkel', 'Vroeger kwamen hier elke dag mensen. Ze betaalden met een raadsel of een koekje. Brokkel kende ze allemaal.');
        await say('brokkel', 'Toen werd de nevel dikker. Mensen vergaten de weg. Ze vergaten de brug. Ze vergaten… Brokkel.');
        if (!f('brokkelFed')) await M('<em>(Hij kijkt hongerig naar mijn tas. Hanna bakt heerlijk brood…)</em>');
      } else if (r === 'sorry') {
        G.set('brokkelSorry'); G.kind(1);
        await say('brokkel', 'Oh. Hm. Niemand zegt ooit sorry tegen Brokkel. Brokkel weet niet wat hij moet zeggen. Brokkel zegt: …is goed.');
      }
      return;
    }
    const r = await G.choose([
      { text: 'Hoeveel tol moet ik betalen?', value: 'toll', seen: G.state.seen.askedToll },
      { text: 'Ik daag je uit voor een raadselwedstrijd!', value: 'riddle' },
      { text: 'Hier, Brokkel. Ik heb brood voor je meegenomen.', value: 'bread', if: G.has('brood') },
      { text: 'Ga opzij, steenklomp. Ik heb haast.', value: 'rude', if: !f('brokkelRude') },
      { text: 'Laat maar.', value: 'bye' },
    ], 'brokkel', 'Tol! Brokkel wil TOL!');
    if (r === 'toll') {
      G.state.seen.askedToll = true;
      await say('brokkel', 'Tol is: drie raadsels goed raden. Dat is de wet. Die wet heeft Brokkels moeder gemaakt.');
      await say('brokkel', 'Of… iets lekkers. Dat staat niet in de wet. Maar dat vindt Brokkel ook goed.');
    } else if (r === 'riddle') {
      await say('brokkel', 'HAH! Een wedstrijd! Brokkel kent wel duizend raadsels. Nou ja. Twaalf. Let op!');
      const ok = await P.riddles(G);
      if (ok) {
        G.set('bridgePassed'); G.set('brokkelBeaten'); G.choice('brug', 'Je versloeg Brokkel met raadsels.'); G.refresh();
        await say('brokkel', 'Grmbl. Drie goed. Dat is de wet. Brokkel gaat opzij. Maar Brokkel vindt het niet leuk.');
        await M('Bedankt, Brokkel. Het waren mooie raadsels.');
        await say('brokkel', '…Vond je? Hm. Mama maakte ze.');
        await G.runChapter(2);
      } else await say('brokkel', 'Opgeven? Hoho! Kom maar terug als je slimmer bent.');
    } else if (r === 'bread') {
      await brokkelFeed(G);
    } else if (r === 'rude') {
      G.set('brokkelRude'); G.kind(-1); G.choice('brokrude', 'Je noemde Brokkel een steenklomp.');
      A.sfx('rumble');
      await say('brokkel', 'STEENKLOMP?! Brokkel is een TROL. Een brúgtrol! Jij mag er alleen over als je drie raadsels raadt!');
      await K('Nou, dat ging goed.');
    }
  }
  async function brokkelFeed(G) {
    G.take('brood'); G.set('brokkelFed'); G.set('brokkelFriend'); G.kind(2);
    G.choice('brood', 'Je gaf Brokkel het brood van bakker Hanna.');
    await say('brokkel', 'Voor… Brokkel? Brood? Écht brood, met van die zaadjes?');
    A.sfx('heart');
    await say('brokkel', '<em>*knars knars knars*</em> …Niemand heeft ooit iets voor Brokkel meegenomen. Nooit. Niet in honderd jaar.');
    await say('brokkel', 'Jij mag over de brug. Altijd. Jij bent nu Brokkels vriendin. Dat is de nieuwe wet.');
    const wasPassed = G.flag('bridgePassed');
    G.set('bridgePassed'); G.refresh();
    await brokkelVoice(G);
    if (!wasPassed) await G.runChapter(2);
  }
  async function brokkelVoice(G) {
    if (!G.flag('sabethTruth') && !G.flag('knowsSong')) {
      await say('brokkel', 'Heb je ooit iemand nodig die héél laag kan zingen? Brokkel zingt als een berg die snurkt.');
      G.set('brokkelOffered');
      G.addVoice('brokkel');
      return;
    }
    await say('brokkel', 'Een lied? Voor de lantaarn? Brokkel zingt mee. Brokkel zingt als een berg die snurkt.');
    G.addVoice('brokkel');
  }

  /* ==========================================================
     5. DE PADDENSTOELENHOLTE
     ========================================================== */
  G.register('holte', {
    name: 'De Paddenstoelenholte', tint: '#3a2a5a', music: 'hollow', ambience: 'hollow', fx: 'spores',
    walk: { y0: 1150, y1: 1420, x0: 80, x1: 920, s0: 0.84, s1: 1.04 },
    entries: { brug: [130, 1300], veer: [860, 1360], default: [500, 1320] },
    bg(G) {
      const mush = (x, y, h, cap, glowK, cls) => `<g class="${cls || 'sway-slow'}"><path d="M${x - h * 0.08} ${y} Q${x - h * 0.05} ${y - h * 0.5} ${x - h * 0.1} ${y - h * 0.8} L${x + h * 0.1} ${y - h * 0.8} Q${x + h * 0.05} ${y - h * 0.5} ${x + h * 0.08} ${y} Z" fill="#e8dccb"/><path d="M${x - h * 0.45} ${y - h * 0.78} Q${x} ${y - h * 1.25} ${x + h * 0.45} ${y - h * 0.78} Q${x} ${y - h * 0.7} ${x - h * 0.45} ${y - h * 0.78} Z" fill="${cap}"/>${Art.glow(x, y - h * 0.85, h * 0.7, glowK, 0.6, 'glowpulse')}</g>`;
      return `
        ${Art.sky('ph-sky', ['#120a26', '#2a1648', '#3a2a5a', '#2a3a4a'])}
        ${Art.stars(50, 41, 400, 0.7)}
        ${Art.ridge(700, 40, 17, '#1d1838', { steps: 8 })}
        ${mush(120, 900, 360, '#5ac8b0', 'green')}${mush(880, 860, 420, '#c86ab0', 'pink')}${mush(760, 920, 220, '#7fe0c8', 'green')}
        ${Art.mist(940, 100, 0.45, 'drift-2', 43)}
        <!-- huis van Sabeth: een reuzenpaddenstoel -->
        <g>
          <path d="M380 1120 Q370 900 400 760 L600 760 Q630 900 620 1120 Z" fill="#e8dccb"/>
          <path d="M380 1120 Q370 900 400 760 L430 760 Q410 900 420 1120 Z" fill="#c9bca8"/>
          <path d="M240 790 Q300 520 500 500 Q700 520 760 790 Q500 730 240 790 Z" fill="#c2453a"/>
          <path d="M240 790 Q500 730 760 790 Q500 770 240 790Z" fill="#8a2a24"/>
          <g fill="#fbe9d8"><ellipse cx="360" cy="660" rx="34" ry="22"/><ellipse cx="500" cy="580" rx="44" ry="26"/><ellipse cx="640" cy="650" rx="30" ry="20"/><ellipse cx="440" cy="720" rx="20" ry="12"/><ellipse cx="580" cy="720" rx="22" ry="13"/></g>
          <path d="M455 1120 L455 990 Q455 940 500 940 Q545 940 545 990 L545 1120 Z" fill="#5e3b22"/><circle cx="532" cy="1040" r="6" fill="url(#g-gold)"/>
          <circle cx="430" cy="860" r="28" fill="#ffd890"/><circle cx="430" cy="860" r="28" fill="none" stroke="#5e3b22" stroke-width="6"/><path d="M402 860 L458 860 M430 832 L430 888" stroke="#5e3b22" stroke-width="4"/>
          <circle cx="575" cy="870" r="22" fill="#ffd890"/><circle cx="575" cy="870" r="22" fill="none" stroke="#5e3b22" stroke-width="5"/>
          ${Art.glow(500, 880, 220, '', 0.4)}
          <path d="M560 760 Q600 700 640 760" stroke="#4a2f1c" stroke-width="4" fill="none"/>
        </g>
        <rect x="0" y="1110" width="1000" height="390" fill="#1f2a30"/>
        ${Art.ridge(1120, 18, 47, '#26343a', { steps: 10 })}
        ${Art.grass(1120, 1480, 110, 91, '#2f5a50', 26)}
        <!-- tuin met vuurbloemen -->
        <g><path d="M680 1170 Q800 1140 940 1170 L960 1260 Q800 1290 660 1260 Z" fill="#3a2a20"/>
        ${[700, 740, 790, 840, 890, 920].map((x, i) => `<g><path d="M${x} ${1240 - (i % 2) * 20} L${x} ${1190 - (i % 2) * 20}" stroke="#3e6b3a" stroke-width="4"/><path d="M${x} ${1192 - (i % 2) * 20} q-14 -6 -14 -22 q10 6 14 16 q4 -10 14 -16 q0 16 -14 22z" fill="#ff7a3d" class="flicker" style="animation-delay:${i * 0.3}s"/>${Art.glow(x, 1180 - (i % 2) * 20, 40, '', 0.6)}</g>`).join('')}
        </g>
        <!-- ketel -->
        <g transform="translate(230 1210)">${Art.shadow(0, 30, 110, 20)}
          <path d="M-60 30 L-80 50 M60 30 L80 50" stroke="#2a2a34" stroke-width="8"/>
          <path d="M-80 -40 Q-90 40 0 46 Q90 40 80 -40 Z" fill="#2a2a34"/>
          <ellipse cx="0" cy="-40" rx="82" ry="20" fill="#3a3a48"/><ellipse cx="0" cy="-40" rx="70" ry="14" fill="#5ac87a" class="glowpulse"/>
          ${Art.glow(0, -60, 140, 'green', 0.7, 'glowpulse')}
          <g fill="#c8ffd8" opacity=".7"><circle cx="-20" cy="-44" r="6" class="bob"/><circle cx="18" cy="-40" r="4" class="bob" style="animation-delay:1s"/></g>
          <path d="M-60 60 Q-30 40 0 60 Q30 40 60 60" stroke="#ff8a3d" stroke-width="10" fill="none" class="flicker"/>
        </g>
      `;
    },
    props(G) {
      let s = '';
      s += `<g transform="translate(665 1195) scale(.9)">${Art.sabeth()}</g>`;
      s += kwastPerch(G, 470, 798, true);
      return s;
    },
    hotspots(G) {
      const f = (k) => G.flag(k);
      const list = [
        { id: 'sabeth', name: 'Sabeth', x: 585, y: 860, w: 170, h: 340, walk: [520, 1260], tap: (G) => sabethTalk(G), use: {
          medaillon: async (G) => sabethMedaillon(G),
          nevelzicht: async (G) => { await say('sabeth', 'Bewaar dat maar voor iemand die het nodig heeft, kind. Ik kan al door de nevel kijken.'); },
          portret: async (G) => { await say('sabeth', 'Brem en… waar een jongen hoort te staan, zie ik een vlek. Dat heeft de nevel gedaan. Iemand is hier helemaal vergeten.'); G.set('sabethSawPortrait'); },
          '*': async (G, it) => { await say('sabeth', 'Hm. Een ' + G.items[it].name.toLowerCase() + '. Leuk. Nee, dank je.'); },
        } },
        { id: 'ketel', name: 'Sabeths ketel', x: 130, y: 1100, w: 200, h: 160, walk: [330, 1270], tap: async (G) => {
          if (!f('sabethMet')) { await M('Een borrelende ketel. Hij ruikt naar munt en onweer. Ik vraag eerst of ik hem mag gebruiken.'); return; }
          if (!f('brewAllowed')) { await say('sabeth', 'Handen af van mijn ketel, meisje. Eerst wil ik je kunnen vertrouwen.'); return; }
          if (G.has('nevelzicht') || f('teunCanSee')) { await M('Ik heb al Nevelzicht gebrouwen. De ketel pruttelt tevreden na.'); return; }
          const ok = await P.brew(G);
          if (ok) { G.give('nevelzicht'); G.done('brew'); await say('sabeth', 'Niet slecht. Helemaal niet slecht. Je hebt de handen van je oma.'); }
        } },
        { id: 'tuin', name: 'Vuurbloemen', x: 660, y: 1130, w: 300, h: 140, walk: [760, 1300], tap: async (G) => {
          if (G.has('vuurbloem') || f('ovenLit')) { await M('Ze branden vrolijk door, zonder op te branden.'); return; }
          if (!f('sabethTruth')) { await say('sabeth', 'Vuurbloemen. Ze branden, maar ze gaan nooit op. Niet plukken! Tenzij je een heel goede reden hebt.'); return; }
          await G.reach(); G.give('vuurbloem');
          await say('sabeth', 'Neem er maar een. Voor de oven van Brem. Een vuurbloem brandt een hele week.');
        } },
        { id: 'huis', name: 'Paddenstoelhuis', x: 300, y: 520, w: 400, h: 340, walk: [480, 1170], look: 'Sabeths huis is een paddenstoel zo groot als een molen. Uit de schoorsteen komt groene rook. Hij ruikt naar soep en geheimen.' },
        { id: 'brug', name: 'Terug naar de brug', exit: 'left', to: 'brug', x: 0, y: 1180, w: 100, h: 220, walk: [60, 1300] },
        { id: 'veer', name: 'Naar het meer', exit: 'down', to: 'veer', x: 780, y: 1360, w: 220, h: 140, walk: [880, 1400] },
      ];
      const kh = kwastHot(G, 470, 798); if (kh) list.push(kh);
      return list;
    },
    async enter(G, first) {
      if (first) {
        await M('Wauw. Alles geeft hier licht. De paddenstoelen, de bloemen… zelfs de lucht glinstert.');
        await K('Niet te diep ademhalen, Mira. Straks groeit er een paddenstoel op je hoofd.');
      }
    },
  });

  async function sabethTalk(G) {
    const f = (k) => G.flag(k);
    if (!f('sabethMet')) {
      G.set('sabethMet');
      await say('sabeth', 'Een kleinkind van Brem, bij míjn huis. Met een kraai. Wat een avond.');
      await M('Weet u waar mijn oma is? De lantaarn is uit, en ze is weg, en…');
      await say('sabeth', 'Ik weet veel. Ik weet alles over de nevel. Maar ik vertel niets aan iemand die ik niet ken.');
      await say('sabeth', 'Wil je dat ik je vertrouw? Help me dan eerst. Ik ben mijn medaillon kwijt. Groen, met een blaadje. Het viel ergens… maar ik weet niet meer waar.');
      if (G.has('medaillon')) { await M('Een groen medaillon met een blaadje? Dat heb ik hier!'); await sabethMedaillon(G); return; }
      G.task('medaillon', 'Vind Sabeths groene medaillon.');
      if (f('kwastJoined')) await K('Ik heb iets groens zien vallen. In een gat. Een diep gat. Op het plein. Ik zeg niks, hoor. Ik zeg het alleen maar.');
      return;
    }
    if (!f('medaillonBack')) {
      await say('sabeth', 'Geen medaillon, geen verhaal. Zo werkt dat.');
      return;
    }
    const opts = [
      { text: 'Vertel me nog eens over de lantaarn.', value: 'lamp' },
      { text: 'Hoe maak ik dat nieuwe glas?', value: 'glass' },
      { text: 'Sorry dat ik zei dat het jouw schuld was.', value: 'sorry', if: f('sabethAccused') && !f('sabethForgiven') },
      { text: 'Wil jij meezingen, als het zover is?', value: 'sing', if: !G.state.voices.includes('sabeth') && !f('sabethAccused') },
      { text: 'Wie is A.? Op Oma\'s portret staat een jongen…', value: 'a', if: f('sawPortrait') },
      { text: 'Dag Sabeth.', value: 'bye' },
    ];
    const r = await G.choose(opts, 'sabeth', 'Nog vragen, glasblazerskind?');
    if (r === 'lamp') {
      await say('sabeth', 'De lantaarn brandt niet op olie. Hij brandt op herinneringen. Elke nacht eet hij er één op. Een naam, een liedje of een gezicht.');
      await say('sabeth', 'En alles wat vergeten wordt, verandert in nevel. Snap je? De lantaarn maakt zelf de nevel die hij wegjaagt.');
    } else if (r === 'glass') {
      await say('sabeth', 'Brem wilde nieuw glas maken. Van sterrenzand, in haar eigen oven. Zulk glas brandt op een liedje, en niet op herinneringen.');
      await say('sabeth', 'Maar één stem is niet genoeg. Er moeten veel mensen meezingen.');
      G.set('knowsSong');
    } else if (r === 'sorry') {
      G.set('sabethForgiven'); G.kind(1);
      await say('sabeth', 'Hm. Je bent net zo eigenwijs als je oma. Maar je hebt ook haar goede hart. Het is al goed.');
      await say('sabeth', 'En heb je een stem nodig voor dat lied? Ik zing niet mooi. Maar ik zing wel.');
      G.addVoice('sabeth');
    } else if (r === 'sing') {
      await say('sabeth', 'Ik? Zingen? …Voor Brem. En voor mijn moeder. Ja.');
      G.addVoice('sabeth');
    } else if (r === 'a') {
      await say('sabeth', 'Als zelfs iemands gezicht is weggevaagd… dan heeft de lantaarn hem helemaal opgegeten. Vraag het aan iemand die heel oud is. Iemand die al heel lang heen en weer vaart.');
    }
  }
  async function sabethMedaillon(G) {
    G.take('medaillon'); G.set('medaillonBack'); G.done('medaillon');
    await say('sabeth', 'Mijn medaillon! Waar was het…? Nee, zeg maar niks. Ik vergeet het toch weer.');
    await say('sabeth', 'Hierin zit een schilderijtje van mijn moeder. Als ik mijn ogen dichtdoe, zie ik haar gezicht niet meer. Alleen nog hiermee.');
    await say('sabeth', 'Goed. Je hebt me geholpen. Nu vertel ik jou de waarheid. Ga maar zitten.');
    await say('sabeth', 'Ik heb je oma geholpen de lantaarn te doven.');
    await say('sabeth', 'De lantaarn brandt op herinneringen, Mira. Elke nacht eet hij er één op. En wat vergeten wordt, verandert in nevel. De lantaarn maakt dus zelf de nevel die hij wegjaagt.');
    await say('sabeth', 'Brem kwam erachter. Ze wilde het anders doen. Met nieuw glas, dat brandt op een liedje dat we samen zingen. Ze ging naar de toren om het te proberen. Ze is niet teruggekomen.');
    G.set('sabethTruth'); G.set('knowsSong'); G.set('brewAllowed');
    const r = await G.choose([
      { text: 'Ik geloof je. Je wilde haar helpen.', value: 'trust' },
      { text: 'Jij hebt het licht gedoofd! Door jou is ze weg!', value: 'accuse' },
    ]);
    if (r === 'trust') {
      G.kind(1); G.choice('sabeth', 'Je vertrouwde Sabeth toen ze de waarheid vertelde.');
      await say('sabeth', '…Dank je. Dat had ik niet verwacht.');
      await say('sabeth', 'Als je dat lied echt gaat zingen, zing ik mee. Ik zing niet mooi. Maar ik zing.');
      G.addVoice('sabeth');
    } else {
      G.kind(-1); G.set('sabethAccused'); G.choice('sabeth', 'Je gaf Sabeth de schuld van Oma\'s verdwijning.');
      await say('sabeth', 'Misschien heb je gelijk. Misschien ook niet. Ik ga geen ruzie met je maken, kind.');
    }
    await say('sabeth', 'Teun de veerman kan je naar de toren brengen. Maar hij ziet de weg niet meer door de nevel. Maak een drankje <b>Nevelzicht</b> in mijn ketel. Het recept hangt ernaast.');
    await say('sabeth', 'Wil je dat nieuwe glas blazen? Dan heb je <b>sterrenzand</b> van het strandje nodig. En een <b>vuurbloem</b> uit mijn tuin, voor de koude oven van Brem. Neem maar een bloem.');
    G.task('brew', 'Maak het drankje Nevelzicht in Sabeths ketel.');
    G.task('glas', 'Blaas een nieuw glas: Maanglas. (Sterrenzand, vuurbloem, Oma\'s oven)');
    G.task('stemmen', 'Verzamel stemmen voor het nieuwe lied (minstens 3).');
  }

  /* ==========================================================
     6. HET VEER AAN HET NEVELMEER
     ========================================================== */
  G.register('veer', {
    name: 'Het Nevelmeer', tint: '#2a3a6a', music: 'lake', ambience: 'lake', fx: 'sparkle',
    walk: { y0: 1160, y1: 1420, x0: 80, x1: 760, s0: 0.84, s1: 1.04 },
    entries: { holte: [180, 1300], toren: [660, 1220], eiland: [660, 1220], default: [300, 1320] },
    bg(G) {
      let refl = '';
      for (let i = 0; i < 18; i++) refl += `<rect x="${430 + Math.sin(i) * 30}" y="${900 + i * 14}" width="${60 + (i % 3) * 30}" height="4" rx="2" fill="#dfe8ff" opacity="${0.35 - i * 0.015}" class="ripple" style="animation-delay:${i * 0.2}s"/>`;
      return `
        ${Art.sky('vm-sky', ['#070d22', '#16224a', '#2a3a6a', '#4a5a8a'])}
        ${Art.stars(110, 51, 700)}
        ${Art.moon(480, 200, 54, true)}
        ${Art.ridge(820, 30, 23, '#1a2244', { steps: 6 })}
        <!-- de Maantoren op het eiland -->
        <g><path d="M380 880 Q500 840 620 880 L620 900 L380 900 Z" fill="#141a34"/>
          <path d="M470 880 L478 520 L522 520 L530 880 Z" fill="#10152c"/>
          <path d="M460 530 L540 530 L530 490 L470 490 Z" fill="#141a34"/><path d="M466 490 L500 430 L534 490 Z" fill="#10152c"/>
          <rect x="482" y="495" width="36" height="30" fill="#232c50"/>
          ${G.flag('ending') === 'oud' ? Art.glow(500, 510, 200, '', 1) : ''}
        </g>
        <rect x="0" y="880" width="1000" height="620" fill="#1a2650"/>
        <rect x="0" y="880" width="1000" height="620" fill="url(#vm-water)"/>
        <defs><linearGradient id="vm-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3a70"/><stop offset="1" stop-color="#0c142e"/></linearGradient></defs>
        ${refl}
        ${Art.mist(930, 140, 0.85, 'drift', 53)}${Art.mist(1040, 120, 0.6, 'drift-2', 57)}
        <!-- oever links -->
        <path d="M0 1120 Q200 1100 330 1160 Q420 1220 400 1500 L0 1500 Z" fill="#3a3a48"/>
        <path d="M0 1180 Q160 1170 300 1230 Q360 1300 340 1500 L0 1500 Z" fill="#c9b48a" opacity=".35"/>
        <!-- steiger -->
        <path d="M260 1500 L420 1140 L860 1140 L860 1190 L460 1190 L360 1500 Z" fill="#5e3b22"/>
        ${[440, 520, 600, 680, 760, 840].map((x) => `<line x1="${x}" y1="1140" x2="${x - 10}" y2="1190" stroke="#3a2416" stroke-width="3"/>`).join('')}
        <path d="M420 1190 L420 1260 M600 1190 L600 1250 M840 1190 L840 1250" stroke="#3a2416" stroke-width="14"/>
        <rect x="355" y="1150" width="30" height="80" rx="8" fill="#4a2f1c"/>
        ${Art.grass(1120, 1300, 40, 101, '#4a5a4a', 30)}
      `;
    },
    props(G) {
      const f = (k) => G.flag(k);
      let s = '';
      // sterrenzand
      if (!G.has('sterrenzand') && !f('sandTaken')) s += `<g>${Art.fireflies(0, 1, [0, 0, 0, 0])}${[[110, 1300], [160, 1340], [80, 1360], [200, 1290], [140, 1390]].map(([x, y], i) => `<path d="M${x} ${y - 7} l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff6c0" class="twinkle" style="animation-delay:${i * 0.5}s"/>`).join('')}${Art.glow(140, 1340, 110, 'blue', 0.45, 'glowpulse')}</g>`;
      // touw op de meerpaal
      if (!G.has('touw') && !f('ropeTaken') && !G.has('werphaak')) s += `<g><ellipse cx="370" cy="1170" rx="30" ry="12" fill="none" stroke="#c9a46a" stroke-width="7"/><ellipse cx="370" cy="1182" rx="28" ry="11" fill="none" stroke="#b8935a" stroke-width="7"/></g>`;
      // boot
      s += `<g transform="translate(780 1240)"><g class="bob"><path d="M-170 -40 Q-160 30 0 34 Q160 30 190 -50 Z" fill="#6b4528"/><path d="M-170 -40 L190 -50 L180 -34 L-160 -26 Z" fill="#8a5a34"/>
        <path d="M150 -50 L150 -170" stroke="#4a2f1c" stroke-width="6"/><path d="M150 -170 Q170 -168 172 -150" stroke="#4a2f1c" stroke-width="4" fill="none"/>
        ${f('teunCanSee') ? `<g transform="translate(172 -130)"><circle r="22" fill="url(#g-glass)"/>${Art.glow(0, 0, 90, '', 0.9, 'glowpulse')}</g>` : '<g transform="translate(172 -130)"><circle r="18" fill="#2a3048" stroke="#6a6f86" stroke-width="3"/></g>'}</g></g>`;
      // Teun
      s += `<g transform="translate(620 1170) scale(.86)">${Art.teun()}</g>`;
      s += kwastPerch(G, 370, 1150, false);
      return s;
    },
    hotspots(G) {
      const f = (k) => G.flag(k);
      const list = [
        { id: 'teun', name: 'Teun de veerman', x: 560, y: 880, w: 140, h: 300, walk: [520, 1230], tap: (G) => teunTalk(G), use: {
          nevelzicht: async (G) => teunPotion(G),
          muziekdoos: async (G) => { if (!f('teunCanSee')) { await say('teun', 'Mooi deuntje. Maar ik zie nog steeds geen hand voor ogen.'); return; } await teunPay(G, 'box'); },
          portret: async (G) => { if (!f('teunCanSee')) { await say('teun', 'Ik zie niks, kind. Alles is grijs.'); return; } await teunPay(G, 'portret'); },
          '*': async (G, it) => { await say('teun', 'Wat moet een oude veerman met een ' + G.items[it].name.toLowerCase() + '? Ik wil een herinnering, geen rommel.'); },
        } },
        { id: 'zand', name: 'Glinsterend zand', hidden: G.has('sterrenzand') || f('sandTaken'), x: 40, y: 1260, w: 220, h: 160, walk: [230, 1340], tap: async (G) => {
          await G.reach(); G.set('sandTaken'); G.give('sterrenzand');
          await M('Sterrenzand! Elk korreltje glinstert als een sterretje. Oma zei altijd: van dit zand blaas je het mooiste glas. Ik doe een handje in mijn zakdoek.');
        } },
        { id: 'touw', name: 'Touw', hidden: G.has('touw') || f('ropeTaken') || G.has('werphaak'), x: 330, y: 1140, w: 90, h: 70, walk: [380, 1250], tap: async (G) => {
          if (f('teunMet')) await say('teun', 'Neem dat touw maar mee. Ik heb er nog tien. Of twaalf. Ik weet het niet meer.');
          else await M('Een rol touw op de meerpaal. Ik vraag het later wel aan de veerman. Dat mag vast.');
          await G.reach(); G.set('ropeTaken'); G.give('touw');
        } },
        { id: 'boot', name: 'Teuns boot', x: 600, y: 1080, w: 380, h: 200, walk: [700, 1220], tap: async (G) => {
          if (!f('ferryPaid')) { await say('teun', 'Ho ho, niet zomaar in mijn boot klimmen! Eerst praten.'); return; }
          await ferryRide(G);
        } },
        { id: 'toren', name: 'De Maantoren', x: 440, y: 420, w: 120, h: 470, walk: false, look: 'De Maantoren, midden in het meer. Zonder licht lijkt hij net een vinger die naar de sterren wijst. Waar ben je, Oma?' },
        { id: 'holte', name: 'Terug naar de holte', exit: 'left', to: 'holte', x: 0, y: 1120, w: 110, h: 160, walk: [100, 1220] },
      ];
      const kh = kwastHot(G, 370, 1150); if (kh) list.push(kh);
      return list;
    },
    async enter(G, first) {
      if (first) await G.runChapter(3);
      if (first) {
        await M('Het Nevelmeer. De mist hangt zo laag, het lijkt wel of het water ademt.');
        await K('Ik vind water niks. Water is gewoon nat. Veel te nat.');
      }
    },
  });

  async function teunTalk(G) {
    const f = (k) => G.flag(k);
    if (!f('teunMet')) {
      G.set('teunMet');
      await say('teun', 'Ahoi… wie is daar? Mijn ogen zijn niet meer zo goed. Of het komt door de nevel. Alles is grijs, kind.');
      await M('Ik ben Mira, de kleindochter van Brem. Ik moet naar de toren!');
      await say('teun', 'Brem… Brem. Die heb ik gisteren nog naar de toren gebracht. Of was het vorige week? Ze zei dat ik moest wachten op een meisje met rood haar.');
      await say('teun', 'Maar ik kan niet varen als ik de weg niet zie. Dan vaar ik zó tegen de rotsen.');
      G.task('teun', 'Help Teun door de nevel te kijken.');
      return;
    }
    if (!f('teunCanSee')) { await say('teun', 'Kon ik maar door die nevel heen kijken… Sabeth weet daar alles van. Die met haar paddenstoelhoed.'); return; }
    if (!f('ferryPaid')) { await teunPay(G); return; }
    const opts = [
      { text: 'Laten we gaan varen, Teun.', value: 'go' },
      { text: 'Het spijt me dat ik je bedreigde.', value: 'sorry', if: f('teunThreat') && !G.state.voices.includes('teun') },
      { text: 'Zing je mee, als het zover is? Het lied voor de lantaarn?', value: 'sing', if: !G.state.voices.includes('teun') && !f('teunThreat') },
      { text: 'Nog niet, Teun.', value: 'bye' },
    ];
    const r = await G.choose(opts, 'teun', 'Klaar om te varen, kind?');
    if (r === 'go') await ferryRide(G);
    else if (r === 'sorry') { G.kind(1); await say('teun', 'Ach. Iedereen is bang, vannacht. Vertel me dan maar iets moois over Brem. Dan is het weer goed.'); await teunMemory(G); }
    else if (r === 'sing') { await say('teun', 'Ik ken maar één liedje: mijn roeiliedje. Dat zing ik al vijftig jaar. Ja, ik zing mee.'); G.addVoice('teun'); }
  }
  async function ferryRide(G) {
    if (!G.flag('islandVisited')) {
      await say('teun', 'Instappen dan. Hou je kraai goed vast.');
      A.sfx('splash'); await G.goto('eiland', 'veer'); return;
    }
    const r = await G.choose([
      { text: 'Naar de Maantoren!', value: 'toren', if: G.has('zeekaart') },
      { text: 'Naar het Eiland van Vergeten Dingen.', value: 'eiland' },
      { text: 'Nog niet.', value: 'no' },
    ], 'teun', G.has('zeekaart') ? 'Waar naartoe, kind?' : 'Zonder kaart kom ik niet bij de toren. Zullen we naar het eiland?');
    if (r === 'no') return;
    A.sfx('splash'); await G.goto(r, 'veer');
  }
  async function teunPotion(G) {
    if (G.flag('teunCanSee')) { await M('Teun kan al door de nevel kijken.'); return; }
    G.take('nevelzicht'); G.set('teunCanSee'); G.done('teun'); A.sfx('magic'); G.refresh();
    await say('teun', 'Wat is dit? Het ruikt naar regen en sterren… <em>*slurp*</em>');
    await say('teun', 'Wel heb je ooit! Ik zie het water weer. En de rotsen. En de toren! Ik zie alles!');
    await say('teun', 'Ik breng je met de boot, Mira. Maar een veerman vaart nooit voor niets. Dat is de regel.');
    await teunPay(G);
  }
  async function teunPay(G, pre) {
    if (G.flag('ferryPaid')) return;
    await say('teun', 'Ik wil geen geld. Wat moet ik met geld? Ik wil een herinnering. Ik vergeet de mijne zo snel. Vertel me iets moois, iets om te onthouden.');
    let r = pre;
    if (!r) r = await G.choose([
      { text: 'Ik vertel je een herinnering aan Oma.', value: 'memory' },
      { text: 'Neem Oma\'s muziekdoosje maar. Daar zit een heel liedje in.', value: 'box', if: G.has('muziekdoos') },
      { text: 'Laat me in die boot, oude man. Oma\'s leven staat op het spel!', value: 'threat' },
    ]);
    if (r === 'memory' || r === 'portret') {
      await teunMemory(G, r === 'portret');
    } else if (r === 'box') {
      G.take('muziekdoos'); G.set('boxGiven'); G.set('heardSong'); G.kind(1); G.choice('veer', 'Je gaf Teun Oma\'s muziekdoosje als veergeld.');
      A.sfx('musicbox', A.LULLABY.easy);
      await say('teun', 'Ach… dit liedje. Brem zong het altijd op de boot, toen we klein waren. Dank je, kind. Dit vergeet ik niet. Ik laat het elke avond spelen.');
      G.addVoice('teun');
    } else {
      G.kind(-1); G.set('teunThreat'); G.choice('veer', 'Je dreigde de oude veerman.');
      await say('teun', '…Goed dan. Instappen. Je bent net zo eigenwijs als zij. Maar zij was wél aardig.');
    }
    G.set('ferryPaid');
  }
  async function teunMemory(G, viaPortrait) {
    const r = viaPortrait ? 'portret' : await G.choose([
      { text: 'Oma blies glazen vogeltjes voor elk kind in het dal.', value: 'vogels' },
      { text: 'Elke avond zong ze me in slaap met haar slaapliedje.', value: 'lied' },
      { text: 'Ik vond een portretje van haar met een jongen… “B. en A.”', value: 'portret', if: G.has('portret') },
    ]);
    G.kind(1);
    if (r === 'vogels') {
      G.choice('veer', 'Je vertelde Teun over Oma\'s glazen vogeltjes.');
      await say('teun', 'Glazen vogeltjes… Ik had er ook een! Een groene, met een gele snavel. Hij hangt boven mijn bed. Ik wist niet meer van wie ik hem had. Van Brem, natuurlijk.');
    } else if (r === 'lied') {
      G.choice('veer', 'Je vertelde Teun over Oma\'s slaapliedje.');
      A.sfx('musicbox', A.LULLABY.easy);
      await say('teun', '<em>Slaap, kleine vonk, de nacht is lang…</em> Dat zong haar moeder al. Op deze boot. Ik was er zelf bij, als kleine jongen. Wel heb je ooit, dat weet ik weer.');
    } else {
      G.choice('veer', 'Je liet Teun het oude portretje zien.');
      await say('teun', 'Laat zien… Brem, en… wacht. Wacht eens.');
      A.sfx('magic');
      await say('teun', '<b>Aldo.</b> Haar broertje Aldo! Hij speelde altijd bij de toren. Toen de lantaarn voor het eerst aanging… was hij ineens weg. En iedereen vergat hem. Iedereen. Zelfs Brem.');
      await say('teun', 'Hoe kán ik dat vergeten zijn? Hij was mijn beste vriend.');
      G.set('knowsName');
      await M('Aldo… De allereerste herinnering die de lantaarn opat.');
    }
    await say('teun', 'Dank je, kind. Dat is het mooiste wat ik in jaren heb gekregen. En heb je ooit een stem nodig? Ik zing mijn roeiliedje al vijftig jaar.');
    G.addVoice('teun');
  }

  /* ==========================================================
     7. HET EILAND VAN VERGETEN DINGEN  (hoofdstuk 4)
     Alles wat in het dal vergeten wordt, spoelt hier aan.
     Wieke de mot schrijft het op in het Grote Register.
     ========================================================== */
  G.register('eiland', {
    name: 'Het Eiland van Vergeten Dingen', tint: '#4a4468', music: 'island', ambience: 'lake', fx: ['motes', 'sparkle'],
    walk: { y0: 1170, y1: 1420, x0: 80, x1: 900, s0: 0.84, s1: 1.02 },
    entries: { veer: [220, 1330], toren: [220, 1330], default: [260, 1320] },
    bg(G) {
      const r = Art.rng(301);
      // boeken die samen een torentje vormen
      let books = '';
      for (let i = 0; i < 13; i++) {
        const y = 1100 - i * 42, w = 260 - i * 8 + (r() - 0.5) * 30, x = 270 - w / 2 + (r() - 0.5) * 16;
        const c = ['#7a3a3a', '#3a5a7a', '#5a6a3a', '#6a4a7a', '#8a6a3a', '#3a6a6a'][i % 6];
        books += `<rect x="${x.toFixed(0)}" y="${y}" width="${w.toFixed(0)}" height="40" rx="6" fill="${c}"/><rect x="${x.toFixed(0)}" y="${y}" width="${w.toFixed(0)}" height="40" rx="6" fill="url(#g-shade)"/><path d="M${(x + 14).toFixed(0)} ${y + 8} V${y + 32} M${(x + w - 14).toFixed(0)} ${y + 8} V${y + 32}" stroke="#e8c87a" stroke-width="3" opacity=".6"/>`;
      }
      return `
        ${Art.sky('ei-sky', ['#0e1228', '#262a4c', '#4a4668', '#7a6a84'])}
        ${Art.stars(70, 303, 560, 0.6)}
        ${Art.moon(820, 250, 36, false)}
        <!-- de toren, ver weg in de nevel -->
        <path d="M880 830 L886 610 L904 610 L910 830 Z M878 616 L895 576 L912 616 Z" fill="#1a1e38" opacity=".8"/>
        <rect x="0" y="800" width="1000" height="260" fill="#232848"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${60 + i * 120}" y="${840 + (i % 3) * 40}" width="${60 + (i % 2) * 50}" height="4" rx="2" fill="#c8d0f0" opacity=".25" class="ripple" style="animation-delay:${i * 0.4}s"/>`).join('')}
        ${Art.mist(860, 120, 0.8, 'drift', 305)}
        <!-- zandig eiland -->
        <defs><linearGradient id="ei-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a7e86"/><stop offset="1" stop-color="#4e4656"/></linearGradient></defs>
        <path d="M0 980 Q240 930 520 960 Q780 990 1000 950 L1000 1500 L0 1500 Z" fill="url(#ei-sand)"/>
        ${Art.grass(990, 1100, 40, 307, '#6a6a5a', 26)}
        <!-- het boekentorentje van Wieke -->
        ${books}
        <path d="M150 556 Q270 470 390 556 Z" fill="#5a3a5a"/><path d="M150 556 Q270 470 390 556 Z" fill="url(#g-shade)"/>
        <circle cx="270" cy="690" r="36" fill="#ffd890"/>${Art.glow(270, 690, 150, '', 0.6, 'glowpulse')}<path d="M234 690 H306 M270 654 V726" stroke="#3a2414" stroke-width="5"/>
        <!-- schipwrak met mast -->
        <g>
          <path d="M690 1110 Q700 980 800 940 L1000 900 L1000 1120 Z" fill="#3a2a22"/><path d="M690 1110 Q700 980 800 940 L1000 900 L1000 1120 Z" fill="url(#g-shade)"/>
          ${[0, 1, 2, 3].map((i) => `<path d="M${716 + i * 70} ${1100 - i * 8} Q${730 + i * 70} ${1010 - i * 20} ${800 + i * 60} ${950 - i * 12}" stroke="#1e140e" stroke-width="5" fill="none"/>`).join('')}
          <path d="M876 930 L896 360" stroke="#2a1c14" stroke-width="16"/><path d="M880 930 L898 360" stroke="#5a3e2a" stroke-width="4" opacity=".6"/>
          <path d="M820 520 L960 500" stroke="#2a1c14" stroke-width="8"/>
          <path d="M832 528 Q890 640 950 508 Q900 580 832 528 Z" fill="#8a8494" opacity=".55"/>
          <path d="M858 432 L938 424 L934 460 L862 466 Z" fill="#3a2a22"/><path d="M858 432 L938 424 L934 460 L862 466 Z" fill="url(#g-shade)"/>
        </g>
        <!-- vergeten dingen op het strand -->
        <g transform="translate(620 1230) rotate(-18)"><path d="M-70 0 Q0 -70 70 0 Z" fill="#a83a3a"/><path d="M-70 0 Q0 -70 70 0 Z" fill="url(#g-shade)"/><path d="M0 -36 V50 Q0 62 -12 58" stroke="#3a2414" stroke-width="5" fill="none"/></g>
        <g transform="translate(780 1180)"><path d="M-60 40 Q0 70 60 40" stroke="#5e3b22" stroke-width="8" fill="none"/><path d="M-40 34 L-30 -20 L30 -20 L40 34 Z" fill="#c88a4a"/><path d="M-40 34 L-30 -20 L30 -20 L40 34 Z" fill="url(#g-shade)"/><circle cx="34" cy="-40" r="24" fill="#c88a4a"/><circle cx="34" cy="-40" r="24" fill="url(#g-shade-r)"/><circle cx="42" cy="-44" r="4" fill="#2a1c14"/><path d="M14 -56 L4 -80 L24 -62 Z" fill="#8a5a2a"/></g>
        <g opacity=".9">${[[880, 1300, '#9fd0f0'], [930, 1250, '#e8a0c8'], [840, 1360, '#c8e8a0'], [560, 1340, '#ffd890']].map(([x, y, c], i) => `<g transform="translate(${x} ${y}) rotate(${-30 + i * 25})"><path d="M-8 -26 L8 -26 L8 -14 Q18 -8 18 8 Q18 26 0 26 Q-18 26 -18 8 Q-18 -8 -8 -14 Z" fill="url(#g-glass)" stroke="#e6f6ff" stroke-width="2"/><circle cx="0" cy="8" r="7" fill="${c}" class="glowpulse" style="animation-delay:${i * 0.7}s"/>${Art.glow(0, 8, 40, 'blue', 0.5)}</g>`).join('')}</g>
        <g transform="translate(470 1380) rotate(8)"><path d="M-30 -18 L30 -22 L32 18 L-28 22 Z" fill="#efe2c4"/><path d="M-20 -8 H20 M-20 2 H24 M-20 12 H14" stroke="#8a7a5a" stroke-width="2"/></g>
        <!-- de boot van Teun -->
        <g transform="translate(110 1440) scale(.8)"><g class="bob"><path d="M-170 -40 Q-160 30 0 34 Q160 30 190 -50 Z" fill="#6b4528"/><path d="M-170 -40 Q-160 30 0 34 Q160 30 190 -50 Z" fill="url(#g-shade)"/><path d="M-170 -40 L190 -50 L180 -34 L-160 -26 Z" fill="#8a5a34"/></g></g>
      `;
    },
    props(G) {
      const f = (k) => G.flag(k);
      let s = '';
      // glinstering in de mast (de fles)
      if (!f('bottleTaken')) s += `<g transform="translate(898 420)"><path d="M-6 -16 L6 -16 L6 -8 Q12 -4 12 6 Q12 16 0 16 Q-12 16 -12 6 Q-12 -4 -6 -8 Z" fill="url(#g-glass)" stroke="#e6f6ff" stroke-width="2"/>${Art.glow(0, 0, 50, 'blue', 0.8, 'glowpulse')}</g>`;
      // het Register op een lessenaar
      s += `<g transform="translate(660 1150)">${Art.shadow(0, 6, 90, 14)}
        <path d="M-14 0 L-10 -120 L10 -120 L14 0 Z" fill="#5e3b22"/><path d="M-50 4 L50 4 L40 -10 L-40 -10 Z" fill="#4a2f1c"/>
        <path d="M-90 -126 L0 -150 L90 -126 L84 -110 L0 -132 L-84 -110 Z" fill="#5a2a2a"/>
        <path d="M-86 -128 Q-44 -146 0 -140 L0 -156 Q-44 -164 -86 -144 Z M86 -128 Q44 -146 0 -140 L0 -156 Q44 -164 86 -144 Z" fill="#f3e3bf"/>
        <path d="M-70 -140 L-14 -150 M-70 -132 L-14 -142 M14 -150 L70 -140 M14 -142 L70 -132" stroke="#8a7a5a" stroke-width="2"/>
        ${f('pageBack') ? Art.glow(0, -146, 120, '', 0.7, 'glowpulse') : ''}</g>`;
      // kist met scherven
      if (!f('birdDone')) s += `<g transform="translate(240 1300)">${Art.shadow(0, 6, 80, 12)}<path d="M-60 0 L-56 -60 L56 -60 L60 0 Z" fill="#7a5a3a"/><path d="M-60 0 L-56 -60 L56 -60 L60 0 Z" fill="url(#g-shade)"/><path d="M-58 -30 H58" stroke="#4a3020" stroke-width="4"/>
        <g fill="url(#g-glass)" stroke="#e6f6ff" stroke-width="1.5"><path d="M-30 -60 L-20 -80 L-10 -60 Z"/><path d="M0 -60 L14 -84 L22 -60 Z"/><path d="M28 -60 L36 -74 L44 -60 Z"/></g>${Art.glow(0, -66, 70, 'blue', 0.6, 'glowpulse')}</g>`;
      // Wieke
      s += `<g transform="translate(470 1215) scale(.88)">${Art.wieke()}</g>`;
      s += kwastPerch(G, 286, 1240, false);
      return s;
    },
    hotspots(G) {
      const f = (k) => G.flag(k);
      const list = [
        { id: 'wieke', name: 'Wieke de Mot', x: 380, y: 900, w: 190, h: 320, walk: [400, 1290], tap: (G) => wiekeTalk(G), use: {
          bladzijde: async (G) => wiekePage(G),
          vogeltje: async (G) => { await say('wieke', 'Wat glimt hij mooi, hè? Hou hem goed vast. Hij hoort bij iemand.'); },
          '*': async (G, it) => { await say('wieke', 'Een ' + G.items[it].name.toLowerCase() + '? Die is nog niet vergeten. Bewaar hem maar goed.'); },
        } },
        { id: 'register', name: 'Het Grote Register', x: 570, y: 980, w: 180, h: 170, walk: [620, 1240], tap: (G) => readRegister(G) },
        { id: 'kist', name: 'Kist met scherven', hidden: f('birdDone'), x: 170, y: 1210, w: 150, h: 110, walk: [330, 1320], tap: (G) => birdCrate(G) },
        { id: 'wrak', name: 'Schipwrak', x: 790, y: 360, w: 200, h: 600, walk: [820, 1200], tap: (G) => wreckTap(G), use: {
          werphaak: async (G) => {
            if (f('bottleTaken')) { await M('Daar zit niks meer.'); return; }
            await M('Ik gooi de werphaak omhoog… mis… nog een keer… hebbes!'); A.sfx('whoosh');
            G.set('bottleTaken'); G.give('fles'); G.choice('fles', 'Je viste de fles uit de mast met je werphaak.');
          },
        } },
        { id: 'dingen', name: 'Vergeten dingen', x: 540, y: 1140, w: 300, h: 120, walk: [700, 1300], tap: async (G) => {
          const looks = /* stem:mira */ [
            'Een rode paraplu. Iemand is vergeten dat het regende.',
            'Een hobbelpaard met één oor. Ik vraag me af welk kind hem mist.',
            'Kleine flesjes met lichtjes erin. In elk flesje zit een herinnering. Ze zijn zo stil.',
            'Een brief zonder naam. Wie hem schreef, weet niemand meer.',
          ];
          const i = (G.state.seen.eilandLook || 0) % looks.length; G.state.seen.eilandLook = i + 1;
          await M(looks[i]);
        } },
        { id: 'boekentoren', name: 'Wiekes boekentoren', x: 140, y: 470, w: 260, h: 520, walk: [280, 1200], look: 'Een torentje van boeken, met een raampje erin. Daar woont Wieke. Het ruikt er naar oud papier.' },
        { id: 'boot', name: 'Teuns boot', exit: 'left', x: 0, y: 1330, w: 230, h: 170, walk: [160, 1380], tap: (G) => islandBoat(G) },
      ];
      const kh = kwastHot(G, 286, 1240); if (kh) list.push(kh);
      return list;
    },
    async enter(G, first) {
      if (first) {
        G.set('islandVisited');
        await G.runChapter(4);
        await say('teun', 'Pas op! De nevel duwt de boot opzij… Daar is land. Het Eiland van Vergeten Dingen.');
        await say('teun', 'Verder durf ik niet. Rond de toren liggen scherpe rotsen: de Grijze Riffen. Zonder kaart varen we ons kapot.');
        await M('Dan zoeken we hier een kaart. Wacht even op ons, Teun.');
        G.task('kaart', 'Zoek een kaart van de Grijze Riffen.');
      }
    },
  });

  async function wiekeTalk(G) {
    const f = (k) => G.flag(k);
    if (!f('wiekeMet')) {
      G.set('wiekeMet');
      await say('wieke', 'O! Een bezoeker! Hier komt nooit iemand. Alleen dingen.');
      await M('Dingen?');
      await say('wieke', 'Alles wat vergeten wordt in het dal, spoelt hier aan. Paraplu\'s, liedjes, namen. Ik ben Wieke. Ik schrijf alles op in het Grote Register.');
      await say('wieke', 'Iemand moet het toch onthouden? Ook al leest niemand het ooit.');
      if (f('kwastJoined')) {
        await K('Een mot met een bril. Nu heb ik echt alles gezien.');
        await say('wieke', 'Ik ben een nachtvlinder, meneer de kraai. Wij houden van licht. Daarom mis ik de lantaarn zo.');
      }
      await M('Wij moeten naar de Maantoren. Maar Teun vindt de weg niet tussen de rotsen.');
      await say('wieke', 'De Grijze Riffen. Daar heb ik een kaart van. Maar die geef ik niet zomaar weg.');
      await say('wieke', 'Lang geleden spoelde hier een glazen vogeltje aan. In stukjes. Ik krijg het niet meer heel. Jij bent toch een glasblazer?');
      await say('wieke', 'Maak het vogeltje heel. Dan krijg je mijn kaart.');
      G.task('vogel', 'Maak het glazen vogeltje van Wieke heel.');
      return;
    }
    const opts = [
      { text: 'Wat weet jij van de Grijze Heer?', value: 'heer' },
      { text: 'Waarom ben je hier helemaal alleen?', value: 'alone', if: !G.state.seen.wiekeAlone },
      { text: 'Wil je meezingen, als ik het nieuwe lied zing?', value: 'sing', if: !G.state.voices.includes('wieke') },
      { text: 'Tot ziens, Wieke.', value: 'bye' },
    ];
    const r = await G.choose(opts, 'wieke', 'Ja, kind? Ik luister.');
    if (r === 'heer') {
      await say('wieke', 'Soms, als de nevel aanspoelt, komt hij hier. Hij bladert in mijn Register. Hij zoekt iets.');
      await say('wieke', 'Ik denk dat hij zijn eigen naam zoekt. Maar die stond op de eerste bladzijde. En die is weg.');
    } else if (r === 'alone') {
      G.state.seen.wiekeAlone = true;
      await say('wieke', 'Ik weet het eigenlijk niet meer. Ik ben vergeten waarom ik begon. Grappig, hè? Voor iemand die alles opschrijft.');
    } else if (r === 'sing') {
      if (G.has('bladzijde') || f('pageBack')) await wiekePage(G);
      else await say('wieke', 'Ik zing pas als mijn Register weer heel is. Als ik de eerste bladzijde terug heb.');
    }
  }

  async function readRegister(G) {
    const f = (k) => G.flag(k);
    if (f('pageBack')) {
      await M('Bladzijde één zit er weer in. <em>“Aldo, zeven jaar. Broertje van Brem.”</em> Wieke heeft er een sterretje bij getekend.');
      return;
    }
    await M('Het Grote Register. Wat een dik boek!');
    await M('<em>“Dinsdag: één rode paraplu. De naam van Hanna\'s poes. Het liedje van de molenaar.”</em>');
    await M('Hé… de eerste bladzijde is eruit gescheurd. Er zit alleen nog een randje papier.');
    if (f('wiekeMet')) {
      await say('wieke', 'Die bladzijde is lang geleden weggewaaid. Er stond het allereerste op dat ooit vergeten werd. Ik weet niet meer wat.');
      G.task('bladzijde', 'Vind de eerste bladzijde van het Register.');
    }
  }

  async function birdCrate(G) {
    if (!G.flag('wiekeMet')) { await M('Een kist vol glasscherven. Ze glimmen blauw. Ik vraag eerst even aan wie hij is.'); return; }
    await M('Blauwe scherven. Dit was een vogeltje. Oma blies vroeger ook zulke vogeltjes. Ik kan dit!');
    const ok = await P.bird(G);
    if (!ok) { await M('Even rusten. Ik probeer het straks nog een keer.'); return; }
    G.set('birdDone'); G.done('vogel'); G.done('kaart'); G.refresh();
    await say('wieke', 'Hij is weer heel! Kijk eens hoe hij glimt.');
    await say('wieke', 'Kijk, onder zijn pootje staat een letter. Een A.');
    await M('Een A… Net als op Oma\'s portretje!');
    await say('wieke', 'Hou hem maar. Hij hoort bij iemand die jij gaat vinden, denk ik. En hier is mijn kaart, zoals beloofd.');
    G.give('vogeltje', true); G.give('zeekaart', true); A.sfx('pickup');
    G.toast('Glazen vogeltje en zeekaart!', 'zeekaart');
    G.kind(1);
    if (G.flag('kwastJoined')) await K('Een kaart! Eindelijk iets nuttigs. Behalve ik, natuurlijk.');
    G.task('toren', 'Vaar met Teun naar de Maantoren.');
  }

  async function wreckTap(G) {
    const f = (k) => G.flag(k);
    if (f('bottleTaken')) { await M('Het oude schip slaapt in het zand. De mast kraakt in de wind.'); return; }
    await M('Een oud schip, half in het zand. Boven in de mast glinstert iets. Een fles?');
    if (!f('kwastJoined')) { await M('Daar kan ik nooit bij. Misschien met een haak aan een touw?'); return; }
    await K('Ik kan daar heus bij, hoor. Maar ik vlieg niet voor niks. Een kraai heeft regels.');
    const r = await G.choose([
      { text: 'Wil je een kraal van mijn ketting, Kwast?', value: 'bead' },
      { text: 'Dan doe ik het zelf wel, met mijn werphaak.', value: 'self', if: G.has('werphaak') },
      { text: 'Laat maar.', value: 'no' },
    ]);
    if (r === 'bead') {
      await M('Hier. De blauwe. Die vond Oma altijd het mooist.');
      await K('…De blauwe? Voor mij? Kraa. Ik… daar ga ik!');
      A.sfx('crow'); await G.wait(300); A.sfx('whoosh'); await G.wait(500);
      G.set('bottleTaken'); G.set('gaveBead'); G.give('fles'); G.kind(1);
      G.choice('fles', 'Je gaf Kwast de blauwe kraal van je ketting.');
      await K('Alsjeblieft. Een fles. En die kraal bewaar ik bij mijn medaille. Voor altijd.');
    } else if (r === 'self') {
      await M('Ik gooi de werphaak omhoog… mis… nog een keer… hebbes!'); A.sfx('whoosh');
      G.set('bottleTaken'); G.give('fles'); G.choice('fles', 'Je viste de fles uit de mast met je werphaak.');
      await K('Pff. Dat had ik sneller gekund.');
    }
  }

  async function islandBoat(G) {
    const r = await G.choose([
      { text: 'Naar de Maantoren, Teun!', value: 'toren', if: G.has('zeekaart') },
      { text: 'Terug naar het veer.', value: 'veer' },
      { text: 'Nog even blijven.', value: 'stay' },
    ], 'teun', G.has('zeekaart') ? 'Waar gaan we heen, kind?' : 'Zonder kaart vind ik de weg naar de toren niet. Waar wil je heen?');
    if (r === 'toren') {
      await say('teun', 'Laat zien, die kaart… Links langs de grote rots, dan rechtdoor. Ja! Zo komen we er.');
      A.sfx('splash'); await G.goto('toren', 'eiland');
    } else if (r === 'veer') { A.sfx('splash'); await G.goto('veer', 'eiland'); }
  }

  async function wiekePage(G) {
    if (G.flag('pageBack')) { await say('wieke', 'Ik zing mee, kind. Motten zingen heel zacht. Maar wel heel lang.'); G.addVoice('wieke'); return; }
    if (!G.has('bladzijde')) return;
    await say('wieke', 'De eerste bladzijde! Na al die jaren!');
    const r = await G.choose([
      { text: 'Hier, Wieke. Hij hoort in jouw boek.', value: 'give' },
      { text: 'Mag ik hem nog even houden? Voor Oma.', value: 'keep' },
    ]);
    if (r === 'keep') { await say('wieke', 'Goed. Maar breng hem daarna terug, hoor. Een boek zonder begin is zo verdrietig.'); return; }
    G.take('bladzijde'); G.set('pageBack'); G.done('bladzijde'); G.kind(1); G.refresh();
    G.choice('bladzijde', 'Je gaf Wieke de eerste bladzijde van haar Register terug.');
    A.sfx('heart');
    await say('wieke', 'Nu is mijn Register weer heel. En nu weet ik ook weer waarom ik begon.');
    await say('wieke', 'Ik begon voor hem. Voor Aldo. Zodat er tóch iemand was die hem opschreef.');
    await say('wieke', 'Als je het nieuwe lied zingt, zing ik mee. Motten zingen heel zacht. Maar wel heel lang.');
    G.addVoice('wieke');
  }

  async function readPage(G) {
    await M('<em>“Bladzijde 1. Het allereerste dat vergeten werd: Aldo, zeven jaar. Zoon van Isolde. Broertje van Brem. Hij speelde altijd bij de toren.”</em>');
    if (!G.flag('knowsName')) {
      G.set('knowsName'); A.sfx('magic');
      await M('Aldo! A. is Aldo. Oma had een broertje!');
      if (G.flag('kwastJoined')) await K('Kraa. Daar wist ik niks van. En ik weet bijna alles.');
    }
    if (!G.flag('pageBack')) G.task('bladzijde', 'Breng de bladzijde terug naar Wieke.');
  }

  /* ==========================================================
     9. DE SPIEGELTRAP  (hoofdstuk 6)
     Binnen in de toren. Het maanlicht moet via spiegels het luik openen.
     In de grote spiegel woont het spiegelbeeld van Isolde, Oma's moeder.
     ========================================================== */
  G.register('trap', {
    name: 'De Spiegeltrap', tint: '#2a3460', music: 'stairs', ambience: 'tower', fx: ['motes', 'sparkle'],
    walk: { y0: 1180, y1: 1420, x0: 100, x1: 880, s0: 0.86, s1: 1.02 },
    entries: { toren: [240, 1360], torenkamer: [520, 1220], default: [300, 1340] },
    bg(G) {
      let stones = '';
      for (let r = 0; r < 26; r++) for (let c = 0; c < 9; c++) { const x = c * 120 + (r % 2) * 60 - 60, y = r * 46; stones += `<rect x="${x}" y="${y}" width="116" height="42" rx="7" fill="${['#26304e', '#222b46', '#2a3454'][(r * 5 + c) % 3]}"/>`; }
      let steps = '';
      for (let i = 0; i < 14; i++) {
        const t = i / 13, x = 120 + t * 720, y = 1160 - t * 980, w = 210 - Math.sin(t * Math.PI) * 60;
        steps += `<path d="M${(x - w / 2).toFixed(0)} ${y.toFixed(0)} L${(x + w / 2).toFixed(0)} ${(y - 20).toFixed(0)} L${(x + w / 2).toFixed(0)} ${(y + 10).toFixed(0)} L${(x - w / 2).toFixed(0)} ${(y + 30).toFixed(0)} Z" fill="#4a5470"/><path d="M${(x - w / 2).toFixed(0)} ${(y + 30).toFixed(0)} L${(x + w / 2).toFixed(0)} ${(y + 10).toFixed(0)}" stroke="#141a2c" stroke-width="4"/>`;
      }
      return `
        <rect width="1000" height="1500" fill="#1a2038"/>
        ${stones}
        <rect width="1000" height="1500" fill="url(#g-vignette)"/>
        <!-- spleetraam met maanlicht -->
        <path d="M70 300 L70 160 Q90 120 110 160 L110 300 Z" fill="#a8c8ff"/>${Art.glow(90, 230, 140, 'blue', 0.7)}
        <path d="M70 160 L110 300 L760 1180 L380 1180 Z" fill="#cfe4ff" opacity=".06"/>
        <!-- wenteltrap -->
        ${steps}
        <path d="M120 1170 Q500 700 880 160" stroke="#6a7494" stroke-width="6" fill="none" opacity=".7"/>
        <!-- vloer -->
        <path d="M0 1170 L1000 1170 L1000 1500 L0 1500 Z" fill="#2a3048"/>
        <ellipse cx="500" cy="1300" rx="460" ry="130" fill="#323a56"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${500 + Math.cos(i) * 420} ${1300 + Math.sin(i) * 110} L500 1300" stroke="#262c44" stroke-width="3"/>`).join('')}
        <!-- kleine spiegels aan de muur -->
        ${[[260, 520], [430, 360], [180, 820], [620, 300]].map(([x, y]) => `<g><ellipse cx="${x}" cy="${y}" rx="42" ry="58" fill="#3a4466" stroke="url(#g-gold)" stroke-width="7"/><ellipse cx="${x}" cy="${y}" rx="34" ry="50" fill="url(#g-glass)" opacity=".5"/><path d="M${x - 16} ${y - 30} Q${x - 4} ${y - 40} ${x + 8} ${y - 34}" stroke="#fff" stroke-width="3" opacity=".5" fill="none"/></g>`).join('')}
        <!-- de grote staande spiegel -->
        <g>
          <path d="M600 1180 L600 640 Q600 520 720 520 Q840 520 840 640 L840 1180 Z" fill="url(#g-gold)"/>
          <path d="M622 1160 L622 650 Q622 544 720 544 Q818 544 818 650 L818 1160 Z" fill="#1c2440"/>
          <path d="M622 1160 L622 650 Q622 544 720 544 Q818 544 818 650 L818 1160 Z" fill="url(#g-glass)" opacity=".35"/>
          <path d="M650 700 Q680 620 740 600" stroke="#fff" stroke-width="5" opacity=".25" fill="none"/>
          <path d="M590 1180 L850 1180 L860 1210 L580 1210 Z" fill="#5e3b22"/>
        </g>
      `;
    },
    props(G) {
      const f = (k) => G.flag(k);
      let s = '';
      // luik in het plafond, boven aan de trap
      s += `<g transform="translate(790 120)"><rect x="-80" y="-40" width="160" height="60" rx="8" fill="${f('hatchOpen') ? '#0a0e1c' : 'url(#g-wood-dark)'}" stroke="#6a7088" stroke-width="5"/>
        ${f('hatchOpen') ? Art.glow(0, -10, 160, 'blue', 0.9, 'glowpulse') : '<text x="0" y="6" text-anchor="middle" font-size="34" fill="#c9a54a">☾</text>'}</g>`;
      if (f('hatchOpen')) s += `<path d="M110 230 L260 520 L430 360 L620 300 L790 120" stroke="#e8f4ff" stroke-width="5" fill="none" opacity=".8" class="glowpulse"/>`;
      // Isolde in de spiegel
      if (f('isoldeSeen')) s += `<g transform="translate(720 1150) scale(.95)">${Art.isolde(f('isoldeForgiven'))}</g>`;
      s += kwastPerch(G, 560, 1176, true);
      return s;
    },
    hotspots(G) {
      const f = (k) => G.flag(k);
      const list = [
        { id: 'spiegel', name: f('isoldeSeen') ? 'Isolde' : 'Grote spiegel', x: 600, y: 520, w: 240, h: 660, walk: [560, 1260], tap: (G) => isoldeTalk(G), use: {
          vogeltje: async (G) => { if (!f('isoldeSeen')) { await M('In de spiegel zie ik alleen mezelf. En een glazen vogeltje.'); return; } await say('isolde', 'Dat vogeltje… dat blies Brem voor Aldo. Ze was nog zo klein. Hij nam het overal mee naartoe.'); },
          bladzijde: async (G) => { if (!f('isoldeSeen')) return; await say('isolde', 'Aldo. Daar staat zijn naam. Zeg hem vaak, kind. Namen moet je hardop zeggen, anders vervagen ze.'); },
        } },
        { id: 'spiegels', name: f('hatchOpen') ? 'Het luik is open' : 'Spiegels en maanlicht', x: 60, y: 140, w: 600, h: 760, walk: [380, 1220], tap: async (G) => {
          if (f('hatchOpen')) { await M('Het maanlicht springt van spiegel naar spiegel. Helemaal tot aan het luik.'); return; }
          if (!G.state.seen.mirrorIntro) { G.state.seen.mirrorIntro = true; await M('Door het smalle raam valt maanlicht naar binnen. Aan de muur hangen spiegels. Boven aan de trap zit een luik met een maan erop.'); }
          const ok = await P.mirrors(G);
          if (ok) { G.set('hatchOpen'); G.done('luik'); A.sfx('rumble'); G.refresh(); await M('Krrr… het luik schuift open! Nu kan ik naar boven.'); }
        } },
        { id: 'omhoog', name: f('hatchOpen') ? 'Naar boven' : 'Luik', x: 690, y: 60, w: 200, h: 200, walk: [740, 1200], exit: f('hatchOpen') ? 'up' : null, tap: async (G) => {
          if (!f('hatchOpen')) { await M('Het luik zit dicht. Er zit geen klink aan. Alleen een maantje.'); return; }
          await M('Ik klim de laatste treden op. Mijn benen trillen een beetje.');
          await G.goto('torenkamer', 'trap');
        } },
        { id: 'trap', name: 'Naar beneden', exit: 'down', to: 'toren', x: 100, y: 1340, w: 260, h: 160, walk: [200, 1400] },
      ];
      const kh = kwastHot(G, 560, 1176); if (kh) list.push(kh);
      return list;
    },
    async enter(G, first) {
      if (first) {
        await G.runChapter(6);
        await M('Een trap die rond en rond omhoog draait. En overal spiegels. In het licht van mijn lampje glimmen ze als ogen.');
        if (G.flag('kwastJoined')) await K('Ik hou niet van spiegels. Er kijkt altijd een kraai terug. Een héél knappe, dat wel.');
        G.task('luik', 'Open het luik boven aan de Spiegeltrap.');
      }
    },
  });

  async function isoldeTalk(G) {
    const f = (k) => G.flag(k);
    if (!f('isoldeSeen')) {
      G.set('isoldeSeen'); A.sfx('magic'); G.refresh();
      await M('In de grote spiegel zie ik mezelf niet. Ik zie een vrouw met een kroon van vlechten.');
      await say('isolde', 'Kind… jij hebt de ogen van mijn Brem.');
      await M('U kent Oma? Wie bent u?');
      await say('isolde', 'Ik ben Isolde. Brems moeder. Of wat er van mij over is: een spiegelbeeld in oud glas.');
      await say('isolde', 'Ik was de eerste glasblazer van het dal. Ik blies het glas van de Maanlantaarn. En ik stak hem aan, in de zomer van het eerste licht.');
      await say('isolde', 'Ik wist niet dat hij op herinneringen brandt. De eerste nacht at hij er één op. De mooiste die er was. Mijn zoontje.');
      if (f('knowsName')) await M('Aldo… Oma\'s broertje.');
      await say('isolde', 'Daarna wist niemand meer dat hij bestond. Ik ook niet. Alleen dit glas heeft het onthouden. Daarom woon ik hier.');
      const r = await G.choose([
        { text: 'U wist het niet. U wilde het dal helpen.', value: 'forgive' },
        { text: 'Door u is Aldo verdwenen!', value: 'blame' },
      ]);
      if (r === 'forgive') await isoldeForgive(G);
      else {
        G.set('isoldeBlamed'); G.kind(-1); G.choice('isolde', 'Je gaf Isolde de schuld van Aldo\'s verdwijning.');
        await say('isolde', 'Dat is waar. Ik kan het niet goedmaken. Maar jij misschien wel.');
      }
      await say('isolde', 'Het luik naar boven gaat alleen open voor maanlicht. Laat de spiegels het licht naar het luik sturen.');
      return;
    }
    if (f('isoldeBlamed') && !f('isoldeForgiven')) {
      const r = await G.choose([
        { text: 'Het spijt me wat ik zei.', value: 'sorry' },
        { text: 'Hoe kom ik boven?', value: 'how' },
      ], 'isolde', 'Ja, kind?');
      if (r === 'sorry') await isoldeForgive(G);
      else await say('isolde', 'Vang het maanlicht met de spiegels. Stuur het naar het luik.');
      return;
    }
    await say('isolde', f('hatchOpen') ? 'Ga maar, kind. Boven wacht Brem. En boven wacht hij.' : 'Vang het maanlicht met de spiegels. Stuur het naar het luik.');
  }
  async function isoldeForgive(G) {
    G.set('isoldeForgiven'); G.kind(1); G.choice('isolde', 'Je vergaf Isolde, het spiegelbeeld van Oma\'s moeder.'); G.refresh();
    await say('isolde', 'Dank je, kind. Daar heb ik zestig jaar op gewacht.');
    await say('isolde', 'Als je het nieuwe lied zingt, zing ik mee. Glas kan zingen, weet je. Als je goed luistert.');
    G.addVoice('isolde');
  }

  /* ==========================================================
     8. VOET VAN DE MAANTOREN
     ========================================================== */
  G.register('toren', {
    name: 'Voet van de Maantoren', tint: '#26305a', music: 'tower', ambience: 'tower', fx: 'motes',
    walk: { y0: 1180, y1: 1420, x0: 80, x1: 920, s0: 0.86, s1: 1.04 },
    entries: { veer: [260, 1340], eiland: [260, 1340], trap: [500, 1240], torenkamer: [500, 1240], default: [300, 1320] },
    bg(G) {
      let stones = '';
      for (let r = 0; r < 22; r++) for (let c = 0; c < 6; c++) { const x = 240 + c * 90 + (r % 2) * 45, y = 120 + r * 46; if (x < 760) stones += `<rect x="${x}" y="${y}" width="86" height="42" rx="6" fill="${['#3a4258', '#343c52', '#40485e'][(r * 3 + c) % 3]}"/>`; }
      return `
        ${Art.sky('tw-sky', ['#060a1c', '#121a3a', '#26305a'])}
        ${Art.stars(80, 61, 900)}
        ${Art.mist(500, 200, 0.5, 'drift', 63)}
        <defs><clipPath id="tw-clip"><path d="M240 1180 L270 0 L730 0 L760 1180 Z"/></clipPath></defs>
        <path d="M240 1180 L270 0 L730 0 L760 1180 Z" fill="#2c3448"/>
        <g clip-path="url(#tw-clip)">${stones}</g>
        <path d="M240 1180 L270 0 L310 0 L290 1180 Z" fill="#000" opacity=".25"/><path d="M710 1180 L690 0 L730 0 L760 1180 Z" fill="#000" opacity=".3"/>
        <!-- deur -->
        <path d="M380 1180 L380 860 Q380 740 500 740 Q620 740 620 860 L620 1180 Z" fill="#1a1f30"/>
        <path d="M360 1180 L360 860 Q360 720 500 720 Q640 720 640 860 L640 1180" fill="none" stroke="#6a7088" stroke-width="16"/>
        <!-- rotsen, water -->
        <rect x="0" y="1150" width="1000" height="350" fill="#1a2240"/>
        <path d="M0 1180 Q200 1140 400 1180 Q600 1200 1000 1170 L1000 1500 L0 1500 Z" fill="#3a3e50"/>
        <path d="M0 1300 Q120 1280 180 1320 L200 1500 L0 1500 Z" fill="#2a3048"/>
        <path d="M820 1220 Q900 1180 1000 1210 L1000 1500 L800 1500 Z" fill="#30364c"/>
        <path d="M380 1180 L620 1180 L660 1230 L340 1230 Z" fill="#4a5068"/><path d="M340 1230 L660 1230 L700 1280 L300 1280 Z" fill="#525870"/>
        ${Art.mist(1300, 140, 0.8, 'drift-2', 67)}
      `;
    },
    props(G) {
      const f = (k) => G.flag(k);
      let s = '';
      if (f('towerOpen')) s += `<g><path d="M390 1180 L390 864 Q390 752 500 752 Q610 752 610 864 L610 1180 Z" fill="#05070e"/>${G.has('lamp') ? '' : ''}<path d="M440 1180 L470 1000 L530 1000 L560 1180Z" fill="#2a3048" opacity=".5"/></g>`;
      else s += `<g><path d="M390 1180 L390 864 Q390 752 500 752 Q610 752 610 864 L610 1180 Z" fill="url(#g-wood-dark)"/><path d="M500 760 L500 1180" stroke="#1a0e08" stroke-width="6"/>
        <g transform="translate(500 920)" opacity=".9"><path d="M-22 -60 L-22 0 Q-22 22 0 22 Q22 22 22 0 L22 -60 M0 22 L0 70" stroke="#a8b8e8" stroke-width="10" fill="none" stroke-linecap="round"/>${Art.glow(0, 0, 110, 'blue', 0.6, 'glowpulse')}</g></g>`;
      // de boot
      s += `<g transform="translate(140 1420) scale(.8)"><g class="bob"><path d="M-170 -40 Q-160 30 0 34 Q160 30 190 -50 Z" fill="#6b4528"/><path d="M-170 -40 L190 -50 L180 -34 L-160 -26 Z" fill="#8a5a34"/></g></g>`;
      if (f('sluipFree')) s += `<g transform="translate(820 1230) scale(-.9 .9)">${Art.sluip()}</g>`;
      s += kwastPerch(G, 680, 1236, true);
      return s;
    },
    hotspots(G) {
      const f = (k) => G.flag(k);
      const list = [
        { id: 'deur', name: f('towerOpen') ? 'Naar binnen' : 'Torendeur', x: 380, y: 740, w: 240, h: 440, walk: [500, 1240], exit: f('towerOpen') ? 'up' : null, tap: async (G) => {
          if (!f('towerOpen')) { await M('Een enorme deur, zonder klink en zonder slot. Er staat een stemvork op. En het hout zoemt zachtjes.'); return; }
          if (!G.has('lamp')) { await M('Binnen is het pikkedonker. Ik zie niks. Ik heb licht nodig.'); return; }
          await M('Ik houd de vuurvliegjeslamp omhoog. Binnen draait een trap omhoog, en omhoog, en omhoog…');
          await G.goto('trap', 'toren');
        }, use: { stemvork: async (G) => {
          await M('Ik sla de stemvork aan tegen de steen…');
          A.sfx('note', 81); await G.wait(300); A.sfx('note', 88); await G.wait(300); A.sfx('rumble');
          G.set('towerOpen'); G.done('toren'); G.refresh();
          await M('De hele toren zingt mee! De deur zwaait langzaam open.');
          if (!G.has('lamp')) await M('Maar binnen is het aardedonker…');
        } } },
        { id: 'boot', name: 'Terug naar het veer', exit: 'left', to: 'veer', entry: 'toren', x: 0, y: 1320, w: 260, h: 180, walk: [220, 1380] },
      ];
      if (f('sluipFree')) list.push({ id: 'sluip', name: 'Sluip', x: 720, y: 1080, w: 200, h: 160, walk: [700, 1300], tap: (G) => sluipTalk(G) });
      const kh = kwastHot(G, 680, 1236); if (kh) list.push(kh);
      return list;
    },
    async enter(G, first) {
      if (first) {
        G.set('reachedTower');
        await G.runChapter(5);
        await M('De Maantoren. Van dichtbij is hij nog groter. En hij zoemt. Ik voel het in mijn tanden!');
        if (G.flag('sluipFree')) { await say('sluip', 'Mira van de glasblazers! Ik zei toch dat ik je zou vinden.'); }
      }
    },
  });

  async function sluipTalk(G) {
    if (!G.state.voices.includes('sluip')) {
      await say('sluip', 'Boven wacht de Grijze Heer. Ik ben gemaakt van zijn nevel. Ik ben een vergeten vos. Niemand weet meer dat hier vroeger vossen woonden.');
      await say('sluip', 'Hij is niet gemeen, Mira. Hij is alleen héél erg alleen. Net als ik, in die braamstruik.');
      const r = await G.choose([
        { text: 'Zing jij mee, Sluip? Als ik een nieuw lied voor de lantaarn zing?', value: 'sing' },
        { text: 'Weet je hoe hij heet, de Grijze Heer?', value: 'name' },
      ]);
      if (r === 'name') await say('sluip', 'Hij weet het zelf niet meer. Misschien iemand die hem vroeger kende. Iemand met een boot.');
      await say('sluip', 'Ik zing mee. Vossen zingen niet vaak. Maar als we het doen, hoort de hele nacht het.');
      G.addVoice('sluip');
    } else {
      await say('sluip', 'Ik wacht hier. Als je zingt, zing ik mee. Beloofd, op mijn staart.');
    }
  }

  /* ==========================================================
     10. DE LANTAARNKAMER
     ========================================================== */
  G.register('torenkamer', {
    name: 'De Lantaarnkamer', tint: '#2a3048', music: 'tower', ambience: 'tower', fx: ['motes', 'sparkle'],
    walk: { y0: 1200, y1: 1420, x0: 100, x1: 900, s0: 0.86, s1: 1.02 },
    entries: { trap: [380, 1380], toren: [380, 1380], default: [380, 1360] },
    bg(G) {
      let win = '';
      [[150, 300], [500, 230], [850, 300]].forEach(([x, y]) => {
        win += `<g><path d="M${x - 90} ${y + 420} L${x - 90} ${y + 90} Q${x - 90} ${y} ${x} ${y} Q${x + 90} ${y} ${x + 90} ${y + 90} L${x + 90} ${y + 420} Z" fill="#141c3c"/>
          <clipPath id="tk-w${x}"><path d="M${x - 80} ${y + 410} L${x - 80} ${y + 90} Q${x - 80} ${y + 10} ${x} ${y + 10} Q${x + 80} ${y + 10} ${x + 80} ${y + 90} L${x + 80} ${y + 410} Z"/></clipPath>
          <g clip-path="url(#tk-w${x})">${Art.sky('tk-s' + x, ['#0a1430', '#2a3a6a'])}${Art.stars(30, x, 800)}${Art.mist(y + 340, 120, 0.9, 'drift', x)}</g>
          <path d="M${x} ${y + 10} L${x} ${y + 410} M${x - 80} ${y + 200} L${x + 80} ${y + 200}" stroke="#3a4258" stroke-width="10"/></g>`;
      });
      return `
        <rect width="1000" height="1500" fill="#1e2438"/>
        <path d="M0 0 L1000 0 L1000 1150 L0 1150 Z" fill="#262d44"/>
        ${win}
        <path d="M0 1150 L1000 1150 L1000 1500 L0 1500 Z" fill="#30364a"/>
        <ellipse cx="500" cy="1290" rx="480" ry="160" fill="#3a4058"/>
        <ellipse cx="500" cy="1290" rx="380" ry="120" fill="none" stroke="#5a6080" stroke-width="4" stroke-dasharray="20 14"/>
        ${['☾', '✦', '❦', '≈', '✸'].map((s, i) => `<text x="${500 + Math.cos(i / 5 * Math.PI * 2) * 300}" y="${1300 + Math.sin(i / 5 * Math.PI * 2) * 95}" font-size="40" fill="#8a96c8" opacity=".5" text-anchor="middle">${s}</text>`).join('')}
        <path d="M60 1500 L120 1260 L240 1260 L200 1500 Z" fill="#20263a"/>
        <!-- sokkel van de lantaarn -->
        <path d="M400 1130 L420 960 L580 960 L600 1130 Z" fill="#4a5068"/><rect x="380" y="1120" width="240" height="30" rx="6" fill="#3a4058"/>
        <!-- koperen kooi -->
        <path d="M410 960 L410 700 Q500 600 590 700 L590 960" fill="none" stroke="url(#g-gold)" stroke-width="12"/>
        <path d="M450 960 L450 680 M500 960 L500 640 M550 960 L550 680" stroke="url(#g-gold)" stroke-width="5" opacity=".8"/>
        <path d="M400 960 L600 960 M405 830 L595 830" stroke="url(#g-gold)" stroke-width="10"/>
        <path d="M480 650 L500 590 L520 650" fill="url(#g-gold)"/>
      `;
    },
    props(G) {
      const f = (k) => G.flag(k);
      let s = '';
      // het glas in de lantaarn
      if (f('ending') === 'nieuw' || f('maanglasPlaced')) s += `<g>${Art.glow(500, 800, 360, 'blue', 1, 'glowpulse')}<circle cx="500" cy="800" r="80" fill="url(#g-glass)" stroke="#fff" stroke-width="3"/><path d="M500 760 l8 26 26 8 -26 8 -8 26 -8 -26 -26 -8 26 -8z" fill="#fff6c0" class="spin-slow"/></g>`;
      else if (f('ending') === 'oud') s += `<g>${Art.glow(500, 800, 380, '', 1, 'glowpulse')}<circle cx="500" cy="800" r="80" fill="#ffd890" opacity=".9"/></g>`;
      else s += `<g><circle cx="500" cy="800" r="80" fill="#3a4258" opacity=".85"/><circle cx="500" cy="800" r="80" fill="url(#g-glass)" opacity=".35"/><path d="M460 760 L500 800 L480 850 M500 800 L545 780" stroke="#1a1f30" stroke-width="3" fill="none"/></g>`;
      // ringen-sokkel
      s += `<g transform="translate(790 1180)">${Art.shadow(0, 10, 100, 16)}<path d="M-60 0 L-46 -150 L46 -150 L60 0 Z" fill="#4a5068"/>
        <ellipse cx="0" cy="-160" rx="80" ry="28" fill="#2a3048" stroke="url(#g-gold)" stroke-width="5"/><ellipse cx="0" cy="-160" rx="56" ry="19" fill="none" stroke="url(#g-gold)" stroke-width="4"/><ellipse cx="0" cy="-160" rx="32" ry="11" fill="none" stroke="url(#g-gold)" stroke-width="3"/>
        ${f('ringsDone') ? Art.glow(0, -170, 100, '', 0.8, 'glowpulse') : ''}</g>`;
      // oma
      s += `<g transform="translate(170 1210) scale(.95)">${Art.oma(!f('omaAwake'))}</g>`;
      if (!f('omaAwake')) s += `<g opacity=".7">${Art.mist(1190, 60, 0.9, 'drift-2', 91)}</g>`;
      // de Grijze Heer
      if (f('heerAppeared') && !f('ending')) s += `<g transform="translate(560 1260) scale(.92)">${Art.grijs(f('knowsName'))}</g>`;
      s += kwastPerch(G, 410, 952, false);
      return s;
    },
    hotspots(G) {
      const f = (k) => G.flag(k);
      const list = [
        { id: 'lantaarn', name: 'De Maanlantaarn', x: 400, y: 600, w: 200, h: 360, walk: [480, 1220], tap: async (G) => {
          if (!f('ringsDone')) { await M('De Maanlantaarn. Het glas is gebarsten en koud. Rechts staat een paal met draaiende ringen. Daarmee kun je de lantaarn bedienen, denk ik.'); return; }
          if (f('heerAppeared')) { await finalChoice(G); return; }
          await M('De lantaarn is klaar om aangestoken te worden. Maar door wat?');
        }, use: { maanglas: async (G) => { if (!f('heerAppeared')) { await M('Eerst moet ik weten hoe de lantaarn werkt. De ringen…'); return; } await finalChoice(G, 'nieuw'); } } },
        { id: 'ringen', name: 'Sterrenringen', x: 700, y: 980, w: 190, h: 210, walk: [700, 1260], tap: async (G) => {
          if (f('ringsDone')) { await M('De ringen staan vast op het slaapliedje.'); return; }
          const ok = await P.rings(G);
          if (ok) { G.set('ringsDone'); G.applyColor(); G.refresh(); await heerAppears(G); }
        } },
        { id: 'oma', name: 'Oma Brem', x: 90, y: 950, w: 170, h: 270, walk: [330, 1300], tap: (G) => omaTalk(G) , use: { nevelzicht: async (G) => { await M('Ik heb het drankje niet meer. En het zou haar ook niet wakker maken. De nevel zelf houdt haar vast.'); } } },
        { id: 'trap', name: 'Trap naar beneden', exit: 'down', to: 'trap', x: 60, y: 1300, w: 180, h: 200, walk: [150, 1400] },
      ];
      if (f('heerAppeared') && !f('ending')) list.push({ id: 'heer', name: 'De Grijze Heer', x: 440, y: 880, w: 240, h: 400, walk: [380, 1300], tap: (G) => finalChoice(G), use: { maanglas: async (G) => finalChoice(G, 'nieuw'), portret: async (G) => heerPortrait(G), vogeltje: async (G) => heerBird(G), bladzijde: async (G) => { if (!G.flag('saidName')) await finalChoice(G, 'name'); else await finalChoice(G); } } });
      const kh = kwastHot(G, 410, 952); if (kh) list.push(kh);
      return list;
    },
    async enter(G, first) {
      if (first) {
        await M('Oma! OMA!');
        await M('Ze zit daar op een krukje, met haar ogen dicht. Ze is een beetje doorzichtig. Alsof ze half van nevel is.');
        if (G.flag('kwastJoined')) await K('Ze ademt. Ze ademt, Mira. Kraa. Ik ben niet aan het huilen, ik heb iets in mijn oog. Een veer.');
        G.done('oma');
      }
    },
  });

  async function omaTalk(G) {
    if (!G.flag('ringsDone')) {
      await say('oma', '<em>…Mira? Ben jij dat, kind…? Ik ben zo moe. De nevel houdt me vast, als een zware deken.</em>');
      await say('oma', '<em>De ringen, kind. Zet het liedje op de ringen. Van buiten naar binnen. Dan komt hij… Dan kun je met hem praten…</em>');
      return;
    }
    await say('oma', '<em>Je bent er. Mijn dappere glasblazer. Wat je ook kiest… ik ben trots op je.</em>');
  }

  async function heerAppears(G) {
    A.music('finale'); A.sfx('rumble');
    await M('De ringen draaien… de lantaarn bromt… en de nevel kruipt door de ramen naar binnen!');
    G.set('heerAppeared'); G.refresh();
    await G.wait(400);
    await say('grijs', 'Zo. Het kind van de glasblazer. Je bent ver gekomen, door al mijn nevel.');
    await M('Wie… wat ben jij?');
    await say('grijs', 'Ik ben alles wat vergeten is. Elk liedje dat niemand meer zingt. Elke naam die niemand meer weet. Elke nacht at de lantaarn een herinnering op. En die kwamen allemaal bij mij.');
    await say('grijs', 'Ik ben de Grijze Heer. Ik was eens iemand. Ik weet niet meer wie.');
    if (G.flag('knowsName')) await M('<em>(Ik weet het wel. Teun vertelde het. Aldo…)</em>');
    await say('grijs', 'Je oma heeft de lantaarn uitgedaan. Nu kan de nevel over het dal komen. Dan vergeet iedereen alles. En dan ben ik niet meer de enige die vergeten is.');
    await say('grijs', 'Maar jij hebt de ringen gedraaid. De lantaarn kan weer branden. Jij mag kiezen, kind.');
    G.task('keuze', 'Kies wat er met de Maanlantaarn gebeurt.');
    await finalChoice(G);
  }

  async function heerBird(G) {
    if (G.flag('heerBird')) { await say('grijs', 'Mijn vogeltje. Ik laat hem niet meer los.'); return; }
    G.set('heerBird'); G.take('vogeltje'); A.sfx('magic'); G.refresh();
    G.choice('vogel', 'Je gaf de Grijze Heer het glazen vogeltje.');
    await M('Ik houd het glazen vogeltje omhoog. Het vangt het licht.');
    await say('grijs', 'Een… vogeltje. Van blauw glas. Ik had er zo een. Een meisje met vlechten blies hem voor mij.');
    await say('grijs', 'Ik weet het bijna. Haar naam. Mijn naam. Het zit vlak achter de nevel…');
    if (G.flag('knowsName') && !G.flag('saidName')) await M('<em>(Ik weet zijn naam. Ik moet hem zeggen.)</em>');
  }
  async function heerPortrait(G) {
    if (G.flag('knowsName')) { await finalChoice(G); return; }
    await say('grijs', 'Een portretje? Twee kinderen. Het meisje ken ik… Brem. De jongen… die zie ik niet. Daar is alleen nevel.');
  }

  async function finalChoice(G, pre) {
    const f = (k) => G.flag(k);
    const v = G.state.voices.length;
    let r = pre;
    while (!r || r === 'ask' || r === 'name') {
      if (r !== 'name' || !pre) r = await G.choose([
        { text: 'Waarom wil je dat iedereen vergeet?', value: 'ask' },
        { text: '<b>Aldo.</b> Je heet Aldo. Je bent Oma\'s broertje.', value: 'name', if: f('knowsName') && !f('saidName') },
        { text: '🔥 Steek de oude lantaarn weer aan.', value: 'oud' },
        { text: '🌫️ Laat de lantaarn gedoofd. Laat de nevel komen.', value: 'nevel' },
        { text: `✨ Zet mijn Maanglas in de lantaarn en zing het slaapliedje.`, value: 'nieuw', if: G.has('maanglas'), tag: v + '/3 stemmen' },
        { text: 'Ik moet eerst nog iets doen. Wacht op me.', value: 'later' },
      ], 'grijs', 'Kies, kind van de glasblazer.');
      if (r === 'ask') {
        await say('grijs', 'Weet je hoe het is om de enige te zijn die niemand kent? Als iedereen vergeet, ben ik niet meer de enige. Dan zijn we allemaal nevel. Samen.');
        await M('Maar dan vergeet ik Oma. En Kwast. En jou ook.');
        await say('grijs', '…Ja. Dat is waar.');
      }
      if (r === 'name') {
        G.set('saidName');
        A.sfx('magic');
        await say('grijs', 'Al… do. Aldo. Ik… speelde hier. Bij de toren. Er was een meisje met vlechten. Ze gaf me een glazen vogeltje…');
        await say('grijs', 'Brem. Mijn zusje. Ik was haar broertje. Hoe kon ik dat vergeten? Hoe konden zíj dat vergeten?');
        await M('Dat kwam door de lantaarn. Jij was het allereerste dat hij opat.');
        G.refresh();
        pre = null; r = null;
      }
    }
    if (r === 'later') { await say('grijs', 'Ga dan maar. De nevel kan wachten. Wachten is het enige wat ik kan.'); return; }
    if (r === 'nieuw') {
      if (!G.has('maanglas')) { await M('Ik heb nog geen Maanglas. Dat moet ik eerst maken, in Oma\'s oven.'); return; }
      if (v < 3) {
        G.set('maanglasPlaced'); G.take('maanglas'); G.refresh();
        A.sfx('glass');
        await M('Ik zet het Maanglas in de kooi en zing… <em>slaap, kleine vonk, de nacht is lang…</em>');
        await say('grijs', v ? 'Hoor je dat? Een paar stemmetjes. Zo dun als een draadje. Daar brandt geen lantaarn op.' : 'Hoor je dat? Eén stemmetje. Zo dun als een draadje. Daar brandt geen lantaarn op.');
        await K(`Je hebt meer stemmen nodig, Mira. ${v} is niet genoeg. Wie in het dal zou met je mee willen zingen?`);
        G.set('maanglasPlaced', false); G.give('maanglas', true); G.refresh();
        await M('Ik moet terug. Ik heb meer mensen nodig die met me mee willen zingen.');
        return;
      }
      await ending(G, 'nieuw');
      return;
    }
    const confirm = await G.choose([
      { text: r === 'oud' ? 'Ja. Steek het oude licht aan.' : 'Ja. Laat de nevel komen.', value: 'yes' },
      { text: 'Nee, wacht. Ik twijfel.', value: 'no' },
    ], 'mira', 'Weet ik het zeker? Dit kan ik niet terugdraaien.');
    if (confirm === 'yes') await ending(G, r);
  }

  /* ================= eindes ================= */
  async function ending(G, kind) {
    const f = (k) => G.flag(k);
    const v = G.state.voices;
    G.set('ending', kind); G.set('omaAwake');
    G.applyColor(); G.refresh();
    if (kind === 'nieuw') {
      G.take('maanglas'); G.refresh();
      A.music('ending'); A.sfx('magic');
      await M('Ik zet mijn Maanglas in de kooi. En ik zing. <em>Slaap, kleine vonk, de nacht is lang…</em>');
      if (v.includes('brokkel')) await say('brokkel', '<em>…de bergen slapen, de rivier zingt zacht…</em> BROKKEL ZINGT MEE!');
      if (v.includes('sabeth')) await say('sabeth', '<em>…de nevel draagt wat wij vergaten…</em>');
      if (v.includes('teun')) await say('teun', '<em>…en roeit het terug, slag voor slag…</em>');
      if (v.includes('sluip')) await say('sluip', '<em>Aoeeee… aoeee…</em>');
      if (v.includes('wieke')) await say('wieke', '<em>…wat jij vergeet, dat schrijf ik op…</em>');
      if (v.includes('isolde')) await say('isolde', '<em>…en elk glas dat zingt, brengt iemand thuis…</em>');
      await K('Kraa-kraa-KRAAA! (Ik zing ook. Niemand had het gevraagd. Ik doe het toch.)');
      A.sfx('voice');
      await say('grijs', 'Het licht… het eet niets op. Het geeft juist. Alle herinneringen gaan terug naar huis…');
      if (f('saidName') || f('knowsName')) {
        await say('grijs', 'En ik… ik weet wie ik ben.');
        await say('oma', 'Aldo…? ALDO! Mijn broertje! Ik weet het weer. Ik weet alles weer!');
      }
    } else if (kind === 'oud') {
      A.music('ending'); A.sfx('fire');
      await M('Ik draai de laatste ring. Een vonk springt in het oude glas. De lantaarn vlamt op, goud en fel.');
      await say('grijs', 'Nee… niet weer… Ik moet weg… Maar ik kom terug. Elke nacht word ik groter. Dat weet je toch, kind?');
    } else {
      A.music('dark');
      await M('Ik laat de lantaarn uit. De nevel komt zachtjes door de ramen naar binnen. Als een kat die eindelijk binnen mag.');
      await say('grijs', 'Dank je. Nu ben ik niet meer alleen. Nu zijn we allemaal… zacht… en grijs…');
    }
    await G.wait(400);
    const stats = `<div class="stats">
      <div class="stat"><b>${v.length}/6</b>stemmen</div>
      <div class="stat"><b>${G.state.kindness}</b>vriendelijkheid</div>
      <div class="stat"><b>${Math.round(G.state.playtime / 60)} min</b>speeltijd</div></div>`;
    const choices = G.state.choices.map((c) => `<li>${c.text}</li>`).join('');
    const choicesHtml = choices ? `<p><b>Jouw keuzes:</b></p><ul class="small">${choices}</ul>` : '';
    let title, text;
    if (kind === 'nieuw') {
      const named = f('saidName') || f('knowsName');
      title = named ? /* stem:verteller */ 'Het Nieuwe Lied, Thuis' : /* stem:verteller */ 'Het Nieuwe Lied';
      text = /* stem:verteller */ [
        'De Maanlantaarn brandt weer. Maar dit licht is anders. Het is zilver en warm, en het eet niets op. Het brandt op het lied dat het hele dal samen zingt.',
        'De nevel trekt weg. Iedereen in het dal krijgt zijn herinneringen terug. Hanna weet weer hoe de appeltaart van haar oma smaakte. En Sabeth ziet het gezicht van haar moeder weer, als ze haar ogen dichtdoet.',
        named ? 'Waar de Grijze Heer stond, staat nu een oude man met tranen op zijn wangen. Oma Brem houdt hem vast en laat niet meer los. Aldo is thuis, na zestig jaar.' : 'Waar de Grijze Heer stond, blijft een zacht, zilveren lichtje over. Het past op het dal, en het lijkt niet meer zo alleen. Wie hij was, weet niemand. Misschien kom je daar nog eens achter…',
        f('heerBird') ? 'In zijn handen glinstert het blauwe glazen vogeltje van vroeger.' : '',
        v.includes('isolde') ? 'En in het glas van de lantaarn glimlacht heel even een vrouw met een kroon van vlechten. Dan is ze weg. Nu kan ze rusten.' : '',
        'Elke avond, als de zon ondergaat, zingt het dal samen. Iedereen die meezong, zingt weer mee. Zelfs een kraai die vals meedoet. En een glasblazer die nu weet hoe sterk haar glas is.',
        stats, choicesHtml,
      ].filter(Boolean);
    } else if (kind === 'oud') {
      title = /* stem:verteller */ 'Het Oude Licht';
      text = /* stem:verteller */ [
        'De Maanlantaarn vlamt op, goud en vertrouwd. De nevel vlucht weg naar de randen van het dal. Overal gaan de lampen weer aan.',
        'Oma Brem doet haar ogen open. Ze glimlacht naar je. Lief, maar een beetje verbaasd. <em>“Wat aardig dat je me komt helpen, kind. Hoe heet je ook alweer?”</em>',
        'Want de lantaarn had honger. En vannacht at hij de herinnering op die het dichtstbij was: die aan jou.',
        'Het dal is veilig. Voor nu. Maar elke nacht wordt de nevel aan de rand een beetje dikker…',
        stats, choicesHtml,
        '<p class="small muted">Er is nog een ander einde. Wat als de lantaarn op iets anders kon branden?</p>',
      ];
    } else {
      title = /* stem:verteller */ 'Het Nevelrijk';
      text = /* stem:verteller */ [
        'De nevel stroomt het dal in, zacht als wol. Niemand doet zich pijn. Niemand is bang.',
        'Maar morgen weet Hanna niet meer hoe je brood bakt. Teun vergeet het meer. Brokkel vergeet zijn brug. En jij… jij vergeet langzaam waarom je ooit de trap op liep.',
        'De Grijze Heer is niet meer alleen. Niemand is meer alleen. Iedereen is nevel, samen.',
        'Het is stil en grijs. En heel, heel rustig.',
        stats, choicesHtml,
        '<p class="small muted">Er zijn nog andere eindes. Kan het ook zo, dat niemand iets kwijtraakt?</p>',
      ];
    }
    G.profile.endings = Array.from(new Set((G.profile.endings || []).concat(kind)));
    G.state.ended = true; G.profile.auto = null; G.Store.save();
    await G.card({ kicker: 'Einde', title, text, btn: 'Terug naar het begin', music: kind === 'nevel' ? 'dark' : 'ending' });
    window.UI.toTitle();
  }
  G.ending = ending;
})();
