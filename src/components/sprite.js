/** @typedef {import("../engine/animator")} */
/** @typedef {import("./position")} */

/**
 * Sprite is a component used to display a spritesheet on to the canvas
 */
class Sprite {
    /**
     * @param {Position} parent
     * @param {number} scale
     * @param {number} xOffset
     * @param {number} yOffset
     * @param  {Object<string, Animator>} animations
     */
    constructor(parent, game, scale, xOffset, yOffset, animations) {
        if (Object.keys(animations).length === 0) {
            throw new Error("Must pass at least 1 animation into Sprite");
        }

        this.parent = parent;
        this.game = game;
        this.scale = scale;

        this.offset = new Position(xOffset, yOffset);

        this.animations = animations;
        /** @type {string} */
        this.state = Object.keys(animations)[0];

        this.verticalFlip = false;
        this.horizontalFlip = false;
    }

    /**
     * Sets the currently playing animation
     * @param {string} state
     */
    setState(state) {
        if (!Object.hasOwn(this.animations, state)) {
            throw new Error("Invalid state value (state does not exist)");
        }

        this.state = state;
    }

    /**
     * Flips the sprite vertically (all pixels above the middle appear at the bottom, and bottom pixels appear at the top)
     * @param {boolean} flip true if there should be vertical flip and false otherwise
     */
    setVerticalFlip(flip) {
        this.verticalFlip = flip;
    }

    /**
     * Flips the sprite horizontally (all pixels left the middle appear at the right, and right pixels appear at the left)
     * @param {boolean} flip true if there should be horizontal flip and false otherwise
     */
    setHorizontalFlip(flip) {
        this.horizontalFlip = flip;
    }

    /**
     * Draws the sprite on to the canvas
     * @param {number} tick delta time
     * @param {CanvasRenderingContext2D} ctx
     */
    drawSprite(tick, ctx, cameraScale = 1) {
        let position = this.parent.asVector().add(this.offset);
        const camX = position.x - this.game.camera.x * cameraScale;
        const camY = position.y - this.game.camera.y * cameraScale;

        if (
            camX + this.animations[this.state].getWidth() * this.scale < 0 ||
            camX > ctx.canvas.width
        )
            return;
        if (
            camY + this.animations[this.state].getHeight() * this.scale < 0 ||
            camY > ctx.canvas.height
        )
            return;

        this.animations[this.state].drawFrame(
            tick,
            ctx,
            position.x - this.game.camera.x * cameraScale,
            position.y - this.game.camera.y * cameraScale,
            this.scale,
            this.horizontalFlip,
            this.verticalFlip
        );
    }

    isDone() {
        return this.animations[this.state].isDone();
    }

    resetAnim() {
        this.animations[this.state].reset();
    }
}
