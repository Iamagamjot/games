const blockTray = document.getElementById("blockTray");
const towerZone = document.getElementById("towerZone");
const currentStackEl = document.getElementById("currentStack");
const bestStackEl = document.getElementById("bestStack");
const missionTextEl = document.getElementById("missionText");
const resetBtn = document.getElementById("resetBtn");
const shuffleBtn = document.getElementById("shuffleBtn");

const BLOCK_COUNT = 6;
const BLOCK_WIDTH = 74;
const BLOCK_HEIGHT = 52;
const STACK_GAP = 6;
const COLORS = ["#41d0ff", "#ff7de2", "#86ff7f", "#ffe55c", "#ff9567", "#a08bff"];

let blocks = [];
let stackCount = 0;
let bestStack = 0;
let activeDrag = null;

function randomColorSet() {
  return [...COLORS].sort(() => Math.random() - 0.5);
}

function updateHud() {
  currentStackEl.textContent = String(stackCount);
  bestStackEl.textContent = String(bestStack);
  if (stackCount === BLOCK_COUNT) {
    missionTextEl.textContent = "Mission complete! Stellar stack!";
    towerZone.classList.add("celebrate");
  } else {
    missionTextEl.textContent = `Stack all ${BLOCK_COUNT} blocks`;
    towerZone.classList.remove("celebrate");
  }
}

function setBlockPosition(block, x, y) {
  block.style.left = `${x}px`;
  block.style.top = `${y}px`;
}

function getTowerStackPosition(level) {
  const towerRect = towerZone.getBoundingClientRect();
  const trayRect = blockTray.getBoundingClientRect();
  const x = towerRect.left + towerRect.width / 2 - BLOCK_WIDTH / 2 - trayRect.left;
  const y = towerRect.bottom - 42 - (level + 1) * (BLOCK_HEIGHT + STACK_GAP) - trayRect.top;
  return { x, y };
}

function createBlocks() {
  blockTray.innerHTML = "";
  const colors = randomColorSet();
  blocks = [];

  for (let i = 0; i < BLOCK_COUNT; i += 1) {
    const block = document.createElement("div");
    block.className = "block";
    block.style.background = `linear-gradient(145deg, ${colors[i]}, #ffffff33)`;
    block.dataset.locked = "false";
    block.dataset.originX = String(20 + (i % 3) * 110);
    block.dataset.originY = String(20 + Math.floor(i / 3) * 90);
    setBlockPosition(block, Number(block.dataset.originX), Number(block.dataset.originY));
    blockTray.appendChild(block);
    blocks.push(block);
  }
}

function resetGame() {
  stackCount = 0;
  activeDrag = null;
  createBlocks();
  updateHud();
}

function pointerDown(event) {
  const block = event.target.closest(".block");
  if (!block || block.dataset.locked === "true") return;
  const rect = block.getBoundingClientRect();
  activeDrag = {
    block,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  };
  block.setPointerCapture(event.pointerId);
  block.style.zIndex = "20";
}

function pointerMove(event) {
  if (!activeDrag) return;
  const trayRect = blockTray.getBoundingClientRect();
  const x = event.clientX - trayRect.left - activeDrag.offsetX;
  const y = event.clientY - trayRect.top - activeDrag.offsetY;
  setBlockPosition(activeDrag.block, x, y);
}

function lockBlockOnTower(block) {
  const pos = getTowerStackPosition(stackCount);
  setBlockPosition(block, pos.x, pos.y);
  block.classList.add("locked");
  block.dataset.locked = "true";
  block.style.zIndex = String(5 + stackCount);
  stackCount += 1;
  bestStack = Math.max(bestStack, stackCount);
  updateHud();
}

function returnToOrigin(block) {
  setBlockPosition(block, Number(block.dataset.originX), Number(block.dataset.originY));
  block.style.zIndex = "1";
}

function pointerUp(event) {
  if (!activeDrag) return;
  const { block } = activeDrag;
  block.releasePointerCapture(event.pointerId);

  const blockRect = block.getBoundingClientRect();
  const nextPos = getTowerStackPosition(stackCount);
  const trayRect = blockTray.getBoundingClientRect();
  const targetX = trayRect.left + nextPos.x;
  const targetY = trayRect.top + nextPos.y;
  const xDiff = Math.abs(blockRect.left - targetX);
  const yDiff = Math.abs(blockRect.top - targetY);

  if (xDiff < 48 && yDiff < 48 && stackCount < BLOCK_COUNT) {
    lockBlockOnTower(block);
  } else {
    returnToOrigin(block);
  }

  activeDrag = null;
}

resetBtn.addEventListener("click", resetGame);
shuffleBtn.addEventListener("click", resetGame);
blockTray.addEventListener("pointerdown", pointerDown);
blockTray.addEventListener("pointermove", pointerMove);
blockTray.addEventListener("pointerup", pointerUp);
blockTray.addEventListener("pointercancel", pointerUp);

resetGame();
