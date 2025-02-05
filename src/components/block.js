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
        this.debugMode = false;

        this.collision = new ColliderRect(this.position, 0, 0, 55, 55, 1, this);
        this.game.addEntity(this.collision);

        this.sprite = new Sprite(this.position, this.game, 5, 0, 0, {
            new: new Animator(assetManager.getAsset("anims/block.png"), 0, 0, 11, 11, 1, .25),
            break: new Animator(assetManager.getAsset("anims/block.png"), 11, 0, 11, 11, 2, .5),
        });

        this.sprite.setState("new");
    }

    update() {
        if (this.age >= 3) {
            this.sprite.setState("break");
        }
        if (this.age >= 4) {
            this.removeFromWorld = true;
            this.collision.removeFromWorld = true;
        }
        this.age += this.game.clockTick;
    }

    draw(ctx) {
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