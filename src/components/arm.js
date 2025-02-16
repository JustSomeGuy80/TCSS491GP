/** @typedef {import("../player")} */
/** @typedef {import("../engine/gameengine")} */
/** @typedef {import("../engine/assetmanager")} */
/** @typedef {import("../primitives/vector")} */
/** @typedef {import("./position")} */
/** @typedef {import("./bullet")} */
/** @typedef {import("./slash")} */
/** @typedef {import("./ColliderRect")} */
/** @typedef {import("./sprite")} */

/**
 * The player's arm. The class is responsible for the
 *  rotational animation of the arm, as well as firing bullets.
 */
class Arm {
<<<<<<< Updated upstream
    
    static #FIRED = 0;
    static #SLASHED = 1;

=======
>>>>>>> Stashed changes
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
            bladeFire: new Animator(assetManager.getAsset("anims/arm.png"), 32, 0, 32, 32, 1, .2, false),
            slash: new Animator(assetManager.getAsset("anims/slash.png"), 0, 0, 32, 32, 3, .1, false),
        });

        this.sprite.setHorizontalFlip(false); // 0 = right, 1 = left
        this.sprite.setState("blade"); // 0 = bladed

        this.bullets = [];
<<<<<<< Updated upstream
        this.fireRate = .75;
        this.slashRate = this.fireRate * 1.5;
        this.fireCD = 0; // tracks when the player can shoot again
=======
        this.fireRate = 0.6;
        this.slashRate = 0.9;
        this.grappleRate = 1.0;
>>>>>>> Stashed changes

        this.fireCD = 0; // tracks when the player can shoot again
        this.slashCD = 0; // tracks when the player can slash again
        this.grappleCD = 0; // tracks when the player can grapple again

        this.bulletSpeed = 750;

        this.hook = null;
    }

    update() {
        if (this.fireCD > 0) this.fireCD -= this.game.clockTick;
<<<<<<< Updated upstream
        if (this.CDType == Arm.#SLASHED && this.fireCD <= 0) {
            this.assetManager.playAsset("sounds/slashReady.mp3");
            this.CDType = Arm.#FIRED;
        } 
=======
        if (this.slashCD > 0) this.slashCD -= this.game.clockTick;
        if (this.grappleCD > 0) this.grappleCD -= this.game.clockTick;

>>>>>>> Stashed changes
        var newBullets = [];
        this.bullets.forEach(el => {
            el.update();
            if (!el.unload) {
                newBullets.push(el);
            }
        });
        this.bullets = newBullets;
        if (this.hook != null) {
            this.hook.update();
        }

        this.setState();
<<<<<<< Updated upstream
=======

        GUI.setCooldown("bullet-ability", this.fireCD / this.fireRate);
        GUI.setCooldown("slash-ability", this.slashCD / this.slashRate);
>>>>>>> Stashed changes
    }

    setState() {
        // if (this.CDType == 0 && this.fireCD >= (this.fireRate / 2)) this.sprite.setState("bladeFire");
        // else if (this.CDType == 1 && this.fireCD >= this.slashRate - (Arm.#SLASH_ANIM_TIME * 3)) this.sprite.setState("slash")
        // else this.sprite.setState("blade")
        if (this.sprite.isDone()) {
            this.sprite.resetAnim();
            this.sprite.setState("blade");
        }

    }

    fire() {
        if (this.fireCD <= 0) {
            this.fireCD = this.fireRate;
            var bulPos = new Position(this.parent.position.x + (this.xOffset * this.parent.facing), this.parent.position.y + this.yOffset);
            bulPos = bulPos.asVector();
            bulPos = bulPos.add(this.parent.aimVector.normalize().multiply(36));
            this.bullets.push(new Bullet(this.game, this.assetManager, bulPos.x, bulPos.y, this.parent.aimVector, this.bulletSpeed, 0));
            this.sprite.setState("bladeFire");
        }
    }

    grapple(bool) {
        if (bool) {
            if (this.grappleCD <= 0 && this.hook == null) {
                this.grappleCD = this.grappleRate;

                var graPos = new Position(this.parent.position.x, this.parent.position.y);
                var graVect = this.parent.aimVector.normalize().multiply(350);
                var mag = ColliderRect.lineCollide(graPos, graVect, [1]);

                if (mag != null) {
                    graPos.add(graVect.normalize().multiply(mag));

                    this.hook = new Grapple(
                        this.game,
                        this.assetManager,
                        this.parent,
                        this.parent.position,
                        this.xOffset,
                        this.yOffset,
                        graPos,
                        mag + 5
                    );
                }
            }
        } else {
            this.hook = null;
        }
    }

    //TEMPORARY implementation of the slash attack for the prototype presentation
    slash() {
        if (this.slashCD <= 0) {
            this.slashCD = this.slashRate;

            this.bullets.push(new Slash(this.game, this.assetManager, this.parent, this.xOffset, this.yOffset, this.parent.aimVector));

            this.sprite.setState("slash");

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
<<<<<<< Updated upstream
        
=======
        if (this.hook != null) {
            this.hook.draw(ctx);
        }

>>>>>>> Stashed changes
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
        ctx.translate(xTranslate, (this.parent.position.y + this.yOffset - this.game.camera.y));
        ctx.rotate(angle);
        ctx.translate(-xTranslate, -(this.parent.position.y + this.yOffset - this.game.camera.y));
        this.sprite.drawSprite(this.game.clockTick, ctx);
        ctx.restore();

    }
} 