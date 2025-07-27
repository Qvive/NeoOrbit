// ———————————————
// 1) Hämta och förbered
// ———————————————
const ship        = document.getElementById('ship');
const planet      = document.getElementById('planet');
const scoreDisplay= document.getElementById('scoreboard');
const gameWorld   = document.getElementById('gameWorld');

// Dölj scrollbars
document.body.style.overflow = 'hidden';

// ———————————————
// 2) Klass- och element‑skapande
// ———————————————
class Asteroid {
  constructor(x, y, size) {
    this.x      = x;
    this.y      = y;
    this.size   = size;                // 1,2 eller 3
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
    this.el.style.width  = this.radius*2 + 'px';
    this.el.style.height = this.radius*2 + 'px';
    this.el.style.left   = (this.x - this.radius) + 'px';
    this.el.style.top    = (this.y - this.radius) + 'px';
    gameWorld.appendChild(this.el);
  }
}

// Lista med asteroider
let asteroids = [
  new Asteroid(800, 950, 3),
  new Asteroid(1200, 1000, 2),
  new Asteroid(1000, 1200, 1),
];

// ———————————————
//   Resterande kontroll‑funktioner
// ———————————————
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
  // ta bort gamla element
  gameWorld.removeChild(ast.el);
  return fragments.map(f => {
    // ge slumpvektor
    const dir   = Math.random() * 2 * Math.PI;
    const speed = 2 + Math.random() * 2;
    f.vx = Math.cos(dir) * speed;
    f.vy = Math.sin(dir) * speed;
    return f;
  });
}

function collide(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist >= a.radius + b.radius) return false;
  const nx = dx/dist, ny = dy/dist;
  const rel = (b.vx-a.vx)*nx + (b.vy-a.vy)*ny;
  if (rel > 0) return false;
  const e=1, j=-(1+e)*rel/(1/a.mass+1/b.mass);
  a.vx -= (j/a.mass)*nx; a.vy -= (j/a.mass)*ny;
  b.vx += (j/b.mass)*nx; b.vy += (j/b.mass)*ny;
  return true;
}

// ———————————————
//   Tangent- och fys‑inställningar
// ———————————————
let shipX=990, shipY=890, currentSpeed=0, accelFrames=0, angle=0;
let score=0, hasLeftPlanet=false;
const baseSpeed=10, planetRadius=100, shipRadius=10;
const dockingRadius=planetRadius+shipRadius;
let keys={a:false,d:false};

document.addEventListener('keydown', e=>{
  if(e.key==='w'){ accelFrames=300; e.preventDefault(); }
  if(e.key==='s'){ accelFrames=-300; e.preventDefault(); }
  if(e.key==='a'){ keys.a=true;  e.preventDefault(); }
  if(e.key==='d'){ keys.d=true;  e.preventDefault(); }
});
document.addEventListener('keyup', e=>{
  if(e.key==='a'){ keys.a=false; e.preventDefault(); }
  if(e.key==='d'){ keys.d=false; e.preventDefault(); }
});

// ———————————————
//      Spelloopen
// ———————————————
function gameLoop(){
  // acc/decel
  if(accelFrames>0){
    const d=(baseSpeed-currentSpeed)/accelFrames;
    currentSpeed+=d; accelFrames--;
  } else if(accelFrames<0){
    const d=currentSpeed/(-accelFrames);
    currentSpeed-=d; accelFrames++;
  }

  // rotation
  if(keys.d)      angle=(angle+2)%360;
  else if(keys.a) angle=(angle-2+360)%360;
  ship.style.transform=`rotate(${angle}deg)`;

  // rörelse
  const rad=angle*Math.PI/180;
  const dx1=Math.sin(rad)*currentSpeed;
  const dy1=-Math.cos(rad)*currentSpeed;
  shipX+=dx1; shipY+=dy1;

  // flytta & kollidera asteroider
  for(let ast of asteroids) {
    ast.x+=ast.vx; ast.y+=ast.vy;
    ast.el.style.left=(ast.x-ast.radius)+'px';
    ast.el.style.top =(ast.y-ast.radius)+'px';
  }
  for(let i=0;i<asteroids.length;i++)
    for(let j=i+1;j<asteroids.length;j++)
      collide(asteroids[i],asteroids[j]);

  // fragmentering
  for(let i=asteroids.length-1;i>=0;i--){
    const ast=asteroids[i], dx=ast.x-shipX, dy=ast.y-shipY;
    if(Math.hypot(dx,dy)<ast.radius+shipRadius){
      const fr=fragmentAsteroid(ast);
      asteroids.splice(i,1);
      asteroids.push(...fr);
      score+=ast.size*25;
      scoreDisplay.textContent=`Poäng: ${score}`;
    }
  }

  // skepp–planet (oförändrad)
  const cx=shipX+shipRadius, cy=shipY+shipRadius;
  const dxp=cx-1000, dyp=cy-1000;
  const distp=Math.hypot(dxp,dyp);
  if(distp<dockingRadius){
    if(distp>0){
      const a2=Math.atan2(dyp,dxp);
      shipX=1000+Math.cos(a2)*dockingRadius-shipRadius;
      shipY=1000+Math.sin(a2)*dockingRadius-shipRadius;
    }
    if(hasLeftPlanet) hasLeftPlanet=false;
  } else hasLeftPlanet=true;

  // uppdatera skepp & kamera
  ship.style.left=shipX+'px';
  ship.style.top =shipY+'px';
  const offX=window.innerWidth/2-shipX;
  const offY=window.innerHeight/2-shipY;
  gameWorld.style.transform=`translate(${offX}px, ${offY}px)`;

  requestAnimationFrame(gameLoop);
}
gameLoop();

