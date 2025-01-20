const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./anims/jump.png");
ASSET_MANAGER.queueDownload("./anims/idle.png");
ASSET_MANAGER.queueDownload("./anims/run.png");

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;

	const sceneManager = new SceneManager(gameEngine);
	gameEngine.addEntity(sceneManager);

	gameEngine.init(ctx);
	gameEngine.start();
});
