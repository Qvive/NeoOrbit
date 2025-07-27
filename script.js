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
// Thrust‑timer (antal frames)
let thrustTimer = 0;

// Rotationsvinkel (grader)
let angle = 0;

// Poänglogik
let score = 0;
let hasLeftPlanet = false;

// Tangentstatus för A/D
let keys = { a: false, d: false };

// W/S för thrust och stopp
document.addEventListener('keydown', e => {
  if (e.key === 'w' && thrustTimer === 0) {
    thrustTimer = 30;       // 30 frames = 0.5 s @ 60fps
    e.preventDefault();
  }
  if (e.key === 's') {
    thrustTimer = 0;        // akut stopp
    e.preventDefault();
  }
});

// A/D för rotation
document.addEventListener('keydown', e => {
  if (e.key === 'a') { keys.a = true; e.preventDefault(); }
  if (e.key === 'd') { keys.d = true; e.preventDefault(); }
});
document.addEventListener('keyup', e => {
  if (e.key === 'a') { keys.a = false; e.preventDefault(); }
  if (e.key === 'd') { keys.d = false; e.preventDefault(); }
});

// Planet- och skeppsradier
const planetRadius = 100;
const shipRadius   = 10;
const dockingRadius = planetRadius + shipRadius;

// Spelloopen
function gameLoop() {
  // Minska thrust‑timer om aktiv
  if (thrustTimer > 0) thrustTimer--;

  // Bestäm fart
  const speed = thrustTimer > 0 ? baseSpeed : 0;

  // Rotation via A/D
  if (keys.d) {
    angle = (angle + 2) % 360;
  } else if (keys.a) {
    angle = (angle - 2 + 360) % 360;
  }
  ship.style.transform = `rotate(${angle}deg)`;

  // Omvandla vinkel till rörelsevektor
  const rad = angle * Math.PI / 180;
  const dx  = Math.sin(rad) * speed;
  const dy  = -Math.cos(rad) * speed;

  // Flytta skeppet i nosens riktning
  shipX += dx;
  shipY += dy;

  // Kollisionskontroll & poäng
  const cx = shipX + shipRadius;
  const cy = shipY + shipRadius;
  const dist = Math.hypot(cx - 1000, cy - 1000);

  if (dist < dockingRadius) {
    if (dist > 0) {
      const angRad = Math.atan2(cy - 1000, cx - 1000);
      const nx = 1000 + Math.cos(angRad) * dockingRadius - shipRadius;
      const ny = 1000 + Math.sin(angRad) * dockingRadius - shipRadius;
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

  // Uppdatera position visuellt
  ship.style.left = shipX + 'px';
  ship.style.top  = shipY + 'px';

  // Kamera: centrera skeppet i vy
  const offsetX = window.innerWidth  / 2 - shipX;
  const offsetY = window.innerHeight / 2 - shipY;
  gameWorld.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

  requestAnimationFrame(gameLoop);
}

// Starta gameLoop
gameLoop();
