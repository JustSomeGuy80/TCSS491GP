/** @typedef {import('./vector')} */

class InstanceVector extends Vector {
    /**
     * @override
     * @param {Vector | InstanceVector | number} arg1
     * @param {number | undefined} arg2
     */
    constructor(arg1, arg2) {
        if (arg1 !== undefined && arg2 === undefined) {
            super(arg1.x, arg1.y);
        } else {
            super(arg1, arg2);
        }
    }

    /**
     * Sets the x and y value of this Vector
     * @override
     * @param {Vector | InstanceVector | number} arg1
     * @param {number | undefined} arg2
     */
    set(arg1, arg2) {
        if (arg2 === undefined) {
            this.set(arg1.x, arg1.y);
        } else {
            if (isNaN(arg1) || isNaN(arg2)) {
                throw new Error(`NaN Vector value occurred`);
            }

            this.x = arg1;
            this.y = arg2;
        }

        return this;
    }

    /**
     * Adds this vector with another Vector
     * @override
     * @param {Vector | InstanceVector | number} arg1
     * @param {number | undefined} arg2
     */
    add(arg1, arg2) {
        if (arg2 === undefined) {
            if (typeof arg1 === "number") {
                this.add(arg1, 0);
            } else {
                this.add(arg1.x, arg1.y);
            }
        } else {
            this.set(this.x + arg1, this.y + arg2);
        }

        return this;
    }

    /**
     * Subtracts another Vector from this Vector (a-b where a is this and b is other)
     * @override
     * @param {Vector | InstanceVector | number} arg1
     * @param {number | undefined} arg2
     */
    subtract(arg1, arg2) {
        if (arg2 === undefined) {
            if (typeof arg1 === "number") {
                this.subtract(arg1, 0);
            } else {
                this.subtract(arg1.x, arg1.y);
            }
        } else {
            this.add(-arg1, -arg2);
        }

        return this;
    }

    /**
     * Negates this Vector such that it becomes -a
     */
    negate() {
        this.set(-this.x, this.y);

        return this;
    }

    /**
     * Normalizes this vector such that its magnitude becomes 1
     */
    normalize() {
        this.set(super.normalize());

        return this;
    }

    /**
     * Performs a scalar multiplication on this Vector.
     * @param {number} scalar
     */
    multiply(scalar) {
        this.set(this.x * scalar, this.y * scalar);

        return this;
    }

    /**
     * Applies the transformation on each element of a copy of this Instance Vector
     * @param {(value: number) => number} transformation
     */
    map(transformation) {
        return new InstanceVector(transformation(this.x), transformation(this.y));
    }

    /**
     * Applies the transformation on each element of this Instance Vector
     * @param {(value: number) => number} transformation
     */
    forEach(transformation) {
        this.set(transformation(this.x), transformation(this.y));

        return this;
    }

    /**
     * Makes a deep copy of this Vector.
     * @returns a new InstanceVector
     */
    copy() {
        return new InstanceVector(this.x, this.y);
    }

    /**
     * Converts this InstanceVector into a Vector
     * @readonly a new Vector
     */
    asVector() {
        return new Vector(this.x, this.y);
    }

    /**
     * @returns a string representation of this Vector
     */
    toString() {
        return `InstanceVector(x=${this.x}, y=${this.y})`;
    }
}
