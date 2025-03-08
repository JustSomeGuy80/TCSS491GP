// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011
/** @typedef {import("./timer")} */

class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = [null];
        this.mouse = null;
        this.wheel = null;
        this.keys = {};
        this.buttons = {};
        this.sceneManager = null;

        // Options and the Details
        this.options = options || {
            debugging: false,
        };
    }

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
    }

    start() {
        this.running = true;
        const gameLoop = () => {
            if (!this.running) return;
            this.loop();
            // revert to old requestAnimFrame if anything goes wrong
            window.requestAnimationFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    }

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top,
        });

        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent Scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent Context Menu
            this.rightclick = getXandY(e);
        });

        this.ctx.canvas.addEventListener("keydown", event => (this.keys[event.key] = true));
        this.ctx.canvas.addEventListener("keyup", event => (this.keys[event.key] = false));

        this.ctx.canvas.addEventListener("mousedown", event => (this.buttons[event.button] = true));
        this.ctx.canvas.addEventListener("mouseup", event => (this.buttons[event.button] = false));
    }

    addEntity(entity) {
        this.entities.push(entity);
    }
    addTile(tile) {
        this.tiles.push(tile);
    }

    draw() {
        // Clear the whole canvas with transparent color (rgba(0, 0, 0, 0))
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw latest things first
        if (this.sceneManager != null) {
            this.sceneManager.draw(this.ctx, this);
        }
        MapExport.currentMap.draw(this.ctx, this);
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].draw(this.ctx, this);
        }
    }

    update() {
        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                if (i < this.entities.length - 1) this.entities[i] = this.entities.pop();
                else this.entities.pop();
            }
        }

        for (let i = 0; i < colliders.length; i++) {
            if (!colliders[i].owner || colliders[i].owner.removeFromWorld) {
                var temp = colliders.pop();
                if (i < colliders.length) colliders[i] = temp;
            }
        }

        for (let i = 0; i < this.entities.length; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }
        if (this.sceneManager != null) {
            this.sceneManager.update();
        }
    }

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    }
}

// KV Le was here :)
