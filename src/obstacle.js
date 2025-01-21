/** @typedef {import("./components/ColliderRect")} */
/** @typedef {import("./components/position")} */
/** @typedef {import("./engine/gameengine")} */

class Obstacle {
    constructor(game, x, y, width, height, type) {
        this.game = game;
        this.position = new Position(x, y);
        this.width = width;
        this.height = height;
        this.type = type;


        this.collision = new ColliderRect(this.position, 0, 0, width, height);
        this.game.addEntity(this.collision);
    }

    update() {

    }

    draw(ctx) {
        // camera offset
        const camX = this.position.x - this.game.camera.x;
        
        // draws if on screen
        if (camX + this.width < 0 || camX > ctx.canvas.width) return;

        ctx.fillStyle = this.type === "spike" ? "red" : "gray";
        ctx.fillRect(camX, this.position.y, this.width, this.height);
    }
} 