/** @typedef {import("../player")} */
/** @typedef {import("../engine/gameengine")} */
/** @typedef {import("../engine/assetmanager")} */
/** @typedef {import("../primitives/vector")} */
/** @typedef {import("./position")} */
/** @typedef {import("./bullet")} */
/** @typedef {import("./ColliderRect")} */
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
            blade: new Animator(assetManager.getAsset("anims/arm.png"), 0, 0, 32, 32, 1, 1),
            bladeFire: new Animator(assetManager.getAsset("anims/arm.png"), 32, 0, 32, 32, 1, 1),
        });

        this.sprite.setHorizontalFlip(false); // 0 = right, 1 = left
        this.sprite.setState("blade"); // 0 = bladed

        this.bullets = [];
        this.fireRate = .75;
        this.fireCD = 0; // tracks when the player can shoot again
        this.CDType = 0; // Tracks if cooldown is from shooting (0) or slashing (1)
        this.bulletSpeed = 750;
    }

    update() {
        if (this.fireCD > 0) this.fireCD -= this.game.clockTick;
        if (this.fireCD <= 0 && this.CDType == 1) {
            this.assetManager.playAsset("sounds/slashReady.mp3");
            this.CDType = 0;
        } 
        var newBullets = [];
        this.bullets.forEach(el => {
            el.update();
            if (!el.unload) {
                newBullets.push(el);
            }
        });
        this.bullets = newBullets;
        this.setState();
    }

    setState() {
        if (this.fireCD >= (this.fireRate / 2)) this.sprite.setState("bladeFire");
        else this.sprite.setState("blade")
    }

    fire() {
        if (this.fireCD <= 0) {
            this.CDType = 0;
            this.fireCD = this.fireRate;
            var bulPos = new Position(this.parent.position.x + (this.xOffset * this.parent.facing), this.parent.position.y + this.yOffset);
            bulPos = bulPos.asVector();
            bulPos = bulPos.add(this.parent.aimVector.normalize().multiply(36));
            this.bullets.push(new Bullet(this.game, this.assetManager, bulPos.x, bulPos.y, this.parent.aimVector, this.bulletSpeed, 0));
        }
    }

    //TEMPORARY implementation of the slash attack for the prototype presentation
    slash() {
        if (this.fireCD <= 0) {
            this.CDType = 1;
            this.fireCD = 1.5 * this.fireRate;
            var slashPos = new Position(this.parent.position.x + (this.xOffset * this.parent.facing), this.parent.position.y + this.yOffset);
            slashPos = slashPos.asVector();
            slashPos = slashPos.add(this.parent.aimVector.normalize().multiply(60));

            var slashCol = new ColliderRect(slashPos, -25, -25, 50, 70, 4);
            this.game.addEntity(slashCol);
            
            const collisions = slashCol.getCollision();
            while (true) {
                const { value: collision, done } = collisions.next();

                if (done) {
                    break;
                }
            
                if (collision.id == 1) {
                    const bounce = this.parent.aimVector.normalize().multiply(-150)
                    this.parent.velocity = this.parent.velocity.add(bounce);
                    this.assetManager.playAsset("sounds/slashHit.mp3");
                }
            }

            slashCol.removeFromWorld = true;
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