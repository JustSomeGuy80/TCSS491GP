/** @typedef {import("./ColliderRect")} */

class StairController {
    #stairMode;
    static validIDS = new Set([1, ColliderRect.TYPE.STAIR_BL, ColliderRect.TYPE.STAIR_BR]);

    /**
     * @param {ColliderRect} snapUpCollider
     * @param {ColliderRect} snapDownCollider
     * @param {number} displacementThreshold
     */
    constructor(snapUpCollider, snapDownCollider, displacementThreshold) {
        this.snapUpCollider = snapUpCollider;
        this.snapDownCollider = snapDownCollider;
        this.displacementThreshold = displacementThreshold;

        this.#stairMode = false;
    }

    /**
     * Resolves all collisions passed into this function.
     *
     * Note: This function should only be used for resolving collisions with this.snapUpCollider
     * @param {Vector} displacement
     * @param {ColliderRect[]} collisions list of all collisions with this.snapUpCollider
     */
    #resolveCollisions(displacement, collisions) {
        let stairFound = false;

        for (const collider of collisions) {
            if (StairController.isStair(collider)) {
                stairFound = true;
            }
        }

        this.#stairMode = stairFound;

        return this.snapUpCollider.resolveCollisionsWith(displacement, collisions);
    }

    /**
     * Gets the highest collision in collisions
     * @param {ColliderRect[]} collisions
     */
    #getHighestStair(collisions) {
        /** @type {{y: number, collider: null | ColliderRect}} */
        const highestCollider = { y: Infinity, collider: null };

        for (const collider of collisions) {
            if (!StairController.isStair(collider)) continue;
            if (collider.position.y < highestCollider.y) {
                highestCollider.y = collider.position.y;
                highestCollider.collider = collider;
            }
        }

        return highestCollider.collider;
    }

    /**
     * Attempts to snap the player down if possible, otherwise snaps the player up.
     * If player cannot snap then the snap up collider is treated as a normal collider.
     *
     * @param {Vector} displacement
     */
    updateState(displacement) {
        const selfY = this.snapUpCollider.getBoundary().bottom;
        const snapDownCollisions = [...this.snapDownCollider.getCollision()].filter(collider =>
            StairController.validIDS.has(collider.id)
        );
        const snapDownStairCollider = this.#getHighestStair(snapDownCollisions);

        // snap down
        if (this.#stairMode && isBetween(displacement.y, 0, this.displacementThreshold)) {
            if (snapDownStairCollider !== null) {
                if (StairController.checkDirectionalCounter(snapDownStairCollider, displacement)) {
                    return new Vector(0, snapDownStairCollider.position.y - selfY);
                }
            }
        }

        // snap up
        {
            const collisions = [...this.snapUpCollider.getCollision()].filter(collider =>
                StairController.validIDS.has(collider.id)
            );
            const collider = this.#getHighestStair(collisions);

            if (collider === null || (displacement.y < 0 && snapDownStairCollider === null)) {
                return this.#resolveCollisions(displacement, collisions);
            } else {
                if (StairController.checkDirectionalCounter(collider, displacement)) {
                    return this.#resolveCollisions(displacement, collisions);
                } else {
                    return new Vector(0, collider.position.y - selfY - 0.1);
                }
            }
        }
    }

    /**
     * Returns true if the given colliderRect has a stair ID and false otherwise
     * @param {ColliderRect} colliderRect
     */
    static isStair(colliderRect) {
        const id = colliderRect.id;
        return id === ColliderRect.TYPE.STAIR_BL || id === ColliderRect.TYPE.STAIR_BR;
    }

    /**
     *
     * @param {ColliderRect} collider
     * @param {Vector} displacement
     */
    static checkDirectionalCounter(collider, displacement) {
        if (collider.id === ColliderRect.TYPE.STAIR_BL) {
            return isDirectionalCounter(-1, displacement.x);
        } else if (collider.id === ColliderRect.TYPE.STAIR_BR) {
            return isDirectionalCounter(1, displacement.x);
        }

        return false;
    }
}
