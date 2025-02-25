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
        this.lastAttack = 0;

        this.windupDuration = 1;
        this.windupTimer = 0;
        this.inWindup = false;

        this.position = new Position(x, y);
        this.collider = new ColliderRect(this.position, -30, -48, 30 * 3, 48 * 3, 3, this);
        this.sprite = new Sprite(this.position, this.game, 3, -43, -48, {
            running: new Animator(
                this.assetManager.getAsset("anims/slasher.png"),
                0,
                0,
                43,
                48,
                7,
                0.1
            ),
            death: new Animator(
                this.assetManager.getAsset("anims/run.png"),
                1000,
                0,
                32,
                32,
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
            new Animator(
                this.assetManager.getAsset("anims/slasher.png"),
                0,
                0,
                43 * 8,
                48 * 8,
                7,
                0.1
            )
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
        let attackRect = new ColliderRect(this.position, -43, -48, 43 * 3, 48 * 3, 4, this, true);
        attackRect.expandW(3);
        attackRect.expandH(1.5);

        if (!this.inWindup && this.lastAttack < this.game.timer.gameTime) {
            let playerDetected = false;
            const collisions = attackRect.getCollision();
            while (true) {
                const { value: collision, done } = collisions.next();
                if (done) break;
                if (collision.id === 0) {
                    // Player
                    playerDetected = true;
                    break;
                }
            }

            if (playerDetected) {
                this.inWindup = true;
                this.windupTimer = this.windupDuration;
                // TODO WINDUP ANIMATION
            }
        }

        if (this.inWindup) {
            this.windupTimer -= this.game.clockTick;
            if (this.windupTimer <= 0) {
                let hitPlayer = false;
                const collisions = attackRect.getCollision();
                while (true) {
                    const { value: collision, done } = collisions.next();
                    if (done) break;
                    if (collision.id === 0) {
                        collision.owner.health -= 35;
                        hitPlayer = true;
                        break;
                    }
                }
                if (hitPlayer) {
                    const slash = new SlashEffect(
                        this.game,
                        this.assetManager,
                        this.position.x,
                        this.position.y,
                        this.facing,
                        this
                    );
                    this.game.addEntity(slash);
                    this.moveSpeed = 0;
                }
                this.inWindup = false;
                this.lastAttack = this.game.timer.gameTime + 3;
            }
        }
    }

    death() {
        if (this.health <= 0) {
            this.active = false;
            this.removeFromWorld = true;
            // if (Math.random() < 0.25) {
            //     this.game.addEntity(
            //         new Pickup(
            //             this.game,
            //             this.assetManager,
            //             this.position.x,
            //             this.position.y,
            //             "health"
            //         )
            //     );
            // }
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
        if (this.active) this.sprite.drawSprite(this.game.clockTick, ctx);

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
            attackRect.expandW(3);
            attackRect.expandH(1.5);
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
            slash: new Animator(
                this.assetManager.getAsset("anims/slasherslash.png"),
                0,
                0,
                56,
                32,
                4,
                0.1,
                false
            ),
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
