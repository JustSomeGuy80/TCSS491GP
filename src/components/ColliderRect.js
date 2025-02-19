/** @typedef {import("./position")} */

/** @type {ColliderRect[]} */
const colliders = [];

/** @typedef {import("../primitives/vector")} */

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
        return this.getBoundary().resolveCollision(displacement, other.getBoundary());
    }

    /**
     * Resolves all collisions within the given array of collisions
     * @param {Vector} displacement
     * @param {ColliderRect[]} collisions
     */
    resolveCollisionsWith(displacement, collisions) {
        return this.getBoundary().resolveCollisions(
            displacement,
            collisions.map(collider => collider.getBoundary())
        );
    }

    /**
     * Resolves all current collisions with this collider
     * @param {*} displacement the owner's displacement between the last "frame" and now
     * @param  {...any} validIDs the valid ids which this collider may collide with
     * @returns the needed displacement to move this collider out of all collisions
     */
    resolveCollisions(displacement, ...validIDs) {
        return this.resolveCollisionsWith(
            displacement,
            [...this.getCollision()].filter(collider => validIDs.includes(collider.id))
        );
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
     * Converts this ColliderRect into a Boundary object
     * @returns
     */
    getBoundary() {
        const xStart = this.parent.x + this.xOffset;
        const yStart = this.parent.y + this.yOffset;

        return new Boundary(xStart, xStart + this.w, yStart, yStart + this.h);
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
     * Checks if a given line, starting at pos and spanning vect, collides with anything
     * @param {Position} pos position where the line starts
     * @param {Vector} vect how far and in what direction the line goes
     * @param {List} ids a list of collider IDs to check for
     * @returns the closest magnitude for vect that collides with a rectangle, or null if no collision exists
     */
    static lineCollide(pos, vect, ids) {
        var magnitudes = [];
        if (vect.x === 0 && vect.y === 0) {
            // if the line has a magnitude of zero,
        } else if (vect.x === 0 || vect.y === 0) {
            // if the line is perfectly horizontal or vertical, account for parallel lines;
            var xStart = pos.x;
            var xEnd = pos.x + vect.x;
            if (xEnd < xStart) {
                const temp = xEnd;
                xEnd = xStart;
                xStart = temp;
            }
            var yStart = pos.y;
            var yEnd = pos.y + vect.y;
            if (yEnd < yStart) {
                const temp = yEnd;
                yEnd = yStart;
                yStart = temp;
            }
            for (const collider of colliders) {
                if (ids.includes(collider.id)) {
                    bounds = collider.getBounds();
                    if (
                        !(
                            bounds.xStart > xEnd ||
                            bounds.xEnd < xStart ||
                            bounds.yStart > yEnd ||
                            bounds.yEnd < yStart
                        )
                    ) {
                        if (vect.x === 0) {
                            magnitudes.push(Math.abs(pos.y - bounds.yStart));
                            magnitudes.push(Math.abs(pos.y - bounds.yEnd));
                        } else {
                            magnitudes.push(Math.abs(pos.x - bounds.xStart));
                            magnitudes.push(Math.abs(pos.x - bounds.xEnd));
                        }
                    }
                }
            }
        } else {
            // else, find where the line and each bound meet, and check if it's within the collider
            const m = vect.y / vect.x;
            const findX = function (y) {
                return -(pos.y / m) + pos.x + y / m;
            };
            const findY = function (x) {
                return -(m * pos.x) + pos.y + m * x;
            };
            const getMag = function (x, y) {
                return Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
            };

            var bounds;
            var coord;
            for (const collider of colliders) {
                if (ids.includes(collider.id)) {
                    bounds = collider.getBounds();
                    // Left bound
                    coord = findY(bounds.xStart);
                    if (
                        coord >= bounds.yStart &&
                        coord <= bounds.yEnd &&
                        (coord - pos.y) * vect.y > 0
                    ) {
                        magnitudes.push(getMag(bounds.xStart, coord));
                    }
                    // Right bound
                    coord = findY(bounds.xEnd);
                    if (
                        coord >= bounds.yStart &&
                        coord <= bounds.yEnd &&
                        (coord - pos.y) * vect.y > 0
                    ) {
                        magnitudes.push(getMag(bounds.xEnd, coord));
                    }
                    // Upper bound
                    coord = findX(bounds.yStart);
                    if (
                        coord >= bounds.xStart &&
                        coord <= bounds.xEnd &&
                        (coord - pos.x) * vect.x > 0
                    ) {
                        magnitudes.push(getMag(coord, bounds.yStart));
                    }
                    // Lower bound
                    coord = findX(bounds.yEnd);
                    if (
                        coord >= bounds.xStart &&
                        coord <= bounds.xEnd &&
                        (coord - pos.x) * vect.x > 0
                    ) {
                        magnitudes.push(getMag(coord, bounds.yEnd));
                    }
                }
            }
        }
        if (magnitudes.length < 1 || Math.min.apply(Math, magnitudes) > vect.getMagnitude())
            return null;
        else return Math.min.apply(Math, magnitudes);
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
