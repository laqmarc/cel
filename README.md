# Explorador NASA API

Aplicacio web local per explorar dades i imatges de NASA amb una interfície visual. Inclou galeries, cerca, favorits, grafics, detall orbital JPL i mapa global d'esdeveniments naturals.

## Arrencada

Instal.la dependencies si no existeix `node_modules`:

```bash
cmd /c npm install
```

Arrenca el servidor local:

```bash
node server.js
```

Obre:

```text
http://127.0.0.1:5501/index.html
```

No facis servir Live Server per aquesta app: el projecte necessita `server.js` per fer de proxy cap a les APIs externes i evitar problemes de CORS.

## Desplegament a Plesk

Aquesta app no pot funcionar nomes com a fitxers estatics, perque el frontend crida rutes locals com:

```text
/api/nasa/*
/api/images/*
/api/jpl/*
/api/eonet/*
/api/texture
```

Aquestes rutes les crea ``. A Plesk has de configurar-la com a aplicacio Node.js.

Passos recomanats:

1. Puja tot el projecte excepte `node_modules`.
2. A Plesk, activa Node.js per al domini.
3. Defineix:
   - Application root: carpeta del projecte.
   - Document root: carpeta del projecte.
   - Application startup file: `server.js`.
4. Executa:

```bash
npm install
```

5. Afegeix una variable d'entorn a Plesk:

```text
NASA_API_KEY=la-teva-clau
```

6. Reinicia l'aplicacio Node.js des de Plesk.

Comprovacions:

```text
https://el-teu-domini.com/health
```

Ha de respondre:

```json
{
  "ok": true,
  "service": "nasa-api-explorer",
  "hasNasaApiKey": true
}
```

Despres prova:

```text
https://el-teu-domini.com/api/nasa/planetary/apod?date=2024-01-15
```

Si `/health` no respon, Plesk esta servint la web com a estatica o Node no esta arrencat.

Si `/health` respon pero `/api/nasa/...` falla, revisa:

- variable `NASA_API_KEY`
- logs de Node a Plesk
- connexio sortint HTTPS del servidor
- que el hosting permeti crides externes cap a `api.nasa.gov`, `images-api.nasa.gov`, `ssd-api.jpl.nasa.gov`, `eonet.gsfc.nasa.gov` i `www.solarsystemscope.com`

## Configuracio API

La clau de NASA es carrega des de:

```text
config.local.js
```

Format:

```js
window.NASA_API_KEY = "la-teva-clau";
```

Aquest fitxer esta al `.gitignore` per evitar pujar la clau.

Hi ha un exemple segur a:

```text
config.local.example.js
```

## Pestanyes

### Dashboard

Pantalla inicial amb resum de tota l'app:

- APOD destacat amb imatge clicable.
- Resum d'asteroides de l'ultima setmana.
- Nombre d'objectes potencialment perillosos.
- Velocitat de l'asteroide mes rapid.
- Resum d'esdeveniments actius de la Terra via EONET.
- Resum de favorits guardats.
- Accessos rapids a Cerca, Grafics, Terra i Favorits.

Connexions:

- `GET /api/nasa/planetary/apod`
- `GET /api/nasa/neo/rest/v1/feed`
- `GET /api/eonet/api/v3/events`

### APOD

Consulta la imatge astronomica del dia per data.

Funcions:

- Selector de data.
- Imatge o previsualitzacio del recurs.
- Explicacio de NASA.
- Enllaç al recurs original.
- Popup a pantalla gran clicant la imatge.
- Guardar a favorits.

Connexio:

- `GET /api/nasa/planetary/apod`

API externa:

- `https://api.nasa.gov/planetary/apod`

### Galeria

Galeria APOD de diversos dies.

Funcions:

- Seleccio de 7, 14 o 30 dies.
- Graella d'imatges.
- Popup a pantalla gran.
- Favorits.

Connexio:

- `GET /api/nasa/planetary/apod?start_date=...&end_date=...`

### Cerca NASA

Cercador general d'imatges de NASA Image and Video Library.

Funcions:

- Cerca lliure per text.
- Quantitat configurable: 12, 24 o 36.
- Tags combinables en una linia amb scroll horitzontal.
- Historial de cerques guardat al navegador.
- Botó per netejar tags.
- Botó per netejar historial.
- Popup a pantalla gran.
- Favorits.

Tags actuals:

- Planeta
- Lluna
- Galaxia
- Nebulosa
- Telescopi
- Nau
- Astronauta
- Terra
- Mart
- Venus
- Jupiter
- Saturn
- Uranus
- Neptune
- Pluto
- Apollo
- Artemis
- Hubble
- Webb
- ISS
- Forat negre
- Supernova
- Cometa
- Asteroide
- Sol
- Eclipsi
- Llançament
- Rover

Connexio:

- `GET /api/images/search`

API externa:

- `https://images-api.nasa.gov/search`

### Mart

Cerca imatges relacionades amb Mart a NASA Image and Video Library.

Funcions:

- Cerca per text.
- Valor inicial: `Mars rover`.
- Graella d'imatges.
- Popup a pantalla gran.
- Favorits.

Connexio:

- `GET /api/images/search`

API externa:

- `https://images-api.nasa.gov/search`

### Asteroides

Llista d'objectes propers a la Terra amb NASA NeoWs.

Funcions:

- Selector de data inicial i final.
- Interval maxim de 7 dies.
- Targetes resum:
  - total
  - potencialment perillosos
  - mes proper
  - mes rapid
- Llista d'asteroides amb:
  - nom
  - data de pas
  - diametre estimat
  - distancia
  - velocitat
  - enllaç JPL

Connexio:

- `GET /api/nasa/neo/rest/v1/feed`

API externa:

- `https://api.nasa.gov/neo/rest/v1/feed`

### Grafics

Dashboard de dades NeoWs amb Chart.js.

Funcions:

- Dates per defecte: ultima setmana.
- Grafic de barres d'objectes per dia.
- Linia de risc per dia.
- Donut de risc:
  - potencialment perillosos
  - seguiment normal
- Bubble chart:
  - velocitat vs distancia
  - mida segons diametre estimat
  - color segons risc
- Grafic de diametres mes grans.
- Linia de velocitat mitjana i maxima per dia.
- Ranking d'objectes mes rapids.
- Panell detallat d'objectes potencialment perillosos.

Panell de risc:

- Comptador de perillosos.
- Mes proper.
- Mes rapid.
- Mes gran.
- Distancia mitjana.
- Taula amb:
  - nom
  - data
  - distancia
  - velocitat
  - diametre
  - boto `Orbita`

Connexio:

- `GET /api/nasa/neo/rest/v1/feed`

Llibreria:

- Chart.js local: `node_modules/chart.js/dist/chart.umd.js`

### Detall Orbita

Popup obert des de la pestanya Grafics, dins la taula d'objectes potencialment perillosos.

Funcions:

- Consulta JPL Small-Body Database.
- Mostra:
  - nom complet
  - classificacio orbital
  - SPKID
  - epoch
  - condition code
  - arc de dades
  - observacions usades
  - elements orbitals
  - parametres fisics disponibles
  - aproximacions properes
  - enllaç directe a JPL
- Grafics interns:
  - barres d'elements orbitals clau
  - linia d'aproximacions properes amb distancia i velocitat relativa

Connexio:

- `GET /api/jpl/sbdb.api`

API externa:

- `https://ssd-api.jpl.nasa.gov/sbdb.api`

### Terra

Mapa global d'esdeveniments naturals amb NASA EONET i Leaflet.

Funcions:

- Mapa mundial interactiu.
- Marcadors de colors per categoria.
- Filtres:
  - categoria
  - estat
  - regio
  - dies
- Regions:
  - Global
  - Europa
  - Africa
  - Asia
  - America Nord
  - America Sud
  - Oceania
- Estadistiques:
  - total
  - actius
  - categoria principal
  - events amb magnitud
- Donut per categories.
- Llista lateral d'esdeveniments.
- Clic en event per centrar el mapa.
- Clic en marcador per popup amb titol, categoria i data.

Connexio:

- `GET /api/eonet/api/v3/events`

API externa:

- `https://eonet.gsfc.nasa.gov/api/v3/events`

Llibreria:

- Leaflet local:
  - `node_modules/leaflet/dist/leaflet.js`
  - `node_modules/leaflet/dist/leaflet.css`

### Sistema Solar

Planetari 3D interactiu amb Three.js.

Funcions:

- Sol i planetes en una escena 3D.
- Sol clicable amb fitxa detallada.
- Textures reals de planetes i Sol carregades via proxy local.
- Capa de núvols sobre la Terra.
- Textura d'anells de Saturn.
- Orbites visibles.
- Animacio orbital.
- Controls de camera amb OrbitControls.
- Labels clicables sobre cada planeta.
- Cinturo d'asteroides procedural.
- Cinturo d'asteroides clicable amb explicacio i objectes principals.
- Asteroides destacats clicables: Ceres, Vesta, Pallas, Hygiea i Eros.
- Glow visual del Sol.
- Saturn amb anells.
- Seleccio visual del planeta clicat.
- Control de velocitat.
- Boto per mostrar/amagar orbites.
- Boto per reiniciar camera.
- Clic en el Sol, un planeta o un asteroide per veure dades ampliades: diametre, dia, any, satel·lits, temperatura i missions.
- Boto per buscar imatges NASA del planeta seleccionat.

Llibreria:

- Three.js local:
  - `node_modules/three/build/three.module.min.js`

### Favorits

Imatges guardades localment al navegador.

Funcions:

- Guarda imatges des d'APOD, Galeria, Cerca NASA i Mart.
- Mostra graella de favorits.
- Popup a pantalla gran.
- Botó per netejar favorits.

Persistencia:

- `localStorage`
- clau: `nasa-favorites`

## Proxies locals

El servidor local exposa rutes internes per evitar CORS i centralitzar connexions:

```text
/api/nasa/*
/api/images/*
/api/jpl/*
/api/eonet/*
/api/texture
```

Mapeig:

```text
/api/nasa/*   -> https://api.nasa.gov/*
/api/images/* -> https://images-api.nasa.gov/*
/api/jpl/*    -> https://ssd-api.jpl.nasa.gov/*
/api/eonet/*  -> https://eonet.gsfc.nasa.gov/*
/api/texture  -> textures planetaries de Solar System Scope
```

## Fitxers principals

- `index.html`: estructura HTML de totes les pestanyes.
- `styles.css`: disseny responsive, dashboard, mapes, modals i grafics.
- `app.js`: logica de frontend, crides API, renderitzat, Chart.js, Leaflet i Three.js.
- `server.js`: servidor local i proxies.
- `config.local.js`: clau API local.
- `config.local.example.js`: exemple de configuracio sense secrets.
- `package.json`: dependencies i scripts.
- `package-lock.json`: versions exactes instal·lades.

## Dependencies

- `chart.js`: grafics de dades.
- `leaflet`: mapa interactiu.
- `three`: escena 3D del Sistema Solar.

Instal·lacio:

```bash
cmd /c npm install
```

## Notes

- NeoWs limita els intervals del feed a 7 dies.
- EONET pot tenir mes o menys dades segons fonts i dies seleccionats.
- Per veure dades europees a Terra, prova:
  - Regio: `Europa`
  - Estat: `Tots`
  - Dies: `90`
- Si canvies `server.js`, reinicia el servidor.
- Si el navegador mostra dades antigues, fes `Ctrl + F5`.
- La web inclou loader inicial, transicions suaus, tabs sticky i ajustos responsive.
