/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./engine/scenemanager")} */
/** @typedef {import("./components/ColliderRect")} */
/** @typedef {import("./components/position")} */
/** @typedef {import("./player")} */

function main() {
    const gameEngine = new GameEngine();
    window.gameEngine = gameEngine; // Store reference globally

    const ASSET_MANAGER = new AssetManager();
    window.ASSET_MANAGER = ASSET_MANAGER; // Store reference globally
    Tile.AssetManager = ASSET_MANAGER;

    ASSET_MANAGER.queueDownload("anims/jump.png");
    ASSET_MANAGER.queueDownload("anims/idle.png");
    ASSET_MANAGER.queueDownload("anims/run.png");
    ASSET_MANAGER.queueDownload("anims/bwrun.png");
    ASSET_MANAGER.queueDownload("anims/arm.png");
    ASSET_MANAGER.queueDownload("anims/bullet.png");
    ASSET_MANAGER.queueDownload("anims/slash.png");
    ASSET_MANAGER.queueDownload("anims/slashEffect.png");
    ASSET_MANAGER.queueDownload("anims/teleport.png");
    ASSET_MANAGER.queueDownload("anims/teleIndicator.png");
    ASSET_MANAGER.queueDownload("anims/slasher.png");
    ASSET_MANAGER.queueDownload("anims/shooter.png");
    ASSET_MANAGER.queueDownload("anims/block.png");
    ASSET_MANAGER.queueDownload("anims/slasherslash.png");
    ASSET_MANAGER.queueDownload("anims/pickup.png");
    ASSET_MANAGER.queueDownload("anims/enemy_bullet.png");

    ASSET_MANAGER.queueDownload("sounds/music.mp3");
    ASSET_MANAGER.queueDownload("sounds/jump.mp3");
    ASSET_MANAGER.queueDownload("sounds/slashHit.mp3");
    ASSET_MANAGER.queueDownload("sounds/slashReady.mp3");

    ASSET_MANAGER.queueDownload("images/bg.png");

    ASSET_MANAGER.queueDownload("images/dirt.png");
    ASSET_MANAGER.queueDownload("images/dirt_stair_BL.png");
    ASSET_MANAGER.queueDownload("images/dirt_stair_BR.png");
    ASSET_MANAGER.queueDownload("images/dirt_stair_TL.png");
    ASSET_MANAGER.queueDownload("images/dirt_stair_TR.png");

    ASSET_MANAGER.queueDownload("images/brick.png");
    ASSET_MANAGER.queueDownload("images/brick_bg.png");
    ASSET_MANAGER.queueDownload("images/brick_bl.png");
    ASSET_MANAGER.queueDownload("images/brick_br.png");
    ASSET_MANAGER.queueDownload("images/brick_tl.png");
    ASSET_MANAGER.queueDownload("images/brick_tr.png");

    ASSET_MANAGER.downloadAll(() => {
        const canvas = document.getElementById("gameWorld");
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        // Stop any existing music before starting new instance
        ASSET_MANAGER.pauseBackgroundMusic();
        ASSET_MANAGER.autoRepeat("sounds/music.mp3");
        ASSET_MANAGER.playAsset("sounds/music.mp3");

        const sceneManager = new SceneManager(gameEngine, ASSET_MANAGER);
        gameEngine.sceneManager = sceneManager;

        gameEngine.init(ctx);
        gameEngine.start();
    });
}
