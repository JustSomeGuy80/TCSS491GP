/** @typedef {import("./engine/animator")} */
/** @typedef {import("./components/ColliderRect")} */
/** @typedef {import("./components/position")} */
/** @typedef {import("./components/arm")} */
/** @typedef {import("./components/teleport")} */
/** @typedef {import("./components/sprite")} */
/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./primitives/vector")} */

/**
 * Player is an entity controlled by the user within the game.
 */
class Player {
    /**
     * @param {GameEngine} game
     * @param {AssetManager} assetManager
     */
    constructor(game, assetManager) {
        this.game = game;
        this.assetManager = assetManager;
        this.jumpHeight = 550;
        this.debugMode = true;
        this.removeFromWorld = false;

        const height = 96;
        const width = 36;

        this.position = new Position(525, 500);
        this.collider = new ColliderRect(
            this.position,
            -width / 2,
            -height / 2,
            width,
            height,
            0,
            this
        );
        this.teleport = new Teleport(
            game,
            assetManager,
            this,
            -width / 2,
            -height / 2,
            width,
            height
        );
        this.arm = new Arm(game, this.assetManager, this, 6, -4, "bladed");
        this.sprite = new Sprite(this.position, this.game, 3, -48, -48, {
            idle: new Animator(this.assetManager.getAsset("anims/idle.png"), 0, 0, 32, 32, 2, 2),
            running: new Animator(
                this.assetManager.getAsset("anims/run.png"),
                0,
                0,
                32,
                32,
                4,
                0.2
            ),
            bwrunning: new Animator(
                this.assetManager.getAsset("anims/bwrun.png"),
                0,
                0,
                32,
                32,
                4,
                0.2
            ),
            airLeanBack: new Animator(
                this.assetManager.getAsset("anims/jump.png"),
                0,
                0,
                32,
                32,
                1,
                1
            ),
            airLeanFront: new Animator(
                this.assetManager.getAsset("anims/jump.png"),
                32,
                0,
                32,
                32,
                1,
                1
            ),
        });

        this.sprite.setHorizontalFlip(false);
        this.sprite.setState("idle");

        this.facing = 1; // 1 = right, -1 = left, used for calculations, should never be set to 0
        this.jumped = 0; // 0 = can jump, 1 = can vary gravity, 2 = can't vary gravity 3 = grappling
        this.jumpBuffer = 0;

        this.velocity = new Vector(0, 0);
        this.maxSpeed = 350;
        this.walkAccel = 1050;
        this.aimVector = new Vector(1, 0);

        /** @type {Animator[]} */
        this.animations = [];
        this.loadAnimations(this.assetManager);

        // TEMP (standing on hitboxes is not recognized by Player.isGrounded())
        this.groundOverride = 0;

        this.health = 100;
        this.canShoot = false;
        this.canSlash = false;
        this.canTeleport = false;
    }

    loadAnimations(assetManager) {
        this.animations.push(
            new Animator(assetManager.getAsset("/anims/idle.png"), 0, 0, 32, 32, 2, 2)
        );
        this.animations.push(
            new Animator(assetManager.getAsset("/anims/run.png"), 0, 0, 32, 32, 4, 0.2)
        );
        this.animations.push(
            new Animator(assetManager.getAsset("/anims/run.png"), 0, 0, 32, 32, 4, 0.2)
        );
        this.animations.push(
            new Animator(assetManager.getAsset("/anims/jump.png"), 0, 0, 32, 32, 1, 1)
        );
        this.animations.push(
            new Animator(assetManager.getAsset("/anims/jump.png"), 32, 0, 32, 32, 1, 1)
        );
    }

    update() {
        this.checkInput();

        let origin = this.position.asVector();

        GUI.setHealth(this.health / 100);

        this.calcMovement();

        this.arm.update();
        this.teleport.update();

        this.runCollisions(origin);

        this.setState();

        if (this.health <= 0) {
            // this.removeFromWorld = true;
        }
    }

    checkInput() {
        var move = 0;
        var grounded = this.isGrounded();
        if (this.game.keys["d"]) move += 1;
        if (this.game.keys["a"]) move -= 1;

        if (this.game.keys[" "]) {
            if (grounded && (this.jumped == 0 || this.jumpBuffer <= 0.1)) {
                this.velocity.y = -this.jumpHeight;
                this.jumped = 1;
                this.assetManager.playAsset("sounds/jump.mp3");
            }
            this.jumpBuffer += this.game.clockTick;
        } else {
            if (grounded) this.jumped = 0;
            else if (this.velocity.y < 0 && this.jumped == 1)
                this.velocity.y -= this.velocity.y * 32 * this.game.clockTick;
            this.jumpBuffer = 0;
        }

        // Don't let the player exceed max speed
        if (
            !(
                (this.velocity.x > this.maxSpeed && move == 1) ||
                (this.velocity.x < -this.maxSpeed && move == -1)
            )
        ) {
            // Accelerate the player
            this.velocity.x += this.walkAccel * move * this.game.clockTick;
        }

        if (this.game.mouse != null) {
            //Set facing direction
            if (this.game.mouse.x + this.game.camera.x >= this.position.x) {
                this.sprite.setHorizontalFlip(false);
                this.arm.sprite.setHorizontalFlip(false);
                this.facing = 1;
            } else {
                this.sprite.setHorizontalFlip(true);
                this.arm.sprite.setHorizontalFlip(true);
                this.facing = -1;
            }

            this.aimVector.x =
                this.game.mouse.x +
                this.game.camera.x -
                this.position.x +
                this.arm.xOffset * this.facing;
            this.aimVector.y =
                this.game.mouse.y + this.game.camera.y - (this.position.y + this.arm.yOffset);
        }
        if (this.canShoot &&  this.game.buttons[0]) this.arm.fire();
        if (this.canSlash && this.game.keys["s"] || this.game.buttons[3]) this.arm.slash();
        if ((this.canTeleport) && this.teleport.teleport(this.game.keys["w"]) === true) {
            this.arm.grapple(false);
        }
        if (this.game.buttons[2] != null) this.arm.grapple(this.game.buttons[2], move);

        // Do we apply ground friction to the player?
        var traction =
            this.isGrounded() &&
            (move == 0 ||
                (move == 1 && this.velocity.x < 0) ||
                (move == -1 && this.velocity.x > 0) ||
                this.velocity.x > this.maxSpeed ||
                this.velocity.x < -this.maxSpeed);
        if (traction) {
            // Apply ground friction
            if (this.velocity.x < 0) this.velocity.x += this.walkAccel * this.game.clockTick;
            else if (this.velocity.x > 0) this.velocity.x -= this.walkAccel * this.game.clockTick;
            if (this.velocity.x < this.maxSpeed / 20 && this.velocity.x > -this.maxSpeed / 20)
                this.velocity.x = 0;
        }
    }

    calcMovement() {
        const gravity = 1000;
        this.position.x += this.velocity.x * this.game.clockTick;
        this.position.y += this.velocity.y * this.game.clockTick;

        // player needs to be put into the ground anyways for game to detect ground collision
        // if (!this.isGrounded()) this.velocity.y += gravity * this.game.clockTick;

        this.velocity.y += gravity * this.game.clockTick;
    }

    runCollisions(origin) {
        const displacement = this.position.asVector().subtract(origin);
        const readjustment = this.collider.resolveCollisions(displacement, 1);
        this.position.add(readjustment);

        // horizontal collision
        if (readjustment.x !== 0) {
            this.velocity.x = 0;
        }
        // vertical collision
        if (readjustment.y !== 0) {
            // guarantee some frames of "grounded" where the first is this one and the second causes player to fall into hitbox (triggers collision)
            this.groundOverride = 2;
            this.velocity.y = 0;
        }
        // no collision
        if (readjustment.y === 0 && readjustment.x === 0) {
            this.groundOverride -= 1;
        }
    }

    setState() {
        if (this.isGrounded()) {
            if (this.velocity.x == 0) this.sprite.setState("idle");
            else if (this.velocity.x * this.facing > 0) this.sprite.setState("running");
            else this.sprite.setState("bwrunning");
        } else {
            if (this.velocity.y <= 10) {
                if (this.velocity.x * this.facing >= 1) this.sprite.setState("airLeanBack");
                else this.sprite.setState("airLeanFront");
            } else {
                if (this.velocity.x * this.facing >= 1) this.sprite.setState("airLeanFront");
                else this.sprite.setState("airLeanBack");
            }
        }
    }

    isGrounded() {
        //TEMPORARY
        return this.groundOverride > 0;
    }

    draw(ctx) {
        this.teleport.draw(ctx);
        this.arm.draw(ctx);
        this.sprite.drawSprite(this.game.clockTick, ctx);

        if (this.debugMode) {
            const bounds = this.collider.getBounds();
            ctx.save();
            ctx.strokeStyle = 'yellow';
            ctx.strokeRect(
                bounds.xStart - this.game.camera.x,
                bounds.yStart - this.game.camera.y,
                bounds.xEnd - bounds.xStart,
                bounds.yEnd - bounds.yStart);
            ctx.restore();

            this.collider.draw(ctx);
            this.position.draw(ctx);
        }
    }
}
