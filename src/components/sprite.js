import { Animator } from "../engine/animator.js";
import { Position } from "./position.js";

/**
 * Sprite is a component used to display a spritesheet on to the canvas
 */
export class Sprite {
    /**
     * @param {Position} parent
     * @param {number} scale
     * @param {number} xOffset
     * @param {number} yOffset
     * @param  {...Animator} animations
     */
    constructor(parent, scale, xOffset, yOffset, ...animations) {
        this.parent = parent;
        this.scale = scale;

        this.offset = new Position(xOffset, yOffset);

        this.animations = animations;
        this.state = 0;

        this.verticalFlip = false;
        this.horizontalFlip = false;

        if (animations.length === 0) {
            throw new Error("Must pass at least 1 animation into Sprite");
        }
    }

    /**
     * Sets the currently playing animation
     * @param {number} state must be between 0 and n-1 where n is the number of animations
     */
    setState(state) {
        if (state >= this.animations.length) {
            throw new Error(
                "Invalid state value (must be between 0 and n-1 where n is the number of animations)"
            );
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
    drawSprite(tick, ctx) {
        let position = this.parent.asVector().add(this.offset);

        this.animations[this.state].drawFrame(
            tick,
            ctx,
            position.x,
            position.y,
            this.scale,
            this.horizontalFlip,
            this.verticalFlip
        );
    }
}
