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

// Maxfart per frame (dubblad)
const baseSpeed = 10;
// Aktuell fart
let currentSpeed = 0;
// Räknare för acceleration/inbromsning (antal frames)
let accelFrames = 0;

// Vinkel i grader för nosrotation
let angle = 0;

// Poänglogik
let score = 0;
let hasLeftPlanet = false;

// Tangentstatus för A/D
let keys = { a: false, d: false };

// Tangenter för acc/decel
document.addEventListener('keydown', e => {
  if (e.key === 'w') {
    // Starta acceleration: från currentSpeed → baseSpeed på 300 frames (5s)
    accelFrames = 300;
    e.preventDefault();
  }
  if (e.key === 's') {
    // Starta inbromsning: från currentSpeed → 0 på 300 frames
    accelFrames = -300;
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
  // Hantera acc/decel
  if (accelFrames > 0) {
    // Linjär acceleration: delta baserat på återstående frames
    const delta = (baseSpeed - currentSpeed) / accelFrames;
    currentSpeed += delta;
    accelFrames--;
  } else if (accelFrames < 0) {
    // Linjär inbromsning
    const delta = currentSpeed / (-accelFrames);
    currentSpeed -= delta;
    accelFrames++;
  }

  // Rotation med A/D
  if (keys.d) {
    angle = (angle + 2) % 360;
  } else if (keys.a) {
    angle = (angle - 2 + 360) % 360;
  }
  ship.style.transform = `rotate(${angle}deg)`;

  // Rörelsevektor i nosens riktning
  const rad = angle * Math.PI / 180;
  const dx  = Math.sin(rad) * currentSpeed;
  const dy  = -Math.cos(rad) * currentSpeed;

  // Flytta skeppet
  shipX += dx;
  shipY += dy;

  // Kollisionskontroll & poäng
  const cx = shipX + shipRadius;
  const cy = shipY + shipRadius;
  const dist = Math.hypot(cx - 1000, cy - 1000);
  if (dist < dockingRadius) {
    if (dist > 0) {
      const angRad = Math.atan2(cy - 1000, cx - 1000);
      shipX = 1000 + Math.cos(angRad) * dockingRadius - shipRadius;
      shipY = 1000 + Math.sin(angRad) * dockingRadius - shipRadius;
    }
    if (hasLeftPlanet) {
      score++;
      scoreDisplay.textContent = `Poäng: ${score}`;
      hasLeftPlanet = false;
    }
  } else {
    hasLeftPlanet = true;
  }

  // Uppdatera visuellt läge
  ship.style.left = shipX + 'px';
  ship.style.top  = shipY + 'px';

  // Kamera – centrera skeppet
  const offsetX = window.innerWidth  / 2 - shipX;
  const offsetY = window.innerHeight / 2 - shipY;
  gameWorld.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

  requestAnimationFrame(gameLoop);
}

// Starta loopen
gameLoop();
