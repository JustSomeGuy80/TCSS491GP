/** @typedef {import("./ColliderRect")} */
/** @typedef {import("./position")} */
/** @typedef {import("../engine/gameengine")} */
/** @typedef {import("../primitives/vector")} */
/** @typedef {import("../engine/assetmanager")} */
/** @typedef {import("./sprite")} */

/**
 * Handles logic and effects for the player's slash attack.
 */
class Slash {
    /**
     * @param {GameEngine} game
     * @param {AssetManager} assetManager
     * @param {Player} player
     * @param {number} xOffset
     * @param {number} yOffset
     * @param {vector} vect
     */
    constructor(game, assetManager, player, xOffset, yOffset, vect) {
        this.game = game;
        this.assetManager = assetManager;
        this.player = player;
        this.position = player.position.copy();
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.vect = vect.normalize();

        this.debugMode = false;

        this.flip = this.vect.x < 0;

        let temp = 30;
        if (this.flip) {
            temp *= -1;
        }
        this.sprite = new Sprite(this.position, this.game, 3, -48 + temp, -48, {
            slash: new Animator(
                assetManager.getAsset("anims/slashEffect.png"),
                0,
                0,
                32,
                32,
                5,
                0.05,
                false
            ),
        });
        if (this.flip) {
            this.sprite.setHorizontalFlip(true);
        }

        this.sprite.setState("slash");

        this.unload = false;

        this.removeFromWorld = false;

        this.init();
    }

    // All the logic for the slash attack happens in a single frame, which is handled by this method
    init() {
        let clanged = false; // ensures that you can't get extra momentum from hitting multiple walls at once
        let hit = false; // set to true if the slash hits anything, wall or enemy, and plays a sound later if so

        // Calculate where the collision should be placed
        let slashPos = new InstanceVector(
            this.position.x + this.xOffset * this.player.facing,
            this.position.y + this.yOffset - 72
        ).add(this.player.aimVector.normalize().multiply(60));
        const slashCol = new ColliderRect(
            this,
            slashPos,
            new Vector(-25, 35),
            new Vector(50, 80),
            Slasher.TYPE_ID,
            Obstacle.TYPE_ID
        );

        // Handle collisions
        const collisions = slashCol.getCollisions();
        while (true) {
            const { value: collider, done } = collisions.next();

            if (done) {
                break;
            }

            const typeID = collider.parent.constructor.TYPE_ID;

            if (!clanged && typeID === Obstacle.TYPE_ID) {
                this.neutralize();
                const bounce = this.vect.multiply(this.calcPush());
                bounce.y *= 1.5;
                this.player.controller.velocity = this.player.controller.velocity.add(bounce);
                clanged = true;
                hit = true;
            } else if (typeID === Slasher.TYPE_ID) {
                collider.owner.health -= 3;
                hit = true;
            }
        }

        // Play sound if it hit something
        if (hit) {
            this.assetManager.playAsset("sounds/slashHit.mp3");
        }

        // Remove the collision box from the world
        slashCol.delete();

        // Store the collision box, purely so it can be displayed for debugging purposes
        this.collider = slashCol;
    }

    // Calculates how hard the player gets pushed by the slash hitting terrain,
    // based on the angle and magnitude of their momentum and the angle of the slash.
    // Maximum of 350 velocity, minimum of 150.
    calcPush() {
        var push = 350;

        // Find the angle between the player's velocity vector and the vector of the momentum they'll recieve from the slash
        let angle =
            Math.atan2(-this.vect.y, -this.vect.x) -
            Math.atan2(this.player.controller.velocity.y, this.player.controller.velocity.x);

        // Convert from radians to a scale of 0 to 1. 0 being 0 degrees, 1 being 180 degrees
        angle = (angle / (Math.PI * 2)) % 1;

        // The tighter the angle, and the faster you're moving, the less momentum you recieve.
        if (angle < 0.5) {
            push -= this.player.controller.velocity.getMagnitude() * (1 - angle * 2);
            if (push < 150) push = 150;
        }

        return -push;
    }

    // When slashing terrain, this method allows the player to brake by slashing against their momentum
    neutralize() {
        let angle = Math.atan2(this.vect.y, this.vect.x);
        if (
            (angle <= Math.PI / 8 &&
                angle >= -Math.PI / 8 &&
                this.player.controller.velocity.x > 0) || // did the player slash to the right while moving right?
            ((angle >= Math.PI * (7 / 8) || angle <= -Math.PI * (7 / 8)) &&
                this.player.controller.velocity.x < 0)
        ) {
            // or did they slash to the left while moving left?
            this.player.controller.velocity.x = 0; // If so, halt horizontal momentum
        } else if (
            (angle <= Math.PI * (7 / 8) &&
                angle >= Math.PI / 8 &&
                this.player.controller.velocity.y > 0) || // did the player slash downward while moving down?
            (angle <= -Math.PI / 8 &&
                angle >= -Math.PI * (7 / 8) &&
                this.player.controller.velocity.y < 0)
        ) {
            // or did they slash upward while moving up?
            this.player.controller.velocity.y = 0; // If so, halt vertical momentum
        }
    }

    // Unloads this object when its animation is done playing
    update() {
        if (this.sprite.isDone()) {
            this.unload = true;
        }
    }

    // Draws the effect of the slash
    draw(ctx) {
        let angle = Math.atan2(this.vect.y, this.vect.x);
        if (angle < 0) angle += Math.PI * 2;

        var xTranslate;
        if (!this.flip) {
            xTranslate = this.position.x - this.game.camera.x + this.xOffset;
        } else {
            xTranslate = this.position.x - this.game.camera.x - this.xOffset;
            angle += Math.PI;
        }

        ctx.save();
        ctx.translate(xTranslate, this.position.y + this.yOffset - this.game.camera.y);
        ctx.rotate(angle);
        ctx.translate(-xTranslate, -(this.position.y + this.yOffset - this.game.camera.y));
        this.sprite.drawSprite(this.game.clockTick, ctx);
        ctx.restore();

        if (true) {
            const bounds = this.collider.getBoundary();
            ctx.save();
            ctx.strokeStyle = "yellow";
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
