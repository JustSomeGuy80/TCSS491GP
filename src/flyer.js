class Flyer {
    /**
     * @param {GameEngine} game
     * @param {AssetManager} assetManager
     * @param {number} x Initial X position
     * @param {number} y Initial Y position
     */
    constructor(game, assetManager, x, y, player) {
        this.game = game;
        this.assetManager = assetManager;
        this.debugMode = false;
        this.active = true;
        this.health = 2;
        this.removeFromWorld = false;
        this.player = player;
        this.lastAttack = 0;

        this.position = new Position(x, y);
        this.collider = new ColliderRect(this.position, -12, -26, 64, 30 * 3, 3, this);
        this.sprite = new Sprite(this.position, this.game, 3, -43, -48, {
            running: new Animator(
                this.assetManager.getAsset("anims/flyer.png"),
                0,
                0,
                43,
                48,
                8,
                0.2
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

        this.moveSpeed = 0;
        this.chasing = false;
        this.facing = 1; // 1 = right, -1 = left
        this.velocity = new Vector(0, 0);
        this.gravity = 0;

        this.sprite.setHorizontalFlip(false);
        this.sprite.setState("running");
    }

    update() {
        if (this.active) {
            if (this.damageCooldown > 0) {
                this.damageCooldown -= this.game.clockTick;
            }
            const origin = this.position.asVector();
            this.attack();
            this.calcMovement();
            this.runCollisions(origin);
            this.flip();
            this.death();
        }
    }

    attack() {
        let colliderRect = new ColliderRect(this.position, -43, -48, 43 * 3, 48 * 3, 4, this, true);
        let attackRect = new ColliderRect(this.position, -43, -48, 43 * 3, 48 * 3, 4, this, true);
        attackRect.expandW(6);
        attackRect.expandH(5);

        const attackIterator = attackRect.getCollision();
        while (true) {
            const { value: attackCollision, done } = attackIterator.next();
            if (done) break;
            if (attackCollision.id === 0) {
                if (!this.chasing) {
                    this.chasing = true;
                    this.moveSpeed = 250;
                }
            }
        }

        const colliderIterator = colliderRect.getCollision();
        while (true) {
            const { value: collision, done } = colliderIterator.next();
            if (done) break;
            if (collision.id === 0 && this.game.timer.gameTime > this.lastAttack) {
                this.assetManager.playAsset("sounds/player_hurt.wav");
                collision.owner.health -= 40;
                this.lastAttack = this.game.timer.gameTime + 2;
            }
        }
    }

    calcMovement() {
        if (this.chasing) {
            const flyerPos = this.position.asVector();
            const playerPos = this.player.position.asVector();
            const direction = playerPos.subtract(flyerPos).normalize();
            this.velocity = direction.multiply(this.moveSpeed);
            if (direction.x >= 0) {
                this.facing = 1;
            } else {
                this.facing = -1;
            }
        } else {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }

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
        }
        // vertical collision
        if (readjustment.y !== 0) {
            this.velocity.y = 0;
        }
    }

    flip() {
        this.sprite.setHorizontalFlip(this.facing === -1);
    }

    death() {
        if (this.health <= 0) {
            this.sprite.setState("death");
            this.active = false;
            this.removeFromWorld = true;
        }
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
