/** @typedef {import("./ColliderRect")} */
/** @typedef {import("./position")} */
/** @typedef {import("../engine/gameengine")} */
/** @typedef {import("../primitives/vector")} */
/** @typedef {import("../engine/assetmanager")} */
/** @typedef {import("../player")} */
/** @typedef {import("./sprite")} */

class Teleport {
    /**
     * @param {GameEngine} game
     * @param {AssetManager} assetManager
     * @param {Player} player
     * @param {number} xOffset
     * @param {number} yOffset
     * @param {number} w width
     * @param {number} h height
     */
    constructor(game, assetManager, player, xOffset, yOffset, w, h) {
        this.game = game;
        this.assetManager = assetManager;
        this.player = player;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.w = w;
        this.h = h;

        this.debugMode = false;

        this.position = this.player.position.copy();
        this.collider = new ColliderRect(this.position, -28, -48, 56, 96, -1, this);
        this.warpTime = 1/3;

        this.cdMax = 2;
        this.cd = 0;

        this.primed = false;
        this.grounded = player.isGrounded();
        this.colliding = true;

        this.animate = false;
        this.enterPos = this.position.copy();
        this.enterSprite = new Sprite(this.enterPos, this.game, 3, -48, -48, {
            enter: new Animator(assetManager.getAsset("anims/teleport.png"), 0, 0, 32, 32, 5, .075, false),
        });
        this.exitPos = this.position.copy();
        this.exitSprite = new Sprite(this.exitPos, this.game, 3, -48, -48, {
            exit: new Animator(assetManager.getAsset("anims/teleport.png"), 0, 32, 32, 32, 5, .075, false),
        });
        
        this.indicator = new Sprite(this.position, this.game, 3, -48, -48, {
            viable: new Animator(assetManager.getAsset("anims/teleIndicator.png"), 0, 0, 32, 32, 1, 1),
            unviable: new Animator(assetManager.getAsset("anims/teleIndicator.png"), 32, 0, 32, 32, 1, 1),
        });
    }

    update() {
        if (this.cd > 0) this.cd -= this.game.clockTick;

        this.position.set(0, 0);
        this.position.add(this.player.position.asVector());
        this.position.add(this.player.velocity.multiply(this.warpTime));

        this.grounded = this.player.isGrounded();
        this.colliding = this.runCollisions();

        if (this.enterSprite.isDone() && this.exitSprite.isDone()) this.animate = false;
    }

    teleport(bool) {
        if (bool) {
            this.primed = true;
        } else {
            if (this.cd <= 0 && this.primed) {
                if (!this.colliding && !this.grounded) {
                    this.animate = true;
                    this.enterPos.inherit(this.player.position);
                    this.enterSprite.resetAnim();
                    this.exitPos.inherit(this.position)
                    this.exitSprite.resetAnim();
    
                    this.player.position.inherit(this.position);
                    this.cd = this.cdMax;
                } else {
                    this.cd = this.cdMax/10;
                }
            }
            this.primed = false;
        }
    }

    runCollisions() {
        const collisions = this.collider.getCollision();


        while (true) {
            const { value: collision, done } = collisions.next();

            if (done) {
                break;
            }
            
            if (collision.id === 1) {
                return true;
            }
        }
        return false;
    }

    draw(ctx) {
        if (this.animate == true) {
            this.enterSprite.drawSprite(this.game.clockTick, ctx);
            this.exitSprite.drawSprite(this.game.clockTick, ctx);
        }

        if (!this.grounded && this.primed) {
            if (this.colliding || this.cd > 0) this.indicator.setState("unviable");
            else this.indicator.setState("viable");
            this.indicator.drawSprite(this.game.clockTick, ctx);
        }

        if (this.debugMode) {
            const bounds = this.collider.getBounds();
            ctx.save();
            if (!this.colliding && !this.grounded) {
                ctx.strokeStyle = 'green';
            } else {
                ctx.strokeStyle = 'red';
            }
            ctx.strokeRect(
                bounds.xStart - this.game.camera.x,
                bounds.yStart - this.game.camera.y,
                bounds.xEnd - bounds.xStart,
                bounds.yEnd - bounds.yStart);
            ctx.restore();
        }
    }
} 