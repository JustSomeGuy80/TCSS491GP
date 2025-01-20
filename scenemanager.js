class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this;
        this.x = 0;
        this.y = 0;
        
        // map dimensions
        this.mapWidth = 3000;
        this.mapHeight = 768;
        
        // camera bounds
        this.cameraBoundLeft = 200;
        this.cameraBoundRight = 800;

        // testing (delete later)
        this.debug = true;
        
        this.loadLevel();
    }

    loadLevel() {
        this.player = new Player(this.game);
        this.game.addEntity(this.player);

        this.createTestLevel();
    }

    createTestLevel() {
        // platform tests
        this.addObstacle(0, 600, 1000, 20, "platform");
        this.addObstacle(1200, 600, 800, 20, "platform");
        this.addObstacle(2200, 600, 800, 20, "platform");

        // platform tests
        this.addObstacle(1050, 450, 100, 20, "platform");
        this.addObstacle(1400, 400, 100, 20, "platform");
        this.addObstacle(1700, 350, 100, 20, "platform");

        // traps (add no collision)
        this.addObstacle(1000, 550, 50, 50, "spike");
        this.addObstacle(1600, 550, 50, 50, "spike");
    }

    addObstacle(x, y, width, height, type) {
        this.game.addEntity(new Obstacle(this.game, x, y, width, height, type));
    }

    update() {
        this.updateCamera();
    }

    updateCamera() {
        // only moves camera when player moves past bounds
        if (this.player.x - this.x > this.cameraBoundRight) {
            this.x = this.player.x - this.cameraBoundRight;
        } else if (this.player.x - this.x < this.cameraBoundLeft) {
            this.x = this.player.x - this.cameraBoundLeft;
        }

        // camera bounds
        if (this.x < 0) this.x = 0;
        if (this.x > this.mapWidth - this.game.ctx.canvas.width) {
            this.x = this.mapWidth - this.game.ctx.canvas.width;
        }
    }

    draw(ctx) {
        if (this.debug) {
            this.drawDebugInfo(ctx);
        }
    }

    // testing (delete later)
    drawDebugInfo(ctx) {
        ctx.save();
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        
        ctx.fillText(`Camera: ${Math.floor(this.x)}, ${Math.floor(this.y)}`, 10, 20);
        ctx.fillText(`Player: ${Math.floor(this.player.x)}, ${Math.floor(this.player.y)}`, 10, 40);
        ctx.fillText(`Velocity: ${Math.floor(this.player.xV)}, ${Math.floor(this.player.yV)}`, 10, 60);
        
        const boundLeft = this.cameraBoundLeft;
        const boundRight = this.cameraBoundRight;
        
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(boundLeft, 0);
        ctx.lineTo(boundLeft, ctx.canvas.height);
        ctx.moveTo(boundRight, 0);
        ctx.lineTo(boundRight, ctx.canvas.height);
        ctx.stroke();
        
        ctx.restore();
    }
} 