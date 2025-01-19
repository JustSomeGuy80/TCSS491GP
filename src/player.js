import { Animator } from "./engine/animator.js";
import { ColliderRect } from "./components/ColliderRect.js";
import { Position } from "./components/position.js";
import { Sprite } from "./components/sprite.js";
import { GameEngine } from "./engine/gameengine.js";
import { AssetManager } from "./engine/assetmanager.js";

/**
 * Player is an entity controlled by the user within the game.
 */
export class Player {
    /**
     * @param {GameEngine} game
     * @param {AssetManager} assetManager
     */
    constructor(game, assetManager) {
        this.game = game;
        this.tempGrounded = 500;
        this.jumpHeight = 550;
        this.debugMode = true;

        this.position = new Position(500, this.tempGrounded);
        this.collider = new ColliderRect(this.position, 0, 0, 56, 96);
        this.sprite = new Sprite(
            this.position,
            3,
            -48,
            -48,
            new Animator(assetManager.getAsset("/anims/idle.png"), 0, 0, 32, 32, 2, 2),
            new Animator(assetManager.getAsset("/anims/run.png"), 0, 0, 32, 32, 4, 0.2),
            new Animator(assetManager.getAsset("/anims/run.png"), 0, 0, 32, 32, 4, 0.2),
            new Animator(assetManager.getAsset("/anims/jump.png"), 0, 0, 32, 32, 1, 1),
            new Animator(assetManager.getAsset("/anims/jump.png"), 32, 0, 32, 32, 1, 1)
        );

        this.sprite.setHorizontalFlip(false); // 0 = right, 1 = left
        this.sprite.setState(0); // 0 = idle, 1 = running // 2 = running backwards // 3 = rising 4 = falling

        this.jumped = 0; // 0 = can jump, 1 = can vary gravity, 2 = can't vary gravity

        this.xV = 0;
        this.yV = 0;
        this.maxSpeed = 350;
        this.walkAccel = 1050;

        /** @type {Animator[]} */
        this.animations = [];
        this.loadAnimations(assetManager);

        // TEMP (standing on hitboxes is not recognized by Player.isGrounded())
        this.groundOverride = false;
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

        const initialPosition = this.position.asVector();

        this.calcMovement();

        // TEMPORARY IMPLEMENTATION OF HITBOXES
        // bugs:
        // - standing on a hitbox and moving horizontally appears laggy (groundOverride needs to be fixed)
        // - hugging a wall by going left and then switching to moving right causes you to tp to the left of hitbox
        // - jumping while hugging wall appears laggy
        const collision = this.collider.getCollision();
        const newPosition = this.position.asVector();
        if (collision) {
            const { xStart, xEnd, yStart, yEnd } = collision.getBounds();
            const { x: xDiff, y: yDiff } = newPosition.subtract(initialPosition);

            let nearX = (xStart - this.collider.w / 2 - initialPosition.x) / xDiff;
            let farX = (xEnd + this.collider.w / 2 - initialPosition.x) / xDiff;
            let nearY = (yStart - this.collider.h / 2 - initialPosition.y) / yDiff;
            let farY = (yEnd + this.collider.h / 2 - initialPosition.y) / yDiff;

            if (nearX > farX) {
                [farX, nearX] = [nearX, farX];
            }
            if (nearY > farY) {
                [farY, nearY] = [nearY, farY];
            }

            let horizontalHit = nearX > nearY;
            let hitNear = horizontalHit ? nearX : nearY;

            if (hitNear && isFinite(hitNear)) {
                const { x, y } = initialPosition.add(difference.multiply(hitNear));
                this.position.set(x, y);

                if (horizontalHit) {
                    this.groundOverride = false;
                    this.xV = 0;
                } else {
                    this.groundOverride = true;
                    this.yV = 0;
                }
            } else {
                this.groundOverride = false;
            }
        } else {
            this.groundOverride = false;
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
                this.yV = -this.jumpHeight;
                this.jumped = 1;
            }
        } else {
            if (grounded) this.jumped = 0;
            else if (this.yV < 0 && this.jumped == 1) this.yV -= this.yV * 8 * this.game.clockTick;
        }

        // Don't let the player exceed max speed
        if (!((this.xV > this.maxSpeed && move == 1) || (this.xV < -this.maxSpeed && move == -1))) {
            // Accelerate the player
            this.xV += this.walkAccel * move * this.game.clockTick;
        }

        //Set facing direction
        if (move == -1) this.sprite.setHorizontalFlip(true);
        if (move == 1) this.sprite.setHorizontalFlip(false);

        // Do we apply ground friction to the player?
        var traction =
            this.isGrounded() &&
            (move == 0 ||
                (move == 1 && this.xV < 0) ||
                (move == -1 && this.xV > 0) ||
                (this.xV > this.maxSpeed && this.xV < -this.maxSpeed));
        if (traction) {
            // Apply ground friction
            if (this.xV < 0) this.xV += this.walkAccel * this.game.clockTick;
            else if (this.xV > 0) this.xV -= this.walkAccel * this.game.clockTick;
            if (this.xV < this.maxSpeed / 20 && this.xV > -this.maxSpeed / 20) this.xV = 0;
        }
    }

    calcMovement() {
        const gravity = 1000;
        this.position.x += this.xV * this.game.clockTick;
        this.position.y += this.yV * this.game.clockTick;
        if (this.position.y > this.tempGrounded) this.position.y = this.tempGrounded;
        if (!this.isGrounded()) this.yV += gravity * this.game.clockTick;
    }

    setState() {
        if (this.isGrounded()) {
            if (this.xV == 0) this.sprite.setState(0);
            else this.sprite.setState(1);
        } else {
            if (this.yV < 0) this.sprite.setState(3);
            else this.sprite.setState(4);
        }
    }

    isGrounded() {
        //TEMPORARY
        return this.groundOverride || this.position.y >= this.tempGrounded;
    }

    draw(ctx) {
        this.sprite.drawSprite(this.game.clockTick, ctx);

        if (this.debugMode) {
            this.collider.draw(ctx);
            this.position.draw(ctx);
        }
    }
}
