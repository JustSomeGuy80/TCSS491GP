/** @typedef {import("./position")} */
/** @typedef {import("../primitives/vector")} */

/**
 * ColliderRect exists to detect and resolve collisions between 2 or more rectangles
 *
 * NOTE: for "perfect fit" scenarios, ensure there is between [1, 0) unit of space (things will appear to be a perfect fit)
 */
class ColliderRect {
    #colliderID;

    /** @type {{[key: string]: ColliderRect}} */
    static #colliders = {};

    /**
     * @param {Position | Vector} parent
     * @param {number} xOffset
     * @param {number} yOffset
     * @param {number} w width
     * @param {number} h height
     * @param {number} id identification. 0 = player, 1 = block, 2 = bullet, 3 = enemy
     * @param {any} owner
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

        this.#colliderID = Object.keys(ColliderRect.#colliders).length;
        ColliderRect.#colliders[this.#colliderID] = this;
        // console.log(this.parent.x, this.parent.y, w, h);
    }

    delete() {
        delete ColliderRect.#colliders[this.#colliderID];
    }

    /**
     * Finds the first colliding rectangle and returns it.
     * @returns The ColliderRect object which collides with this one
     */
    *getCollisions() {
        for (const collider of Object.values(ColliderRect.#colliders)) {
            if (!collider.owner || collider.owner.removeFromWorld) {
                collider.delete();
                continue;
            }

            if (this !== collider && this.collidesWith(collider)) {
                yield collider;
            }
        }

        return null;
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

    /**
     * Resolves the collision of this ColliderRect with the other (other ColliderRect treated as immovable)
     * @param {Vector} displacement
     * @param {ColliderRect} other
     * @returns the displacement this ColliderRect needs to not be in collision
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
            default:
                return new Vector();
        }
    }

    /**
     * Resolves all collisions currently happening with this ColliderRect
     * @param {Vector} displacement
     * @returns the displacement this ColliderRect needs to not be in collision
     */
    resolveCollisions(displacement) {
        const collisions = this.getCollisions();
        let neededDisplacement = new Vector();

        while (true) {
            const { value: collider, done } = collisions.next();

            if (done) {
                break;
            }

            neededDisplacement = neededDisplacement.add(
                this.resolveCollision(displacement, collider)
            );
        }

        return neededDisplacement;
    }
}
