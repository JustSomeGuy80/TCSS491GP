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
        this.gravity = 0; //temporarily disabled

        this.patrolLeft = x - 200;
        this.patrolRight = x + 200;

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
        this.handleMovement();
        this.setState();
    }

    handleMovement() {
        this.velocity.x = this.moveDirection * this.moveSpeed;

        this.velocity.y += this.gravity * this.game.clockTick;

        this.position.x += this.velocity.x * this.game.clockTick;
        this.position.y += this.velocity.y * this.game.clockTick;

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