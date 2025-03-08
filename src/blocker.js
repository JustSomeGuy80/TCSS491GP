/** @typedef {import("./engine/animator")} */
/** @typedef {import("./components/ColliderRect")} */
/** @typedef {import("./components/position")} */
/** @typedef {import("./components/sprite")} */
/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./primitives/vector")} */

class Blocker {
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
        this.objectID = 3;
        this.lastAttack = 0;

        this.position = new Position(x, y);
        this.collider = new ColliderRect(this.position, -43, -48, 24 * 3, 43 * 3, 3, this);
        this.sprite = new Sprite(this.position, this.game, 3, -43, -48, {
            running: new Animator(
                this.assetManager.getAsset("anims/blocker.png"),
                0,
                0,
                24,
                43,
                2,
                0.2
            ),
            death: new Animator(
                this.assetManager.getAsset("anims/run.png"),
                1000,
                0,
                24,
                43,
                4,
                0.2
            ),
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
        this.animations.push(
            new Animator(assetManager.getAsset("anims/slasher.png"), 0, 0, 43, 48, 7, 0.2)
        );
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
        // Fire every 6 seconds
        if (this.game.timer.gameTime >= this.lastAttack) {
            let attackRect = new ColliderRect(
                this.position,
                -43,
                -48,
                43 * 3,
                48 * 3,
                4,
                this,
                true
            );
            attackRect.expandW(6);
            attackRect.expandH(5);

            const collisions = attackRect.getCollision();
            let attacked = false;
            const blockSize = 48;

            for (const collision of collisions) {
                if (!attacked && collision.id === 0) {
                    const gridSize = 5;

                    const snappedX = Math.floor(collision.owner.position.x / blockSize) * blockSize;
                    const snappedY = Math.floor(collision.owner.position.y / blockSize) * blockSize;

                    const side = Math.floor(Math.random() * 4);

                    const patternOffset = Math.floor(gridSize / 2) * blockSize;
                    const baseX = snappedX - patternOffset;
                    const baseY = snappedY - patternOffset;

                    switch (side) {
                        case 0: // Top
                            for (let col = 0; col < gridSize; col++) {
                                const x = baseX + col * blockSize;
                                const y = baseY;
                                this.game.addEntity(new Block(this.game, this.assetManager, x, y));
                            }
                            break;
                        case 1: // Bottom
                            for (let col = 0; col < gridSize; col++) {
                                const x = baseX + col * blockSize;
                                const y = baseY + (gridSize - 1) * blockSize;
                                this.game.addEntity(new Block(this.game, this.assetManager, x, y));
                            }
                            break;
                        case 2: // Left
                            for (let row = 0; row < gridSize; row++) {
                                const x = baseX;
                                const y = baseY + row * blockSize;
                                this.game.addEntity(new Block(this.game, this.assetManager, x, y));
                            }
                            break;
                        case 3: // Right
                            for (let row = 0; row < gridSize; row++) {
                                const x = baseX + (gridSize - 1) * blockSize;
                                const y = baseY + row * blockSize;
                                this.game.addEntity(new Block(this.game, this.assetManager, x, y));
                            }
                            break;
                    }
                    attacked = true;
                    break;
                }
            }
            this.lastAttack = this.game.timer.gameTime + 6;
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
        this.velocity.x = this.facing * this.moveSpeed;
        this.velocity.y += this.gravity * this.game.clockTick;

        this.position.x += this.velocity.x * this.game.clockTick;
        this.position.y += this.velocity.y * this.game.clockTick;
    }

    runCollisions(origin) {
        const readjustment = this.collider.resolveCollisions(
            this.position.asVector().subtract(origin),
            1
        );
        this.position.add(readjustment);

        // horizontal collision
        if (readjustment.x !== 0) {
            this.velocity.x = 0;
            // turn around after hitting wall
            this.facing *= -1;
        }
        // vertical collision
        if (readjustment.y !== 0) {
            this.velocity.y = 0;
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
            ctx.strokeStyle = "yellow";
            ctx.strokeRect(
                bounds.xStart - this.game.camera.x,
                bounds.yStart - this.game.camera.y,
                bounds.xEnd - bounds.xStart,
                bounds.yEnd - bounds.yStart
            );

            let attackRect = new ColliderRect(
                this.position,
                -43,
                -48,
                43 * 3,
                48 * 3,
                4,
                this,
                true
            );
            attackRect.expandW(6);
            attackRect.expandH(5);
            const attackBounds = attackRect.getBounds();
            ctx.strokeStyle = "lightblue";
            ctx.strokeRect(
                attackBounds.xStart - this.game.camera.x,
                attackBounds.yStart - this.game.camera.y,
                attackBounds.xEnd - attackBounds.xStart,
                attackBounds.yEnd - attackBounds.yStart
            );
        }
    }
}
