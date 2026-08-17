# Games Collection

This repository is now structured to support multiple games cleanly in one place.

## Folder structure

```text
games/
├── apps/
│   ├── dashboard/          # Launcher/home UI for all games
│   └── packing-list/       # Packing list utility app
├── games/
│   ├── ping-pong/          # Ping Pong game
│   └── stacking-lab/       # Stacking Lab game
└── index.html              # Quick entry point -> dashboard
```

## Run locally

- Open [index.html](/Users/agamjotsingh/Documents/workspace/games/index.html) to launch the dashboard.
- Or open [apps/dashboard/index.html](/Users/agamjotsingh/Documents/workspace/games/apps/dashboard/index.html) directly.

## Adding a new game

1. Create a folder under [games/](/Users/agamjotsingh/Documents/workspace/games/games) (example: `games/space-runner`).
2. Add `index.html`, `styles.css`, and `app.js` inside that folder.
3. Add the game card/link in [apps/dashboard/index.html](/Users/agamjotsingh/Documents/workspace/games/apps/dashboard/index.html).
