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
        this.sprite = new Sprite(this.position, this.game, 3, -48, -48, {
            running: new Animator(
                this.assetManager.getAsset("anims/slasher.png"),
                0,
                0,
                32,
                32,
                4,
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
        this.animations.push(
            new Animator(assetManager.getAsset("anims/slasher.png"), 0, 0, 32, 32, 4, 0.2)
        );
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
        const readjustment = this.collider.resolveCollisions(
            this.position.asVector().subtract(origin),
            1
        );
        this.position.add(readjustment);

        // horizontal collision
        if (readjustment.x !== 0) {
            this.velocity.x = 0;
            // turn around after hitting wall
            this.moveDirection *= -1;
        }
        // vertical collision
        if (readjustment.y !== 0) {
            this.velocity.y = 0;
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
            ctx.strokeStyle = "yellow";
            ctx.strokeRect(
                bounds.xStart - this.game.camera.x,
                bounds.yStart,
                bounds.xEnd - bounds.xStart,
                bounds.yEnd - bounds.yStart
            );
        }
    }
}
