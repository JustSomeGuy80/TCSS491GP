/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./engine/scenemanager")} */
/** @typedef {import("./components/ColliderRect")} */
/** @typedef {import("./components/position")} */
/** @typedef {import("./player")} */
{
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

        const sceneManager = new SceneManager(gameEngine, ASSET_MANAGER);
        gameEngine.addEntity(sceneManager);
        // gameEngine.addEntity(new Player(gameEngine, ASSET_MANAGER));

        gameEngine.init(ctx);

        gameEngine.start();
});
}