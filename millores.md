
1. Three.js carregant sempre (el pitjor culpable)
El Sistema Solar 3D és extremadament costós. Si es carrega encara que l'usuari no vagi a aquella pestanya, mata el mòbil.
Solució: lazy load per pestanya
javascript// Només inicialitzar Three.js quan l'usuari clica la pestanya "Sistema Solar"
document.querySelector('[data-tab="solar-system"]').addEventListener('click', () => {
  if (!solarSystemInitialized) {
    initSolarSystem(); // mou aquí tot el codi Three.js
    solarSystemInitialized = true;
  }
});

2. Textures de planetes sense comprimir
Les textures de solarsystemscope.com poden pesar MB. Afegeix un límit de mida al proxy o carrega textures de baixa resolució en mòbil:
javascriptconst isMobile = window.innerWidth < 768;
const textureQuality = isMobile ? 'low' : 'high'; // usa URLs de textura diferent

3. Chart.js creant tots els gràfics al inici
Mateix problema. Destroys i recrea només quan cal:
javascript// Destrueix el chart quan surts de la pestanya per alliberar memòria
chart.destroy();
chart = null;

4. Scroll lent → probablement scroll listeners pesats o reflows
Afegeix passive: true a tots els listeners d'scroll:
javascript// En lloc de:
window.addEventListener('scroll', handler);

// Posa:
window.addEventListener('scroll', handler, { passive: true });

5. Imatges sense lazy load
A la galeria i cerca, les imatges probablement es carreguen totes alhora. Afegeix:
html<img src="..." loading="lazy" decoding="async">

Per on començar
La millora més gran i ràpida serà el punt 1 (no inicialitzar Three.js fins que l'usuari vagi a la pestanya del Sistema Solar). Pot reduir l'ús de memòria inicial a la meitat fàcilment.
Vols que t'ajudi a refactoritzar alguna d'aquestes parts concretament? Puja l'app.js i ho mirem.