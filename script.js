// Hämta HTML‑element
const ship = document.getElementById('ship');
const planet = document.getElementById('planet');
const scoreDisplay = document.getElementById('scoreboard');
const gameWorld = document.getElementById('gameWorld');

// Dölj scrollbars
document.body.style.overflow = 'hidden';

// Startposition
let shipX = 990;
let shipY = 890;

// Hastighet per frame
const baseSpeed = 5;
// Thrust-timer (antal frames)
let thrustTimer = 0;

// Poänglogik
let score = 0;
let hasLeftPlanet = false;

// Tangentstatus för A/D
let keys = { a: false, d: false };

// Tidsbegränsad thrust: W ger 30 frames (0,5 s @60fps)
document.addEventListener('keydown', e => {
  if (e.key === 'w' && thrustTimer === 0) {
    thrustTimer = 30;
    e.preventDefault();
  }
  if (e.key === 's') {
    thrustTimer = 0; // akut broms
    e.preventDefault();
  }
});

// Styrning A/D + rotation
document.addEventListener('keydown', e => {
  if (e.key === 'a') { keys.a = true; e.preventDefault(); }
  if (e.key === 'd') { keys.d = true; e.preventDefault(); }
});
document.addEventListener('keyup', e => {
  if (e.key === 'a') { keys.a = false; e.preventDefault(); }
  if (e.key === 'd') { keys.d = false; e.preventDefault(); }
});

// Radier
const planetRadius = 100;
const shipRadius   = 10;
const dockingRadius = planetRadius + shipRadius;

// Huvudloop
function gameLoop() {
  // Avkasta thrust-timer
  if (thrustTimer > 0) thrustTimer--;

  // Bestäm fart: 0 om timer=0, annars baseSpeed
  const speed = thrustTimer > 0 ? baseSpeed : 0;

  // Riktad thrust (uppåt)
  shipY -= speed;

  // Sidleds­styrning
  if (keys.a) {
    shipX -= speed;
    ship.style.transform = 'rotate(-15deg)';
  } else if (keys.d) {
    shipX += speed;
    ship.style.transform = 'rotate(15deg)';
  } else {
    ship.style.transform = 'rotate(0deg)';
  }

  // Kollisionskontroll & poäng
  const cx = shipX + shipRadius;
  const cy = shipY + shipRadius;
  const dx = cx - 1000;
  const dy = cy - 1000;
  const dist = Math.hypot(dx, dy);

  if (dist < dockingRadius) {
    if (dist > 0) {
      const ang = Math.atan2(dy, dx);
      const nx = 1000 + Math.cos(ang) * dockingRadius - shipRadius;
      const ny = 1000 + Math.sin(ang) * dockingRadius - shipRadius;
      shipX = nx;
      shipY = ny;
    }
    if (hasLeftPlanet) {
      score++;
      scoreDisplay.textContent = `Poäng: ${score}`;
      hasLeftPlanet = false;
    }
  } else {
    hasLeftPlanet = true;
  }

  // Uppdatera position
  ship.style.left = shipX + 'px';
  ship.style.top  = shipY + 'px';

  // Kamera
  const offsetX = window.innerWidth  / 2 - shipX;
  const offsetY = window.innerHeight / 2 - shipY;
  gameWorld.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

  requestAnimationFrame(gameLoop);
}

// Starta
gameLoop();
