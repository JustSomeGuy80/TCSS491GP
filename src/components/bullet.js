/** @typedef {import("./ColliderRect")} */
/** @typedef {import("./position")} */
/** @typedef {import("../engine/gameengine")} */
/** @typedef {import("../primitives/vector")} */
/** @typedef {import("../engine/assetmanager")} */
/** @typedef {import("./sprite")} */

class Bullet {
    /**
     * @param {GameEngine} game
     * @param {AssetManager} assetManager
     * @param {number} x
     * @param {number} y
     * @param {Vector} vect
     * @param {number} speed
     * @param {int} team // 0 for player. 1 for enemy. Could add more if we want enemy friendly-fire
     */
    constructor(game, assetManager, x, y, vect, speed, team) {
        this.game = game;
        this.position = new Position(x, y);
        this.vect = vect.normalize().multiply(speed);
        this.team = team;
        this.debugMode = false;

        this.sprite = new Sprite(this.position, this.game, 3, -10.5, -10.5, {
            blue: new Animator(assetManager.getAsset("anims/bullet.png"), 0, 0, 7, 7, 2, 0.25),
            blueExplode: new Animator(
                assetManager.getAsset("anims/bullet.png"),
                14,
                0,
                7,
                7,
                6,
                0.05
            ),
            red: new Animator(assetManager.getAsset("anims/enemy_bullet.png"), 0, 0, 7, 7, 2, 0.25),
            redExplode: new Animator(
                assetManager.getAsset("anims/enemy_bullet.png"),
                14,
                0,
                7,
                7,
                6,
                0.05
            ),
        });

        if (this.team === 0) {
            this.sprite.setState("blue");
        } else {
            this.sprite.setState("red");
        }

        this.collider = new ColliderRect(this.position, -7.5, -7.5, 15, 15, 2, this);

        this.age = 0;
        this.active = true;
        this.unload = false;

        this.removeFromWorld = false;
    }

    update() {
        if (this.active) {
            this.position.add(this.vect.multiply(this.game.clockTick));
            this.runCollisions();
            if (this.age >= 4) {
                this.age = 0;
                this.active = false;

                if (this.team === 0) {
                    this.sprite.setState("blueExplode");
                } else {
                    this.sprite.setState("redExplode");
                }

                this.removeFromWorld = true;
            }
        } else if (this.age > 0.3) {
            this.collider.removeFromWorld = true;
            this.unload = true;
        }
        this.age += this.game.clockTick;
    }

    runCollisions() {
        const collisions = this.collider.getCollision();

        while (true) {
            const { value: collision, done } = collisions.next();

            if (done) {
                break;
            }
            if (this.team === 0) {
                // player bullet
                if (
                    collision.id !== 0 &&
                    collision.id !== 4 &&
                    collision.id !== 5 &&
                    collision.id !== -1
                ) {
                    if (collision.id === 3) {
                        collision.owner.health -= 1;
                    }

                    this.age = 0;
                    this.active = false;
                    this.sprite.setState("blueExplode");
                    this.removeFromWorld = true;
                }
            } else {
                // enemy bullet
                if (
                    collision.id !== 3 &&
                    collision.id !== 4 &&
                    collision.id !== 5 &&
                    collision.id !== -1
                ) {
                    if (collision.id === 0) {
                        collision.owner.health -= 10;
                    }

                    this.age = 0;
                    this.active = false;
                    this.sprite.setState("redExplode");
                    this.removeFromWorld = true;
                }
            }
        }
    }

    draw(ctx) {
        this.sprite.drawSprite(this.game.clockTick, ctx);

        if (this.debugMode) {
            const bounds = this.collider.getBounds();
            ctx.save();
            ctx.strokeStyle = "yellow";
            ctx.strokeRect(
                bounds.xStart - this.game.camera.x,
                bounds.yStart - this.game.camera.y,
                bounds.xEnd - bounds.xStart,
                bounds.yEnd - bounds.yStart
            );
            ctx.restore();
        }
    }
}
