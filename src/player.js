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
    static Objectives = [
        "Breacher Delta, are you there? Come in, Delta!\n\n...\n\nAh, you're finally awake. Here's the situation: " +
            "something went wrong with the cross-dimensional warp. Pieces of your suit are scattered everywhere. " +
            "Quite frankly, it's a miracle you're alive. According to our scans, the cross-dimensional warp-drive is just beneath you, " +
            "and you'll need to recover it if we're going to get you back home. However, it seems that we must first restore " +
            "more of your suit's functionalities before you can access it. We're picking up the signal of " +
            "another suit piece far below you, try heading down about 35 meters.\n\nGodspeed, Breacher.",
        "You've recovered the slash ability. That's good, but it's not going to get you to the warp-drive. " +
            "We're detecting another suit piece to your immediate left, but our scans indicate you'll need to head up first to access it. " +
            "Remember, Breacher, slashing right as you jump will allow you to leap much higher, or farther depending on the angle you slash at.",
        "That's the grappling hook. You can use it swing your way out of that pit, but again, it doesn't help you reach the warp-drive. " +
            "We're picking up one last scan. This should be it. It's above and to the right of the location you first woke up at. Good luck, Delta.",
        "There it is. The blink-gate generator. With enough velocity, this device will allow you to teleport through thin walls. " +
            "This should be all you need to recover the cross-dimensional warp-drive. We look forward to your return. Godspeed, Breacher.",
    ];

    /**
     * @param {GameEngine} game
     * @param {AssetManager} assetManager
     */
    constructor(game, assetManager) {
        this.game = game;
        this.assetManager = assetManager;
        this.map = null;
        this.jumpHeight = 550;
        this.debugMode = false;
        this.removeFromWorld = false;

        // make height slightly lower so that player can fit through 96px areas
        const height = 96 - 0.1;
        const width = 36;

        this.position = new Position(525, 500);
        this.topCollider = new ColliderRect(
            this.position,
            -width / 2,
            -height / 2 + 0.1,
            width,
            height - Tile.STEP_SIZE,
            0,
            this
        );
        this.middleCollider = new ColliderRect(
            this.position,
            -width / 2,
            -height / 2 + height - Tile.STEP_SIZE,
            width,
            Tile.STEP_SIZE,
            0,
            this
        );
        this.bottomCollider = new ColliderRect(
            this.position,
            -width / 2,
            -height / 2 + height,
            width,
            Tile.STEP_SIZE * 1.5,
            0,
            this,
            true
        );
        this.stairController = new StairController(
            this.middleCollider,
            this.bottomCollider,
            Infinity
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

        this.maxSpeed = 350;
        this.walkAccel = 1050;
        this.aimVector = new Vector(1, 0);

        /** @type {Animator[]} */
        this.animations = [];
        this.loadAnimations(this.assetManager);

        this.load();
    }

    #save() {
        PlayerSaveState.save({
            position: this.position.asVector(),
            canShoot: this.canShoot,
            canSlash: this.canSlash,
            canTeleport: this.canTeleport,
        });
    }

    /**
     * @param {SaveState | undefined} saveState
     */
    load(saveState) {
        // saved states
        if (saveState !== undefined) {
            const { position, canShoot, canSlash, canTeleport } = saveState;
            this.position.set(position.x, position.y);
            this.canShoot = canShoot;
            this.canSlash = canSlash;
            this.canTeleport = canTeleport;
        } else {
            // default unsaved states
            this.sprite.setHorizontalFlip(false);
            this.sprite.setState("idle");

            this.facing = 1; // 1 = right, -1 = left, used for calculations, should never be set to 0
            this.jumped = 0; // 0 = can jump, 1 = can vary gravity, 2 = can't vary gravity 3 = grappling
            this.jumpBuffer = 0;

            this.animationGroundFrames = 0;
            this.physicsGroundFrames = 0;

            this.velocity = new Vector(0, 0);

            this.health = 100;
            this.objectiveIndex = 0;

            this.canShoot = this.debugMode;
            this.canSlash = this.debugMode;
            this.canTeleport = this.debugMode;

            GUI.printStdOut(Player.Objectives[this.objectiveIndex]);
        }
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

        this.calcMovement();

        this.arm.update();
        this.teleport.update();

        this.runCollisions(origin);

        this.setState();

        this.updateGUI();
    }

    updateGUI() {
        if (this.health <= 0) {
            GUI.clearStdOut();
            this.assetManager.playAsset("sounds/gameover.wav");
            GUI.showDeathScreen();
            this.removeFromWorld = true;
            return;
        }

        GUI.setHealth(this.health / 100);

        if (this.canSlash && this.objectiveIndex === 0) {
            this.#printNextObjective();
            GUI.showSlashControl();
            this.#save();
        }
        if (this.canShoot && this.objectiveIndex === 1) {
            this.#printNextObjective();
            GUI.showHookControl();
            this.#save();
        }
        if (this.canTeleport && this.objectiveIndex === 2) {
            this.#printNextObjective();
            GUI.showTeleportControl();
            this.#save();
        }
    }

    checkInput() {
        var move = 0;
        var grounded = this.isPhysicsGrounded();
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
            (this.jumped < 3 || this.arm.grappleCheck(move)) &&
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
        if (this.game.buttons[0]) this.arm.fire();
        if (this.canSlash && (this.game.keys["s"] || this.game.buttons[3])) this.arm.slash();
        if (this.canTeleport && this.teleport.teleport(this.game.keys["w"]) === true) {
            this.arm.grapple(false);
        }
        if (this.canShoot && this.game.buttons[2] != null)
            this.arm.grapple(this.game.buttons[2], move);

        // Do we apply ground friction to the player?
        var traction =
            this.isPhysicsGrounded() &&
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
        this.velocity.y += gravity * this.game.clockTick;
    }

    runCollisions(origin) {
        const displacement = this.position.asVector().subtract(origin);
        const topAdjustment = this.topCollider.resolveCollisions(displacement, 1, 6);
        this.position.add(topAdjustment);

        const stairAdjustment = this.stairController.updateState(displacement);
        this.position.add(stairAdjustment);

        // horizontal collision
        if (topAdjustment.x !== 0 || stairAdjustment.x !== 0) {
            this.velocity.x = 0;
        }

        // vertical collision
        if (topAdjustment.y !== 0 || stairAdjustment.y !== 0) {
            this.velocity.y = 0;
        }

        if (topAdjustment.y < 0 || stairAdjustment.y !== 0) {
            this.animationGroundFrames = 8;
            this.physicsGroundFrames = 2;
        } else {
            // guarantee some frames of "grounded" where the first is this one and the second causes player to fall into hitbox (triggers collision)
            this.animationGroundFrames -= 1;
            this.physicsGroundFrames -= 1;
        }
    }

    setState() {
        if (this.isAnimationGrounded()) {
            if (this.velocity.x == 0) this.sprite.setState("idle");
            else if (this.velocity.x * this.facing > 0) this.sprite.setState("running");
            else this.sprite.setState("bwrunning");
        } else {
            if (this.velocity.y <= 10) {
                if (this.velocity.x * this.facing >= -1) this.sprite.setState("airLeanBack");
                else this.sprite.setState("airLeanFront");
            } else {
                if (this.velocity.x * this.facing >= -1) this.sprite.setState("airLeanFront");
                else this.sprite.setState("airLeanBack");
            }
        }
    }

    isPhysicsGrounded() {
        return this.physicsGroundFrames > 0;
    }

    isAnimationGrounded() {
        return this.animationGroundFrames > 0;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        this.teleport.draw(ctx);
        this.arm.draw(ctx);
        this.sprite.drawSprite(this.game.clockTick, ctx);

        if (this.debugMode) {
            ctx.save();
            ctx.strokeStyle = "yellow";

            for (const collider of [this.topCollider, this.middleCollider, this.bottomCollider]) {
                const bounds = collider.getBounds();
                ctx.strokeRect(
                    bounds.xStart - this.game.camera.x,
                    bounds.yStart - this.game.camera.y,
                    bounds.xEnd - bounds.xStart,
                    bounds.yEnd - bounds.yStart
                );
            }

            ctx.restore();
        }
    }

    #printNextObjective() {
        GUI.printStdOut(Player.Objectives[++this.objectiveIndex]);
    }
}
