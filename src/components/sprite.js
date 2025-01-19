import { Position } from "./position.js";

export class Sprite {
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

    setState(state) {
        if (state >= this.animations.length) {
            throw new Error(
                "Invalid state value (must be between 0 and n-1 where n is the number of animations)"
            );
        }

        this.state = state;
    }

    setVerticalFlip(flip) {
        this.verticalFlip = flip;
    }
    setHorizontalFlip(flip) {
        this.horizontalFlip = flip;
    }

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
