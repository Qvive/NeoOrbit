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

// Hastighet i px per frame
const baseSpeed = 5;
// Gasläge: false = still, true = full fart
let isThrusting = false;

// Poäng och returflagga
let score = 0;
let hasLeftPlanet = false;

// Tangentstatus – A/D för sidled
let keys = { a: false, d: false };

// Gas & broms: W slår på, S stänger av
document.addEventListener('keydown', e => {
  if (e.key === 'w') {
    isThrusting = true;
    e.preventDefault();
  }
  if (e.key === 's') {
    isThrusting = false;
    e.preventDefault();
  }
});

// WASD (bara A/D)
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'a') { keys.a = true; e.preventDefault(); }
  if (k === 'd') { keys.d = true; e.preventDefault(); }
});
document.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (k === 'a') { keys.a = false; e.preventDefault(); }
  if (k === 'd') { keys.d = false; e.preventDefault(); }
});

// Konstanter för planetens radie och skeppets radie
const planetRadius = 100;
const shipRadius   = 10;
const dockingRadius = planetRadius + shipRadius;

// Huvudloop – körs 60 ggr/s
function gameLoop() {
  // Bestäm fart
  const speed = isThrusting ? baseSpeed : 0;

  // Rörelse
  if (keys.a) shipX -= speed;
  if (keys.d) shipX += speed;
  shipY -= speed; // gas drar alltid uppåt, eller 0 om isThrusting=false

  // Kollisionskontroll & poäng
  const cx = shipX + shipRadius;
  const cy = shipY + shipRadius;
  const dx = cx - 1000;
  const dy = cy - 1000;
  const dist = Math.hypot(dx, dy);

  if (dist < dockingRadius) {
    // putta ut skeppet till ringens kant
    if (dist > 0) {
      const ang = Math.atan2(dy, dx);
      const nx = 1000 + Math.cos(ang) * dockingRadius - shipRadius;
      const ny = 1000 + Math.sin(ang) * dockingRadius - shipRadius;
      shipX = nx;
      shipY = ny;
    }
    // ge poäng om vi kommit tillbaka
    if (hasLeftPlanet) {
      score++;
      scoreDisplay.textContent = `Poäng: ${score}`;
      hasLeftPlanet = false;
    }
  } else {
    hasLeftPlanet = true;
  }

  // Uppdatera visuellt
  ship.style.left = shipX + 'px';
  ship.style.top  = shipY + 'px';

  // Kamera: håll skeppet centrerat
  const offsetX = window.innerWidth  / 2 - shipX;
  const offsetY = window.innerHeight / 2 - shipY;
  gameWorld.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

  requestAnimationFrame(gameLoop);
}

// Starta
gameLoop();
