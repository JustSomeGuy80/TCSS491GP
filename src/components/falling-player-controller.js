/** @typedef {import("./physics-entity")} */

class FallingPlayerController extends PhysicsEntity {
    #jumping;

    static BLOCK_DIRECTION = {
        NO_BLOCK: 0b0000,
        ABOVE: 0b0001,
        BELOW: 0b0010,
        LEFT: 0b0100,
        RIGHT: 0b1000,
    };

    /**
     * @param {Vector} terminalVelocity maxium speed in horizontal and vertical direction
     * @param {number} horizontalAcceleration
     * @param {number} reverseAcceleration extra acceleration when going in opposite direction of horizontal velocity (grounded)
     * @param {number} airReverseAcceleration extra acceleration when going in opposite direction of horizontal (in air)
     * @param {number} stoppingAcceleration deacceleration applied when there is no target direction
     * @param {number} gravitationalAcceleration constant downwards acceleration
     * @param {number} jumpAcceleration upwards acceleration applied when holding jump (to counter gravity)
     * @param {number} jumpVelocity immediate velocity applied when jumping
     */
    constructor(
        terminalVelocity,
        horizontalAcceleration,
        reverseAcceleration,
        airReverseAcceleration,
        stoppingAcceleration,
        gravitationalAcceleration,
        jumpAcceleration,
        jumpVelocity
    ) {
        super(terminalVelocity);

        this.horizontalAcceleration = horizontalAcceleration;
        this.reverseAcceleration = reverseAcceleration;
        this.airReverseAcceleration = airReverseAcceleration;
        this.stoppingAcceleration = stoppingAcceleration;
        this.gravitationalAcceleration = gravitationalAcceleration;
        this.jumpAcceleration = jumpAcceleration;
        this.jumpVelocity = jumpVelocity;

        this.#jumping = false;
    }

    /**
     * Updates the player acceleration in the horizontal direction
     * @param {Vector} offset
     * @param {boolean | undefined} grounded whether the player is touching the ground
     */
    updateHorizontal(offset, grounded) {
        const xDirection = getDirection(offset.x);

        this.applyAcceleration(new Vector(xDirection * this.horizontalAcceleration));
        if (isDirectionalCounter(xDirection, this.velocity.x)) {
            if (grounded) {
                this.applyAcceleration(new Vector(xDirection * this.reverseAcceleration));
            } else {
                this.applyAcceleration(new Vector(xDirection * this.airReverseAcceleration));
            }
        }

        if (xDirection === 0) {
            this.applyCounterAcceleration(new Vector(this.stoppingAcceleration));
        }
    }

    /**
     * Updates the gravity
     */
    updateNatural() {
        this.applyAcceleration(new Vector(0, this.gravitationalAcceleration));
    }

    /**
     * Updates the player acceleration and velocity in the vertical direction
     * @param {boolean | undefined} jumping
     * @param {boolean | undefined} grounded
     */
    updateVertical(jumping, grounded) {
        if (this.#jumping) {
            this.applyAcceleration(new Vector(0, this.#jumping * -this.jumpAcceleration));
        }

        if (grounded && this.velocity.y > 0) {
            this.overrideYVelocity(0);
        }

        if (jumping && grounded) {
            this.overrideYVelocity(-this.jumpVelocity);
            this.#jumping = true;
        } else if (!jumping || this.velocity.y > 0) {
            this.#jumping = false;
        }
    }

    /**
     * Updates acceleration related to player input
     * @param {Vector} offset vector that represents where the player wants to go (not normalized)
     * @param {boolean} grounded whether the player is touching the ground
     */
    updateUnnatural(offset, grounded) {
        const jumping = offset.y < 0;

        this.updateHorizontal(offset, grounded);
        this.updateVertical(jumping, grounded);
    }

    /**
     * Updates the player's acceleration and velocity, and returns displacement
     * @param {number} deltaTime change in time since last update
     * @param {Vector} offset vector that represents where the player wants to go (not normalized)
     * @param {number} blockedDirections directions in which this player is blocked
     * @returns displacement caused by acceleration and velocity
     */
    updateAll(deltaTime, offset, blockedDirections) {
        const table = FallingPlayerController.BLOCK_DIRECTION;

        this.updateNatural();
        this.updateUnnatural(offset, Boolean(blockedDirections & table.BELOW));

        if (blockedDirections & (table.LEFT | table.RIGHT)) {
            this.overrideXVelocity(0);
        }
        if (blockedDirections & table.ABOVE) {
            this.#jumping = false;
            this.overrideYVelocity(0);
        }

        return this.updateVelocity(deltaTime);
    }
}
