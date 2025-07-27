// Hämta HTML‑element
const ship = document.getElementById('ship');
const planet = document.getElementById('planet');
const scoreDisplay = document.getElementById('scoreboard');
const gameWorld = document.getElementById('gameWorld');

// Dölj scrollbars
document.body.style.overflow = 'hidden';

// Startposition för skeppet
let shipX = 990;
let shipY = 890;

// Maxfart per frame
const baseSpeed = 10;
// Aktuell fart
let currentSpeed = 0;
// Räknare för acceleration/inbromsning (antal frames)
let accelFrames = 0;

// Vinkel i grader för nosrotation
let angle = 0;

// Poäng och returflagga
let score = 0;
let hasLeftPlanet = false;

// Tangentstatus för A/D
let keys = { a: false, d: false };

// Definiera Asteroid‐klass
class Asteroid {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size   = size;                                          // 1=små,2=medel,3=stor
    this.radius = size === 3 ? 40 
               : size === 2 ? 25 
               : 15;
    this.mass   = size === 3 ? 4 
               : size === 2 ? 2 
               : 1;
    this.vx = 0;
    this.vy = 0;
  }
}

// Lista med alla asteroider
let asteroids = [
  new Asteroid(800, 950, 3)    // Exempel: en stor asteroid
  // Lägg till fler vid behov
];

// Fragmenteringsfunktion
function fragmentAsteroid(ast) {
  const fragments = [];
  if (ast.size === 3) {
    fragments.push(new Asteroid(ast.x, ast.y, 2));
    fragments.push(new Asteroid(ast.x, ast.y, 1));
    fragments.push(new Asteroid(ast.x, ast.y, 1));
  } else if (ast.size === 2) {
    fragments.push(new Asteroid(ast.x, ast.y, 1));
    fragments.push(new Asteroid(ast.x, ast.y, 1));
  }
  // Ge varje fragment en slumpmässig utkastningsvektor
  for (let f of fragments) {
    const dir   = Math.random() * 2 * Math.PI;
    const speed = 2 + Math.random() * 2;  // slumpmässig hastighet
    f.vx = Math.cos(dir) * speed;
    f.vy = Math.sin(dir) * speed;
  }
  return fragments;
}

// Elastisk 2D‑kollision mellan två asteroider
function collide(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist >= a.radius + b.radius) return false;

  // Normaliserad kollisionsriktning
  const nx = dx / dist;
  const ny = dy / dist;
  // Relativ hastighet längs normalkomponenten
  const relVel = (b.vx - a.vx)*nx + (b.vy - a.vy)*ny;
  if (relVel > 0) return false; // de glider isär

  const e = 1; // helt elastisk
  const j = -(1 + e) * relVel / (1/a.mass + 1/b.mass);

  // Applicera impuls
  a.vx -= (j / a.mass) * nx;
  a.vy -= (j / a.mass) * ny;
  b.vx += (j / b.mass) * nx;
  b.vy += (j / b.mass) * ny;

  return true;
}

// W/S för acceleration och inbromsning
document.addEventListener('keydown', e => {
  if (e.key === 'w') {
    accelFrames = 300;   // 5 s @60fps
    e.preventDefault();
  }
  if (e.key === 's') {
    accelFrames = -300;  // bromsa 5 s
    e.preventDefault();
  }
});

// A/D för rotation
document.addEventListener('keydown', e => {
  if (e.key === 'a') { keys.a = true;  e.preventDefault(); }
  if (e.key === 'd') { keys.d = true;  e.preventDefault(); }
});
document.addEventListener('keyup', e => {
  if (e.key === 'a') { keys.a = false; e.preventDefault(); }
  if (e.key === 'd') { keys.d = false; e.preventDefault(); }
});

// Planet‐ och skeppsradier
const planetRadius = 100;
const shipRadius   = 10;
const dockingRadius = planetRadius + shipRadius;

// Huvudloop
function gameLoop() {
  // 1) Accelerera eller bromsa
  if (accelFrames > 0) {
    const delta = (baseSpeed - currentSpeed) / accelFrames;
    currentSpeed += delta;
    accelFrames--;
  } else if (accelFrames < 0) {
    const delta = currentSpeed / (-accelFrames);
    currentSpeed -= delta;
    accelFrames++;
  }

  // 2) Rotation av skeppet
  if (keys.d) {
    angle = (angle + 2) % 360;
  } else if (keys.a) {
    angle = (angle - 2 + 360) % 360;
  }
  ship.style.transform = `rotate(${angle}deg)`;

  // 3) Flytta skeppet framåt i nosens riktning
  const rad  = angle * Math.PI / 180;
  const dx1  = Math.sin(rad) * currentSpeed;
  const dy1  = -Math.cos(rad) * currentSpeed;
  shipX += dx1;
  shipY += dy1;

  // 4) Flytta alla asteroider
  for (let ast of asteroids) {
    ast.x += ast.vx;
    ast.y += ast.vy;
  }

  // 5) Krockar asteroid–asteroid?
  for (let i = 0; i < asteroids.length; i++) {
    for (let j = i + 1; j < asteroids.length; j++) {
      collide(asteroids[i], asteroids[j]);
    }
  }

  // 6) Kollision skepp–asteroid → fragmentera
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const ast = asteroids[i];
    const dx = ast.x - shipX;
    const dy = ast.y - shipY;
    if (Math.hypot(dx, dy) < ast.radius + shipRadius) {
      const frags = fragmentAsteroid(ast);
      asteroids.splice(i, 1);
      asteroids.push(...frags);
      score += ast.size * 25;
      scoreDisplay.textContent = `Poäng: ${score}`;
    }
  }

  // 7) Kollision skepp–planet & poäng (oförändrad)
  const cx = shipX + shipRadius;
  const cy = shipY + shipRadius;
  const dxp = cx - 1000, dyp = cy - 1000;
  const distp = Math.hypot(dxp, dyp);
  if (distp < dockingRadius) {
    if (distp > 0) {
      const angRad = Math.atan2(dyp, dxp);
      shipX = 1000 + Math.cos(angRad) * dockingRadius - shipRadius;
      shipY = 1000 + Math.sin(angRad) * dockingRadius - shipRadius;
    }
    if (hasLeftPlanet) {
      // poängen redan uppdaterad vid fragmentering
      hasLeftPlanet = false;
    }
  } else {
    hasLeftPlanet = true;
  }

  // 8) Uppdatera visuellt skepp
  ship.style.left = shipX + 'px';
  ship.style.top  = shipY + 'px';

  // 9) Kamera – centrera skeppet
  const offsetX = window.innerWidth  / 2 - shipX;
  const offsetY = window.innerHeight / 2 - shipY;
  gameWorld.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

  requestAnimationFrame(gameLoop);
}

// Starta loopen
gameLoop();
