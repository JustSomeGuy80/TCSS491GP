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

        this.position = new Position(x, y);
        this.collider = new ColliderRect(this.position, -28, -48, 56, 96);
        this.sprite = new Sprite(this.position, 3, -48, -48, {
            running: new Animator(this.assetManager.getAsset("anims/slasher.png"), 0, 0, 32, 32, 4, 0.2)
        });

        this.moveSpeed = 200;
        this.moveDirection = 1; // 1 = right, -1 = left
        this.velocity = new Vector(0, 0);
        this.gravity = 1000; // Enable gravity for falling

        this.patrolLeft = x - 200;
        this.patrolRight = x + 10000;

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
        const originalPosition = new Vector(this.position.x, this.position.y);
        this.handleMovement();
        this.handleCollisions(originalPosition);
        this.checkPatrolBounds();
        this.setState();
    }

    handleMovement() {
        this.velocity.x = this.moveDirection * this.moveSpeed;
        this.velocity.y += this.gravity * this.game.clockTick;

        this.position.x += this.velocity.x * this.game.clockTick;
        this.position.y += this.velocity.y * this.game.clockTick;
    }

    handleCollisions(originalPosition) {
        const target = new Vector(this.position.x, this.position.y);
        let hitHorizontal = false;

        const collisions = this.collider.getCollision();
        while (true) {
            const { value: collision, done } = collisions.next();
            if (done) break;

            const { xStart, xEnd, yStart, yEnd } = collision.getBounds();
            const difference = target.subtract(originalPosition);

            if (difference.getMagnitude() > 0) {
                let nearX = (xStart - this.collider.w / 2 - originalPosition.x) / difference.x;
                let farX = (xEnd + this.collider.w / 2 - originalPosition.x) / difference.x;
                let nearY = (yStart - this.collider.h / 2 - originalPosition.y) / difference.y;
                let farY = (yEnd + this.collider.h / 2 - originalPosition.y) / difference.y;

                if (nearX > farX) {
                    [farX, nearX] = [nearX, farX];
                }
                if (nearY > farY) {
                    [farY, nearY] = [nearY, farY];
                }

                const horizontalHit = nearX > nearY;

                let hitNear;
                if (horizontalHit) {
                    hitNear = nearX;
                } else {
                    hitNear = nearY;
                }

                let normal;
                if (horizontalHit) {
                    if (difference.x >= 0) {
                        normal = new Vector(-1, 0);
                    } else {
                        normal = new Vector(1, 0);
                    }
                    hitHorizontal = true;
                } else {
                    if (difference.y >= 0) {
                        normal = new Vector(0, -1);
                    } else {
                        normal = new Vector(0, 1);
                    }
                }

                if (hitNear >= 0 && hitNear <= 1 && isFinite(hitNear)) {
                    const hitPosition = originalPosition.add(difference.multiply(hitNear));

                    if (horizontalHit) {
                        this.velocity.x = 0;
                        this.position.x = hitPosition.x;
                    } else {
                        this.velocity.y = 0;
                        this.position.y = hitPosition.y;
                    }

                    this.position.add(normal.multiply(0.01));
                }
            }
        }

        if (hitHorizontal) {
            this.moveDirection *= -1;
            this.velocity.x = this.moveDirection * this.moveSpeed;
        }
    }

    checkPatrolBounds() {
        if (this.position.x >= this.patrolRight && this.moveDirection === 1) {
            this.moveDirection = -1;
        } else if (this.position.x <= this.patrolLeft && this.moveDirection === -1) {
            this.moveDirection = 1;
        }
    }

    setState() {
        this.sprite.setHorizontalFlip(this.moveDirection === -1);
    }

    draw(ctx) {
        this.sprite.offset.x -= this.game.camera.x;
        this.sprite.drawSprite(this.game.clockTick, ctx);
        this.sprite.offset.x += this.game.camera.x;

        if (this.debugMode) {
            this.collider.draw(ctx);
            this.position.draw(ctx);
        }
    }
}