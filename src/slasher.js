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
        this.debugMode = true;
        this.active = true;
        this.health = 3;
        this.removeFromWorld = false;
        this.lastAttack = 0;

        this.position = new Position(x, y);
        this.collider = new ColliderRect(this.position, -43, -48, 43 * 3, 48 * 3, 3, this);
        this.sprite = new Sprite(this.position, this.game, 3, -43, -48, {
            running: new Animator(this.assetManager.getAsset("anims/slasher.png"), 0, 0, 43, 48, 7, 0.1),
            death: new Animator(this.assetManager.getAsset("anims/run.png"), 1000, 0, 32, 32, 4, 0.2),
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
        this.animations.push(new Animator(this.assetManager.getAsset("anims/slasher.png"), 0, 0, 43 * 8, 48 * 8, 7, 0.1));
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
        }
    }

    attack() {
        if (this.lastAttack < this.game.timer.gameTime) {
            let hitPlayer = false;
            const attackRect = new ColliderRect(this.position, -43, -48, 43 * 3, 48 * 3, 4, this);
            attackRect.expandW(3);
            attackRect.expandH(1.5);

            const collisions = attackRect.getCollision();
            while (true) {
                const { value: collision, done } = collisions.next();
                if (done) break;
                if (collision.id === 0) { // Player
                    collision.owner.health -= 50;
                    hitPlayer = true;
                }
            }

            if (hitPlayer) {
                const slash = new SlashEffect(this.game, this.assetManager, this.position.x, this.position.y, this.facing, this);
                this.game.addEntity(slash);
                this.moveSpeed = 0;
                this.lastAttack = this.game.timer.gameTime + 3;
            }
        }
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

        if (this.debugMode) {
            const bounds = this.collider.getBounds();
            ctx.strokeStyle = 'yellow';
            ctx.strokeRect(
                bounds.xStart - this.game.camera.x,
                bounds.yStart,
                bounds.xEnd - bounds.xStart,
                bounds.yEnd - bounds.yStart);

            let attackRect = new ColliderRect(this.position, -43, -48, 43 * 3, 48 * 3, 4, this);
            attackRect.expandW(3);
            attackRect.expandH(1.5);
            const attackBounds = attackRect.getBounds();
            ctx.strokeStyle = 'lightblue';
            ctx.strokeRect(
                attackBounds.xStart - this.game.camera.x,
                attackBounds.yStart,
                attackBounds.xEnd - attackBounds.xStart,
                attackBounds.yEnd - attackBounds.yStart);
        }
    }
}

class SlashEffect {
    constructor(game, assetManager, x, y, facing, parent) {
        this.game = game;
        this.assetManager = assetManager;
        this.x = x;
        this.y = y;
        this.removeFromWorld = false;
        this.duration = 0.4; // 0.1s per frame * 4 frames
        this.timer = 0;
        this.parent = parent;

        this.position = new Position(this.x, this.y);
        this.sprite = new Sprite(this.position, game, 7, -43 * 4, -48 * 2, {
            slash: new Animator(this.assetManager.getAsset("anims/slasherslash.png"), 0, 0, 56, 32, 4, 0.1, false)
        });
        this.sprite.setHorizontalFlip(facing === -1);
        this.sprite.setState("slash");
    }

    update() {
        this.timer += this.game.clockTick;
        if (this.timer >= this.duration) {
            this.removeFromWorld = true;
            this.parent.moveSpeed = 200;
        }
    }

    draw(ctx) {
        this.sprite.drawSprite(this.game.clockTick, ctx);
    }
}