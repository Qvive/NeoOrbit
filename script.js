const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- Skeppets bild ---
const shipImg = new Image();
shipImg.src = 'assets/spaceship.png';

// --- Skeppets position och riktning ---
let ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  angle: 0,
  speed: 0,
  maxSpeed: 6,
  acceleration: 0.04,
  deceleration: 0.04,
  width: 20,
  height: 40,
  vx: 0,
  vy: 0
};

// --- Tangentbordsinput ---
let keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (keys.hasOwnProperty(key)) keys[key] = true;
});

document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (keys.hasOwnProperty(key)) keys[key] = false;
});

// --- Planeten ---
const planet = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 100
};

// --- Asteroider (exempel: en norr om planeten) ---
let asteroids = [
  {
    x: planet.x,
    y: planet.y - 100,
    radius: 40,
    vx: 0,
    vy: 0
  }
];

// --- Gravitation ---
function applyGravity() {
  const allObjects = [planet, ...asteroids];
  allObjects.forEach(obj => {
    const dx = obj.x - ship.x;
    const dy = obj.y - ship.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);
    const force = 2000 / distSq; // Justerbar konstant
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    ship.vx += fx;
    ship.vy += fy;
  });
}

// --- Spelloopen ---
function update() {
  // Rotation
  if (keys.a) ship.angle -= 0.05;
  if (keys.d) ship.angle += 0.05;

  // Acceleration (W)
  if (keys.w) {
    if (ship.speed < ship.maxSpeed) {
      ship.speed += ship.acceleration;
    }
  }

  // Broms (S)
  if (keys.s) {
    if (ship.speed > 0) {
      ship.speed -= ship.deceleration;
      if (ship.speed < 0) ship.speed = 0;
    }
  }

  // Räkna ut rörelse
  const ax = Math.sin(ship.angle) * ship.speed;
  const ay = -Math.cos(ship.angle) * ship.speed;

  ship.vx += ax;
  ship.vy += ay;

  applyGravity();

  ship.x += ship.vx;
  ship.y += ship.vy;

  draw();
  requestAnimationFrame(update);
}

// --- Rita ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Planeten
  ctx.beginPath();
  ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#aaa";
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = "lightblue";
  ctx.stroke();

  // Asteroider
  asteroids.forEach(asteroid => {
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#888";
    ctx.fill();
  });

  // Skeppet
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  ctx.drawImage(shipImg, -ship.width / 2, -ship.height / 2, ship.width, ship.height);
  ctx.restore();
}

// --- Starta ---
shipImg.onload = () => {
  update();
};
