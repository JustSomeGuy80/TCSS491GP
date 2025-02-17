/** @typedef {import("./position")} */

/** @type {ColliderRect[]} */
const colliders = [];

/**
 * ColliderRect exists only to detect (not resolve) collisions between 2 rectangles.
 * Currently, if there are 3 or more collisions then they will be ignored (only first counts)
 */
class ColliderRect {
    /**
     * @param {Position} parent
     * @param {number} xOffset
     * @param {number} yOffset
     * @param {number} w width
     * @param {number} h height
     * @param {number} id identification. 0 = player, 1 = block, 2 = bullet, 3 = enemy, 4 = attack hitbox, 5 = pick up
     */
    constructor(parent, xOffset, yOffset, w, h, id, owner) {
        this.parent = parent;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.w = w;
        this.h = h;
        this.id = id;
        this.owner = owner;

        this.debugMode = false;

        colliders.push(this);
    }

    update() {}

    /**
     * Finds the first colliding rectangle and returns it.
     * @returns The ColliderRect object which collides with this one
     */
    *getCollision() {
        for (const collider of colliders) {
            if (this !== collider && this.collidesWith(collider)) {
                yield collider;
            }
        }
    }

    /**
     * Returns the displacement needed to move the owner of this collider out of collision
     * @param {Vector} displacement the owner's displacement between the last "frame" and now
     * @param {ColliderRect} other the other collider which should be in collision with this
     * @returns needed displacement
     */
    resolveCollision(displacement, other) {
        const ERROR = 0.01;

        const otherBounds = other.getBounds();
        const selfBounds = this.getBounds();

        const horizontalDifference = Math.max(
            0,
            displacement.x > 0
                ? selfBounds.xEnd - otherBounds.xStart
                : displacement.x < 0
                ? otherBounds.xEnd - selfBounds.xStart
                : 0
        );
        const verticalDifference = Math.max(
            0,
            displacement.y > 0
                ? selfBounds.yEnd - otherBounds.yStart
                : displacement.y < 0
                ? otherBounds.yEnd - selfBounds.yStart
                : 0
        );

        const direction = displacement.normalize().negate();
        const tHorizontal = Math.abs(horizontalDifference / direction.x);
        const tVertical = Math.abs(verticalDifference / direction.y);

        const state = isNaN(tHorizontal) * 0b10 + isNaN(tVertical) * 0b1;
        switch (state) {
            case 0b00: {
                const newDisplacement = direction.multiply(
                    Math.min(tHorizontal, tVertical) + ERROR
                );

                if (tHorizontal < tVertical) {
                    return new Vector(newDisplacement.x, 0);
                } else if (tVertical < tHorizontal) {
                    return new Vector(0, newDisplacement.y);
                }

                return new Vector();
            }
            case 0b10:
                return direction.multiply(tVertical + ERROR);
            case 0b01:
                return direction.multiply(tHorizontal + ERROR);
        }

        return new Vector(0, 0);
    }

    /**
     * Resolves all current collisions with this collider
     * @param {*} displacement the owner's displacement between the last "frame" and now
     * @param  {...any} validIDs the valid ids which this collider may collide with
     * @returns the needed displacement to move this collider out of all collisions
     */
    resolveCollisions(displacement, ...validIDs) {
        let neededDisplacement = new Vector(0, 0);

        const collisions = this.getCollision();
        while (true) {
            const { value: collider, done } = collisions.next();

            if (done) break;
            if (!validIDs.includes(collider.id)) continue;

            neededDisplacement = neededDisplacement.add(
                this.resolveCollision(displacement, collider)
            );
        }

        return neededDisplacement;
    }

    expandW(percent) {
        let newW = this.w * percent;
        let newX = this.xOffset - (newW - this.w) / 2;
        this.w = newW;
        this.xOffset = newX;
    }

    expandH(percent) {
        let newH = this.h * percent;
        let newY = this.yOffset - (newH - this.h) / 2;
        this.h = newH;
        this.yOffset = newY;
    }

    /**
     * Gets the x and y starts and ends of this ColliderRect.
     * @returns The bounds of this ColliderRect
     */
    getBounds() {
        const xStart = this.parent.x + this.xOffset;
        const yStart = this.parent.y + this.yOffset;

        return {
            xStart,
            xEnd: xStart + this.w,
            yStart,
            yEnd: yStart + this.h,
        };
    }

    /**
     * Checks if this ColliderRect collides with the other ColliderRect
     * @param {ColliderRect} other
     * @returns true if there is a collision and false otherwise
     */
    collidesWith(other) {
        const selfBounds = this.getBounds();
        const otherBounds = other.getBounds();

        return !(
            selfBounds.xStart > otherBounds.xEnd ||
            otherBounds.xStart > selfBounds.xEnd ||
            selfBounds.yStart > otherBounds.yEnd ||
            otherBounds.yStart > selfBounds.yEnd
        );
    }

    /**
     * Draws this ColliderRect as a empty black rectangle on the canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        if (this.debugMode) {
            const bounds = this.getBounds();
            ctx.strokeRect(bounds.xStart, bounds.yStart, this.w, this.h);
        }
    }
}
