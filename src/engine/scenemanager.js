/** @typedef {import("../obstacle")} */
/** @typedef {import("../player")} */
/** @typedef {import("./slasher")} */
/** @typedef {import("./assetmanager")} */
/** @typedef {import("./gameengine")} */

class SceneManager {
    constructor(game, assetManager) {
        this.game = game;
        this.assetManager = assetManager;
        this.game.camera = this;
        this.x = 0;
        this.y = 0;

        // map dimensions
        this.mapWidth = Infinity;
        this.mapHeight = Infinity;

        // EDIT WHEN YOU CHANGE CANVAS SIZE OR FIND AUTOMATIC WAY
        const CANVAS_WIDTH = 1024;

        // camera bounds
        this.cameraBoundLeft = CANVAS_WIDTH / 2 - 25;
        this.cameraBoundRight = CANVAS_WIDTH / 2 + 25;
        this.cameraBoundTop = 400;
        this.cameraBoundBottom = 450;
        this.scrollSpeed = 350;

        // Editor mode properties
        this.isEditMode = false;
        this.selectedTool = "platform";
        this.selectedSize = { width: 100, height: 20 };
        this.deleteMode = false;
        this.undoStack = [];
        this.showGrid = true;
        this.gridSize = 16;

        // testing (delete later)
        this.debug = false;

        this.loadLevel();

        this.sprite = new Sprite(new Position(0, 0), this.game, 3, 0, 0, {
            new: new Animator(assetManager.getAsset("images/bg.png"), 0, 0, 1024, 768, 1, 1),
        });
    }

    loadLevel() {
        this.player = new Player(this.game, this.assetManager);
        this.game.addEntity(this.player);
        this.createTestLevel();
    }

    createTestLevel() {
        const tiles = MapExport.TEST_STAGE.tiles;
        MapExport.TEST_STAGE.init(this.game);

        this.player.map = MapExport.TEST_STAGE;

        // this.game.addEntity(MapExport.TEST_STAGE);

        for (let xIndex = 0; xIndex < tiles.length; xIndex++) {
            for (let yIndex = 0; yIndex < tiles[0].length; yIndex++) {
                const tile = tiles[xIndex][yIndex];
                const x = xIndex * Tile.SIZE;
                const y = yIndex * Tile.SIZE;

                switch (tile) {
                    case Tile.PLAYER:
                        const saveState = PlayerSaveState.load();
                        if (saveState !== undefined) {
                            this.player.load(saveState);
                            const { x, y } = this.player.position;
                            this.x = x - 1024 / 2;
                            this.y = y - 768 / 2;
                        } else {
                            this.player.position.x = x;
                            this.player.position.y = y;
                            this.x = x - 1024 / 2;
                            this.y = y - 768 / 2;
                        }
                        break;
                    case Tile.SLASHER:
                        this.game.addEntity(new Slasher(this.game, this.assetManager, x, y));
                        break;
                    case Tile.SHOOTER:
                        this.game.addEntity(
                            new Shooter(this.game, this.assetManager, x, y, this.player)
                        );
                        break;
                    case Tile.BLOCKER:
                        this.game.addEntity(new Blocker(this.game, this.assetManager, x, y));
                        break;
                    case Tile.SHOOT_PICKUP:
                        this.game.addEntity(
                            new Pickup(this.game, this.assetManager, x, y, "shoot")
                        );
                        break;
                    case Tile.SLASH_PICKUP:
                        this.game.addEntity(
                            new Pickup(this.game, this.assetManager, x, y, "slash")
                        );
                        break;
                    case Tile.TELEPORT_PICKUP:
                        this.game.addEntity(
                            new Pickup(this.game, this.assetManager, x, y, "teleport")
                        );
                        break;
                    case Tile.HEALTH_PICKUP:
                        this.game.addEntity(
                            new Pickup(this.game, this.assetManager, x, y, "health")
                        );
                        break;
                    case Tile.END_PICKUP:
                        this.game.addEntity(
                            new Pickup(this.game, this.assetManager, x, y, "ending")
                        );
                        break;
                }
            }
        }
    }

    update() {
        this.updateCamera();
        this.updateAudio();
    }

    updateCamera() {
        // only moves camera when player moves past bounds
        if (this.player.position.x - this.x > this.cameraBoundRight) {
            // Adjust camera steadily to the right if the player is past the right bound
            this.x += (this.player.velocity.x + this.scrollSpeed) * this.game.clockTick;

            // Fix camera jitter by hard locking the camera to the player if they are close to the bound
            if (this.player.position.x - this.cameraBoundRight - this.x < 5) {
                this.x = this.player.position.x - this.cameraBoundRight;
            }
        } else if (this.player.position.x - this.x < this.cameraBoundLeft) {
            // Adjust camera steadily to the left if the player is past the left bound
            this.x += (this.player.velocity.x - this.scrollSpeed) * this.game.clockTick;

            // Fix camera jitter by hard locking the camera to the player if they are close to the bound
            if (this.x - (this.player.position.x - this.cameraBoundLeft) < 5) {
                this.x = this.player.position.x - this.cameraBoundLeft;
            }
        }

        if (this.player.position.y - this.y > this.cameraBoundBottom) {
            // Adjust camera steadily to the bottom if the player is past the bottom bound
            this.y += (this.player.velocity.y + this.scrollSpeed) * this.game.clockTick;

            // Fix camera jitter by hard locking the camera to the player if they are close to the bound
            if (this.player.position.y - this.cameraBoundBottom - this.y < 5) {
                this.y = this.player.position.y - this.cameraBoundBottom;
            }
        } else if (this.player.position.y - this.y < this.cameraBoundTop) {
            // Adjust camera steadily to the top if the player is past the top bound
            this.y += (this.player.velocity.y - this.scrollSpeed) * this.game.clockTick;

            // Fix camera jitter by hard locking the camera to the player if they are close to the bound
            if (this.y - (this.player.position.y - this.cameraBoundTop) < 5) {
                this.y = this.player.position.y - this.cameraBoundTop;
            }
        }

        // camera bounds
        if (this.x < 0) this.x = 0;
        if (this.x > this.mapWidth - this.game.ctx.canvas.width) {
            this.x = this.mapWidth - this.game.ctx.canvas.width;
        }

        if (this.y < 0) this.y = 0;
        if (this.y > this.mapHeight - this.game.ctx.canvas.height) {
            this.y = this.mapHeight - this.game.ctx.canvas.height;
        }
    }

    updateAudio() {
        let mute = document.getElementById("mute").checked;
        let volume = document.getElementById("volume").value;
        this.assetManager.muteAudio(mute);
        this.assetManager.adjustVolume(volume);
    }

    draw(ctx) {
        this.sprite.drawSprite(this.game.clockTick, ctx, 0);
        if (this.debug) {
            this.drawDebugInfo(ctx);
        }
        if (this.isEditMode) {
            if (this.showGrid) {
                this.drawGrid(ctx);
            }
            this.drawEditorOverlay(ctx);
        }
    }

    drawDebugInfo(ctx) {
        ctx.save();
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";

        ctx.fillText(`Camera: ${Math.floor(this.x)}, ${Math.floor(this.y)}`, 10, 20);
        ctx.fillText(
            `Player: ${Math.floor(this.player.position.x)}, ${Math.floor(this.player.position.y)}`,
            10,
            40
        );
        ctx.fillText(
            `Velocity: ${Math.floor(this.player.velocity.x)}, ${Math.floor(
                this.player.velocity.y
            )}`,
            10,
            60
        );
        if (this.game.mouse != null)
            ctx.fillText(`Mouse: ${this.game.mouse.x}, ${this.game.mouse.y}`, 10, 80);
        ctx.fillText(
            `ScreenPos: ${Math.floor(this.player.position.x) - Math.floor(this.x)}, ${
                Math.floor(this.player.position.y) - Math.floor(this.y)
            }`,
            10,
            100
        );

        const boundLeft = this.cameraBoundLeft;
        const boundRight = this.cameraBoundRight;

        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(boundLeft, 0);
        ctx.lineTo(boundLeft, ctx.canvas.height);
        ctx.moveTo(boundRight, 0);
        ctx.lineTo(boundRight, ctx.canvas.height);
        ctx.stroke();

        ctx.restore();
    }
}
