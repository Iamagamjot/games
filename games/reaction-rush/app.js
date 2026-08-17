const arena = document.getElementById("arena");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const bestTimeEl = document.getElementById("bestTime");
const lastTimeEl = document.getElementById("lastTime");

let timeoutId = null;
let startTime = null;
let waitingForGo = false;
let gameActive = false;
let bestTime = Number(localStorage.getItem("reaction-rush:best")) || null;

function setStatus(text, state) {
  message.textContent = text;
  arena.className = `arena ${state}`;
}

function renderStats(lastTime) {
  bestTimeEl.textContent = bestTime ? `${bestTime} ms` : "--";
  lastTimeEl.textContent = lastTime ? `${lastTime} ms` : "--";
}

function resetRound(preserveMessage = false) {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  waitingForGo = false;
  gameActive = false;
  startTime = null;

  if (!preserveMessage) {
    setStatus("Press Start to begin", "waiting");
  }
}

function startRound() {
  resetRound(true);
  gameActive = true;
  setStatus("Get ready...", "waiting");

  timeoutId = window.setTimeout(() => {
    waitingForGo = true;
    startTime = performance.now();
    setStatus("CLICK NOW!", "go");
  }, 1000 + Math.random() * 2500);
}

function handleReaction() {
  if (!gameActive) {
    return;
  }

  if (!waitingForGo) {
    setStatus("Too soon! Try again.", "waiting");
    resetRound(true);
    return;
  }

  const elapsed = Math.round(performance.now() - startTime);
  const previousBest = bestTime;
  lastTimeEl.textContent = `${elapsed} ms`;

  if (bestTime === null || elapsed < bestTime) {
    bestTime = elapsed;
    localStorage.setItem("reaction-rush:best", String(bestTime));
  }

  renderStats(elapsed);
  setStatus(previousBest === null || elapsed <= previousBest ? "New best time!" : "Nice reflexes!", "waiting");
  resetRound(true);
}

startBtn.addEventListener("click", startRound);
resetBtn.addEventListener("click", () => {
  bestTime = null;
  localStorage.removeItem("reaction-rush:best");
  renderStats(null);
  resetRound();
});

arena.addEventListener("click", handleReaction);
arena.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleReaction();
  }
});

renderStats(null);
resetRound();
