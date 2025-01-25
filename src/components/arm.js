/** @typedef {import("../player")} */
/** @typedef {import("../engine/gameengine")} */
/** @typedef {import("../engine/assetmanager")} */
/** @typedef {import("../primitives/vector")} */
/** @typedef {import("./position")} */
/** @typedef {import("./bullet")} */
/** @typedef {import("./sprite")} */

/**
 * The player's arm. The class is responsible for the
 *  rotational animation of the arm, as well as firing bullets.
 */
class Arm {
    /**
     * @param {GameEngine} game
     * @param {AssetManager} assetManager
     * @param {Player} plarent
     * @param {number} xOffset
     * @param {number} yOffset
     * @param {string} state  // decides which upgrades the arm has
     */
    constructor(game, assetManager, parent, xOffset, yOffset, state) {
        this.game = game;
        this.assetManager = assetManager;
        this.parent = parent;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.state = state;
        
        this.sprite = new Sprite(this.parent.position, this.game, 3, -48, -48, {
            bladed: new Animator(assetManager.getAsset("anims/arm.png"), 0, 0, 32, 32, 1, 1),
        });

        this.sprite.setHorizontalFlip(false); // 0 = right, 1 = left
        this.sprite.setState("bladed"); // 0 = bladed

        this.bullets = [];
        this.fireRate = .5;
        this.fireCD = 0; // tracks when the player can shoot again
        this.bulletSpeed = 750;
    }

    update() {
        if (this.fireCD > 0) this.fireCD -= this.game.clockTick;
        var newBullets = [];
        this.bullets.forEach(el => {
            el.update();
            if (!el.unload) {
                newBullets.push(el);
            }
        });
        this.bullets = newBullets;
    }

    fire() {
        if (this.fireCD <= 0) {
            this.fireCD = this.fireRate;
            var bulPos = new Position(this.parent.position.x + (this.xOffset * this.parent.facing), this.parent.position.y + this.yOffset);
            bulPos = bulPos.asVector();
            bulPos = bulPos.add(this.parent.aimVector.normalize().multiply(36));
            this.bullets.push(new Bullet(this.game, this.assetManager, bulPos.x, bulPos.y, this.parent.aimVector, this.bulletSpeed, 0));
        }
    }

    /**
     * Calculates an angle based on the player's mouse position
     * and draws the arm rotated based on that angle.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        this.bullets.forEach(el => {
            el.draw(ctx);
        });
        
        let angle = Math.atan2(this.parent.aimVector.y, this.parent.aimVector.x);
        if (angle < 0) angle += Math.PI * 2;

        var xTranslate;
        if (this.parent.facing > 0) {
            xTranslate = this.parent.position.x - this.game.camera.x + this.xOffset;
        } else {
            xTranslate = this.parent.position.x - this.game.camera.x - this.xOffset;
            angle += Math.PI;
        } 

        ctx.save();
        ctx.translate(xTranslate, (this.parent.position.y + this.yOffset));
        ctx.rotate(angle);
        ctx.translate(-xTranslate, -(this.parent.position.y + this.yOffset));
        this.sprite.drawSprite(this.game.clockTick, ctx);
        ctx.restore();

    }
} 