import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import { getAnalytics, isSupported } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-analytics.js';
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes
} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDFDIwMh6Sd51wGFWtb96lICUK1VcB6dFk',
  authDomain: 'cumple-8d8cc.firebaseapp.com',
  projectId: 'cumple-8d8cc',
  storageBucket: 'cumple-8d8cc.firebasestorage.app',
  messagingSenderId: '302372717426',
  appId: '1:302372717426:web:bd6c43ea57c01fbbf393eb',
  measurementId: 'G-GZCGYMZ294'
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const wishesCollection = collection(db, 'wishes');
const photosCollection = collection(db, 'photos');

isSupported().then(supported => {
  if (supported) getAnalytics(firebaseApp);
}).catch(() => {});

const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');
const nebulaBg = document.getElementById('nebula-bg');

// Elementos de UI
const togglePanelBtn = document.getElementById('toggle-panel-btn');
const closePanelBtn = document.getElementById('close-panel-btn');
const controlsPanel = document.getElementById('controls-panel');
const galaxyThumbs = document.querySelectorAll('.galaxy-thumb');

// Carta
const birthdayCard = document.getElementById('birthday-card');
const closeCardBtn = document.getElementById('close-card-btn');
const hideCardAction = document.getElementById('hide-card-action');
const openCardBtn = document.getElementById('open-card-btn');

// Spotify
const spotifyBanner = document.getElementById('spotify-banner');
const toggleSpotifyBtn = document.getElementById('toggle-spotify-btn');
const skyDashboard = document.getElementById('sky-dashboard');
const toggleDashboardBtn = document.getElementById('toggle-dashboard-btn');
const skyDate = document.getElementById('sky-date');
const dailyConstellation = document.getElementById('daily-constellation');
const constellationFact = document.getElementById('constellation-fact');
const moonIcon = document.getElementById('moon-icon');
const moonPhase = document.getElementById('moon-phase');
const moonIllumination = document.getElementById('moon-illumination');
const moonNext = document.getElementById('moon-next');
const wishCount = document.getElementById('wish-count');
const featuredWish = document.getElementById('featured-wish');
const featuredPhotoWidget = document.getElementById('featured-photo-widget');
const featuredPhotoButton = document.getElementById('featured-photo-button');
const featuredPhoto = document.getElementById('featured-photo');
const featuredPhotoName = document.getElementById('featured-photo-name');

// Sliders
const starCountInput = document.getElementById('star-count');
const starCountVal = document.getElementById('star-count-val');
const twinkleSpeedInput = document.getElementById('twinkle-speed');
const twinkleSpeedVal = document.getElementById('twinkle-speed-val');
const brightnessInput = document.getElementById('brightness');
const brightnessVal = document.getElementById('brightness-val');
const parallaxToggle = document.getElementById('parallax-toggle');

// Modales interactivos
const wishModal = document.getElementById('wish-modal');
const btnWish = document.getElementById('btn-wish');
const closeWishModal = document.getElementById('close-wish-modal');
const wishInput = document.getElementById('wish-input');
const submitWishBtn = document.getElementById('submit-wish-btn');
const wishesList = document.getElementById('wishes-list');
const wishStatus = document.getElementById('wish-status');

const fortuneModal = document.getElementById('fortune-modal');
const btnFortune = document.getElementById('btn-fortune');
const closeFortuneModal = document.getElementById('close-fortune-modal');
const spinFortuneBtn = document.getElementById('spin-fortune-btn');
const planetSpinner = document.getElementById('planet-spinner');
const fortuneText = document.getElementById('fortune-text');

const photosModal = document.getElementById('photos-modal');
const btnPhotos = document.getElementById('btn-photos');
const closePhotosModal = document.getElementById('close-photos-modal');
const photoUploadInput = document.getElementById('photo-upload-input');
const photosGrid = document.getElementById('photos-grid');
const photosStatus = document.getElementById('photos-status');

const btnCelebrate = document.getElementById('btn-celebrate');

let config = {
  starCount: 400,
  twinkleSpeedMultiplier: 1.0,
  brightnessMultiplier: 1.0,
  parallaxEnabled: true
};

let width, height;
let stars = [];
let shootingStars = [];
let fireworks = [];
let fireworkRockets = [];
let mouse = { x: null, y: null };
let featuredPhotoId = null;

// --- 1. CONTADOR DE CUMPLEAÑOS AUTOMÁTICO (31 de Octubre cada año) ---
function updateCountdown() {
  const now = new Date();
  let currentYear = now.getFullYear();
  let nextBirthday = new Date(currentYear, 9, 31); // Mes 9 = Octubre en JS

  if (now > nextBirthday) {
    nextBirthday = new Date(currentYear + 1, 9, 31);
  }

  const diff = nextBirthday - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById('countdown-timer').textContent = 
    `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

const constellationFacts = [
  { name: 'Orión', fact: 'Betelgeuse, su estrella rojiza, es una supergigante.' },
  { name: 'Escorpio', fact: 'Antares, su estrella más brillante, luce un tono rojizo.' },
  { name: 'Lira', fact: 'Vega es una de las estrellas más brillantes del cielo nocturno.' },
  { name: 'Cisne', fact: 'Deneb forma parte del famoso Triángulo de Verano.' },
  { name: 'Casiopea', fact: 'Sus cinco estrellas principales dibujan una gran W.' },
  { name: 'Tauro', fact: 'Alberga las Pléyades, un cúmulo visible a simple vista.' },
  { name: 'Géminis', fact: 'Cástor parece una estrella, pero es un sistema múltiple.' },
  { name: 'Andrómeda', fact: 'En ella encontramos la gran galaxia M31.' }
];

function getDayOfYear(date) {
  const todayUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const yearStartUtc = Date.UTC(date.getFullYear(), 0, 0);
  return Math.floor((todayUtc - yearStartUtc) / 86400000);
}

function updateDailySky() {
  const now = new Date();
  const fact = constellationFacts[(getDayOfYear(now) - 1) % constellationFacts.length];
  skyDate.textContent = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(now);
  dailyConstellation.textContent = fact.name;
  constellationFact.textContent = fact.fact;
  updateMoonPhase(now);
}

function updateMoonPhase(now) {
  const synodicMonthDays = 29.530588853;
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const daysSinceNewMoon = (now.getTime() - knownNewMoon) / 86400000;
  const phase = ((daysSinceNewMoon / synodicMonthDays) % 1 + 1) % 1;
  const illumination = Math.round((1 - Math.cos(phase * Math.PI * 2)) * 50);
  const phaseNames = ['Luna nueva', 'Cuarto creciente', 'Luna llena', 'Cuarto menguante'];
  const phaseIcons = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

  let currentName;
  if (phase < 0.03 || phase >= 0.97) currentName = 'Luna nueva';
  else if (phase < 0.22) currentName = 'Creciente';
  else if (phase < 0.28) currentName = 'Cuarto creciente';
  else if (phase < 0.47) currentName = 'Gibosa creciente';
  else if (phase < 0.53) currentName = 'Luna llena';
  else if (phase < 0.72) currentName = 'Gibosa menguante';
  else if (phase < 0.78) currentName = 'Cuarto menguante';
  else currentName = 'Menguante';

  const iconIndex = Math.min(phaseIcons.length - 1, Math.round(phase * phaseIcons.length));
  const nextQuarterIndex = Math.floor(phase * 4) + 1;
  const nextPhase = phaseNames[nextQuarterIndex % 4];
  const phaseDistance = (nextQuarterIndex / 4 - phase + 1) % 1;
  const hoursUntilNextPhase = Math.max(1, Math.round(phaseDistance * synodicMonthDays * 24));

  moonIcon.textContent = phaseIcons[iconIndex];
  moonPhase.textContent = currentName;
  moonIllumination.textContent = `${illumination}% iluminada`;
  moonNext.textContent = hoursUntilNextPhase < 24
    ? `Próxima: ${nextPhase} en ${hoursUntilNextPhase} h`
    : `Próxima: ${nextPhase} en ${Math.round(hoursUntilNextPhase / 24)} días`;
}

updateDailySky();
setInterval(updateDailySky, 60 * 60 * 1000);

toggleDashboardBtn.addEventListener('click', () => {
  const isCollapsed = skyDashboard.classList.toggle('collapsed');
  toggleDashboardBtn.textContent = isCollapsed ? '+' : '−';
  toggleDashboardBtn.setAttribute('aria-expanded', String(!isCollapsed));
  toggleDashboardBtn.setAttribute('aria-label', isCollapsed ? 'Expandir Cielo de hoy' : 'Minimizar Cielo de hoy');
  toggleDashboardBtn.title = isCollapsed ? 'Expandir Cielo de hoy' : 'Minimizar Cielo de hoy';
});

// --- 2. DESEOS COMPARTIDOS EN FIRESTORE ---
btnWish.addEventListener('click', () => wishModal.classList.remove('hidden'));
closeWishModal.addEventListener('click', () => wishModal.classList.add('hidden'));

function showFirebaseError(statusElement, error) {
  console.error('Firebase error:', error);
  const accessDenied = error.code === 'permission-denied' || error.code === 'storage/unauthorized';
  statusElement.textContent = accessDenied
    ? 'Firebase rechazó el acceso. Revisa las reglas de Firestore y Storage.'
    : 'No se pudo conectar con Firebase. Inténtalo de nuevo.';
}

onSnapshot(
  query(wishesCollection, orderBy('createdAt', 'desc')),
  snapshot => {
    wishesList.replaceChildren();
    const wishes = [];
    snapshot.forEach(wishDocument => {
      wishes.push(wishDocument.data().text);
    });
    wishes.forEach(wish => {
      const item = document.createElement('li');
      item.textContent = `✨ ${wish}`;
      wishesList.appendChild(item);
    });
    wishCount.textContent = new Intl.NumberFormat('es').format(wishes.length);
    if (wishes.length) {
      const highlightedWish = wishes[(getDayOfYear(new Date()) - 1) % wishes.length];
      featuredWish.textContent = `“${highlightedWish.length > 100 ? `${highlightedWish.slice(0, 97)}...` : highlightedWish}”`;
    } else {
      featuredWish.textContent = 'El universo espera el primer deseo.';
    }
    wishStatus.textContent = '';
  },
  error => showFirebaseError(wishStatus, error)
);

submitWishBtn.addEventListener('click', async () => {
  const text = wishInput.value.trim();
  if (!text) return;

  submitWishBtn.disabled = true;
  wishStatus.textContent = 'Enviando deseo...';
  try {
    await addDoc(wishesCollection, { text, createdAt: serverTimestamp() });
    wishInput.value = '';
    wishStatus.textContent = 'Deseo compartido con éxito.';
    triggerShootingStar();
  } catch (error) {
    showFirebaseError(wishStatus, error);
  } finally {
    submitWishBtn.disabled = false;
  }
});

// --- 4. GALLETA DE LA FORTUNA ASTRONÓMICA ---
const fortunes = [
  "Las estrellas indican que este año vendrán viajes increíbles y risas inolvidables. ✨",
  "El universo conspira a tu favor: grandes sorpresas te esperan este mes. 🪐",
  "Una coincidencia mágica traerá a alguien o algo especial a tu vida muy pronto. 🌟",
  "Tu energía cósmica está en su punto más alto. ¡Es el año para cumplir tus sueños! 🚀"
];

btnFortune.addEventListener('click', () => fortuneModal.classList.remove('hidden'));
closeFortuneModal.addEventListener('click', () => fortuneModal.classList.add('hidden'));

spinFortuneBtn.addEventListener('click', () => {
  planetSpinner.style.transform = `rotate(${Math.floor(Math.random() * 1000 + 720)}deg)`;
  setTimeout(() => {
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    fortuneText.textContent = randomFortune;
  }, 800);
});

// --- 3. GALERÍA COMPARTIDA EN FIREBASE STORAGE ---
btnPhotos.addEventListener('click', () => {
  photosModal.classList.remove('hidden');
});
closePhotosModal.addEventListener('click', () => photosModal.classList.add('hidden'));
featuredPhotoButton.addEventListener('click', () => photosModal.classList.remove('hidden'));

onSnapshot(
  query(photosCollection, orderBy('createdAt', 'desc')),
  snapshot => {
    photosGrid.replaceChildren();
    const photos = snapshot.docs.map(photoDocument => ({ id: photoDocument.id, ...photoDocument.data() }));
    photos.forEach(photoData => {
      const image = document.createElement('img');
      image.className = 'photo-item';
      image.src = photoData.url;
      image.alt = photoData.fileName || 'Foto compartida';
      image.loading = 'lazy';
      photosGrid.appendChild(image);
    });

    if (photos.length) {
      const currentFeaturedPhoto = photos.find(photo => photo.id === featuredPhotoId);
      const photoOfTheDay = currentFeaturedPhoto || photos[Math.floor(Math.random() * photos.length)];
      featuredPhotoId = photoOfTheDay.id;
      featuredPhoto.src = photoOfTheDay.url;
      featuredPhoto.alt = photoOfTheDay.fileName || 'Recuerdo destacado';
      featuredPhotoName.textContent = photoOfTheDay.fileName || 'Abrir galería';
      featuredPhotoWidget.hidden = false;
    } else {
      featuredPhotoId = null;
      featuredPhoto.removeAttribute('src');
      featuredPhotoWidget.hidden = true;
    }
    photosStatus.textContent = '';
  },
  error => showFirebaseError(photosStatus, error)
);

photoUploadInput.addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;

  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (!supportedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
    photosStatus.textContent = 'Elige una imagen JPG, PNG, WebP, GIF o AVIF de hasta 5 MB.';
    photoUploadInput.value = '';
    return;
  }

  photosStatus.textContent = 'Subiendo imagen...';
  const safeName = file.name.replace(/[^\w.-]/g, '_');
  const imageRef = ref(storage, `birthday-photos/${Date.now()}-${safeName}`);
  let uploaded = false;
  try {
    await uploadBytes(imageRef, file, { contentType: file.type });
    uploaded = true;
    const url = await getDownloadURL(imageRef);
    await addDoc(photosCollection, {
      url,
      storagePath: imageRef.fullPath,
      fileName: file.name,
      createdAt: serverTimestamp()
    });
    photosStatus.textContent = 'Imagen compartida con éxito.';
    photoUploadInput.value = '';
  } catch (error) {
    if (uploaded) await deleteObject(imageRef).catch(() => {});
    showFirebaseError(photosStatus, error);
  }
});

// --- 5. FUEGOS DE ARTIFICIO Y FIESTA ESTELAR ---
class FireworkParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4.5 + 1.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.color = color;
    this.decay = Math.random() * 0.012 + 0.008;
    this.radius = Math.random() * 1.8 + 1.2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.985;
    this.vy = this.vy * 0.985 + 0.035;
    this.alpha -= this.decay;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class FireworkRocket {
  constructor(startX, startY, targetX, targetY) {
    this.startX = startX;
    this.startY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.progress = 0;
    this.duration = 42 + Math.random() * 16;
    this.x = startX;
    this.y = startY;
    this.active = true;
    this.color = ['#ffe08a', '#ff9e9e', '#a9e7ff', '#ffd1a8'][Math.floor(Math.random() * 4)];
  }

  update() {
    this.progress++;
    const progress = Math.min(1, this.progress / this.duration);
    this.x = this.startX + (this.targetX - this.startX) * progress;
    this.y = this.startY + (this.targetY - this.startY) * progress;

    if (progress === 1) {
      for (let i = 0; i < 55; i++) {
        fireworks.push(new FireworkParticle(this.x, this.y, this.color));
      }
      this.active = false;
    }
  }

  draw() {
    if (!this.active) return;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + 18);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function launchFireworks() {
  const startX = width / 2;
  const startY = height + 10;
  for (let index = 0; index < 3; index++) {
    const targetX = Math.max(40, Math.min(width - 40, startX + (Math.random() - 0.5) * 280));
    const targetY = height * (0.2 + Math.random() * 0.38);
    setTimeout(() => fireworkRockets.push(new FireworkRocket(startX, startY, targetX, targetY)), index * 180);
  }
}
btnCelebrate.addEventListener('click', launchFireworks);

function hideCard() { birthdayCard.classList.add('hidden'); }
function showCard() { birthdayCard.classList.remove('hidden'); }

closeCardBtn.addEventListener('click', hideCard);
hideCardAction.addEventListener('click', hideCard);
openCardBtn.addEventListener('click', showCard);

// Pulso de las estrellas
let starPulseTime = 0;

function updateStarPulse() {
  starPulseTime += 0.05;
  requestAnimationFrame(updateStarPulse);
}
updateStarPulse();

// Estrellas fugaces
class ShootingStar {
  constructor() { this.reset(); }

  reset() {
    const entryEdge = Math.floor(Math.random() * 4);
    if (entryEdge === 0) {
      this.x = Math.random() * width;
      this.y = -20;
      this.angle = Math.PI / 6 + Math.random() * (Math.PI * 2 / 3);
    } else if (entryEdge === 1) {
      this.x = width + 20;
      this.y = Math.random() * height;
      this.angle = Math.PI / 2 + Math.random() * Math.PI;
    } else if (entryEdge === 2) {
      this.x = Math.random() * width;
      this.y = height + 20;
      this.angle = Math.PI + Math.random() * Math.PI;
    } else {
      this.x = -20;
      this.y = Math.random() * height;
      this.angle = -Math.PI / 2 + Math.random() * Math.PI;
    }

    this.speed = Math.random() * 8 + 12;
    this.length = Math.random() * 120 + 100;
    this.size = Math.random() * 1.5 + 1;
    this.opacity = 1;
    this.active = true;
  }

  update() {
    if (!this.active) return;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.opacity -= 0.008;
    if (this.opacity <= 0 || this.x < -100 || this.x > width + 100 || this.y < -100 || this.y > height + 100) {
      this.active = false;
    }
  }

  draw() {
    if (!this.active || this.opacity <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.opacity);
    const tailX = this.x - Math.cos(this.angle) * this.length;
    const tailY = this.y - Math.sin(this.angle) * this.length;

    const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.2, '#ea80fc');
    gradient.addColorStop(0.6, 'rgba(123, 31, 162, 0.4)');
    gradient.addColorStop(1, 'transparent');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = this.size;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function triggerShootingStar() { shootingStars.push(new ShootingStar()); }
setTimeout(triggerShootingStar, 30000);
setInterval(triggerShootingStar, 30000);

toggleSpotifyBtn.addEventListener('click', () => {
  const isMinimized = spotifyBanner.classList.toggle('minimized');
  document.body.classList.toggle('spotify-player-open', !isMinimized);
  toggleSpotifyBtn.textContent = isMinimized ? '+' : '−';
  toggleSpotifyBtn.setAttribute('aria-expanded', String(!isMinimized));
  toggleSpotifyBtn.setAttribute('aria-label', isMinimized ? 'Expandir reproductor' : 'Minimizar reproductor');
});

togglePanelBtn.addEventListener('click', () => {
  const isHidden = controlsPanel.classList.toggle('hidden');
  togglePanelBtn.setAttribute('aria-expanded', String(!isHidden));
  togglePanelBtn.setAttribute('aria-label', isHidden ? 'Abrir ajustes del fondo' : 'Cerrar ajustes del fondo');
});

closePanelBtn.addEventListener('click', () => {
  controlsPanel.classList.add('hidden');
  togglePanelBtn.setAttribute('aria-expanded', 'false');
  togglePanelBtn.setAttribute('aria-label', 'Abrir ajustes del fondo');
});

galaxyThumbs.forEach(thumb => {
  thumb.addEventListener('click', () => {
    galaxyThumbs.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');

    const imagePath = thumb.getAttribute('data-img');
    nebulaBg.style.backgroundImage = `url('${imagePath}')`;
  });
});

starCountInput.addEventListener('input', (e) => {
  config.starCount = parseInt(e.target.value);
  starCountVal.textContent = config.starCount;
  initStars();
});

twinkleSpeedInput.addEventListener('input', (e) => {
  config.twinkleSpeedMultiplier = parseFloat(e.target.value);
  twinkleSpeedVal.textContent = `${config.twinkleSpeedMultiplier.toFixed(2)}x`;
});

brightnessInput.addEventListener('input', (e) => {
  config.brightnessMultiplier = parseInt(e.target.value) / 100;
  brightnessVal.textContent = `${e.target.value}%`;
});

parallaxToggle.addEventListener('change', (e) => {
  config.parallaxEnabled = e.target.checked;
  if (!config.parallaxEnabled) {
    nebulaBg.style.transform = 'scale(1.05) translate(0px, 0px)';
  }
});

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initStars();
}
window.addEventListener('resize', resize);

class Star {
  constructor() { this.reset(); }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.baseSize = Math.random() * 1.6 + 0.4;
    this.size = this.baseSize;
    this.baseAlpha = Math.random() * 0.5 + 0.2;
    this.alpha = this.baseAlpha;
    this.twinkleSpeed = (Math.random() * 0.02 + 0.005);
    this.twinkleAngle = Math.random() * Math.PI * 2;
    this.isBigStar = Math.random() < 0.08;

    const colors = ['#ffffff', '#e0f7fa', '#e1bee7', '#fff9c4', '#f3e5f5'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.twinkleAngle += this.twinkleSpeed * config.twinkleSpeedMultiplier;
    const currentPulse = (Math.sin(starPulseTime * 3 * config.twinkleSpeedMultiplier) * 0.3 + 0.7);

    let rawAlpha = (this.baseAlpha + Math.sin(this.twinkleAngle) * 0.25) * config.brightnessMultiplier * currentPulse;
    this.alpha = Math.max(0, Math.min(1, rawAlpha));
    this.size = this.baseSize * (0.85 + currentPulse * 0.3) * Math.sqrt(config.brightnessMultiplier);

    if (mouse.x !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        this.alpha = Math.min(1, this.alpha + (1 - dist / 130) * 0.5 * config.brightnessMultiplier);
      }
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    if (this.isBigStar && this.alpha > 0.3) {
      const spikeLength = this.size * 6 * this.alpha * config.brightnessMultiplier;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 0.5 * Math.min(2, config.brightnessMultiplier);

      ctx.beginPath();
      ctx.moveTo(this.x - spikeLength, this.y);
      ctx.lineTo(this.x + spikeLength, this.y);
      ctx.moveTo(this.x, this.y - spikeLength);
      ctx.lineTo(this.x, this.y + spikeLength);
      ctx.stroke();
    }

    ctx.restore();
  }
}

function initStars() {
  const targetCount = config.starCount;
  while (stars.length < targetCount) { stars.push(new Star()); }
  if (stars.length > targetCount) { stars.length = targetCount; }
}

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  if (config.parallaxEnabled) {
    const moveX = (e.clientX / width - 0.5) * 15;
    const moveY = (e.clientY / height - 0.5) * 15;
    nebulaBg.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`;
  }
});

window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
  if (config.parallaxEnabled) {
    nebulaBg.style.transform = 'scale(1.05) translate(0px, 0px)';
  }
});

function animate() {
  ctx.clearRect(0, 0, width, height);

  stars.forEach(star => {
    star.update();
    star.draw();
  });

  shootingStars.forEach((sStar, index) => {
    sStar.update();
    sStar.draw();
  });
  shootingStars = shootingStars.filter(sStar => sStar.active);

  fireworkRockets.forEach(rocket => {
    rocket.update();
    rocket.draw();
  });
  fireworkRockets = fireworkRockets.filter(rocket => rocket.active);

  fireworks.forEach(fw => {
    fw.update();
    fw.draw();
  });
  fireworks = fireworks.filter(fw => fw.alpha > 0);

  requestAnimationFrame(animate);
}

resize();
animate();