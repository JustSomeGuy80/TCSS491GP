/** @typedef {import("../player")} */
/** @typedef {import("../engine/gameengine")} */
/** @typedef {import("../engine/assetmanager")} */
/** @typedef {import("../primitives/vector")} */
/** @typedef {import("./position")} */
/** @typedef {import("./sprite")} */

class Arm {
    /**
     * @param {GameEngine} game
     * @param {AssetManager} assetManager
     * @param {Player} player
     * @param {int} xOffset
     * @param {int} yOffset
     * @param {string} state
     */
    constructor(game, assetManager, parent, xOffset, yOffset, state) {
        this.game = game;
        this.parent = parent;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.state = state; // decides which upgrades the arm has

        this.rotation = 0;
        
        this.sprite = new Sprite(this.parent.position, 3, -48, -48, {
            bladed: new Animator(assetManager.getAsset("anims/arm.png"), 0, 0, 32, 32, 1, 1),
        });

        this.sprite.setHorizontalFlip(false); // 0 = right, 1 = left
        this.sprite.setState("bladed"); // 0 = bladed
    }

    update() {
    }

    drawAngle(ctx, angle) {

    }

    draw(ctx) {
        let angle = Math.atan2(this.parent.aimVector.y, this.parent.aimVector.x);
        if (angle < 0) angle += Math.PI * 2;

        var xTranslate;
        if (this.parent.facing > 0) {
            xTranslate = this.parent.position.x - this.game.camera.x + this.xOffset;
        } else {
            xTranslate = this.parent.position.x - this.game.camera.x - this.xOffset;
            angle += Math.PI;
        } 

        // Consider a cleaner method of adjusting sprite camera offset
        this.sprite.offset.x -= this.game.camera.x;
        ctx.save();
        ctx.translate(xTranslate, (this.parent.position.y + this.yOffset));
        ctx.rotate(angle);
        ctx.translate(-xTranslate, -(this.parent.position.y + this.yOffset));
        this.sprite.drawSprite(this.game.clockTick, ctx);
        ctx.restore();
        this.sprite.offset.x += this.game.camera.x;
    }
} 