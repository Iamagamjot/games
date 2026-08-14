const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = { x: 150, y: canvas.height / 2, radius: 35, color: "red", score: 0 };
const ai = { x: canvas.width - 150, y: canvas.height / 2, radius: 35, color: "blue", score: 0 };
const ball = { x: canvas.width / 2, y: canvas.height / 2, size: 20, speedX: 6, speedY: 5 };

// --- Lightweight Web Audio for crowd ambience and hit sounds ---
let audioCtx = null;
let crowdBuffer = null;
let crowdNode = null;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const sampleRate = audioCtx.sampleRate;
  const duration = 3; // seconds
  crowdBuffer = audioCtx.createBuffer(1, sampleRate * duration, sampleRate);
  const data = crowdBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.25; // low-volume noise
  }
}

function startCrowd() {
  if (!audioCtx || crowdNode) return;
  crowdNode = audioCtx.createBufferSource();
  crowdNode.buffer = crowdBuffer;
  crowdNode.loop = true;
  const lowpass = audioCtx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 1200;
  const gain = audioCtx.createGain();
  gain.gain.value = 0.08; // subtle ambience
  crowdNode.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(audioCtx.destination);
  crowdNode.start();
}

function stopCrowd() {
  if (!crowdNode) return;
  try { crowdNode.stop(); } catch (e) {}
  crowdNode.disconnect();
  crowdNode = null;
}

function playHitSound(x) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const pan = audioCtx.createStereoPanner && audioCtx.createStereoPanner();
  const panValue = (x - canvas.width / 2) / (canvas.width / 2);
  if (pan) pan.pan.value = Math.max(-1, Math.min(1, panValue));
  osc.type = 'square';
  osc.frequency.value = 700 + Math.random() * 400;
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
  if (pan) osc.connect(gain); gain.connect(pan); pan.connect(audioCtx.destination);
  if (!pan) osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.28);
}


const playerScoreEl = document.getElementById("playerScore");
const aiScoreEl = document.getElementById("aiScore");
const winnerDisplay = document.getElementById("winner");

let gameRunning = false;
let gamePaused = false;
let gameOver = false;

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

// Mouse movement for player
canvas.addEventListener("mousemove", (e) => {
  if (!gameRunning || gamePaused) return;
  const rect = canvas.getBoundingClientRect();
  player.x = e.clientX - rect.left;
  player.y = e.clientY - rect.top;
  // Prevent player from crossing half of table
  if (player.x > canvas.width / 2 - 50) player.x = canvas.width / 2 - 50;
  if (player.y < player.radius) player.y = player.radius;
  if (player.y > canvas.height - player.radius) player.y = canvas.height - player.radius;
});

// Draw table
function drawTable() {
  ctx.fillStyle = "#006400";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 10);
  ctx.lineTo(canvas.width / 2, canvas.height - 10);
  ctx.stroke();
}

// Draw bat
function drawBat(x, y, radius, color) {
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(x - 5, y + radius, 10, 30);
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

// Draw ball
function drawBall(x, y, size) {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fillStyle = "#ff0000";
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speedX = -ball.speedX;
  ball.speedY = 5 * (Math.random() > 0.5 ? 1 : -1);
}

function update() {
  if (!gameRunning || gamePaused || gameOver) return;

  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // AI follows ball
  if (ball.y > ai.y) ai.y += 5;
  else ai.y -= 5;

  if (ball.y <= 15 || ball.y >= canvas.height - 15) {
    ball.speedY = -ball.speedY;
  }

  // Player collision
  const dxP = ball.x - player.x;
  const dyP = ball.y - player.y;
  const distP = Math.sqrt(dxP * dxP + dyP * dyP);
  if (distP < player.radius + ball.size) {
    ball.speedX = Math.abs(ball.speedX);
    ball.speedY = dyP * 0.3;
    try { playHitSound(ball.x); } catch (e) {}
  }

  // AI collision
  const dxA = ball.x - ai.x;
  const dyA = ball.y - ai.y;
  const distA = Math.sqrt(dxA * dxA + dyA * dyA);
  if (distA < ai.radius + ball.size) {
    ball.speedX = -Math.abs(ball.speedX);
    ball.speedY = dyA * 0.3;
    try { playHitSound(ball.x); } catch (e) {}
  }

  // Score
  if (ball.x < 0) {
    ai.score++;
    resetBall();
  } else if (ball.x > canvas.width) {
    player.score++;
    resetBall();
  }

  if (player.score >= 3 || ai.score >= 3) {
    gameOver = true;
    gameRunning = false;
    winnerDisplay.style.display = "block";
    winnerDisplay.textContent =
      player.score > ai.score ? "🎉 YOU WIN!" : "💀 AI WINS!";
  }

  playerScoreEl.textContent = player.score;
  aiScoreEl.textContent = ai.score;
}

function draw() {
  drawTable();
  drawBat(player.x, player.y, player.radius, player.color);
  drawBat(ai.x, ai.y, ai.radius, ai.color);
  drawBall(ball.x, ball.y, ball.size);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();

// Buttons
startBtn.addEventListener("click", () => {
  if (!gameOver) {
    // Allow audio to start after a user gesture
    try {
      initAudio();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      startCrowd();
    } catch (e) {}
    gameRunning = true;
    gamePaused = false;
    winnerDisplay.style.display = "none";
  }
});

pauseBtn.addEventListener("click", () => {
  if (!gameRunning) return;
  gamePaused = !gamePaused;
  pauseBtn.textContent = gamePaused ? "Resume" : "Pause";
});

restartBtn.addEventListener("click", () => {
  player.score = 0;
  ai.score = 0;
  resetBall();
  gameOver = false;
  gameRunning = true;
  gamePaused = false;
  pauseBtn.textContent = "Pause";
  winnerDisplay.style.display = "none";
  playerScoreEl.textContent = 0;
  aiScoreEl.textContent = 0;
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    startCrowd();
  } catch (e) {}
});
