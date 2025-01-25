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
     * @param {vector} vect
     * @param {number} speed
     * @param {int} team // 0 for player. 1 for enemy. Could add more if we want enemy friendly-fire
     */
    constructor(game, assetManager, x, y, vect, speed, team) {
        this.game = game;
        this.position = new Position(x, y);
        this.vect = vect.normalize().multiply(speed);
        this.team = team;

        this.sprite = new Sprite(this.position, this.game, 3, -10.5, -10.5, {
            blue: new Animator(assetManager.getAsset("anims/bullet.png"), 0, 0, 7, 7, 2, .25),
            blueExplode: new Animator(assetManager.getAsset("anims/bullet.png"), 14, 0, 7, 7, 6, .05),
        });
    
        this.sprite.setState("blue");

        this.collider = new ColliderRect(this.position, -7.5, -7.5, 15, 15, 2);
        this.game.addEntity(this.collider);

        this.age = 0;
        this.active = true;
        this.unload = false;
    }

    update() {
        if (this.active) {
            let origin = this.position.asVector();
            this.position.add(this.vect.multiply(this.game.clockTick))
            this.runCollisions(origin);
            if (this.age >= 4) {
                this.age = 0;
                this.active = false;
                this.sprite.setState("blueExplode");
            } 
        } else if (this.age > .3) {
            this.unload = true;
        }
        this.age += this.game.clockTick;
    }

    runCollisions(origin) {
        // TEMPORARY IMPLEMENTATION OF HITBOXES
        // bugs:
        // - (sort of a bug) when you are in the left side of a wall and go left, you tp to the right of wall
        //      - to test, spawn the player inside of a wall in the constructor
        const collisions = this.collider.getCollision();
        let target = this.position.asVector();


        while (true) {
            const { value: collision, done } = collisions.next();

            if (done) {
                this.groundOverride -= 1;
                break;
            }

            const { xStart, xEnd, yStart, yEnd } = collision.getBounds();
            const difference = target.subtract(origin);

            // TEMP (hacky solution but when player hugs wall by going left and switches directions, they tp across wall. This prevents that since switching direction slows you down.)
            if (difference.getMagnitude() >= 0.0) {
                let nearX = (xStart - this.collider.w / 2 - origin.x) / difference.x;
                let farX = (xEnd + this.collider.w / 2 - origin.x) / difference.x;
                let nearY = (yStart - this.collider.h / 2 - origin.y) / difference.y;
                let farY = (yEnd + this.collider.h / 2 - origin.y) / difference.y;

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
                    if (collision.id == 1) {
                        this.age = 0;
                        this.active = false;
                        this.sprite.setState("blueExplode");
                    }
                }
            }
        }

    }

    draw(ctx) {
        this.sprite.drawSprite(this.game.clockTick, ctx);
    }
} 