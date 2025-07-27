// Hämta HTML‑element
const ship         = document.getElementById('ship');
const planet       = document.getElementById('planet');
const scoreDisplay = document.getElementById('scoreboard');
const gameWorld    = document.getElementById('gameWorld');

// Dölj scrollbars
document.body.style.overflow = 'hidden';

// Startposition för skeppet
let shipX = 990;
let shipY = 890;

// Maxfart per frame (sänkt)
const baseSpeed = 5;  // tidigare 10

// Aktuell fart
let currentSpeed = 0;
// Räknare för acceleration/inbromsning
let accelFrames = 0;

// Vinkel i grader för nosrotation
let angle = 0;

// Poäng och returflagga
let score         = 0;
let hasLeftPlanet = false;

// Tangentstatus för A/D
let keys = { a: false, d: false };

// ———————— Asteroid‑klass ————————
class Asteroid {
  constructor(x, y, size) {
    this.x      = x;
    this.y      = y;
    this.size   = size;                // 1=små,2=medel,3=stor
    this.radius = size === 3 ? 40 
               : size === 2 ? 25 
               : 15;
    this.mass   = size === 3 ? 4 
               : size === 2 ? 2 
               : 1;
    this.vx = 0;
    this.vy = 0;

    // Skapa DOM‑element
    this.el = document.createElement('div');
    this.el.className = 'asteroid';
    this.el.style.width  = this.radius * 2 + 'px';
    this.el.style.height = this.radius * 2 + 'px';
    this.el.style.left   = (this.x - this.radius) + 'px';
    this.el.style.top    = (this.y - this.radius) + 'px';
    gameWorld.appendChild(this.el);
  }
}

// ———————— Initiera asteroider ————————
let asteroids = [
  new Asteroid(800, 950, 3),    // Stor
  new Asteroid(1200, 1000, 2),  // Medel
  new Asteroid(1000, 1200, 1),  // Liten
  new Asteroid(1000, 900, 3)    // Stor, 100px norr om planetcentr
];

// ———————— Fragmenteringsfunktion ————————
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
  // Ta bort krossad asteroid
  gameWorld.removeChild(ast.el);

  // Ge varje fragment en slumpmässig utkastningsvektor
  for (let f of fragments) {
    const dir   = Math.random() * 2 * Math.PI;
    const speed = 2 + Math.random() * 2;  // 2–4 px/frame
    f.vx = Math.cos(dir) * speed;
    f.vy = Math.sin(dir) * speed;
  }
  return fragments;
}

// ———————— Elastisk kollision mellan asteroider ————————
function collide(a, b) {
  const dx   = b.x - a.x;
  const dy   = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist >= a.radius + b.radius) return false;

  // Normaliserad kollisionsriktning
  const nx = dx / dist;
  const ny = dy / dist;
  // Relativ hastighet längs normal
  const relVel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (relVel > 0) return false; // glider isär

  // Impuls (elastisk kollision)
  const e = 1;
  const j = -(1 + e) * relVel / (1/a.mass + 1/b.mass);

  a.vx -= (j / a.mass) * nx;
  a.vy -= (j / a.mass) * ny;
  b.vx += (j / b.mass) * nx;
  b.vy += (j / b.mass) * ny;

  return true;
}

// ———————— Tangent­hantering ————————
document.addEventListener('keydown', e => {
  if (e.key === 'w') {
    accelFrames = 300;   // 5 s @60fps
    e.preventDefault();
  }
  if (e.key === 's') {
    accelFrames = -300;  // bromsa över 5 s
    e.preventDefault();
  }
  if (e.key === 'a') {
    keys.a = true; e.preventDefault();
  }
  if (e.key === 'd') {
    keys.d = true; e.preventDefault();
  }
});
document.addEventListener('keyup', e => {
  if (e.key === 'a') {
    keys.a = false; e.preventDefault();
  }
  if (e.key === 'd') {
    keys.d = false; e.preventDefault();
  }
});

// ———————— Planet‐ och skeppsradier ————————
const planetRadius  = 100;
const shipRadius    = 10;
const dockingRadius = planetRadius + shipRadius;

// ———————— Spelloopen ————————
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

  // 2) Rotation A/D
  if (keys.d) {
    angle = (angle + 2) % 360;
  } else if (keys.a) {
    angle = (angle - 2 + 360) % 360;
  }
  ship.style.transform = `rotate(${angle}deg)`;

  // 3) Flytta skeppet i nosens riktning
  const rad = angle * Math.PI / 180;
  shipX += Math.sin(rad) * currentSpeed;
  shipY += -Math.cos(rad) * currentSpeed;

  // 4) Flytta alla asteroider & uppdatera DOM
  for (let ast of asteroids) {
    ast.x += ast.vx;
    ast.y += ast.vy;
    ast.el.style.left = (ast.x - ast.radius) + 'px';
    ast.el.style.top  = (ast.y - ast.radius) + 'px';
  }

  // 5) Asteroid–asteroid kollisioner
  for (let i = 0; i < asteroids.length; i++) {
    for (let j = i + 1; j < asteroids.length; j++) {
      collide(asteroids[i], asteroids[j]);
    }
  }

  // 6) Skepp–asteroid kollision & fragmentering
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const ast = asteroids[i];
    const dx  = ast.x - shipX;
    const dy  = ast.y - shipY;
    if (Math.hypot(dx, dy) < ast.radius + shipRadius) {
      const fr = fragmentAsteroid(ast);
      asteroids.splice(i, 1);
      asteroids.push(...fr);
      score += ast.size * 25;
      scoreDisplay.textContent = `Poäng: ${score}`;
    }
  }

  // 7) Skepp–planet kollision & poäng (oförändrad)
  const cx    = shipX + shipRadius;
  const cy    = shipY + shipRadius;
  const dxp   = cx - 1000;
  const dyp   = cy - 1000;
  const distp = Math.hypot(dxp, dyp);
  if (distp < dockingRadius) {
    if (distp > 0) {
      const ang2 = Math.atan2(dyp, dxp);
      shipX = 1000 + Math.cos(ang2) * dockingRadius - shipRadius;
      shipY = 1000 + Math.sin(ang2) * dockingRadius - shipRadius;
    }
    if (hasLeftPlanet) {
      hasLeftPlanet = false;
    }
  } else {
    hasLeftPlanet = true;
  }

  // 8) Uppdatera skeppets DOM‑position
  ship.style.left = shipX + 'px';
  ship.style.top  = shipY + 'px';

  // 9) Kamera – centrera skeppet
  const offsetX = window.innerWidth  / 2 - shipX;
  const offsetY = window.innerHeight / 2 - shipY;
  gameWorld.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

  requestAnimationFrame(gameLoop);
}

// Starta spelloopen
gameLoop();
