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

        this.sprite = new Sprite(this.position, this.game, 3, -9, -9, {
            blue: new Animator(assetManager.getAsset("anims/bullet.png"), 0, 0, 6, 6, 2, .25),
        });
    
        this.sprite.setState("blue");

        //this.collision = new ColliderRect(this.position, -9, -9, 18, 18);
        //this.game.addEntity(this.collision);

        this.age = 0;
        this.unload = false;
    }

    update() {
        this.position.add(this.vect.multiply(this.game.clockTick))
        this.age += this.game.clockTick;
        if (this.age >= 5) this.unload = true;
    }

    draw(ctx) {
        this.sprite.drawSprite(this.game.clockTick, ctx);
    }
} 