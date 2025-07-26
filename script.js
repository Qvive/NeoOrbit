// Hämta HTML‑element
const ship = document.getElementById('ship');
const planet = document.getElementById('planet');
const scoreDisplay = document.getElementById('scoreboard');
const gameWorld = document.getElementById('gameWorld');

// Dölj sidans scrollbars
document.body.style.overflow = 'hidden';

// Skeppets position i världen (start)
// Starta skeppet på toppen av planeten: planetens mitt är (1000,1000)
// Planeten har radien 100 px och skeppet är 20 px, så skeppets topp‑vänstra hörn
// ska vara (1000 - 10, 1000 - 100 - 10) = (990, 890)
let shipX = 990;
let shipY = 890;

// Hastighet i px per tangenttryckning
const speed = 5;

// Poäng
let score = 0;

// Håller koll på om skeppet lämnat planeten
let hasLeftPlanet = false;

// Tangentstatus – vilka tangenter är nedtryckta?
let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

// Lyssnar på nedtryckningar för piltangenter
document.addEventListener('keydown', e => {
  if (keys.hasOwnProperty(e.key)) {
    e.preventDefault();
    keys[e.key] = true;
  }
});

// Lyssnar på att tangenter släpps för piltangenter
document.addEventListener('keyup', e => {
  if (keys.hasOwnProperty(e.key)) {
    e.preventDefault();
    keys[e.key] = false;
  }
});

// WASD‑kontroller – fungerar med både små och stora bokstäver
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'w') { keys.ArrowUp    = true;  e.preventDefault(); }
  if (k === 's') { keys.ArrowDown  = true;  e.preventDefault(); }
  if (k === 'a') { keys.ArrowLeft  = true;  e.preventDefault(); }
  if (k === 'd') { keys.ArrowRight = true;  e.preventDefault(); }
});

document.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (k === 'w') { keys.ArrowUp    = false; e.preventDefault(); }
  if (k === 's') { keys.ArrowDown  = false; e.preventDefault(); }
  if (k === 'a') { keys.ArrowLeft  = false; e.preventDefault(); }
  if (k === 'd') { keys.ArrowRight = false; e.preventDefault(); }
});

// Spelloopen – körs 60 gånger per sekund
function gameLoop() {
  // Flytta skeppet om tangenter är nedtryckta
  if (keys.ArrowUp)    shipY -= speed;
  if (keys.ArrowDown)  shipY += speed;
  if (keys.ArrowLeft)  shipX -= speed;
  if (keys.ArrowRight) shipX += speed;

  // Uppdatera skeppets position visuellt
  ship.style.left = shipX + 'px';
  ship.style.top  = shipY + 'px';

  // Flytta spelvärlden så att skeppet hålls centrerat i fönstret
  const offsetX = window.innerWidth  / 2 - shipX;
  const offsetY = window.innerHeight / 2 - shipY;
  gameWorld.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

  // Beräkna avstånd till planetens mitt
  const planetCenterX = 1000;
  const planetCenterY = 1000;
  const dx = shipX - planetCenterX;
  const dy = shipY - planetCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Om skeppet är inne i planetens radie
  if (distance < 100) {
    if (hasLeftPlanet) {
      // Spelaren har varit borta och återvänt = ge poäng
      score++;
      scoreDisplay.textContent = `Poäng: ${score}`;
      hasLeftPlanet = false;
    }
  } else {
    hasLeftPlanet = true;
  }

  // Fortsätt köra loopen
  requestAnimationFrame(gameLoop);
}

// Starta spelet
gameLoop();
