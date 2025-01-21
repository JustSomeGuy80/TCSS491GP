/** @typedef {import("./engine/animator")} */
/** @typedef {import("./components/ColliderRect")} */
/** @typedef {import("./components/position")} */
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
        this.tempGrounded = 500;
        this.jumpHeight = 550;
        this.debugMode = true;

        this.position = new Position(500, this.tempGrounded - 100);
        this.collider = new ColliderRect(this.position, 0, 0, 56, 96);
        this.sprite = new Sprite(this.position, 3, -48, -48, {
            idle: new Animator(assetManager.getAsset("anims/idle.png"), 0, 0, 32, 32, 2, 2),
            running: new Animator(assetManager.getAsset("anims/run.png"), 0, 0, 32, 32, 4, 0.2),
            rising: new Animator(assetManager.getAsset("anims/jump.png"), 0, 0, 32, 32, 1, 1),
            falling: new Animator(assetManager.getAsset("anims/jump.png"), 32, 0, 32, 32, 1, 1),
        });

        this.sprite.setHorizontalFlip(false); // 0 = right, 1 = left
        this.sprite.setState("idle"); // 0 = idle, 1 = running // 2 = running backwards // 3 = rising 4 = falling

        this.jumped = 0; // 0 = can jump, 1 = can vary gravity, 2 = can't vary gravity

        this.velocity = new Vector(0, 0);
        this.maxSpeed = 350;
        this.walkAccel = 1050;

        /** @type {Animator[]} */
        this.animations = [];
        this.loadAnimations(assetManager);

        // TEMP (standing on hitboxes is not recognized by Player.isGrounded())
        this.groundOverride = 0;
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

        // TEMPORARY IMPLEMENTATION OF HITBOXES
        // bugs:
        // - (sort of a bug) when you are in the left side of a wall and go left, you tp to the right of wall
        //      - to test, spawn the player inside of a wall in the constructor
        const collisions = this.collider.getCollision();
        let target = this.position.asVector();

        while (true) {
            const { value: collision, done } = collisions.next();

            if (done) {
                this.groundOverride -= 1;
                break;
            }

            const { xStart, xEnd, yStart, yEnd } = collision.getBounds();
            const difference = target.subtract(origin);

            // TEMP (hacky solution but when player hugs wall by going left and switches directions, they tp across wall. This prevents that since switching direction slows you down.)
            if (difference.getMagnitude() >= 0.0) {
                let nearX = (xStart - this.collider.w / 2 - origin.x) / difference.x;
                let farX = (xEnd + this.collider.w / 2 - origin.x) / difference.x;
                let nearY = (yStart - this.collider.h / 2 - origin.y) / difference.y;
                let farY = (yEnd + this.collider.h / 2 - origin.y) / difference.y;

                if (nearX > farX) {
                    [farX, nearX] = [nearX, farX];
                }
                if (nearY > farY) {
                    [farY, nearY] = [nearY, farY];
                }

                const horizontalHit = nearX > nearY;
                const hitNear = horizontalHit ? nearX : nearY;

                let normal = undefined;
                if (horizontalHit) {
                    if (difference.x >= 0) {
                        normal = new Vector(-1, 0);
                    } else {
                        normal = new Vector(1, 0);
                    }
                } else {
                    if (difference.y >= 0) {
                        normal = new Vector(0, -1);
                    } else {
                        normal = new Vector(0, 1);
                    }
                }

                if (hitNear && isFinite(hitNear)) {
                    const { x, y } = origin.add(difference.multiply(hitNear));

                    if (horizontalHit) {
                        this.velocity.x = 0;
                        this.position.set(x, this.position.y);
                    } else {
                        // guarantee some frames of "grounded" where the first is this one and the second causes player to fall into hitbox (triggers collision)
                        this.groundOverride = 4;
                        this.velocity.y = 0;
                        this.position.set(this.position.x, y);
                    }

                    // force player to not touch a wall anymore after collision resolution
                    // this might get in the way of some potential features
                    this.position.add(normal.multiply(0.01));
                }
            }
        }

        this.setState();
    }

    checkInput() {
        var move = 0;
        var grounded = this.isGrounded();
        if (this.game.keys["d"]) move += 1;
        if (this.game.keys["a"]) move -= 1;

        if (this.game.keys[" "]) {
            if (grounded && this.jumped == 0) {
                this.velocity.y = -this.jumpHeight;
                this.jumped = 1;
            }
        } else {
            if (grounded) this.jumped = 0;
            else if (this.velocity.y < 0 && this.jumped == 1)
                this.velocity.y -= this.velocity.y * 8 * this.game.clockTick;
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

        //Set facing direction
        if (move == -1) this.sprite.setHorizontalFlip(true);
        if (move == 1) this.sprite.setHorizontalFlip(false);

        // Do we apply ground friction to the player?
        var traction =
            this.isGrounded() &&
            (move == 0 ||
                (move == 1 && this.velocity.x < 0) ||
                (move == -1 && this.velocity.x > 0) ||
                (this.velocity.x > this.maxSpeed && this.velocity.x < -this.maxSpeed));
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
        if (this.position.y > this.tempGrounded) this.position.y = this.tempGrounded;

        // player needs to be put into the ground anyways for game to detect ground collision
        // if (!this.isGrounded()) this.velocity.y += gravity * this.game.clockTick;

        this.velocity.y += gravity * this.game.clockTick;
    }

    setState() {
        if (this.isGrounded()) {
            if (this.velocity.x == 0) this.sprite.setState("idle");
            else this.sprite.setState("running");
        } else {
            if (this.velocity.y < 0) this.sprite.setState("rising");
            else this.sprite.setState("falling");
        }

        // TEMP (running into wall causes alternation between running and idle) for 1 frame each
        if (this.game.keys["d"] || this.game.keys["a"]) {
            this.sprite.setState("running");
        }
    }

    isGrounded() {
        //TEMPORARY
        return this.groundOverride > 0 || this.position.y >= this.tempGrounded;
    }

    draw(ctx) {
        this.sprite.drawSprite(this.game.clockTick, ctx);

        if (this.debugMode) {
            this.collider.draw(ctx);
            this.position.draw(ctx);
        }
    }
}
