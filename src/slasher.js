/** @typedef {import("./engine/animator")} */
/** @typedef {import("./components/ColliderRect")} */
/** @typedef {import("./components/position")} */
/** @typedef {import("./components/sprite")} */
/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./primitives/vector")} */

class Slasher {
    /**
     * @param {GameEngine} game
     * @param {AssetManager} assetManager
     * @param {number} x Initial X position
     * @param {number} y Initial Y position
     */
    constructor(game, assetManager, x, y) {
        this.game = game;
        this.assetManager = assetManager;
        this.debugMode = false;
        this.active = true;
        this.health = 3;
        this.removeFromWorld = false;

        this.position = new Position(x, y);
        this.collider = new ColliderRect(this.position, -28, -48, 56, 96, 3, this);
        this.sprite = new Sprite(this.position, this.game,3, -48, -48, {
            running: new Animator(this.assetManager.getAsset("anims/slasher.png"), 0, 0, 32, 32, 4, 0.2),
            death: new Animator(this.assetManager.getAsset("anims/run.png"), 1000, 0, 32, 32, 4, 0.2)
        });

        this.moveSpeed = 200;
        this.moveDirection = 1; // 1 = right, -1 = left
        this.velocity = new Vector(0, 0);
        this.gravity = 1000; // Enable gravity for falling

        this.patrolLeft = x - 200;
        this.patrolRight = x + 1000;

        this.sprite.setHorizontalFlip(false);
        this.sprite.setState("running");

        /** @type {Animator[]} */
        this.animations = [];
        this.loadAnimations(this.assetManager);
    }

    loadAnimations(assetManager) {
        this.animations.push(new Animator(assetManager.getAsset("anims/slasher.png"), 0, 0, 32, 32, 4, 0.2));
    }

    update() {
        if (this.active) {
            const origin = this.position.asVector();
            this.calcMovement();
            this.runCollisions(origin);
            this.checkPatrolBounds();
            this.flip();
            this.death();
        }
    }

    death() {
        if (this.health <= 0) {
            this.sprite.setState("death");
            this.active = false;
            this.removeFromWorld = true;
        }
    }

    calcMovement() {
        this.velocity.x = this.moveDirection * this.moveSpeed;
        this.velocity.y += this.gravity * this.game.clockTick;

        this.position.x += this.velocity.x * this.game.clockTick;
        this.position.y += this.velocity.y * this.game.clockTick;
    }

    runCollisions(origin) {
        const collisions = this.collider.getCollision();
        let target = this.position.asVector();

        while (true) {
            const { value: collision, done } = collisions.next();
            if (done) break;

            const { xStart, xEnd, yStart, yEnd } = collision.getBounds();
            const difference = target.subtract(origin);

            if (collision.id === 0) { // player

            }

            else if (collision.id === 1) { // platform
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
                        this.moveDirection = -1;
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
                        const {x, y} = origin.add(difference.multiply(hitNear));

                        if (horizontalHit) {
                            this.velocity.x = 0;
                            this.position.set(x, this.position.y);
                        } else {
                            // guarantee some frames of "grounded" where the first is this one and the second causes player to fall into hitbox (triggers collision)
                            this.groundOverride = 4;
                            this.velocity.y = 0;
                            this.position.set(this.position.x, y);
                        }
                    }
                }
            }
        }
    }

    checkPatrolBounds() {
        if (this.position.x >= this.patrolRight && this.moveDirection === 1) {
            this.moveDirection = -1;
        } else if (this.position.x <= this.patrolLeft && this.moveDirection === -1) {
            this.moveDirection = 1;
        }
    }

    flip() {
        this.sprite.setHorizontalFlip(this.moveDirection === -1);
    }

    draw(ctx) {
        this.sprite.drawSprite(this.game.clockTick, ctx);

        if (this.debugMode) {
            const bounds = this.collider.getBounds();
            ctx.strokeStyle = 'yellow';
            ctx.strokeRect(
                bounds.xStart - this.game.camera.x,
                bounds.yStart,
                bounds.xEnd - bounds.xStart,
                bounds.yEnd - bounds.yStart);
        }
    }
}