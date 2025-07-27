// Hämta HTML-element
const ship = document.getElementById('ship');
const planet = document.getElementById('planet');
const scoreDisplay = document.getElementById('scoreboard');

// Position och riktning
let shipX = 990;
let shipY = 990;
let angle = 0;
let speed = 0;
let velocityX = 0;
let velocityY = 0;

// Poäng
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
  // Rotation
  if (keys.a) angle -= 0.05;
  if (keys.d) angle += 0.05;

  // Acceleration
  if (keys.w) {
    velocityX += Math.cos(angle) * 0.2;
    velocityY += Math.sin(angle) * 0.2;
  }

  // Bromsa lätt
  velocityX *= 0.99;
  velocityY *= 0.99;

  // Uppdatera position
  shipX += velocityX;
  shipY += velocityY;

  // Flytta skeppet visuellt
  ship.style.left = shipX + 'px';
  ship.style.top = shipY + 'px';
  ship.style.transform = `rotate(${angle}rad)`;

  // Beräkna avstånd till planetens mitt
  const planetCenterX = 1000;
  const planetCenterY = 1000;
  const dx = shipX - planetCenterX;
  const dy = shipY - planetCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

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
