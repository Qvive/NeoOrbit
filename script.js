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

// Maxhastighet per frame
const baseSpeed = 5;
// Aktuell hastighet
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

// W/S startar acceleration eller inbromsning
document.addEventListener('keydown', e => {
  if (e.key === 'w') {
    accelFrames = 180;      // 3 s * 60 fps för accelerera
    e.preventDefault();
  }
  if (e.key === 's') {
    accelFrames = -180;     // 3 s * 60 fps för bromsa
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
  // Hantera acceleration eller inbromsning
  if (accelFrames > 0) {
    // accelerera linjärt mot baseSpeed
    currentSpeed = Math.min(baseSpeed, currentSpeed + baseSpeed / 180);
    accelFrames--;
  } else if (accelFrames < 0) {
    // bromsa linjärt mot 0
    currentSpeed = Math.max(0, currentSpeed - baseSpeed / 180);
    accelFrames++;
  }

  // Rotation via A/D
  if (keys.d) {
    angle = (angle + 2) % 360;
  } else if (keys.a) {
    angle = (angle - 2 + 360) % 360;
  }
  ship.style.transform = `rotate(${angle}deg)`;

  // Beräkna rörelsevektor i nosens riktning
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
