// Hämta HTML‑element
const ship = document.getElementById('ship');
const planet = document.getElementById('planet');
const scoreDisplay = document.getElementById('scoreboard');
const gameWorld = document.getElementById('gameWorld');

// Dölj sidans scrollbars
document.body.style.overflow = 'hidden';

// Skeppets position i världen (start)
// Planeten har radien 100 px, skeppet är 20 px → skeppets topp‑vänstra hörn: (990, 890)
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

// Konstanter för planetens radie och skeppets radie
const planetRadius = 100;
const shipRadius   = 10;
const dockingRadius = planetRadius + shipRadius; // 110 px

// Spelloopen – körs 60 gånger per sekund
function gameLoop() {
  // Flytta skeppet om tangenter är nedtryckta
  if (keys.ArrowUp)    shipY -= speed;
  if (keys.ArrowDown)  shipY += speed;
  if (keys.ArrowLeft)  shipX -= speed;
  if (keys.ArrowRight) shipX += speed;

  // Beräkna skeppets centrum
  const shipCenterX = shipX + shipRadius;
  const shipCenterY = shipY + shipRadius;

  // Avstånd till planetens centrum (1000, 1000)
  const dx = shipCenterX - 1000;
  const dy = shipCenterY - 1000;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Om skeppets centrum är innanför dockingradien: flytta ut skeppet och docka
  if (dist < dockingRadius) {
    if (dist > 0) {
      const angle = Math.atan2(dy, dx);
      const newCenterX = 1000 + Math.cos(angle) * dockingRadius;
      const newCenterY = 1000 + Math.sin(angle) * dockingRadius;
      shipX = newCenterX - shipRadius;
      shipY = newCenterY - shipRadius;
    }
    // ge poäng om vi varit ute och nu dockar
    if (hasLeftPlanet) {
      score++;
      scoreDisplay.textContent = `Poäng: ${score}`;
      hasLeftPlanet = false;
    }
  } else {
    // vi är utanför dockingradien
    hasLeftPlanet = true;
  }

  // Uppdatera skeppets position visuellt
  ship.style.left = shipX + 'px';
  ship.style.top  = shipY + 'px';

  // Flytta spelvärlden så att skeppet hålls centrerat i fönstret
  const offsetX = window.innerWidth  / 2 - shipX;
  const offsetY = window.innerHeight / 2 - shipY;
  gameWorld.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

  // Fortsätt köra loopen
  requestAnimationFrame(gameLoop);
}

// Starta spelet
gameLoop();
