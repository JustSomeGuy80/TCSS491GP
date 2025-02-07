/** @typedef {import("./engine/animator")} */
/** @typedef {import("./components/ColliderRect")} */
/** @typedef {import("./components/position")} */
/** @typedef {import("./components/arm")} */
/** @typedef {import("./components/teleoprt")} */
/** @typedef {import("./components/sprite")} */
/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./engine/assetmanager")} */
/** @typedef {import("./primitives/vector")} */
/** @typedef {import("./primitives/instance-vector")} */
/** @typedef {import("./components/falling-player-controller")} */

/**
 * Player is an entity controlled by the user within the game.
 */
class Player {
    static TYPE_ID = Player.name;

    /**
     * @param {GameEngine} game
     * @param {AssetManager} assetManager
     */
    constructor(game, assetManager) {
        this.game = game;
        this.assetManager = assetManager;
        // this.jumpHeight = 550;
        this.debugMode = false;
        this.removeFromWorld = false;

        const height = 96;
        const width = 56;

        this.position = new InstanceVector(525, 500);
        this.collider = new ColliderRect(
            this,
            this.position,
            new Vector(-width / 2, -height / 2),
            new Vector(width, height),
            Obstacle.TYPE_ID
        );
        this.controller = new FallingPlayerController(
            new Vector(350, Infinity),
            1050,
            1050,
            1050,
            1050,
            2000,
            1100,
            550
        );
        this.lastBlockedDirections = FallingPlayerController.BLOCK_DIRECTION.NO_BLOCK;
        this.movement = new Vector();
        this.teleport = new Teleport(
            game,
            assetManager,
            this,
            -width / 2,
            -height / 2,
            width,
            height
        );
        this.arm = new Arm(game, this.assetManager, this, 6, -4, "bladed");
        this.sprite = new Sprite(this.position, this.game, 3, -48, -48, {
            idle: new Animator(this.assetManager.getAsset("anims/idle.png"), 0, 0, 32, 32, 2, 2),
            running: new Animator(
                this.assetManager.getAsset("anims/run.png"),
                0,
                0,
                32,
                32,
                4,
                0.2
            ),
            bwrunning: new Animator(
                this.assetManager.getAsset("anims/bwrun.png"),
                0,
                0,
                32,
                32,
                4,
                0.2
            ),
            airLeanBack: new Animator(
                this.assetManager.getAsset("anims/jump.png"),
                0,
                0,
                32,
                32,
                1,
                1
            ),
            airLeanFront: new Animator(
                this.assetManager.getAsset("anims/jump.png"),
                32,
                0,
                32,
                32,
                1,
                1
            ),
        });

        this.sprite.setHorizontalFlip(false);
        this.sprite.setState("idle");

        this.facing = 1; // 1 = right, -1 = left, used for calculations, should never be set to 0
        this.aimVector = new Vector(1, 0);
        this.health = 100;
    }

    update() {
        this.checkInput();
        GUI.setHealth(this.health / 100);
        this.calcMovement();
        this.setState();
        this.arm.update();
        this.teleport.update();
    }

    checkInput() {
        this.movement = new Vector();
        if (this.game.keys["d"]) this.movement.x += 1;
        if (this.game.keys["a"]) this.movement.x -= 1;
        if (this.game.keys[" "]) this.movement.y = -1;

        if (this.game.mouse != null) {
            //Set facing direction
            if (this.game.mouse.x + this.game.camera.x >= this.position.x) {
                this.sprite.setHorizontalFlip(false);
                this.arm.sprite.setHorizontalFlip(false);
                this.facing = 1;
            } else {
                this.sprite.setHorizontalFlip(true);
                this.arm.sprite.setHorizontalFlip(true);
                this.facing = -1;
            }
            this.aimVector.x =
                this.game.mouse.x +
                this.game.camera.x -
                this.position.x +
                this.arm.xOffset * this.facing;
            this.aimVector.y =
                this.game.mouse.y + this.game.camera.y - (this.position.y + this.arm.yOffset);
        }
        if (this.game.buttons[0]) this.arm.fire();
        if (this.game.keys["s"] || this.game.buttons[3]) this.arm.slash();
        if (this.game.keys["w"]) this.teleport.teleport();
    }

    calcMovement() {
        const displacement = this.controller.updateAll(
            this.game.clockTick,
            this.movement,
            this.lastBlockedDirections
        );
        this.position.add(displacement);
        const readjustment = this.collider.resolveCollisions(displacement);
        this.position.add(readjustment);

        const table = FallingPlayerController.BLOCK_DIRECTION;
        this.lastBlockedDirections = table.NO_BLOCK;
        this.lastBlockedDirections |= table.LEFT * (readjustment.x > 0);
        this.lastBlockedDirections |= table.RIGHT * (readjustment.x < 0);
        this.lastBlockedDirections |= table.ABOVE * (readjustment.y > 0);
        this.lastBlockedDirections |= table.BELOW * (readjustment.y < 0);
    }

    setState() {
        if (this.isGrounded()) {
            if (this.controller.velocity.x == 0) this.sprite.setState("idle");
            else if (this.controller.velocity.x * this.facing > 0) this.sprite.setState("running");
            else this.sprite.setState("bwrunning");
        } else {
            if (this.controller.velocity.y < 0) {
                if (this.controller.velocity.x * this.facing >= 0)
                    this.sprite.setState("airLeanBack");
                else this.sprite.setState("airLeanFront");
            } else {
                if (this.controller.velocity.x * this.facing >= 0)
                    this.sprite.setState("airLeanFront");
                else this.sprite.setState("airLeanBack");
            }
        }
    }

    isGrounded() {
        return Boolean(this.lastBlockedDirections & FallingPlayerController.BLOCK_DIRECTION.BELOW);
    }

    draw(ctx) {
        this.arm.draw(ctx);
        this.teleport.draw(ctx);
        this.sprite.drawSprite(this.game.clockTick, ctx);

        if (this.debugMode) {
            this.collider.draw(ctx);
            this.position.draw(ctx);
        }
    }
}
