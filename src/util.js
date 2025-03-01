/** Global Parameters Object */
const params = {};

/**
 * @param {Number} n
 * @returns Random Integer Between 0 and n-1
 */
function randomInt(n) {
    Math.floor(Math.random() * n);
}

/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @returns String that can be used as a rgb web color
 */
function rgb(r, g, b) {
    return `rgba(${r}, ${g}, ${b})`;
}

/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @param {Number} a Alpha Value
 * @returns String that can be used as a rgba web color
 */
function rgba(r, g, b, a) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * @param {Number} h Hue
 * @param {Number} s Saturation
 * @param {Number} l Lightness
 * @returns String that can be used as a hsl web color
 */
function hsl(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
}

/** Creates an alias for requestAnimationFrame for backwards compatibility */
// UNUSED FUNCTION
// export const requestAnimFrame = window.requestAnimationFrame;

/**
 * Returns distance from two points
 * @param {Number} p1, p2 Two objects with x and y coordinates
 * @returns Distance between the two points
 */
function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function inRange(x, min, max) {
    return x >= min && x <= max;
}

/**
 * Normalizes a number.
 * @param {number} value
 */
function getDirection(value) {
    if (value > 0) {
        return 1;
    } else if (value === 0) {
        return 0;
    }

    return -1;
}

/**
 * Returns true if the directions of a and b are not zero and are not equal
 * @param {number} a
 * @param {number} b
 */
function isDirectionalCounter(a, b) {
    return Boolean(getDirection(a) && getDirection(b)) && getDirection(a) !== getDirection(b);
}

function isBetween(value, a, b) {
    return a <= value && value <= b;
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Vector} offset
 * @param {Vector} position
 * @param {number} radius
 */
function drawPoint(ctx, position, radius) {
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
}
