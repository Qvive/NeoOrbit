// ===================================
// NeoOrbit – script.js
// Version: 0.003 (med kamera)
// ===================================

// Hämta HTML-element
const ship = document.getElementById('ship');
const planet = document.getElementById('planet');
const scoreDisplay = document.getElementById('scoreboard');
const gameWorld = document.getElementById('gameWorld');

// Startposition och riktning (uppåt = -90 grader)
let shipX = 990;
let shipY = 890;
let angle = -Math.PI / 2;
let velocityX = 0;
let velocityY = 0;

// Poängsystem
let score = 0;
let hasLeftPlanet = false;

// Tangentstatus
let keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

document.addEventListener('keydown', e => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});
document.addEventListener('keyup', e => {
  if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

function gameLoop() {
  // Rotation medsols/motsols
  if (keys.a) angle -= 0.05;
  if (keys.d) angle += 0.05;

  // Acceleration i nosens riktning
  if (keys.w) {
    velocityX = Math.cos(angle) * 2;
    velocityY = Math.sin(angle) * 2;
  }

  // Friktion – trögheten minskas
  velocityX *= 0.9;
  velocityY *= 0.9;

  // Uppdatera position
  shipX += velocityX;
  shipY += velocityY;

  // Flytta skeppet visuellt
  ship.style.left = shipX + 'px';
  ship.style.top = shipY + 'px';
  ship.style.transform = `rotate(${angle}rad)`;

  // Kamera: centrera spelet kring skeppet
  const offsetX = window.innerWidth  / 2 - shipX;
  const offsetY = window.innerHeight / 2 - shipY;
  gameWorld.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

  // Beräkna avstånd till planetens mitt
  const dx = shipX - 1000;
  const dy = shipY - 1000;
  const distance = Math.hypot(dx, dy);

  // Poänglogik
  if (distance < 100) {
    if (hasLeftPlanet) {
      score++;
      scoreDisplay.textContent = `Poäng: ${score}`;
      hasLeftPlanet = false;
    }
  } else {
    hasLeftPlanet = true;
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
