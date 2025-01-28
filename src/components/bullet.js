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
        this.debugMode = true;

        this.sprite = new Sprite(this.position, this.game, 3, -10.5, -10.5, {
            blue: new Animator(assetManager.getAsset("anims/bullet.png"), 0, 0, 7, 7, 2, .25),
            blueExplode: new Animator(assetManager.getAsset("anims/bullet.png"), 14, 0, 7, 7, 6, .05),
        });
    
        this.sprite.setState("blue");

        this.collider = new ColliderRect(this.position, -7.5, -7.5, 15, 15, 2, this);
        this.game.addEntity(this.collider);

        this.age = 0;
        this.active = true;
        this.unload = false;

        this.removeFromWorld = false;
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

                this.removeFromWorld = true;
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
                break;
            }
            
            if (collision.id === 1 || collision.id === 3) {
                this.age = 0;
                this.active = false;
                this.sprite.setState("blueExplode");

                this.removeFromWorld = true;

                collision.owner.health -= 1;

            }
        }

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
        }
    }
} 