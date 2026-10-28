# Nevelrijk — Het Lied van de Maanlantaarn

Een point-and-click avontuur in de geest van de oude Kyrandia-games, gebouwd voor de telefoon (staand scherm), maar het werkt ook op desktop.

## Spelen

- **Online (privé):** https://claude.ai/artifact/Uu6St59aH49RTnaDSAzK9T
- **Lokaal:** `node server.js` en open dan http://localhost:8765
- **Op je telefoon thuis:** start `node server.js` en open `http://<ip-van-je-mac>:8765` op de telefoon (zelfde wifi). Via "Zet op beginscherm" wordt het een app.

## Besturing

- Tik op de grond om te lopen, en op dingen of personen om ze te bekijken, te pakken of mee te praten.
- Tik op een voorwerp in je rugzak om het te kiezen en tik dan op iets in de wereld om het te gebruiken. Kies twee voorwerpen achter elkaar om ze te combineren. Tik twee keer op hetzelfde voorwerp om het te bekijken.
- ✦ laat zien waar je op kunt tikken. 🪶 vraagt Kwast de kraai om een hint. 📖 opent het dagboek met taken, verzamelde stemmen en je keuzes.
- Op desktop: `H` geeft een hint, `R` toont tikbare plekken, `J` opent het dagboek en `Esc` het menu.

## Wat erin zit

- **6 hoofdstukken, 10 locaties:** werkplaats, dorpsplein, Fluisterbos, Brokkelbrug, Paddenstoelenholte, Nevelmeer, het Eiland van Vergeten Dingen, voet van de toren, de Spiegeltrap en de lantaarnkamer.
- **11 personages:** Mira, Kwast de kraai, Oma Brem, bakker Hanna, Brokkel de trol, kruidenvrouw Sabeth, Teun de veerman, Sluip de nevelvos, Wieke de mot, Isolde (een spiegelbeeld) en de Grijze Heer.
- **7 puzzels**, elk in een makkelijke en een moeilijke versie: de zingende stenen (melodie), de raadsels van Brokkel, het drankje brouwen, glasblazen (timing), het glazen vogeltje (stukjes draaien), de Spiegeltrap (maanlicht kaatsen) en de sterrenringen.
- **Voorwerpen** die je oppakt, gebruikt en combineert (haak + touw = werphaak).
- **Keuzes met gevolgen** en **3 eindes**. Er zijn 6 stemmen te verdienen door aardig te zijn, en voor het beste einde heb je er 3 nodig. Wie onaardig was, kan het later nog goedmaken.
- **Teksten voor kinderen vanaf 8:** korte zinnen en gewone woorden.
- **Kleur keert terug:** de nevel trekt de kleur uit de wereld en die komt terug naarmate je verder komt.
- **Geluid:** zachte, mysterieuze muziek per locatie (mineur, trage klanken, losse belletjes met echo), sfeergeluiden en effecten, allemaal live gesynthetiseerd. Het slaapliedje van Oma komt terug in de muziek en is ook de oplossing van twee puzzels.
- **Gesproken tekst:** echte opnames van Azure (zie hieronder). Zolang die er niet zijn, of als een zin ontbreekt, spreekt de stem van je toestel.
- **Profielen en opslag:** meerdere profielen, elk met een eigen moeilijkheid, eigen instellingen, automatisch opslaan en 3 handmatige opslagplekken.
- **Toegankelijkheid:** ondertiteling altijd aan, tekstgrootte, een leesbaar lettertype, hoog contrast, minder beweging, namen altijd tonen, tekstsnelheid, automatisch doorgaan, bediening met het toetsenbord en meldingen voor schermlezers. De melodiepuzzel toont ook visueel de toonhoogte, dus je kunt hem zonder geluid oplossen.

## Stemmen maken met Azure

1. Maak een gratis Azure-account en daarin een **Speech**-resource (gratis prijsniveau F0). Noteer de **sleutel** en de **regio** (bijvoorbeeld `westeurope`).
2. Maak het bestand `tools/.env` met:
   ```
   AZURE_SPEECH_KEY=jouw-sleutel
   AZURE_SPEECH_REGION=westeurope
   ```
3. Probeer eerst één zin per personage:
   ```
   node tools/stemmen.mjs test
   ```
   Open daarna `audio/voice-test/index.html` om te luisteren. Bevalt een stem niet? Pas hem aan in `tools/stemmen.config.json` (`node tools/stemmen.mjs stemmen` toont alle Nederlandse stemmen).
4. Maak alle zinnen (ongeveer 510 zinnen en 39.000 tekens, dus ruim binnen het gratis tegoed). Dit duurt zo'n 25 minuten:
   ```
   node tools/stemmen.mjs alles
   ```

De stemverdeling staat in `tools/stemmen.config.json`. De vier nieuwere MAI-stemmen horen elk bij één personage dat veel praat: Fleur bij Mira, Sander bij Kwast, Harper bij de verteller en Grant bij Brokkel. De andere personages krijgen de klassieke Nederlandse en Vlaamse stemmen, met elk een eigen toonhoogte. Je Azure-resource staat op het gratis prijsniveau F0. Daarop rekent Azure niets af, en als het tegoed op is, weigert het gewoon.

De opnames komen in `audio/voice/`. De game speelt ze vanzelf af. Verander je later tekst, draai dan opnieuw `alles`: alleen nieuwe zinnen worden gemaakt, en oude opnames die niet meer nodig zijn worden opgeruimd.

## Bestanden

| Bestand | Inhoud |
|---|---|
| `js/scenes.js` | Verhaal, locaties, dialogen, hints en eindes |
| `js/engine.js` | Spelstaat, opslaan, lopen, hotspots, dialogen, rugzak en deeltjes |
| `js/puzzles.js` | De zeven puzzels |
| `js/art.js` | Alle SVG-tekeningen: personages, voorwerpen en landschapsonderdelen |
| `js/audio.js` | Muziek, effecten en spraak (opnames of toestelstem) |
| `js/voicekey.js` | Koppelt elke zin aan zijn opname |
| `tools/stemmen.mjs` | Haalt alle zinnen uit de game en laat ze inspreken door Azure |
| `js/ui.js` | Titelscherm, profielen, instellingen, menu en dagboek |

<details><summary>Spoiler: het verhaal</summary>

De Maanlantaarn houdt de nevel buiten het dal, maar brandt op herinneringen: elke nacht één. Wat vergeten wordt, wordt nevel. De lantaarn maakt dus zelf de nevel die hij tegenhoudt. Isolde, de moeder van Oma Brem, blies het glas en stak hem aan. De eerste herinnering die hij at was haar zoontje Aldo, het broertje van Oma. Hij werd de Grijze Heer. Op het Eiland van Vergeten Dingen houdt Wieke de mot alles bij wat vergeten wordt; de eerste bladzijde van haar Register (met Aldo's naam) waaide weg en zit in een fles in de mast van een wrak.

Eindes:
- **Het Oude Licht:** steek de oude lantaarn aan. Het dal is veilig, maar Oma vergeet jou.
- **Het Nevelrijk:** laat de nevel komen. Een stille, grijze vrede.
- **Het Nieuwe Lied:** blaas je eigen Maanglas en zing met minstens 3 stemmen. Als je Aldo's naam hebt ontdekt (via Teun en het portretje, of via de eerste bladzijde), komt hij thuis. Geef hem ook het glazen vogeltje voor een extra stukje einde.

</details>
