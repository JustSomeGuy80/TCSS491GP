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

        this.debugMode = true;

        this.position = new Position(player.position.x, player.position.y);
        this.collider = new ColliderRect(this.position, -28, -48, 56, 96, -1, this);
        this.warpTime = 1/3;

        this.cdMax = 2;
        this.cd = 0;

        this.grounded = player.isGrounded();
        this.colliding = true;
    }

    update() {
        if (this.cd > 0) this.cd -= this.game.clockTick;

        this.position.set(0, 0);
        this.position.add(this.player.position.asVector());
        this.position.add(this.player.velocity.multiply(this.warpTime));

        this.grounded = this.player.isGrounded();
        this.colliding = this.runCollisions();
    }

    teleport() {
        if (this.cd <= 0) {
            if (!this.colliding && !this.grounded) {
                this.player.position.set(0, 0);
                this.player.position.add(this.position.asVector());
                this.cd = this.cdMax;
            } else {
                this.cd = this.cdMax/10;
            }
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
        //this.sprite.drawSprite(this.game.clockTick, ctx);

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