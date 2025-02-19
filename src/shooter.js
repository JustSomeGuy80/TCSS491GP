/** @typedef {import("./engine/animator")} */
/** @typedef {import("./components/ColliderRect")} */
/** @typedef {import("./components/position")} */
/** @typedef {import("./components/sprite")} */
/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./primitives/vector")} */

class Shooter {
    /**
     * @param {GameEngine} game
     * @param {AssetManager} assetManager
     * @param {number} x Initial X position
     * @param {number} y Initial Y position
     */
    constructor(game, assetManager, x, y, player) {
        this.game = game;
        this.assetManager = assetManager;
        this.debugMode = true;
        this.active = true;
        this.health = 3;
        this.removeFromWorld = false;
        this.objectID = 3;
        this.lastAttack = 0;
        this.bulletSpeed = 750;
        this.bullets = [];
        this.player = player

        this.position = new Position(x, y);
        this.collider = new ColliderRect(this.position, -43, -48, 43 * 3, 48 * 3, 3, this);
        this.sprite = new Sprite(this.position, this.game, 3, -43, -48, {
            running: new Animator(this.assetManager.getAsset("anims/slasher.png"), 0, 0, 43, 48, 7, 0.2),
            death: new Animator(this.assetManager.getAsset("anims/run.png"), 1000, 0, 32, 32, 4, 0.2)
        });

        this.moveSpeed = 200;
        this.facing = 1; // 1 = right, -1 = left
        this.velocity = new Vector(0, 0);
        this.gravity = 1000; // Enable gravity for falling

        this.patrolLeft = x - 200;
        this.patrolRight = x + 200;

        this.sprite.setHorizontalFlip(false);
        this.sprite.setState("running");

        /** @type {Animator[]} */
        this.animations = [];
        this.loadAnimations(this.assetManager);
    }

    loadAnimations(assetManager) {
        this.animations.push(new Animator(assetManager.getAsset("anims/slasher.png"), 0, 0, 43, 48, 7, 0.2));
    }

    update() {
        if (this.active) {
            const origin = this.position.asVector();
            this.calcMovement();
            this.runCollisions(origin);
            this.attack();
            this.checkPatrolBounds();
            this.flip();
            this.death();
            this.bulletUpdate();
        }
    }

    attack() {
        // Fire every 3 seconds
        if (this.game.timer.gameTime >= this.lastAttack) {
            // Calculate the vector from shooter to player
            const shooterPos = this.position.asVector();
            const playerPos = this.player.position.asVector();
            const aimVector = playerPos.subtract(shooterPos).normalize();

            const bulPos = shooterPos.add(aimVector.multiply(10));

            this.bullets.push(new Bullet(
                this.game,
                this.assetManager,
                bulPos.x,
                bulPos.y,
                aimVector,
                this.bulletSpeed,
                1
            ));

            // Reset the attack cooldown
            this.lastAttack = this.game.timer.gameTime + 3;
        }
    }


    bulletUpdate() {
        let newBullets = [];
        this.bullets.forEach(el => {
            el.update();
            if (!el.unload) {
                newBullets.push(el);
            }
        });
        this.bullets = newBullets;
    }

    death() {
        if (this.health <= 0) {
            this.sprite.setState("death");
            this.active = false;
            this.removeFromWorld = true;

            if (Math.random() < 0.25) {
                this.game.addEntity(new Pickup(this.game, this.assetManager, this.position.x, this.position.y, 'health'))
            }
        }
    }

    calcMovement() {
        this.velocity.x = this.facing * this.moveSpeed;
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
                    let nearX = (xStart - this.collider.w / 1.5 - origin.x) / difference.x;
                    let farX = (xEnd + this.collider.w / 1.5 - origin.x) / difference.x;
                    let nearY = (yStart - this.collider.h / 1.5 - origin.y) / difference.y;
                    let farY = (yEnd + this.collider.h / 1.5 - origin.y) / difference.y;

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
                        this.facing = -1;
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
        if (this.position.x >= this.patrolRight && this.facing === 1) {
            this.facing = -1;
        } else if (this.position.x <= this.patrolLeft && this.facing === -1) {
            this.facing = 1;
        }
    }

    flip() {
        this.sprite.setHorizontalFlip(this.facing === -1);
    }

    draw(ctx) {
        this.sprite.drawSprite(this.game.clockTick, ctx);

        this.bullets.forEach(el => {
            el.draw(ctx);
        });

        if (this.debugMode) {
            const bounds = this.collider.getBounds();
            ctx.strokeStyle = 'yellow';
            ctx.strokeRect(
                bounds.xStart - this.game.camera.x,
                bounds.yStart - this.game.camera.y,
                bounds.xEnd - bounds.xStart,
                bounds.yEnd - bounds.yStart);
        }
    }
}