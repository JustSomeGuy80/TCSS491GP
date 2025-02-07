/** @typedef {import("./components/ColliderRect")} */
/** @typedef {import("./components/position")} */
/** @typedef {import("./engine/gameengine")} */

class Obstacle {
    static TYPE_ID = Symbol(Obstacle.name);

    constructor(game, x, y, width, height, type) {
        this.game = game;
        this.position = new InstanceVector(x, y);
        this.width = width;
        this.height = height;
        this.type = type;
        this.removeFromWorld = false;

        // this.collision = new ColliderRect(this.position, 0, 0, width, height, 1, this);
        this.collider = new ColliderRect(
            this,
            this.position,
            new Vector(),
            new Vector(width, height)
        );
    }

    update() {}

    draw(ctx) {
        // camera offset
        const camX = this.position.x - this.game.camera.x;
        const camY = this.position.y - this.game.camera.y;

        // draws if on screen
        if (camX + this.width < 0 || camX > ctx.canvas.width) return;
        if (camY + this.height < 0 || camY > ctx.canvas.height) return;

        ctx.fillStyle = this.type === "spike" ? "red" : "gray";
        ctx.fillRect(camX, camY, this.width, this.height);
    }
}
