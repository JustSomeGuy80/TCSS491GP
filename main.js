// import GameEngine from "./src/engine/gameengine.js";
// import AssetManager from "./engine/assetmanager.js";
// import Player from "./player.js";
// import ColliderRect from "./components/ColliderRect.js";
// import Position from "./components/position.js";

const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("anims/jump.png");
ASSET_MANAGER.queueDownload("anims/idle.png");
ASSET_MANAGER.queueDownload("anims/run.png");

ASSET_MANAGER.downloadAll(() => {
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    gameEngine.addEntity(new Player(gameEngine, ASSET_MANAGER));
    gameEngine.addEntity(new ColliderRect(new Position(500, 500), 0, 0, 400, 50));
    gameEngine.addEntity(new ColliderRect(new Position(700, 500), 0, 0, 50, 500));

    gameEngine.init(ctx);

    gameEngine.start();
});
