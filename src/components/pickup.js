class Pickup {
    constructor(game, assetManager, x, y, id) {
        this.game = game;
        this.position = new Position(x, y);
        this.removeFromWorld = false;
        this.debugMode = false;
        this.id = id;

        this.collision = new ColliderRect(this.position, 0, 0, 30, 30, 5, this);
        this.game.addEntity(this.collision);

        this.sprite = new Sprite(this.position, this.game, 3, 0, 0, {
            new: new Animator(assetManager.getAsset("anims/pickup.png"), 0, 0, 10, 10, 1, .25),
            picked_up: new Animator(assetManager.getAsset("anims/pickup.png"), 0, 0, 10, 10, 2, .5),
        });

        this.sprite.setState("new");
    }

    update() {
        this.runCollisions();
    }

    runCollisions() {
        const collisions = this.collision.getCollision();

        while (true) {
            const { value: collision, done } = collisions.next();
            if (done) break;

            if (collision.id === 0) {
                switch(this.id) {
                    case 'health':
                        collision.owner.health += 50;
                        break;
                    case 'shoot':
                        collision.owner.canShoot = true;
                        break;
                    case 'slash':
                        collision.owner.canSlash = true;
                        break;
                    case 'teleport':
                        collision.owner.canTeleport = true;
                        break;
                }
                this.removeFromWorld = true;
                this.collision.removeFromWorld = true;
            }
        }
    }

    draw(ctx) {
        this.sprite.drawSprite(this.game.clockTick, ctx);

        if (this.debugMode) {
            const bounds = this.collision.getBounds();
            ctx.save();
            ctx.strokeStyle = 'yellow';
            ctx.strokeRect(
                bounds.xStart - this.game.camera.x,
                bounds.yStart - this.game.camera.y,
                bounds.xEnd - bounds.xStart,
                bounds.yEnd - bounds.yStart);
            ctx.restore();
        }
    }
}