/** @typedef {import("./ColliderRect")} */
/** @typedef {import("./position")} */
/** @typedef {import("../engine/gameengine")} */
/** @typedef {import("../primitives/vector")} */
/** @typedef {import("../engine/assetmanager")} */
/** @typedef {import("./sprite")} */

class Block {
    constructor(game, assetManager, x, y) {
        this.game = game;
        this.position = new Position(x, y);
        this.removeFromWorld = false;
        this.age = 0;
        this.health = 3;
        this.debugMode = false;
        this.active = true;
        this.deathStartTime = 0;

        this.collision = new ColliderRect(this.position, 0, 0, 48, 48, 6, this);
        this.game.addEntity(this.collision);

        this.sprite = new Sprite(this.position, this.game, 1.01, 0, 0, {
            new: new Animator(assetManager.getAsset("anims/block.png"), 0, 0, 48, 48, 1, .25),
            break: new Animator(assetManager.getAsset("anims/block.png"), 48, 0, 48, 48, 2, .5),
            death: new Animator(assetManager.getAsset("anims/block.png"), 48, 0, 48, 48, 2, .25),
        });

        this.sprite.setState("new");
    }

    update() {
        if (this.active) {
            this.death();

            if (this.sprite.state === "death") {
                if (this.age >= this.deathStartTime + 0.5) {
                    this.removeFromWorld = true;
                    this.collision.removeFromWorld = true;
                }
            } else {
                if (this.age >= 3) {
                    this.sprite.setState("break");
                }
                if (this.age >= 4) {
                    this.removeFromWorld = true;
                    this.collision.removeFromWorld = true;
                }
            }

            this.age += this.game.clockTick;
        }
    }

    death() {
        if (this.health <= 0 && this.sprite.state !== "death") {
            this.sprite.setState("death");
            this.deathStartTime = this.age;
        }
    }

    draw(ctx)
    {
        this.sprite.drawSprite(this.game.clockTick, ctx);

        if (this.debugMode) {
            const bounds = this.collision.getBounds();
            ctx.save();
            ctx.strokeStyle = 'yellow';
            ctx.strokeRect(
                bounds.xStart - this.game.camera.x,
                bounds.yStart,
                bounds.xEnd - bounds.xStart,
                bounds.yEnd - bounds.yStart);
            ctx.restore();
        }
    }
}