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
        // Parameter attributes
        this.game = game;
        this.assetManager = assetManager;
        this.player = player;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.w = w;
        this.h = h;

        this.debugMode = false;

        this.position = new InstanceVector(player.position.x, player.position.y);
        this.collider = new ColliderRect(
            this,
            this.position,
            new Vector(xOffset, yOffset),
            new Vector(w, h),
            Obstacle.TYPE_ID
        );
        this.warpTime = 1 / 3;

        this.cdMax = 2;
        this.cd = 0;

        this.primed = false; // Player teleports when releasing the button, this tracks if the buttons being held
        this.grounded = player.isGrounded(); // Remembers if the player is grounded this frame
        this.colliding = true; // Remembers if the player will warp in to a wall this frame

        this.animate = false; // Should we animate the portals this frame?

        // Sprite for the portal that appears where the player *was*
        this.enterPos = this.position.copy();
        this.enterSprite = new Sprite(this.enterPos, this.game, 3, -48, -48, {
            enter: new Animator(
                assetManager.getAsset("anims/teleport.png"),
                0,
                0,
                32,
                32,
                5,
                0.075,
                false
            ),
        });

        // Sprite for the portal that appears where the player *warps to*
        this.exitPos = this.position.copy();
        this.exitSprite = new Sprite(this.exitPos, this.game, 3, -48, -48, {
            exit: new Animator(
                assetManager.getAsset("anims/teleport.png"),
                0,
                32,
                32,
                32,
                5,
                0.075,
                false
            ),
        });

        // Sprite for the indicator that shows where the player will warp to
        this.indicator = new Sprite(this.position, this.game, 3, -48, -48, {
            viable: new Animator(
                assetManager.getAsset("anims/teleIndicator.png"),
                0,
                0,
                32,
                32,
                1,
                1
            ),
            unviable: new Animator(
                assetManager.getAsset("anims/teleIndicator.png"),
                32,
                0,
                32,
                32,
                1,
                1
            ),
        });
    }

    update() {
        // If teleport is on cooldown, lower the cooldown time
        if (this.cd > 0) this.cd -= this.game.clockTick;
        this.position.set(
            this.player.position
                .asVector()
                .add(this.player.controller.velocity.asVector().multiply(this.warpTime))
        );
        this.grounded = this.player.isGrounded();
        this.colliding = this.runCollisions();

        // Stop animating the portal sprites if they're done playing their animations
        if (this.enterSprite.isDone() && this.exitSprite.isDone()) this.animate = false;
    }

    /**
     * Teleports the player if they meet the proper conditions
     * @param {Boolean} bool true if the player is holding w, false if not
     */
    teleport(bool) {
        // First if statement basically just makes it so the player teleports on w RELEASE rather than press
        if (bool) {
            this.primed = true;
        } else {
            if (this.cd <= 0 && this.primed) {
                if (!this.colliding && !this.grounded) {
                    // Sets up portal animations
                    this.animate = true;
                    this.enterPos.set(this.player.position);
                    this.enterSprite.resetAnim();
                    this.exitPos.set(this.position);
                    this.exitSprite.resetAnim();

                    // Teleports player and puts it on cooldown
                    this.player.position.set(this.position);
                    this.cd = this.cdMax;
                } else {
                    this.cd = this.cdMax / 10;
                }
            }
            this.primed = false;
        }
    }

    runCollisions() {
        const { value: collider, done } = this.collider.getCollisions().next();
        return collider !== undefined;
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
