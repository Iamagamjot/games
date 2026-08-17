const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const W = canvas.width, H = canvas.height;

let player = {x: W/2 - 20, y: H-60, w:40, h:20, speed:5};
let keys = {};
let asteroids = [];
let spawnTimer = 0;
let spawnRate = 60; // frames
let score = 0;
let gameOver = false;

function reset(){
  player.x = W/2 - player.w/2;
  asteroids = [];
  spawnTimer = 0;
  spawnRate = 60;
  score = 0;
  gameOver = false;
}

function spawn(){
  const size = 12 + Math.random()*28;
  const x = Math.random()*(W-size);
  const speed = 1.5 + Math.random()*2.5 + score/500;
  asteroids.push({x, y:-size, r:size/2, speed});
}

function update(){
  if(gameOver) return;
  // movement
  if(keys.ArrowLeft || keys.a) player.x -= player.speed;
  if(keys.ArrowRight || keys.d) player.x += player.speed;
  player.x = Math.max(0, Math.min(W-player.w, player.x));

  // spawn
  spawnTimer++;
  if(spawnTimer >= spawnRate){
    spawnTimer = 0;
    spawn();
    if(spawnRate > 20) spawnRate -= 0.5; // ramp difficulty
  }

  // update asteroids
  for(let i=asteroids.length-1;i>=0;i--){
    let a = asteroids[i];
    a.y += a.speed;
    // collision
    const px = player.x + player.w/2;
    const py = player.y + player.h/2;
    const dx = px - (a.x + a.r);
    const dy = py - (a.y + a.r);
    const dist = Math.sqrt(dx*dx + dy*dy);
    if(dist < a.r + Math.max(player.w, player.h)/2){
      gameOver = true;
    }
    // remove offscreen
    if(a.y - a.r > H) asteroids.splice(i,1);
  }

  score++;
  scoreEl.textContent = Math.floor(score/10);
}

function draw(){
  // clear
  ctx.clearRect(0,0,W,H);
  // stars background
  for(let i=0;i<80;i++){
    ctx.fillStyle = (i%10===0)?'#66d2ff':'#4aa7ff';
    ctx.fillRect((i*37)%W, (i*53)%H, 1,1);
  }
  // player
  ctx.fillStyle = '#9fe6ff';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  // thruster
  ctx.fillStyle = '#ffaa33';
  ctx.fillRect(player.x + player.w/2 - 4, player.y + player.h, 8, 6);
  // asteroids
  for(let a of asteroids){
    const g = ctx.createRadialGradient(a.x+a.r*0.5, a.y+a.r*0.5, a.r*0.1, a.x+a.r*0.5, a.y+a.r*0.5, a.r);
    g.addColorStop(0,'#d3c6b1');
    g.addColorStop(1,'#5a4636');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(a.x + a.r, a.y + a.r, a.r, 0, Math.PI*2);
    ctx.fill();
  }

  if(gameOver){
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, H/2 - 60, W, 120);
    ctx.fillStyle = '#fff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', W/2, H/2 - 6);
    ctx.font = '16px sans-serif';
    ctx.fillText('Press Space to restart', W/2, H/2 + 20);
  }
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', e=>{
  keys[e.key] = true;
  if(gameOver && e.code === 'Space') reset();
});
window.addEventListener('keyup', e=>{ keys[e.key] = false; });

reset();
loop();
