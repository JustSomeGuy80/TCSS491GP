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
        this.mapWidth = 3000;
        this.mapHeight = 2000;

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
        this.debug = true;

        this.loadLevel();
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

        for (let xIndex = 0; xIndex < tiles.length; xIndex++) {
            for (let yIndex = 0; yIndex < tiles[0].length; yIndex++) {
                const tile = tiles[xIndex][yIndex];
                const x = xIndex * Tile.SIZE;
                const y = yIndex * Tile.SIZE;

                switch (tile) {
                    case Tile.PLAYER:
                        this.player.position.x = x;
                        this.player.position.y = y;
                        break;
                    case Tile.SLASHER:
                        this.game.addEntity(new Slasher(this.game, this.assetManager, x, y));
                        break;
                    case Tile.SHOOTER:
                        this.game.addEntity(new Shooter(this.game, this.assetManager, x, y));
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
                }
            }
        }

        this.game.addEntity(MapExport.TEST_STAGE);
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
