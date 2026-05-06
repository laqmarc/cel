const NASA_BASE_URL = "/api/nasa";
const DEFAULT_API_KEY = "DEMO_KEY";
const LOCAL_API_KEY = window.NASA_API_KEY || "";
const INITIAL_APOD_DATE = "2024-01-15";
const INITIAL_NEO_START_DATE = "2024-01-15";
const INITIAL_NEO_END_DATE = "2024-01-16";
const FAVORITES_KEY = "nasa-favorites";
const SEARCH_HISTORY_KEY = "nasa-search-history";

const state = {
  apiKey: LOCAL_API_KEY || localStorage.getItem("nasa-api-key") || DEFAULT_API_KEY,
  favorites: readFavorites(),
  searchHistory: readSearchHistory(),
  activeSearchTags: [],
  charts: {},
};

const selectors = {
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  dashboardApod: document.querySelector("#dashboard-apod"),
  dashboardNeo: document.querySelector("#dashboard-neo"),
  dashboardEarth: document.querySelector("#dashboard-earth"),
  dashboardFavorites: document.querySelector("#dashboard-favorites"),
  refreshDashboard: document.querySelector("#refresh-dashboard"),
  dashboardJumps: document.querySelectorAll("[data-jump]"),
  apodForm: document.querySelector("#apod-form"),
  apodDate: document.querySelector("#apod-date"),
  apodResult: document.querySelector("#apod-result"),
  galleryForm: document.querySelector("#gallery-form"),
  galleryCount: document.querySelector("#gallery-count"),
  galleryResult: document.querySelector("#gallery-result"),
  searchForm: document.querySelector("#search-form"),
  searchQuery: document.querySelector("#search-query"),
  searchCount: document.querySelector("#search-count"),
  searchResult: document.querySelector("#search-result"),
  searchTags: document.querySelectorAll("[data-tag]"),
  clearSearchTags: document.querySelector("#clear-search-tags"),
  searchHistory: document.querySelector("#search-history"),
  clearSearchHistory: document.querySelector("#clear-search-history"),
  marsForm: document.querySelector("#mars-form"),
  marsQuery: document.querySelector("#mars-query"),
  marsResult: document.querySelector("#mars-result"),
  neoForm: document.querySelector("#neo-form"),
  neoStart: document.querySelector("#neo-start"),
  neoEnd: document.querySelector("#neo-end"),
  neoStats: document.querySelector("#neo-stats"),
  neoResult: document.querySelector("#neo-result"),
  analyticsForm: document.querySelector("#analytics-form"),
  analyticsStart: document.querySelector("#analytics-start"),
  analyticsEnd: document.querySelector("#analytics-end"),
  dailyChart: document.querySelector("#daily-chart"),
  riskChart: document.querySelector("#risk-chart"),
  scatterChart: document.querySelector("#scatter-chart"),
  diameterChart: document.querySelector("#diameter-chart"),
  speedLineChart: document.querySelector("#speed-line-chart"),
  riskLegend: document.querySelector("#risk-legend"),
  hazardousCount: document.querySelector("#hazardous-count"),
  hazardousStats: document.querySelector("#hazardous-stats"),
  hazardousTable: document.querySelector("#hazardous-table"),
  speedRanking: document.querySelector("#speed-ranking"),
  earthForm: document.querySelector("#earth-form"),
  earthCategory: document.querySelector("#earth-category"),
  earthStatus: document.querySelector("#earth-status"),
  earthRegion: document.querySelector("#earth-region"),
  earthDays: document.querySelector("#earth-days"),
  earthStats: document.querySelector("#earth-stats"),
  earthMap: document.querySelector("#earth-map"),
  earthCategoryChart: document.querySelector("#earth-category-chart"),
  earthEventList: document.querySelector("#earth-event-list"),
  earthCount: document.querySelector("#earth-count"),
  solarStage: document.querySelector("#solar-stage"),
  solarPanel: document.querySelector("#solar-panel"),
  solarSpeed: document.querySelector("#solar-speed"),
  toggleOrbits: document.querySelector("#toggle-orbits"),
  solarReset: document.querySelector("#solar-reset"),
  favoritesResult: document.querySelector("#favorites-result"),
  clearFavorites: document.querySelector("#clear-favorites"),
  detailModal: document.querySelector("#detail-modal"),
  modalClose: document.querySelector("#modal-close"),
  modalContent: document.querySelector("#modal-content"),
  loadingTemplate: document.querySelector("#loading-template"),
  appLoader: document.querySelector("#app-loader"),
};

const today = new Date();
const todayIso = toIsoDate(today);
selectors.apodDate.max = todayIso;
selectors.apodDate.value = INITIAL_APOD_DATE;
selectors.neoStart.value = INITIAL_NEO_START_DATE;
selectors.neoEnd.value = INITIAL_NEO_END_DATE;
selectors.neoStart.max = todayIso;
selectors.neoEnd.max = todayIso;
selectors.analyticsStart.value = toIsoDate(addDays(today, -6));
selectors.analyticsEnd.value = todayIso;
selectors.analyticsStart.max = todayIso;
selectors.analyticsEnd.max = todayIso;

selectors.tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateView(tab.dataset.view));
});

selectors.refreshDashboard.addEventListener("click", () => loadDashboard());

selectors.dashboardJumps.forEach((button) => {
  button.addEventListener("click", () => activateView(button.dataset.jump));
});

selectors.apodForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadApod(selectors.apodDate.value);
});

selectors.galleryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadApodGallery();
});

selectors.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadImageSearch();
});

selectors.searchTags.forEach((button) => {
  button.addEventListener("click", () => {
    const tag = button.dataset.tag;

    if (state.activeSearchTags.includes(tag)) {
      state.activeSearchTags = state.activeSearchTags.filter((item) => item !== tag);
    } else {
      state.activeSearchTags = [...state.activeSearchTags, tag];
    }

    updateSearchTags();
    loadImageSearch();
  });
});

selectors.clearSearchTags.addEventListener("click", () => {
  state.activeSearchTags = [];
  updateSearchTags();
  loadImageSearch();
});

selectors.searchHistory.addEventListener("click", (event) => {
  const button = event.target.closest("[data-history-query]");

  if (!button) {
    return;
  }

  selectors.searchQuery.value = button.dataset.historyQuery;
  state.activeSearchTags = [];
  updateSearchTags();
  loadImageSearch();
});

selectors.clearSearchHistory.addEventListener("click", () => {
  state.searchHistory = [];
  saveSearchHistory();
  renderSearchHistory();
});

selectors.marsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadMarsPhotos();
});

selectors.neoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadNearEarthObjects();
});

selectors.analyticsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadAnalytics();
});

selectors.earthForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadEarthEvents();
});

selectors.toggleOrbits.addEventListener("click", () => {
  state.solarShowOrbits = !state.solarShowOrbits;
  state.solarOrbitObjects?.forEach((orbit) => {
    orbit.visible = state.solarShowOrbits;
  });
});

selectors.solarReset.addEventListener("click", () => resetSolarCamera());

selectors.clearFavorites.addEventListener("click", () => {
  state.favorites = [];
  saveFavorites();
  renderFavorites();
});

selectors.modalClose.addEventListener("click", () => selectors.detailModal.close());

selectors.detailModal.addEventListener("click", (event) => {
  if (event.target === selectors.detailModal) {
    selectors.detailModal.close();
  }
});

document.addEventListener("click", (event) => {
  const detailsButton = event.target.closest("[data-action='details']");
  const favoriteButton = event.target.closest("[data-action='favorite']");
  const orbitButton = event.target.closest("[data-action='orbit']");

  if (detailsButton) {
    event.preventDefault();
    openDetail(detailsButton.dataset.id);
    return;
  }

  if (favoriteButton) {
    event.preventDefault();
    toggleFavorite(favoriteButton.dataset.id);
    return;
  }

  if (orbitButton) {
    event.preventDefault();
    openOrbitalDetail(orbitButton.dataset.neoId);
  }
});

loadInitialData();

function activateView(viewName) {
  selectors.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewName));
  selectors.views.forEach((view) => view.classList.toggle("active", view.id === `${viewName}-view`));

  if (viewName === "mars" && selectors.marsResult.children.length === 0) {
    loadMarsPhotos();
  }

  if (viewName === "gallery" && selectors.galleryResult.children.length === 0) {
    loadApodGallery();
  }

  if (viewName === "search" && selectors.searchResult.children.length === 0) {
    loadImageSearch();
  }

  if (viewName === "neo" && selectors.neoResult.children.length === 0) {
    loadNearEarthObjects();
  }

  if (viewName === "analytics" && selectors.speedRanking.children.length === 0) {
    loadAnalytics();
  }

  if (viewName === "earth") {
    if (!state.earthLoaded) {
      loadEarthEvents();
    }

    setTimeout(() => state.earthMap?.invalidateSize(), 0);
  }

  if (viewName === "solar") {
    initSolarSystem();
    setTimeout(() => resizeSolarSystem(), 0);
  }

  if (viewName === "favorites") {
    renderFavorites();
  }
}

const SOLAR_TEXTURE_BASE = "https://www.solarsystemscope.com/textures/download/";

const SOLAR_PLANETS = [
  { name: "Mercury", ca: "Mercuri", radius: 0.38, distance: 4, speed: 4.15, color: "#9a9a9a", texture: "2k_mercury.jpg", fact: "El planeta mes proper al Sol.", diameter: "4.879 km", day: "58,6 dies", year: "88 dies", moons: "0", temp: "-173 a 427 C", missions: "Mariner 10, MESSENGER, BepiColombo" },
  { name: "Venus", ca: "Venus", radius: 0.72, distance: 5.6, speed: 1.62, color: "#d8b26e", texture: "2k_venus_surface.jpg", fact: "Atmosfera molt densa i temperatura extrema.", diameter: "12.104 km", day: "243 dies", year: "225 dies", moons: "0", temp: "465 C", missions: "Magellan, Venus Express, Akatsuki" },
  { name: "Earth", ca: "Terra", radius: 0.78, distance: 7.4, speed: 1, color: "#5ca8ff", texture: "2k_earth_daymap.jpg", clouds: "2k_earth_clouds.jpg", fact: "El nostre planeta, amb oceans i atmosfera activa.", diameter: "12.742 km", day: "24 h", year: "365,25 dies", moons: "1", temp: "-89 a 58 C", missions: "Landsat, Terra, Aqua, DSCOVR" },
  { name: "Mars", ca: "Mart", radius: 0.52, distance: 9.2, speed: 0.53, color: "#d66a3f", texture: "2k_mars.jpg", fact: "Objectiu de rovers i futures missions tripulades.", diameter: "6.779 km", day: "24 h 37 min", year: "687 dies", moons: "2", temp: "-125 a 20 C", missions: "Viking, Curiosity, Perseverance, MRO" },
  { name: "Jupiter", ca: "Jupiter", radius: 1.7, distance: 12.4, speed: 0.084, color: "#d7b48a", texture: "2k_jupiter.jpg", fact: "El planeta mes gran del Sistema Solar.", diameter: "139.820 km", day: "9 h 56 min", year: "11,86 anys", moons: "95+", temp: "-110 C núvols", missions: "Voyager, Galileo, Juno, Europa Clipper" },
  { name: "Saturn", ca: "Saturn", radius: 1.45, distance: 15.8, speed: 0.034, color: "#ead39b", texture: "2k_saturn.jpg", ringTexture: "2k_saturn_ring_alpha.png", fact: "Famos per l'espectacular sistema d'anells.", diameter: "116.460 km", day: "10 h 33 min", year: "29,45 anys", moons: "146+", temp: "-140 C núvols", missions: "Pioneer 11, Voyager, Cassini-Huygens" },
  { name: "Uranus", ca: "Uranus", radius: 1.05, distance: 18.8, speed: 0.012, color: "#88d8df", texture: "2k_uranus.jpg", fact: "Gegant gelat amb inclinacio extrema.", diameter: "50.724 km", day: "17 h 14 min", year: "84 anys", moons: "27", temp: "-195 C", missions: "Voyager 2" },
  { name: "Neptune", ca: "Neptune", radius: 1.02, distance: 21.6, speed: 0.006, color: "#4a6dff", texture: "2k_neptune.jpg", fact: "Gegant gelat amb vents molt intensos.", diameter: "49.244 km", day: "16 h", year: "164,8 anys", moons: "14", temp: "-200 C", missions: "Voyager 2" },
];

const SOLAR_SUN = {
  name: "Sun",
  ca: "Sol",
  fact: "Estrella central del Sistema Solar. La seva gravetat domina les orbites dels planetes, cometes i asteroides.",
  diameter: "1.392.700 km",
  day: "Rotacio diferencial: 25-35 dies",
  year: "Orbita la Via Lactia en uns 230 milions d'anys",
  moons: "No aplica",
  temp: "5.500 C superficie, ~15 milions C nucli",
  missions: "SOHO, SDO, Parker Solar Probe, Solar Orbiter",
};

const SOLAR_ASTEROIDS = [
  { name: "Ceres", ca: "Ceres", distance: 10.9, angle: 0.4, radius: 0.2, color: "#b8b0a4", fact: "Planeta nan i objecte mes gran del cinturo d'asteroides.", diameter: "940 km", day: "9 h", year: "4,6 anys", missions: "Dawn", jpl: "Ceres" },
  { name: "Vesta", ca: "Vesta", distance: 10.7, angle: 2.2, radius: 0.16, color: "#d0c0a8", fact: "Un dels asteroides mes brillants vistos des de la Terra.", diameter: "525 km", day: "5,3 h", year: "3,6 anys", missions: "Dawn", jpl: "Vesta" },
  { name: "Pallas", ca: "Pallas", distance: 11.5, angle: 4.1, radius: 0.15, color: "#aaa6a0", fact: "Asteroide gran amb orbita inclinada respecte al pla principal.", diameter: "512 km", day: "7,8 h", year: "4,6 anys", missions: "Observacions telescopiques", jpl: "Pallas" },
  { name: "Hygiea", ca: "Hygiea", distance: 11.8, angle: 5.2, radius: 0.13, color: "#8f8a83", fact: "Un dels cossos principals del cinturo exterior.", diameter: "434 km", day: "13,8 h", year: "5,6 anys", missions: "Observacions telescopiques", jpl: "Hygiea" },
  { name: "Eros", ca: "Eros", distance: 8.8, angle: 1.35, radius: 0.1, color: "#c99b6b", fact: "Asteroide proper a la Terra visitat per NEAR Shoemaker.", diameter: "34 km", day: "5,27 h", year: "1,76 anys", missions: "NEAR Shoemaker", jpl: "Eros" },
];

function initSolarSystem() {
  if (state.solarInitialized) {
    return;
  }

  if (!window.THREE) {
    if (!state.waitingForThree) {
      state.waitingForThree = true;
      selectors.solarStage.innerHTML = `<div class="state compact-state">Carregant motor 3D...</div>`;
      setTimeout(() => {
        state.waitingForThree = false;
        initSolarSystem();
      }, 250);
    }
    return;
  }

  state.solarInitialized = true;
  selectors.solarStage.innerHTML = "";
  state.solarShowOrbits = true;
  state.solarPlanets = [];
  state.solarOrbitObjects = [];
  state.solarLabels = [];

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  selectors.solarStage.appendChild(renderer.domElement);

  const controls = window.OrbitControls ? new window.OrbitControls(camera, renderer.domElement) : null;
  if (controls) {
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 14;
    controls.maxDistance = 58;
    controls.maxPolarAngle = Math.PI * 0.48;
  }

  state.solar = { scene, camera, renderer, controls, raycaster: new THREE.Raycaster(), pointer: new THREE.Vector2(), angle: 0 };

  scene.add(new THREE.AmbientLight(0x6d7f8f, 1.05));
  const sunLight = new THREE.PointLight(0xffe4a8, 2.8, 120);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  const starField = createStarField();
  scene.add(starField);

  const sunTexture = loadSolarTexture("2k_sun.jpg");
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(2.1, 48, 48),
    new THREE.MeshStandardMaterial({ color: 0xffc857, map: sunTexture, emissive: 0xff9d00, emissiveMap: sunTexture, emissiveIntensity: 1.25 })
  );
  sun.userData = { ...SOLAR_SUN, type: "sun" };
  scene.add(sun);
  scene.add(createSunGlow());
  const asteroidBelt = createAsteroidBelt();
  asteroidBelt.userData = { type: "belt", ca: "Cinturo d'asteroides" };
  scene.add(asteroidBelt);
  state.solarSun = sun;
  state.solarBelt = asteroidBelt;
  const sunLabel = createPlanetLabel("Sol");
  selectors.solarStage.appendChild(sunLabel);
  state.solarLabels.push({ label: sunLabel, mesh: sun });
  const beltLabel = createPlanetLabel("Cinturó");
  selectors.solarStage.appendChild(beltLabel);
  state.solarLabels.push({ label: beltLabel, mesh: asteroidBelt });

  SOLAR_PLANETS.forEach((planet) => {
    const pivot = new THREE.Object3D();
    scene.add(pivot);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(planet.radius, 48, 48),
      createPlanetMaterial(planet)
    );
    mesh.position.x = planet.distance;
    mesh.userData = planet;
    pivot.add(mesh);

    if (planet.name === "Saturn") {
      const ringTexture = loadSolarTexture(planet.ringTexture);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius * 1.45, planet.radius * 2.15, 64),
        new THREE.MeshBasicMaterial({ color: 0xd8c28a, map: ringTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.86 })
      );
      ring.rotation.x = Math.PI / 2.6;
      mesh.add(ring);
    }

    if (planet.clouds) {
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(planet.radius * 1.015, 48, 48),
        new THREE.MeshBasicMaterial({ map: loadSolarTexture(planet.clouds), transparent: true, opacity: 0.34, depthWrite: false })
      );
      clouds.userData = { isCloudLayer: true };
      mesh.add(clouds);
    }

    const orbit = createOrbitLine(planet.distance);
    scene.add(orbit);
    const label = createPlanetLabel(planet.ca);
    selectors.solarStage.appendChild(label);
    state.solarOrbitObjects.push(orbit);
    state.solarLabels.push({ label, mesh });
    state.solarPlanets.push({ ...planet, pivot, mesh, label });
  });

  SOLAR_ASTEROIDS.forEach((asteroid) => {
    const pivot = new THREE.Object3D();
    pivot.rotation.y = asteroid.angle;
    scene.add(pivot);

    const mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(asteroid.radius, 1),
      new THREE.MeshStandardMaterial({ color: asteroid.color, roughness: 0.9, metalness: 0.02 })
    );
    mesh.position.x = asteroid.distance;
    mesh.userData = { ...asteroid, type: "asteroid" };
    pivot.add(mesh);

    const label = createPlanetLabel(asteroid.ca);
    selectors.solarStage.appendChild(label);
    state.solarLabels.push({ label, mesh });
    state.solarPlanets.push({ ...asteroid, pivot, mesh, label, type: "asteroid" });
  });

  resetSolarCamera();
  resizeSolarSystem();
  selectors.solarStage.addEventListener("click", handleSolarClick);
  selectors.solarStage.addEventListener("pointermove", handleSolarPointerMove);
  window.addEventListener("resize", resizeSolarSystem);
  animateSolarSystem();
}

function createPlanetMaterial(planet) {
  const texture = loadSolarTexture(planet.texture);
  texture.colorSpace = THREE.SRGBColorSpace;

  return new THREE.MeshStandardMaterial({
    color: planet.color,
    map: texture,
    roughness: planet.name === "Earth" ? 0.48 : 0.72,
    metalness: 0.02,
    emissive: planet.name === "Earth" || planet.name === "Neptune" ? planet.color : 0x000000,
    emissiveIntensity: planet.name === "Earth" || planet.name === "Neptune" ? 0.04 : 0,
  });
}

function loadSolarTexture(fileName) {
  const loader = state.solarTextureLoader || new THREE.TextureLoader();
  state.solarTextureLoader = loader;
  const sourceUrl = `${SOLAR_TEXTURE_BASE}${fileName}`;
  const proxiedUrl = `/api/texture?url=${encodeURIComponent(sourceUrl)}`;
  const texture = loader.load(proxiedUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createStarField() {
  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < 900; i += 1) {
    positions.push((Math.random() - 0.5) * 120, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 120);
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.7 })
  );
}

function createOrbitLine(radius) {
  const points = [];

  for (let i = 0; i <= 128; i += 1) {
    const angle = (i / 128) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color: 0x49606a, transparent: true, opacity: 0.48 })
  );
}

function createSunGlow() {
  const geometry = new THREE.SphereGeometry(3.4, 48, 48);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffb347,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Mesh(geometry, material);
}

function createAsteroidBelt() {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const color = new THREE.Color();

  for (let i = 0; i < 1200; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 10.4 + Math.random() * 1.45;
    const y = (Math.random() - 0.5) * 0.18;
    positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    color.set(Math.random() > 0.75 ? 0xf5b942 : 0x8a9ca3);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.72 })
  );
}

function createPlanetLabel(name) {
  const label = document.createElement("button");
  label.className = "planet-label";
  label.type = "button";
  label.textContent = name;
  label.addEventListener("click", (event) => {
    event.stopPropagation();
    if (name === "Sol") {
      selectSolarObject(state.solarSun);
      return;
    }

    if (name === "Cinturó") {
      selectSolarObject(state.solarBelt);
      return;
    }

    const object = state.solarPlanets.find((item) => item.ca === name);
    if (object) {
      selectSolarPlanet(object);
    }
  });
  return label;
}

function animateSolarSystem() {
  if (!state.solar) {
    return;
  }

  const speed = Number(selectors.solarSpeed.value);
  state.solar.angle += 0.005 * speed;

  state.solarPlanets.forEach((planet, index) => {
    planet.pivot.rotation.y += 0.003 * speed * planet.speed;
    planet.mesh.rotation.y += 0.012 * speed;
    planet.mesh.position.y = Math.sin(state.solar.angle * planet.speed + index) * 0.06;
  });

  updateSolarLabels();
  state.solar.controls?.update();
  if (!state.solar.controls) {
    state.solar.camera.lookAt(0, 0, 0);
  }
  state.solar.renderer.render(state.solar.scene, state.solar.camera);
  requestAnimationFrame(animateSolarSystem);
}

function updateSolarLabels() {
  if (!state.solar) {
    return;
  }

  const rect = selectors.solarStage.getBoundingClientRect();
  const vector = new THREE.Vector3();

  state.solarLabels.forEach(({ label, mesh }) => {
    mesh.getWorldPosition(vector);
    vector.project(state.solar.camera);
    const x = (vector.x * 0.5 + 0.5) * rect.width;
    const y = (-vector.y * 0.5 + 0.5) * rect.height;
    const visible = vector.z < 1;
    label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -140%)`;
    label.style.opacity = visible ? "1" : "0";
  });
}

function resizeSolarSystem() {
  if (!state.solar) {
    return;
  }

  const rect = selectors.solarStage.getBoundingClientRect();
  state.solar.camera.aspect = rect.width / Math.max(rect.height, 1);
  state.solar.camera.updateProjectionMatrix();
  state.solar.renderer.setSize(rect.width, rect.height, false);
}

function resetSolarCamera() {
  if (!state.solar) {
    return;
  }

  state.solar.camera.position.set(0, 18, 32);
  state.solar.camera.lookAt(0, 0, 0);
  state.solar.controls?.target.set(0, 0, 0);
  state.solar.controls?.update();
}

function handleSolarClick(event) {
  const rect = selectors.solarStage.getBoundingClientRect();
  state.solar.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  state.solar.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  state.solar.raycaster.setFromCamera(state.solar.pointer, state.solar.camera);

  const clickable = [state.solarSun, ...state.solarPlanets.map((planet) => planet.mesh), state.solarBelt].filter(Boolean);
  const hits = state.solar.raycaster.intersectObjects(clickable);

  if (hits.length > 0) {
    selectSolarObject(hits[0].object);
  }
}

function handleSolarPointerMove(event) {
  if (!state.solar) {
    return;
  }

  const rect = selectors.solarStage.getBoundingClientRect();
  state.solar.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  state.solar.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  state.solar.raycaster.setFromCamera(state.solar.pointer, state.solar.camera);
  const clickable = [state.solarSun, ...state.solarPlanets.map((planet) => planet.mesh), state.solarBelt].filter(Boolean);
  const hits = state.solar.raycaster.intersectObjects(clickable);
  selectors.solarStage.classList.toggle("is-hovering-planet", hits.length > 0);
}

function selectSolarObject(object) {
  if (object === state.solarSun) {
    selectSolarPlanet({ ...SOLAR_SUN, mesh: state.solarSun, type: "sun" });
    return;
  }

  if (object === state.solarBelt) {
    renderAsteroidBeltPanel();
    return;
  }

  const planet = state.solarPlanets.find((item) => item.mesh === object);
  if (planet) {
    selectSolarPlanet(planet);
  }
}

function selectSolarPlanet(planet) {
  state.solarPlanets.forEach((item) => {
    item.mesh.scale.setScalar(item === planet ? 1.22 : 1);
    item.label.classList.toggle("active", item === planet);
  });

  const position = new THREE.Vector3();
  planet.mesh.getWorldPosition(position);
  state.solar.controls?.target.copy(position);
  renderSolarPlanetPanel(planet);
}

function renderSolarPlanetPanel(planet) {
  selectors.solarPanel.innerHTML = `
    <span class="meta">${planet.type === "asteroid" ? "Asteroide" : planet.type === "sun" ? "Estrella" : "Planeta"}</span>
    <h3>${escapeHtml(planet.ca)}</h3>
    <p>${escapeHtml(planet.fact)}</p>
    <div class="stats-grid compact-stats">
      <article class="stat-card">
        <span>Diàmetre</span>
        <strong>${escapeHtml(planet.diameter || "-")}</strong>
      </article>
      <article class="stat-card">
        <span>Dia</span>
        <strong>${escapeHtml(planet.day || "-")}</strong>
      </article>
      <article class="stat-card">
        <span>Any</span>
        <strong>${escapeHtml(planet.year || "-")}</strong>
      </article>
      <article class="stat-card">
        <span>Satèl·lits</span>
        <strong>${escapeHtml(planet.moons || "-")}</strong>
      </article>
    </div>
    <div class="solar-info-list">
      <p><strong>Temperatura:</strong> ${escapeHtml(planet.temp || "-")}</p>
      <p><strong>Missions:</strong> ${escapeHtml(planet.missions || "-")}</p>
    </div>
    <div class="button-row">
      <button type="button" id="planet-search">Busca imatges NASA</button>
      ${planet.type === "asteroid" ? `<button class="secondary-button" type="button" id="asteroid-jpl">Detall JPL</button>` : ""}
    </div>
  `;

  document.querySelector("#planet-search").addEventListener("click", () => {
    selectors.searchQuery.value = planet.name;
    state.activeSearchTags = [];
    updateSearchTags();
    activateView("search");
    loadImageSearch();
  });

  document.querySelector("#asteroid-jpl")?.addEventListener("click", () => {
    window.open(`https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${encodeURIComponent(planet.jpl || planet.name)}`, "_blank", "noreferrer");
  });
}

function renderAsteroidBeltPanel() {
  selectors.solarPanel.innerHTML = `
    <span class="meta">Cinturó d'asteroides</span>
    <h3>Entre Mart i Júpiter</h3>
    <p>Regió plena de petits cossos rocosos. Conté Ceres, Vesta, Pallas, Hygiea i molts fragments formats durant la història primerenca del Sistema Solar.</p>
    <div class="stats-grid compact-stats">
      <article class="stat-card">
        <span>Ubicació</span>
        <strong>2-3,5 au</strong>
        <small>aprox.</small>
      </article>
      <article class="stat-card">
        <span>Objectes</span>
        <strong>Milions</strong>
        <small>estimats</small>
      </article>
      <article class="stat-card">
        <span>Cos principal</span>
        <strong>Ceres</strong>
        <small>planeta nan</small>
      </article>
    </div>
    <div class="solar-info-list">
      ${SOLAR_ASTEROIDS.map((item) => `<p><strong>${escapeHtml(item.ca)}:</strong> ${escapeHtml(item.fact)}</p>`).join("")}
    </div>
    <button type="button" id="belt-search">Busca asteroides a NASA</button>
  `;

  document.querySelector("#belt-search").addEventListener("click", () => {
    selectors.searchQuery.value = "asteroid belt";
    activateView("search");
    loadImageSearch();
  });
}

function loadInitialData() {
  loadDashboard();
  loadApod(selectors.apodDate.value);
  loadApodGallery();
  loadImageSearch();
  loadMarsPhotos();
  loadNearEarthObjects();
  renderFavorites();
  renderSearchHistory();
}

async function loadDashboard() {
  selectors.dashboardApod.innerHTML = `<div class="state compact-state">Carregant APOD...</div>`;
  selectors.dashboardNeo.innerHTML = `<div class="state compact-state">Carregant asteroides...</div>`;
  selectors.dashboardEarth.innerHTML = `<div class="state compact-state">Carregant Terra...</div>`;
  renderDashboardFavorites();

  await Promise.allSettled([
    loadDashboardApod(),
    loadDashboardNeo(),
    loadDashboardEarth(),
  ]);

  hideAppLoader();
}

function hideAppLoader() {
  selectors.appLoader?.classList.add("hidden");
}

async function loadDashboardApod() {
  try {
    const item = normalizeApod(await getApod(INITIAL_APOD_DATE));
    rememberItem(item);
    selectors.dashboardApod.innerHTML = `
      <img class="dashboard-image clickable-image" src="${escapeAttribute(item.imageUrl)}" alt="${escapeAttribute(item.title)}" data-action="details" data-id="${escapeAttribute(item.id)}" />
      <div>
        <span class="meta">APOD destacat</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.date)}</p>
      </div>
    `;
  } catch (error) {
    selectors.dashboardApod.innerHTML = `<div class="state error compact-state">${escapeHtml(error.message)}</div>`;
  }
}

async function loadDashboardNeo() {
  try {
    const data = await request("/neo/rest/v1/feed", {
      start_date: selectors.analyticsStart.value,
      end_date: selectors.analyticsEnd.value,
    });
    const objects = Object.values(data.near_earth_objects).flat();
    const hazardous = objects.filter((item) => item.is_potentially_hazardous_asteroid).length;
    const fastest = objects.reduce((best, item) => {
      const speed = Number(item.close_approach_data[0].relative_velocity.kilometers_per_hour);
      return !best || speed > best.speed ? { item, speed } : best;
    }, null);

    selectors.dashboardNeo.innerHTML = `
      <span class="meta">Última setmana</span>
      <h3>Asteroides propers</h3>
      <strong class="dashboard-number">${objects.length}</strong>
      <p>${hazardous} potencialment perillosos</p>
      <small>Més ràpid: ${fastest ? Math.round(fastest.speed).toLocaleString("ca-ES") : "-"} km/h</small>
    `;
  } catch (error) {
    selectors.dashboardNeo.innerHTML = `<div class="state error compact-state">${escapeHtml(error.message)}</div>`;
  }
}

async function loadDashboardEarth() {
  try {
    const url = new URL("/api/eonet/api/v3/events", window.location.origin);
    url.searchParams.set("status", "open");
    url.searchParams.set("days", "30");
    url.searchParams.set("limit", "500");

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const events = (data.events || []).map(normalizeEarthEvent).filter((event) => event.coordinates);
    const categories = countBy(events, (event) => event.categoryTitle);
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

    selectors.dashboardEarth.innerHTML = `
      <span class="meta">EONET actiu</span>
      <h3>Terra en Directe</h3>
      <strong class="dashboard-number">${events.length}</strong>
      <p>Esdeveniments amb coordenades</p>
      <small>Categoria principal: ${escapeHtml(topCategory?.[0] || "-")}</small>
    `;
  } catch (error) {
    selectors.dashboardEarth.innerHTML = `<div class="state error compact-state">${escapeHtml(error.message)}</div>`;
  }
}

function renderDashboardFavorites() {
  const preview = state.favorites[0];

  if (!preview) {
    selectors.dashboardFavorites.innerHTML = `
      <span class="meta">Favorits</span>
      <h3>Encara buit</h3>
      <strong class="dashboard-number">0</strong>
      <p>Guarda imatges des de qualsevol galeria.</p>
    `;
    return;
  }

  selectors.dashboardFavorites.innerHTML = `
    <img class="dashboard-image clickable-image" src="${escapeAttribute(preview.imageUrl)}" alt="${escapeAttribute(preview.title)}" data-action="details" data-id="${escapeAttribute(preview.id)}" />
    <div>
      <span class="meta">Favorits</span>
      <h3>${state.favorites.length} guardats</h3>
      <p>${escapeHtml(preview.title)}</p>
    </div>
  `;
}

async function loadEarthEvents() {
  selectors.earthEventList.innerHTML = `<div class="state compact-state">Carregant esdeveniments...</div>`;

  try {
    const url = new URL("/api/eonet/api/v3/events", window.location.origin);
    url.searchParams.set("status", selectors.earthStatus.value);
    url.searchParams.set("days", selectors.earthDays.value);
    url.searchParams.set("limit", "500");

    if (selectors.earthCategory.value) {
      url.searchParams.set("category", selectors.earthCategory.value);
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const allEvents = (data.events || []).map(normalizeEarthEvent).filter((event) => event.coordinates);
    const events = filterEarthEventsByRegion(allEvents, selectors.earthRegion.value);
    state.earthLoaded = true;
    state.earthEvents = events;

    renderEarthMap(events);
    renderEarthStats(events);
    renderEarthCategoryChart(events);
    renderEarthEventList(events);
  } catch (error) {
    selectors.earthEventList.innerHTML = `<div class="state error compact-state">${escapeHtml(error.message)}</div>`;
  }
}

function filterEarthEventsByRegion(events, regionKey) {
  const region = getEarthRegion(regionKey);

  if (!region) {
    return events;
  }

  return events.filter((event) => {
    const { lat, lng } = event.coordinates;
    return lat >= region.minLat && lat <= region.maxLat && lng >= region.minLng && lng <= region.maxLng;
  });
}

function getEarthRegion(regionKey) {
  const regions = {
    europe: { minLat: 34, maxLat: 72, minLng: -25, maxLng: 45, center: [54, 12], zoom: 4 },
    africa: { minLat: -36, maxLat: 38, minLng: -20, maxLng: 55, center: [2, 20], zoom: 3 },
    asia: { minLat: -10, maxLat: 78, minLng: 45, maxLng: 180, center: [34, 95], zoom: 3 },
    northAmerica: { minLat: 5, maxLat: 83, minLng: -170, maxLng: -50, center: [45, -105], zoom: 3 },
    southAmerica: { minLat: -56, maxLat: 14, minLng: -82, maxLng: -34, center: [-18, -60], zoom: 3 },
    oceania: { minLat: -50, maxLat: 0, minLng: 110, maxLng: 180, center: [-25, 135], zoom: 4 },
  };

  return regions[regionKey] || null;
}

function normalizeEarthEvent(event) {
  const geometry = event.geometry?.[event.geometry.length - 1];
  const coordinates = geometry?.coordinates;
  const category = event.categories?.[0] || {};
  const source = event.sources?.[0] || {};

  return {
    id: event.id,
    title: event.title,
    description: event.description || "",
    categoryId: category.id || "other",
    categoryTitle: category.title || category.id || "Altres",
    date: geometry?.date || "",
    closed: event.closed || null,
    magnitude: geometry?.magnitudeValue,
    magnitudeUnit: geometry?.magnitudeUnit || "",
    source: source.id || source.title || "NASA",
    link: event.link || source.url || "",
    coordinates: Array.isArray(coordinates) && typeof coordinates[0] === "number"
      ? { lng: coordinates[0], lat: coordinates[1] }
      : null,
  };
}

function renderEarthMap(events) {
  if (!window.L) {
    throw new Error("Leaflet no s'ha carregat correctament.");
  }

  if (!state.earthMap) {
    state.earthMap = L.map(selectors.earthMap, {
      worldCopyJump: true,
      zoomControl: true,
    }).setView([22, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 8,
      attribution: "&copy; OpenStreetMap contributors | NASA EONET",
    }).addTo(state.earthMap);
  }

  state.earthLayer?.remove();
  state.earthLayer = L.layerGroup().addTo(state.earthMap);

  events.forEach((event) => {
    const color = getEarthCategoryColor(event.categoryId);
    const marker = L.circleMarker([event.coordinates.lat, event.coordinates.lng], {
      radius: 8,
      color,
      fillColor: color,
      fillOpacity: 0.74,
      weight: 2,
    });

    marker.bindPopup(`
      <strong>${escapeHtml(event.title)}</strong><br />
      ${escapeHtml(event.categoryTitle)}<br />
      ${escapeHtml(formatShortDate(event.date))}
    `);

    marker.on("click", () => highlightEarthEvent(event.id));
    marker.addTo(state.earthLayer);
  });

  if (events.length > 0) {
    const bounds = L.latLngBounds(events.map((event) => [event.coordinates.lat, event.coordinates.lng]));
    state.earthMap.fitBounds(bounds.pad(0.2), { maxZoom: 4 });
  } else {
    const region = getEarthRegion(selectors.earthRegion.value);
    state.earthMap.setView(region?.center || [22, 0], region?.zoom || 2);
  }
}

function renderEarthStats(events) {
  const categories = countBy(events, (event) => event.categoryTitle);
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
  const active = events.filter((event) => !event.closed).length;
  const magnitudes = events.filter((event) => Number.isFinite(Number(event.magnitude)));

  selectors.earthStats.innerHTML = `
    <article class="stat-card">
      <span>Total</span>
      <strong>${events.length}</strong>
      <small>${selectors.earthDays.value} dies</small>
    </article>
    <article class="stat-card">
      <span>Actius</span>
      <strong>${active}</strong>
      <small>EONET status</small>
    </article>
    <article class="stat-card">
      <span>Categoria principal</span>
      <strong>${escapeHtml(topCategory?.[0] || "-")}</strong>
      <small>${topCategory?.[1] || 0} events</small>
    </article>
    <article class="stat-card">
      <span>Amb magnitud</span>
      <strong>${magnitudes.length}</strong>
      <small>Dades extra</small>
    </article>
  `;
}

function renderEarthCategoryChart(events) {
  const categories = countBy(events, (event) => event.categoryTitle);
  const rows = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  renderChart("earthCategories", selectors.earthCategoryChart, {
    type: "doughnut",
    data: {
      labels: rows.map(([label]) => label),
      datasets: [{
        data: rows.map(([, count]) => count),
        backgroundColor: rows.map(([label]) => getEarthCategoryColor(label)),
        borderColor: "#111b20",
        borderWidth: 3,
        hoverOffset: 10,
      }],
    },
    options: chartOptions({
      cutout: "58%",
      scales: null,
    }),
  });
}

function renderEarthEventList(events) {
  selectors.earthCount.textContent = String(events.length);

  if (events.length === 0) {
    selectors.earthEventList.innerHTML = `<div class="state compact-state">No hi ha esdeveniments amb coordenades per aquesta regió i aquests filtres.</div>`;
    return;
  }

  selectors.earthEventList.innerHTML = events.map((event) => `
    <button class="earth-event" type="button" data-earth-id="${escapeAttribute(event.id)}">
      <span style="--event-color: ${getEarthCategoryColor(event.categoryId)}"></span>
      <strong>${escapeHtml(event.title)}</strong>
      <small>${escapeHtml(event.categoryTitle)} · ${escapeHtml(formatShortDate(event.date))}</small>
    </button>
  `).join("");

  selectors.earthEventList.querySelectorAll("[data-earth-id]").forEach((button) => {
    button.addEventListener("click", () => highlightEarthEvent(button.dataset.earthId));
  });
}

function highlightEarthEvent(id) {
  const event = state.earthEvents?.find((item) => item.id === id);

  if (!event || !state.earthMap) {
    return;
  }

  state.earthMap.flyTo([event.coordinates.lat, event.coordinates.lng], 5, { duration: 0.8 });
  selectors.earthEventList.querySelectorAll(".earth-event").forEach((button) => {
    button.classList.toggle("active", button.dataset.earthId === id);
  });
}

function getEarthCategoryColor(category) {
  const key = String(category).toLowerCase();
  const colors = {
    wildfires: "#ff8a7a",
    "wildfires": "#ff8a7a",
    severestorms: "#8fb8ff",
    "severe storms": "#8fb8ff",
    volcanoes: "#d9a7ff",
    floods: "#5cccbb",
    sealakeice: "#9bdcff",
    "sea and lake ice": "#9bdcff",
    dusthaze: "#f5b942",
    "dust and haze": "#f5b942",
  };

  return colors[key] || "#f5b942";
}

function countBy(items, getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item) || "Altres";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function formatShortDate(value) {
  return value ? value.slice(0, 10) : "sense data";
}

async function loadApod(date) {
  setLoading(selectors.apodResult);

  try {
    const item = normalizeApod(await getApod(date));
    selectors.apodResult.innerHTML = renderFeatureDetail(item);
  } catch (error) {
    setError(selectors.apodResult, error);
  }
}

async function loadApodGallery() {
  setLoading(selectors.galleryResult);

  try {
    const count = Number(selectors.galleryCount.value);
    const endDate = new Date(INITIAL_APOD_DATE);
    const startDate = addDays(endDate, -(count - 1));
    const data = await request("/planetary/apod", {
      start_date: toIsoDate(startDate),
      end_date: toIsoDate(endDate),
      thumbs: "true",
    });

    const items = data
      .map(normalizeApod)
      .filter((item) => item.imageUrl)
      .reverse();

    selectors.galleryResult.innerHTML = items.map(renderImageCard).join("");
  } catch (error) {
    setError(selectors.galleryResult, error);
  }
}

async function loadMarsPhotos() {
  setLoading(selectors.marsResult);

  try {
    const photos = await searchNasaImages(selectors.marsQuery.value.trim() || "Mars rover", 18);

    if (photos.length === 0) {
      selectors.marsResult.innerHTML = `<div class="state">No hi ha imatges per a aquesta cerca.</div>`;
      return;
    }

    selectors.marsResult.innerHTML = photos.map(renderImageCard).join("");
  } catch (error) {
    setError(selectors.marsResult, error);
  }
}

async function loadImageSearch() {
  setLoading(selectors.searchResult);

  try {
    const query = buildSearchQuery();
    const count = Number(selectors.searchCount.value);
    const items = await searchNasaImages(query, count);
    addSearchHistory(query);

    if (items.length === 0) {
      selectors.searchResult.innerHTML = `<div class="state">No hi ha imatges per a aquesta cerca.</div>`;
      return;
    }

    selectors.searchResult.innerHTML = items.map(renderImageCard).join("");
  } catch (error) {
    setError(selectors.searchResult, error);
  }
}

function addSearchHistory(query) {
  const normalized = query.trim();

  if (!normalized) {
    return;
  }

  state.searchHistory = [normalized, ...state.searchHistory.filter((item) => item !== normalized)].slice(0, 10);
  saveSearchHistory();
  renderSearchHistory();
}

function renderSearchHistory() {
  if (state.searchHistory.length === 0) {
    selectors.searchHistory.innerHTML = `<span class="empty-inline">Encara no hi ha cerques.</span>`;
    return;
  }

  selectors.searchHistory.innerHTML = state.searchHistory.map((query) => `
    <button class="history-chip" type="button" data-history-query="${escapeAttribute(query)}">${escapeHtml(query)}</button>
  `).join("");
}

function readSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveSearchHistory() {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(state.searchHistory));
}

function buildSearchQuery() {
  const typedQuery = selectors.searchQuery.value.trim();
  const tagQuery = state.activeSearchTags.join(" ");
  return [typedQuery, tagQuery].filter(Boolean).join(" ") || "James Webb";
}

function updateSearchTags() {
  selectors.searchTags.forEach((button) => {
    button.classList.toggle("active", state.activeSearchTags.includes(button.dataset.tag));
  });
}

async function searchNasaImages(query, count) {
  const url = new URL("/api/images/search", window.location.origin);
  url.searchParams.set("q", query);
  url.searchParams.set("media_type", "image");
  url.searchParams.set("page_size", String(count));

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}`);
  }

  return data.collection.items
    .filter((item) => item.links?.[0]?.href && item.data?.[0])
    .slice(0, count)
    .map(normalizeLibraryImage);
}

async function getApod(date) {
  return request("/planetary/apod", { date, thumbs: "true" });
}

function normalizeApod(data) {
  return {
    id: `apod-${data.date}`,
    type: "APOD",
    title: data.title,
    date: data.date,
    explanation: data.explanation,
    copyright: data.copyright || "",
    imageUrl: data.media_type === "image" ? data.hdurl || data.url : data.thumbnail_url,
    originalUrl: data.url,
  };
}

function renderFeatureDetail(item) {
  rememberItem(item);
  const media = item.imageUrl
    ? `<img class="clickable-image" src="${escapeAttribute(item.imageUrl)}" alt="${escapeAttribute(item.title)}" data-action="details" data-id="${escapeAttribute(item.id)}" />`
    : `<div class="state">Aquest recurs no te previsualitzacio d'imatge.</div>`;

  return `
    <article class="apod-layout">
      <div class="media-frame">${media}</div>
      <div class="details">
        <span class="meta">${escapeHtml(item.type)} - ${escapeHtml(item.date)} ${item.copyright ? `- ${escapeHtml(item.copyright)}` : ""}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.explanation)}</p>
        <div class="button-row">
          <button class="secondary-button" type="button" data-action="details" data-id="${escapeAttribute(item.id)}">Pantalla completa</button>
          <button type="button" data-action="favorite" data-id="${escapeAttribute(item.id)}">${isFavorite(item.id) ? "Elimina favorit" : "Desa favorit"}</button>
        </div>
        <a href="${escapeAttribute(item.originalUrl)}" target="_blank" rel="noreferrer">Obre el recurs original</a>
      </div>
    </article>
  `;
}

function renderImageCard(item) {
  rememberItem(item);
  return `
    <article class="photo-card">
      <img class="clickable-image" src="${escapeAttribute(item.imageUrl)}" alt="${escapeAttribute(item.title)}" loading="lazy" data-action="details" data-id="${escapeAttribute(item.id)}" />
      <div>
        <span class="meta">${escapeHtml(item.type)} - ${escapeHtml(item.date)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <div class="card-actions">
          <button class="secondary-button" type="button" data-action="details" data-id="${escapeAttribute(item.id)}">Pantalla completa</button>
          <button type="button" data-action="favorite" data-id="${escapeAttribute(item.id)}">${isFavorite(item.id) ? "Guardat" : "Favorit"}</button>
        </div>
      </div>
    </article>
  `;
}

function openDetail(id) {
  const item = getKnownItem(id);
  if (!item) {
    console.warn(`No item found for detail view: ${id}`);
    return;
  }

  selectors.modalContent.innerHTML = renderModalDetail(item);
  selectors.detailModal.showModal();
}

function renderModalDetail(item) {
  const media = item.imageUrl
    ? `<img src="${escapeAttribute(item.imageUrl)}" alt="${escapeAttribute(item.title)}" />`
    : `<div class="state">Aquest recurs no te previsualitzacio d'imatge.</div>`;

  return `
    <article class="apod-layout">
      <div class="media-frame">${media}</div>
      <div class="details">
        <span class="meta">${escapeHtml(item.type)} - ${escapeHtml(item.date)} ${item.copyright ? `- ${escapeHtml(item.copyright)}` : ""}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.explanation)}</p>
        <div class="button-row">
          <button type="button" data-action="favorite" data-id="${escapeAttribute(item.id)}">${isFavorite(item.id) ? "Elimina favorit" : "Desa favorit"}</button>
        </div>
        <a href="${escapeAttribute(item.originalUrl)}" target="_blank" rel="noreferrer">Obre el recurs original</a>
      </div>
    </article>
  `;
}

function toggleFavorite(id) {
  const existing = state.favorites.find((item) => item.id === id);

  if (existing) {
    state.favorites = state.favorites.filter((item) => item.id !== id);
  } else {
    const item = getKnownItem(id);
    if (item) {
      state.favorites = [item, ...state.favorites];
    }
  }

  saveFavorites();
  refreshCurrentView();
}

function renderFavorites() {
  if (state.favorites.length === 0) {
    selectors.favoritesResult.innerHTML = `<div class="state">Encara no has guardat cap favorit.</div>`;
    return;
  }

  selectors.favoritesResult.innerHTML = state.favorites.map(renderImageCard).join("");
}

function refreshCurrentView() {
  const activeView = document.querySelector(".view.active")?.id;

  if (activeView === "favorites-view") {
    renderFavorites();
  }

  document.querySelectorAll("[data-action='favorite']").forEach((button) => {
    button.textContent = isFavorite(button.dataset.id) ? "Guardat" : "Favorit";
  });
}

function rememberItem(item) {
  window.nasaItems = window.nasaItems || new Map();
  window.nasaItems.set(item.id, item);
}

function getKnownItem(id) {
  window.nasaItems = window.nasaItems || new Map();
  return window.nasaItems.get(id) || state.favorites.find((item) => item.id === id);
}

function isFavorite(id) {
  return state.favorites.some((item) => item.id === id);
}

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorites));
  renderDashboardFavorites();
}

async function loadNearEarthObjects() {
  setLoading(selectors.neoResult);

  try {
    validateNeoRange();
    const data = await request("/neo/rest/v1/feed", {
      start_date: selectors.neoStart.value,
      end_date: selectors.neoEnd.value,
    });

    const objects = Object.values(data.near_earth_objects)
      .flat()
      .sort((a, b) => Number(b.is_potentially_hazardous_asteroid) - Number(a.is_potentially_hazardous_asteroid))
      .slice(0, 20);

    renderNeoStats(Object.values(data.near_earth_objects).flat());

    selectors.neoResult.innerHTML = `
      <div class="neo-list">
        ${objects.map(renderNeoCard).join("")}
      </div>
    `;
  } catch (error) {
    setError(selectors.neoResult, error);
  }
}

async function loadAnalytics() {
  try {
    validateDateRange(selectors.analyticsStart.value, selectors.analyticsEnd.value);
    selectors.speedRanking.innerHTML = `<div class="state compact-state">Carregant gràfics...</div>`;

    const data = await request("/neo/rest/v1/feed", {
      start_date: selectors.analyticsStart.value,
      end_date: selectors.analyticsEnd.value,
    });

    const byDate = data.near_earth_objects;
    const objects = Object.values(byDate).flat();

    drawDailyChart(byDate);
    drawRiskChart(objects);
    drawScatterChart(objects);
    drawDiameterChart(objects);
    drawSpeedLineChart(byDate);
    renderHazardousDetails(objects);
    renderSpeedRanking(objects);
  } catch (error) {
    selectors.speedRanking.innerHTML = `<div class="state error compact-state">${escapeHtml(error.message)}</div>`;
    destroyCharts();
    selectors.riskLegend.innerHTML = "";
    selectors.hazardousStats.innerHTML = "";
    selectors.hazardousTable.innerHTML = "";
    selectors.hazardousCount.textContent = "0 detectats";
  }
}

function drawDailyChart(byDate) {
  const rows = Object.entries(byDate)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, items]) => ({
      date,
      count: items.length,
      hazardous: items.filter((item) => item.is_potentially_hazardous_asteroid).length,
    }));

  renderChart("daily", selectors.dailyChart, {
    type: "bar",
    data: {
      labels: rows.map((row) => row.date.slice(5)),
      datasets: [
        {
          type: "bar",
          label: "Objectes",
          data: rows.map((row) => row.count),
          backgroundColor: "rgba(245, 185, 66, 0.72)",
          borderColor: "#f5b942",
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          type: "line",
          label: "Perillosos",
          data: rows.map((row) => row.hazardous),
          borderColor: "#ff8a7a",
          backgroundColor: "#ff8a7a",
          pointRadius: 5,
          tension: 0.35,
        },
      ],
    },
    options: chartOptions({
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    }),
  });
}

function drawRiskChart(objects) {
  const hazardous = objects.filter((item) => item.is_potentially_hazardous_asteroid).length;
  const normal = objects.length - hazardous;

  renderChart("risk", selectors.riskChart, {
    type: "doughnut",
    data: {
      labels: ["Potencialment perillosos", "Seguiment normal"],
      datasets: [{
        data: [hazardous, normal],
        backgroundColor: ["#ff8a7a", "#f5b942"],
        borderColor: "#111b20",
        borderWidth: 4,
        hoverOffset: 12,
      }],
    },
    options: chartOptions({
      cutout: "62%",
      scales: null,
      onClick(_event, elements) {
        if (elements.length > 0 && elements[0].index === 0) {
          selectors.hazardousTable.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      },
    }),
  });

  selectors.riskLegend.innerHTML = `
    <span><i class="legend-dot danger-dot"></i>${hazardous} potencialment perillosos</span>
    <span><i class="legend-dot accent-dot"></i>${normal} seguiment normal</span>
  `;
}

function renderHazardousDetails(objects) {
  const hazardous = objects
    .filter((item) => item.is_potentially_hazardous_asteroid)
    .map(normalizeNeoForRisk)
    .sort((a, b) => a.distance - b.distance);

  selectors.hazardousCount.textContent = `${hazardous.length} detectats`;

  if (hazardous.length === 0) {
    selectors.hazardousStats.innerHTML = `
      <article class="stat-card">
        <span>Risc</span>
        <strong>0</strong>
        <small>No hi ha objectes potencialment perillosos en aquest interval.</small>
      </article>
    `;
    selectors.hazardousTable.innerHTML = `<div class="state compact-state">Cap objecte potencialment perillós en aquest interval.</div>`;
    return;
  }

  const closest = hazardous[0];
  const fastest = hazardous.reduce((best, item) => item.speed > best.speed ? item : best, hazardous[0]);
  const largest = hazardous.reduce((best, item) => item.diameterMax > best.diameterMax ? item : best, hazardous[0]);
  const avgDistance = hazardous.reduce((sum, item) => sum + item.distance, 0) / hazardous.length;

  selectors.hazardousStats.innerHTML = `
    <article class="stat-card danger-stat">
      <span>Més proper</span>
      <strong>${Math.round(closest.distance).toLocaleString("ca-ES")} km</strong>
      <small>${escapeHtml(closest.name)}</small>
    </article>
    <article class="stat-card danger-stat">
      <span>Més ràpid</span>
      <strong>${Math.round(fastest.speed).toLocaleString("ca-ES")} km/h</strong>
      <small>${escapeHtml(fastest.name)}</small>
    </article>
    <article class="stat-card danger-stat">
      <span>Més gran</span>
      <strong>${Math.round(largest.diameterMax).toLocaleString("ca-ES")} m</strong>
      <small>${escapeHtml(largest.name)}</small>
    </article>
    <article class="stat-card danger-stat">
      <span>Distància mitjana</span>
      <strong>${Math.round(avgDistance).toLocaleString("ca-ES")} km</strong>
      <small>${hazardous.length} objectes</small>
    </article>
  `;

  selectors.hazardousTable.innerHTML = `
    <div class="hazard-row hazard-head">
      <span>Nom</span>
      <span>Data</span>
      <span>Distància</span>
      <span>Velocitat</span>
      <span>Diàmetre</span>
      <span>Detall</span>
    </div>
    ${hazardous.map((item) => `
      <div class="hazard-row">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.date)}</span>
        <span>${Math.round(item.distance).toLocaleString("ca-ES")} km</span>
        <span>${Math.round(item.speed).toLocaleString("ca-ES")} km/h</span>
        <span>${Math.round(item.diameterMin)}-${Math.round(item.diameterMax)} m</span>
        <button class="secondary-button orbit-button" type="button" data-action="orbit" data-neo-id="${escapeAttribute(item.id)}">Òrbita</button>
      </div>
    `).join("")}
  `;
}

function normalizeNeoForRisk(item) {
  const approach = item.close_approach_data[0];
  const diameter = item.estimated_diameter.meters;

  return {
    id: item.neo_reference_id || item.id,
    name: item.name,
    date: approach.close_approach_date_full || approach.close_approach_date,
    distance: Number(approach.miss_distance.kilometers),
    speed: Number(approach.relative_velocity.kilometers_per_hour),
    diameterMin: diameter.estimated_diameter_min,
    diameterMax: diameter.estimated_diameter_max,
    url: item.nasa_jpl_url,
  };
}

async function openOrbitalDetail(neoId) {
  selectors.modalContent.innerHTML = `<div class="state">Carregant dades orbitals de JPL...</div>`;
  selectors.detailModal.showModal();

  try {
    const url = new URL("/api/jpl/sbdb.api", window.location.origin);
    url.searchParams.set("spk", neoId);
    url.searchParams.set("phys-par", "1");
    url.searchParams.set("ca-data", "1");
    url.searchParams.set("ca-time", "both");

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.code) {
      throw new Error(data.message || `Error HTTP ${response.status}`);
    }

    selectors.modalContent.innerHTML = renderOrbitalDetail(data);
    renderOrbitalCharts(data);
  } catch (error) {
    selectors.modalContent.innerHTML = `<div class="state error">${escapeHtml(error.message)}</div>`;
  }
}

function renderOrbitalDetail(data) {
  const object = data.object || {};
  const orbit = data.orbit || {};
  const elements = orbit.elements || [];
  const physical = data.phys_par || [];
  const closeApproaches = data.ca_data || [];
  const classes = object.orbit_class ? `${object.orbit_class.name || ""} ${object.orbit_class.code ? `(${object.orbit_class.code})` : ""}` : "Sense classificacio";
  const keyElements = ["e", "a", "q", "i", "om", "w", "ma", "per", "n", "ad"];

  return `
    <article class="orbit-detail">
      <div class="orbit-header">
        <div>
          <span class="meta">JPL Small-Body Database</span>
          <h2>${escapeHtml(object.fullname || object.des || "Objecte")}</h2>
          <p>${escapeHtml(classes)}</p>
        </div>
        <a class="secondary-link" href="https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${escapeAttribute(object.spkid || object.des || "")}" target="_blank" rel="noreferrer">Obre a JPL</a>
      </div>

      <div class="stats-grid compact-stats">
        ${renderOrbitStat("SPKID", object.spkid)}
        ${renderOrbitStat("Prefix", object.prefix || "-")}
        ${renderOrbitStat("Epoch", orbit.epoch || "-")}
        ${renderOrbitStat("Condició", orbit.condition_code || "-")}
        ${renderOrbitStat("Arc dades", orbit.data_arc || "-")}
        ${renderOrbitStat("Obs.", orbit.n_obs_used || "-")}
      </div>

      <div class="orbit-grid">
        <section class="orbit-panel wide-orbit-panel">
          <h3>Visualització orbital</h3>
          <div class="orbit-chart-grid">
            <div class="chart-box short"><canvas id="orbit-elements-chart"></canvas></div>
            <div class="chart-box short"><canvas id="orbit-approach-chart"></canvas></div>
          </div>
        </section>

        <section class="orbit-panel">
          <h3>Elements orbitals</h3>
          <div class="element-table">
            ${elements
              .filter((element) => keyElements.includes(element.name))
              .map(renderElementRow)
              .join("")}
          </div>
        </section>

        <section class="orbit-panel">
          <h3>Paràmetres físics</h3>
          <div class="element-table">
            ${physical.length > 0 ? physical.slice(0, 10).map(renderPhysicalRow).join("") : `<div class="empty-inline">No hi ha paràmetres físics disponibles.</div>`}
          </div>
        </section>

        <section class="orbit-panel wide-orbit-panel">
          <h3>Aproximacions properes</h3>
          <div class="element-table">
            ${closeApproaches.length > 0 ? closeApproaches.slice(0, 8).map(renderCloseApproachRow).join("") : `<div class="empty-inline">No hi ha aproximacions disponibles a la resposta.</div>`}
          </div>
        </section>
      </div>
    </article>
  `;
}

function renderOrbitalCharts(data) {
  const orbit = data.orbit || {};
  const elements = orbit.elements || [];
  const closeApproaches = data.ca_data || [];
  const elementCanvas = document.querySelector("#orbit-elements-chart");
  const approachCanvas = document.querySelector("#orbit-approach-chart");

  if (elementCanvas) {
    const elementMap = new Map(elements.map((element) => [element.name, Number(element.value)]));
    const rows = [
      { label: "e", title: "Excentricitat", value: elementMap.get("e") },
      { label: "a", title: "Semieix major (au)", value: elementMap.get("a") },
      { label: "q", title: "Periheli (au)", value: elementMap.get("q") },
      { label: "Q", title: "Afeli (au)", value: elementMap.get("ad") },
      { label: "i", title: "Inclinació (deg)", value: elementMap.get("i") },
    ].filter((row) => Number.isFinite(row.value));

    renderChart("orbitElements", elementCanvas, {
      type: "bar",
      data: {
        labels: rows.map((row) => row.label),
        datasets: [{
          label: "Elements orbitals clau",
          data: rows.map((row) => row.value),
          backgroundColor: ["#f5b942", "#5cccbb", "#ff8a7a", "#8fb8ff", "#d9a7ff"],
          borderColor: "#111b20",
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: chartOptions({
        plugins: {
          tooltip: {
            callbacks: {
              label(context) {
                const row = rows[context.dataIndex];
                return `${row.title}: ${formatJplValue(row.value)}`;
              },
            },
          },
        },
        scales: {
          y: { beginAtZero: true },
        },
      }),
    });
  }

  if (approachCanvas) {
    const rows = closeApproaches
      .slice()
      .sort((a, b) => Number(a.jd) - Number(b.jd))
      .slice(-20)
      .map((item) => ({
        date: item.cd || "",
        distance: Number(item.dist),
        speed: Number(item.v_rel),
        body: item.body || "",
      }))
      .filter((row) => Number.isFinite(row.distance));

    renderChart("orbitApproaches", approachCanvas, {
      type: "line",
      data: {
        labels: rows.map((row) => row.date.slice(0, 11)),
        datasets: [
          {
            label: "Distància (au)",
            data: rows.map((row) => row.distance),
            borderColor: "#f5b942",
            backgroundColor: "rgba(245, 185, 66, 0.16)",
            fill: true,
            tension: 0.35,
          },
          {
            label: "Vel. relativa (km/s)",
            data: rows.map((row) => row.speed),
            borderColor: "#5cccbb",
            backgroundColor: "#5cccbb",
            yAxisID: "y1",
            tension: 0.35,
          },
        ],
      },
      options: chartOptions({
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "au" } },
          y1: {
            beginAtZero: true,
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: { color: "#a8bbb6" },
            title: { display: true, text: "km/s", color: "#a8bbb6" },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label(context) {
                const row = rows[context.dataIndex];
                return `${context.dataset.label}: ${context.formattedValue} (${row.body})`;
              },
            },
          },
        },
      }),
    });
  }
}

function renderOrbitStat(label, value) {
  return `
    <article class="stat-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value || "-"))}</strong>
    </article>
  `;
}

function renderElementRow(element) {
  return `
    <div class="element-row">
      <span>${escapeHtml(element.title || element.name)}</span>
      <strong>${escapeHtml(formatJplValue(element.value))}</strong>
      <small>${escapeHtml(element.units || "")}</small>
    </div>
  `;
}

function renderPhysicalRow(item) {
  return `
    <div class="element-row">
      <span>${escapeHtml(item.title || item.name || "Paràmetre")}</span>
      <strong>${escapeHtml(formatJplValue(item.value))}</strong>
      <small>${escapeHtml(item.units || item.name || "")}</small>
    </div>
  `;
}

function renderCloseApproachRow(item) {
  return `
    <div class="element-row">
      <span>${escapeHtml(item.cd || item.date || "Aproximació")}</span>
      <strong>${escapeHtml(item.dist || item.dist_min || "-")} au</strong>
      <small>${escapeHtml(`${item.body || ""} ${item.v_rel ? `- ${item.v_rel} km/s` : ""}`)}</small>
    </div>
  `;
}

function formatJplValue(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Math.abs(numeric) >= 1000 ? numeric.toLocaleString("ca-ES", { maximumFractionDigits: 4 }) : String(Number(numeric.toFixed(8)));
  }

  return String(value);
}

function drawScatterChart(objects) {
  const points = objects.map((item) => {
    const approach = item.close_approach_data[0];
    const diameter = item.estimated_diameter.meters;
    return {
      x: Number(approach.miss_distance.kilometers) / 1_000_000,
      y: Number(approach.relative_velocity.kilometers_per_hour),
      r: Math.max(5, Math.min(18, Math.round(diameter.estimated_diameter_max / 80))),
      name: item.name,
      hazardous: item.is_potentially_hazardous_asteroid,
    };
  });

  renderChart("scatter", selectors.scatterChart, {
    type: "bubble",
    data: {
      datasets: [
        {
          label: "Seguiment normal",
          data: points.filter((point) => !point.hazardous),
          backgroundColor: "rgba(245, 185, 66, 0.58)",
          borderColor: "#f5b942",
        },
        {
          label: "Potencialment perillosos",
          data: points.filter((point) => point.hazardous),
          backgroundColor: "rgba(255, 138, 122, 0.64)",
          borderColor: "#ff8a7a",
        },
      ],
    },
    options: chartOptions({
      parsing: false,
      scales: {
        x: { title: { display: true, text: "Distància mínima (milions km)" } },
        y: { title: { display: true, text: "Velocitat (km/h)" }, beginAtZero: true },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label(context) {
              const point = context.raw;
              const risk = point.hazardous ? "RISC" : "normal";
              return `${risk} - ${point.name}: ${Math.round(point.y).toLocaleString("ca-ES")} km/h, ${point.x.toFixed(2)} M km`;
            },
          },
        },
      },
    }),
  });
}

function drawDiameterChart(objects) {
  const rows = objects
    .map((item) => ({
      name: item.name,
      max: item.estimated_diameter.meters.estimated_diameter_max,
      min: item.estimated_diameter.meters.estimated_diameter_min,
    }))
    .sort((a, b) => b.max - a.max)
    .slice(0, 8);

  renderChart("diameter", selectors.diameterChart, {
    type: "bar",
    data: {
      labels: rows.map((row) => row.name),
      datasets: [
        {
          label: "Diàmetre màxim estimat (m)",
          data: rows.map((row) => Math.round(row.max)),
          backgroundColor: "rgba(92, 204, 188, 0.68)",
          borderColor: "#5cccbb",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    },
    options: chartOptions({
      indexAxis: "y",
      scales: {
        x: { beginAtZero: true },
      },
    }),
  });
}

function drawSpeedLineChart(byDate) {
  const rows = Object.entries(byDate)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, items]) => {
      const speeds = items.map((item) => Number(item.close_approach_data[0].relative_velocity.kilometers_per_hour));
      const avg = speeds.reduce((sum, speed) => sum + speed, 0) / Math.max(speeds.length, 1);
      const max = Math.max(...speeds);
      return { date, avg, max };
    });

  renderChart("speedLine", selectors.speedLineChart, {
    type: "line",
    data: {
      labels: rows.map((row) => row.date.slice(5)),
      datasets: [
        {
          label: "Velocitat mitjana",
          data: rows.map((row) => Math.round(row.avg)),
          borderColor: "#5cccbb",
          backgroundColor: "rgba(92, 204, 188, 0.16)",
          fill: true,
          tension: 0.36,
        },
        {
          label: "Velocitat màxima",
          data: rows.map((row) => Math.round(row.max)),
          borderColor: "#f5b942",
          backgroundColor: "#f5b942",
          tension: 0.36,
        },
      ],
    },
    options: chartOptions({
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "km/h" } },
      },
    }),
  });
}

function renderSpeedRanking(objects) {
  const top = objects
    .map((item) => {
      const approach = item.close_approach_data[0];
      return {
        name: item.name,
        date: approach.close_approach_date,
        speed: Number(approach.relative_velocity.kilometers_per_hour),
        distance: Number(approach.miss_distance.kilometers),
      };
    })
    .sort((a, b) => b.speed - a.speed)
    .slice(0, 8);

  selectors.speedRanking.innerHTML = top.map((item, index) => `
    <div class="ranking-row">
      <span>${index + 1}</span>
      <strong>${escapeHtml(item.name)}</strong>
      <small>${escapeHtml(item.date)}</small>
      <b>${Math.round(item.speed).toLocaleString("ca-ES")} km/h</b>
    </div>
  `).join("");
}

function renderChart(key, canvas, config) {
  if (!window.Chart) {
    throw new Error("Chart.js no s'ha carregat correctament.");
  }

  state.charts[key]?.destroy();
  state.charts[key] = new Chart(canvas, config);
}

function destroyCharts() {
  Object.values(state.charts).forEach((chart) => chart.destroy());
  state.charts = {};
}

function chartOptions(overrides = {}) {
  const { plugins, scales, ...rest } = overrides;
  const defaultScales = {
    x: {
      grid: { color: "rgba(168, 187, 182, 0.12)" },
      ticks: { color: "#a8bbb6" },
      title: { color: "#a8bbb6" },
    },
    y: {
      grid: { color: "rgba(168, 187, 182, 0.12)" },
      ticks: { color: "#a8bbb6" },
      title: { color: "#a8bbb6" },
    },
  };

  return {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 120,
    interaction: { mode: "nearest", intersect: false },
    plugins: {
      legend: {
        labels: {
          color: "#eef6f2",
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(7, 16, 19, 0.94)",
        borderColor: "#2b3d45",
        borderWidth: 1,
        titleColor: "#eef6f2",
        bodyColor: "#a8bbb6",
      },
      ...(plugins || {}),
    },
    scales: scales === null ? {} : { ...defaultScales, ...(scales || {}) },
    ...rest,
  };
}

function normalizeLibraryImage(item) {
  const data = item.data[0];
  const image = item.links[0].href;

  return {
    id: `image-${data.nasa_id}`,
    type: "NASA Library",
    title: data.title,
    date: data.date_created?.slice(0, 10) || "NASA Image Library",
    explanation: data.description || "Imatge de la NASA Image and Video Library.",
    imageUrl: image,
    originalUrl: image,
  };
}

function renderNeoStats(objects) {
  const hazardous = objects.filter((item) => item.is_potentially_hazardous_asteroid).length;
  const closest = objects.reduce((best, item) => {
    const approach = item.close_approach_data[0];
    const distance = Number(approach.miss_distance.kilometers);
    return !best || distance < best.distance ? { item, distance } : best;
  }, null);
  const fastest = objects.reduce((best, item) => {
    const approach = item.close_approach_data[0];
    const speed = Number(approach.relative_velocity.kilometers_per_hour);
    return !best || speed > best.speed ? { item, speed } : best;
  }, null);

  selectors.neoStats.innerHTML = `
    <article class="stat-card">
      <span>Total</span>
      <strong>${objects.length}</strong>
    </article>
    <article class="stat-card">
      <span>Potencialment perillosos</span>
      <strong>${hazardous}</strong>
    </article>
    <article class="stat-card">
      <span>Mes proper</span>
      <strong>${closest ? Math.round(closest.distance).toLocaleString("ca-ES") : "-" } km</strong>
      <small>${closest ? escapeHtml(closest.item.name) : ""}</small>
    </article>
    <article class="stat-card">
      <span>Mes rapid</span>
      <strong>${fastest ? Math.round(fastest.speed).toLocaleString("ca-ES") : "-" } km/h</strong>
      <small>${fastest ? escapeHtml(fastest.item.name) : ""}</small>
    </article>
  `;
}

function renderNeoCard(item) {
  const approach = item.close_approach_data[0];
  const diameter = item.estimated_diameter.meters;
  const min = Math.round(diameter.estimated_diameter_min);
  const max = Math.round(diameter.estimated_diameter_max);
  const distanceKm = Number(approach.miss_distance.kilometers).toLocaleString("ca-ES", { maximumFractionDigits: 0 });
  const speed = Number(approach.relative_velocity.kilometers_per_hour).toLocaleString("ca-ES", { maximumFractionDigits: 0 });
  const risk = item.is_potentially_hazardous_asteroid ? "Potencialment perillós" : "Seguiment normal";

  return `
    <article class="neo-card">
      <span class="pill">${risk}</span>
      <h3>${escapeHtml(item.name)}</h3>
      <p>Pas: ${escapeHtml(approach.close_approach_date_full || approach.close_approach_date)}</p>
      <p>Diàmetre estimat: ${min}-${max} m · Distància: ${distanceKm} km · Velocitat: ${speed} km/h</p>
      <a href="${escapeAttribute(item.nasa_jpl_url)}" target="_blank" rel="noreferrer">Fitxa JPL</a>
    </article>
  `;
}

async function request(path, params = {}) {
  const url = new URL(`${NASA_BASE_URL}${path}`, window.location.origin);
  if (state.apiKey !== DEFAULT_API_KEY) {
    url.searchParams.set("api_key", state.apiKey);
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.msg || payload?.error?.message || `Error HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

function validateNeoRange() {
  validateDateRange(selectors.neoStart.value, selectors.neoEnd.value);
}

function validateDateRange(startValue, endValue) {
  const start = new Date(startValue);
  const end = new Date(endValue);
  const days = Math.round((end - start) / 86_400_000);

  if (Number.isNaN(days) || days < 0) {
    throw new Error("La data final ha de ser igual o posterior a la inicial.");
  }

  if (days > 7) {
    throw new Error("L'endpoint NeoWs accepta intervals màxims de set dies.");
  }
}

function setLoading(container) {
  container.innerHTML = "";
  container.append(selectors.loadingTemplate.content.cloneNode(true));
}

function setError(container, error) {
  container.innerHTML = `<div class="state error">${escapeHtml(error.message)}</div>`;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value);
}
