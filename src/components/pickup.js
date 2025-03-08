class Pickup {
    constructor(game, assetManager, x, y, id) {
        this.game = game;
        this.assetManager = assetManager;
        this.position = new Position(x, y);
        this.removeFromWorld = false;
        this.debugMode = false;
        this.id = id;

        this.collision = new ColliderRect(this.position, 0, 0, 30, 30, 5, this);
        this.game.addEntity(this.collision);

        this.sprite = new Sprite(this.position, this.game, 3, 0, 0, {
            upgrade: new Animator(assetManager.getAsset("anims/pickup.png"), 0, 0, 16, 16, 1, 1),
            health: new Animator(assetManager.getAsset("anims/pickup.png"), 16, 0, 16, 16, 1, 1),
            ending: new Animator(assetManager.getAsset("anims/pickup.png"), 32, 0, 16, 16, 1, 1),
            picked_up: new Animator(
                assetManager.getAsset("anims/pickup.png"),
                0,
                0,
                10,
                10,
                2,
                0.5
            ),
        });

        this.sprite.setState("upgrade");
        if (this.id == "health") this.sprite.setState("health");
        if (this.id == "ending") this.sprite.setState("ending");
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
                switch (this.id) {
                    case "health":
                        collision.owner.health += 20;
                        this.assetManager.playAsset("sounds/healthup.wav")
                        break;
                    case "shoot":
                        collision.owner.canShoot = true;
                        this.assetManager.playAsset("sounds/powerup.wav")
                        break;
                    case "slash":
                        collision.owner.canSlash = true;
                        this.assetManager.playAsset("sounds/powerup.wav")
                        break;
                    case "teleport":
                        collision.owner.canTeleport = true;
                        this.assetManager.playAsset("sounds/powerup.wav")
                        break;
                    case "ending":
                        this.assetManager.playAsset("sounds/win.wav")
                        GUI.showWinScreen();
                        collision.owner.removeFromWorld = true;
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
