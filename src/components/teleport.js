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

        this.position = new InstanceVector(player.position.x, player.position.y);
        this.collider = new ColliderRect(
            this,
            this.position,
            new Vector(-28, -48),
            new Vector(56, 96),
            Obstacle.TYPE_ID
        );
        this.warpTime = 1 / 3;

        this.cdMax = 2;
        this.cd = 0;

        this.grounded = player.isGrounded();
        this.colliding = true;
    }

    update() {
        if (this.cd > 0) this.cd -= this.game.clockTick;
        this.position.set(
            this.player.position
                .asVector()
                .add(this.player.controller.velocity.asVector().multiply(this.warpTime))
        );
        this.grounded = this.player.isGrounded();
        this.colliding = this.runCollisions();
    }

    teleport() {
        if (this.cd <= 0) {
            if (!this.colliding && !this.grounded) {
                this.player.position.set(this.position);
                this.cd = this.cdMax;
            } else {
                this.cd = this.cdMax / 10;
            }
        }
    }

    runCollisions() {
        const { value: collider, done } = this.collider.getCollisions().next();
        return collider !== undefined;
    }

    draw(ctx) {
        if (this.debugMode) {
            const bounds = this.collider.getBoundary();
            ctx.save();
            if (!this.colliding && !this.grounded) {
                ctx.strokeStyle = "green";
            } else {
                ctx.strokeStyle = "red";
            }
            ctx.strokeRect(
                bounds.left - this.game.camera.x,
                bounds.top - this.game.camera.y,
                bounds.right - bounds.left,
                bounds.bottom - bounds.top
            );
            ctx.restore();
        }
    }
}
