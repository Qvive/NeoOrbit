// Hämta HTML‑element
const ship = document.getElementById('ship');
const planet = document.getElementById('planet');
const scoreDisplay = document.getElementById('scoreboard');
const gameWorld = document.getElementById('gameWorld');

// Dölj sidans scrollbars
document.body.style.overflow = 'hidden';

// Skeppets position i världen (start)
let shipX = 990;
let shipY = 890;

// Basfart per steg
const baseSpeed = 5;
// Hastighetsnivå 0–3
let speedLevel = 0;

// Poäng
let score = 0;
// Håller koll på om skeppet lämnat planeten
let hasLeftPlanet = false;

// Tangentstatus – vilka tangenter är nedtryckta?
let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

// Tangent­tryckningar för hastighetskontroll
document.addEventListener('keydown', e => {
  if (e.key === 'v' || e.key === 'V') {
    speedLevel = Math.min(3, speedLevel + 1);
    console.log('Speed level:', speedLevel);
    e.preventDefault();
  }
  if (e.key === 's' || e.key === 'S') {
    speedLevel = Math.max(0, speedLevel - 1);
    console.log('Speed level:', speedLevel);
    e.preventDefault();
  }
});

// Lyssna på nedtryckningar för piltangenter
document.addEventListener('keydown', e => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
    e.preventDefault();
  }
});
// Lyssna på uppsläpp för piltangenter
document.addEventListener('keyup', e => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
    e.preventDefault();
  }
});

// WASD‑kontroller (alternativ till pilarna)
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'w') { keys.ArrowUp    = true;  e.preventDefault(); }
  if (k === 'a') { keys.ArrowLeft  = true;  e.preventDefault(); }
  if (k === 'd') { keys.ArrowRight = true;  e.preventDefault(); }
  // 's' fångas av hastighets­kontrollen, så vi avstår här
});
document.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (k === 'w') { keys.ArrowUp    = false; e.preventDefault(); }
  if (k === 'a') { keys.ArrowLeft  = false; e.preventDefault(); }
  if (k === 'd') { keys.ArrowRight = false; e.preventDefault(); }
});

// Konstanter för planetens radie och skeppets radie
const planetRadius = 100;
const shipRadius   = 10;
const dockingRadius = planetRadius + shipRadius; // 110 px

// Spelloopen – körs 60 gånger per sekund
function gameLoop() {
  // Beräkna faktisk fart
  const speed = baseSpeed * speedLevel;

  // Flytta skeppet om tangenter är nedtryckta
  if (keys.ArrowUp)    shipY -= speed;
  if (keys.ArrowDown)  shipY += speed;
  if (keys.ArrowLeft)  shipX -= speed;
  if (keys.ArrowRight) shipX += speed;

  // Kollisionskontroll mot planeten (behåll som tidigare)
  const shipCenterX = shipX + shipRadius;
  const shipCenterY = shipY + shipRadius;
  const dx = shipCenterX - 1000;
  const dy = shipCenterY - 1000;
  const dist = Math.sqrt(dx*dx + dy*dy);

  if (dist < dockingRadius) {
    if (dist > 0) {
      const angle = Math.atan2(dy, dx);
      const newCenterX = 1000 + Math.cos(angle) * dockingRadius;
      const newCenterY = 1000 + Math.sin(angle) * dockingRadius;
      shipX = newCenterX - shipRadius;
      shipY = newCenterY - shipRadius;
    }
    if (hasLeftPlanet) {
      score++;
      scoreDisplay.textContent = `Poäng: ${score}`;
      hasLeftPlanet = false;
    }
  } else {
    hasLeftPlanet = true;
  }

  // Uppdatera skeppets position visuellt
  ship.style.left = shipX + 'px';
  ship.style.top  = shipY + 'px';

  // Flytta spelvärlden så skeppet hålls centrerat
  const offsetX = window.innerWidth  / 2 - shipX;
  const offsetY = window.innerHeight / 2 - shipY;
  gameWorld.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

  requestAnimationFrame(gameLoop);
}

// Starta spelet
gameLoop();
