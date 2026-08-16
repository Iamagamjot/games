const games = [
  {
    name: "Ping Pong",
    description: "Classic player vs AI arcade game.",
    href: "../../games/ping-pong/index.html"
  },
  {
    name: "Stacking Lab",
    description: "Drag, drop, and stack all blocks on the tower.",
    href: "../../games/stacking-lab/index.html"
  }
];

const gamesGrid = document.getElementById("gamesGrid");

games.forEach((game) => {
  const card = document.createElement("article");
  card.className = "game-card";
  card.innerHTML = `
    <h2>${game.name}</h2>
    <p>${game.description}</p>
    <a class="play-link" href="${game.href}">Play</a>
  `;
  gamesGrid.appendChild(card);
});
