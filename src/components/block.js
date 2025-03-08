/** @typedef {import("./ColliderRect")} */
/** @typedef {import("./position")} */
/** @typedef {import("../engine/gameengine")} */
/** @typedef {import("../primitives/vector")} */
/** @typedef {import("../engine/assetmanager")} */
/** @typedef {import("./sprite")} */
/** @typedef {import("../map-export")} */
/** @typedef {import("../tile")} */

class Block {
    constructor(game, assetManager, x, y) {
        this.game = game;
        this.assetManager = assetManager;
        this.position = new Position(x, y);
        this.removeFromWorld = false;
        this.age = 0;
        this.health = 3;
        this.debugMode = false;
        this.active = true;
        this.deathStartTime = 0;

        this.tileX = Math.floor(x / Tile.SIZE);
        this.tileY = Math.floor(y / Tile.SIZE);
        if (
            this.tileX >= 0 &&
            this.tileY >= 0 &&
            this.tileX < MapExport.currentMap.tiles.length &&
            this.tileY < MapExport.currentMap.tiles[this.tileX].length &&
            MapExport.currentMap.tiles[this.tileX][this.tileY] !== Tile.AIR
        ) {
            this.coveredTile = MapExport.currentMap.tiles[this.tileX][this.tileY];
            MapExport.currentMap.tiles[this.tileX][this.tileY] = Tile.DIRT;
        } else {
            this.coveredTile = Tile.AIR;
        }

        this.collision = new ColliderRect(this.position, 0, 0, 48, 48, 6, this);
        this.game.addEntity(this.collision);

        this.sprite = new Sprite(this.position, this.game, 1.01, 0, 0, {
            new: new Animator(assetManager.getAsset("anims/block.png"), 0, 0, 48, 48, 1, 0.25),
            break: new Animator(assetManager.getAsset("anims/block.png"), 48, 0, 48, 48, 2, 0.5),
            death: new Animator(assetManager.getAsset("anims/block.png"), 48, 0, 48, 48, 2, 0.25),
        });

        this.sprite.setState("new");
    }

    update() {
        if (this.active) {
            this.death();

            if (this.sprite.state === "death") {
                if (this.age >= this.deathStartTime + 0.5) {
                    this.remove();
                    this.assetManager.playAsset("sounds/block_break.wav");
                }
            } else {
                if (this.age >= 3) {
                    this.sprite.setState("break");
                }
                if (this.age >= 4) {
                    this.remove();
                    this.assetManager.playAsset("sounds/block_break.wav");
                }
            }

            this.age += this.game.clockTick;
        }
    }

    remove() {
        if (this.coveredTile !== Tile.AIR) {
            MapExport.currentMap.tiles[this.tileX][this.tileY] = this.coveredTile;
        }
        this.removeFromWorld = true;
        this.collision.removeFromWorld = true;
    }

    death() {
        if (this.health <= 0 && this.sprite.state !== "death") {
            this.sprite.setState("death");
            this.deathStartTime = this.age;
        }
    }

    draw(ctx) {
        this.sprite.drawSprite(this.game.clockTick, ctx);

        if (this.debugMode) {
            const bounds = this.collision.getBounds();
            ctx.save();
            ctx.strokeStyle = "yellow";
            ctx.strokeRect(
                bounds.xStart - this.game.camera.x,
                bounds.yStart - this.game.camera.y,
                bounds.xEnd - bounds.xStart,
                bounds.yEnd - bounds.yStart
            );
            ctx.restore();
        }
    }
}
