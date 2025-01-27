/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./engine/scenemanager")} */
/** @typedef {import("./components/ColliderRect")} */
/** @typedef {import("./components/position")} */
/** @typedef {import("./player")} */

function main() {
    const gameEngine = new GameEngine();

    const ASSET_MANAGER = new AssetManager();

    ASSET_MANAGER.queueDownload("anims/jump.png");
    ASSET_MANAGER.queueDownload("anims/idle.png");
    ASSET_MANAGER.queueDownload("anims/run.png");
    ASSET_MANAGER.queueDownload("anims/bwrun.png");
    ASSET_MANAGER.queueDownload("anims/arm.png");
    ASSET_MANAGER.queueDownload("anims/bullet.png");

    ASSET_MANAGER.queueDownload("sounds/music.mp3");

    ASSET_MANAGER.queueDownload("sounds/jump.mp3");

    ASSET_MANAGER.downloadAll(() => {
        /** @type {HTMLCanvasElement} */

        ASSET_MANAGER.autoRepeat("sounds/music.mp3");

        const canvas = document.getElementById("gameWorld");
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        const sceneManager = new SceneManager(gameEngine, ASSET_MANAGER);
        gameEngine.addEntity(sceneManager);
        // gameEngine.addEntity(new Player(gameEngine, ASSET_MANAGER));

        gameEngine.init(ctx);

        gameEngine.start();
    });
}
