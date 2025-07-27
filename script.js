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

// Maxfart per frame
const baseSpeed = 10;  // behåll det du har nu
// Aktuell fart
let currentSpeed = 0;
// Räknare för acceleration/inbromsning
let accelFrames = 0;

// Vinkel i grader för nosrotation
let angle = 0;

// Poänglogik
let score = 0;
let hasLeftPlanet = false;

// Tangentstatus för A/D
let keys = { a: false, d: false };

// Gravitation­skällor: planet + övriga objekt
const gravitySources = [
  { x: 1000, y: 1000, strength: 500 },      // planet
  // { x: asteroidX, y: asteroidY, strength: 50 },
  // { x: mineralX,  y: mineralY,  strength: 10 },
  // Lägg in alla dina asteroider, meteoriter och mineraler här
];

// W/S för acc/decel
document.addEventListener('keydown', e => {
  if (e.key === 'w') {
    accelFrames = 300;    // 5 s @60fps
    e.preventDefault();
  }
  if (e.key === 's') {
    accelFrames = -300;   // 5 s broms
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
    const delta = (baseSpeed - currentSpeed) / accelFrames;
    currentSpeed += delta;
    accelFrames--;
  } else if (accelFrames < 0) {
    const delta = currentSpeed / (-accelFrames);
    currentSpeed -= delta;
    accelFrames++;
  }

  // Rotation via A/D
  if (keys.d) {
    angle = (angle + 2) % 360;
  } else if (keys.a) {
    angle = (angle - 2 + 360) % 360;
  }
  ship.style.transform = `rotate(${angle}deg)`;

  // Thrust‑vektor i nosens riktning
  const rad  = angle * Math.PI / 180;
  const dx1  = Math.sin(rad) * currentSpeed;
  const dy1  = -Math.cos(rad) * currentSpeed;

  // Gravitation
  let gravDX = 0, gravDY = 0;
  for (const src of gravitySources) {
    const vx = src.x - shipX;
    const vy = src.y - shipY;
    const distSq = vx*vx + vy*vy;
    if (distSq === 0) continue;
    const force = src.strength / distSq;
    const invDist = 1 / Math.sqrt(distSq);
    gravDX += vx * invDist * force;
    gravDY += vy * invDist * force;
  }

  // Kombinera och flytta skeppet
  shipX += dx1 + gravDX;
  shipY += dy1 + gravDY;

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

  // Uppdatera visuellt
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
