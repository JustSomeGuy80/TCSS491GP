class Obstacle {
    constructor(game, x, y, width, height, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    update() {
        // add collision here
    }

    draw(ctx) {
        // camera offset
        const camX = this.x - this.game.camera.x;
        
        // draws if on screen
        if (camX + this.width < 0 || camX > ctx.canvas.width) return;

        ctx.fillStyle = this.type === "spike" ? "red" : "gray";
        ctx.fillRect(camX, this.y, this.width, this.height);
    }
} 