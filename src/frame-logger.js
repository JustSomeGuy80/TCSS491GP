class FrameLogger {
    /** @type {{ name: string, time: int }[]} start times of each period in stack */
    static #timeStack = [];

    constructor() {
        throw new Error("FrameLogger is a static class, instances should not be made.");
    }

    /**
     * @param {string} name
     */
    static push(name) {
        FrameLogger.#timeStack.push({ name, time: performance.now() });
    }

    /**
     * Pops the difference in time in milliseconds
     * @param {string} name
     */
    static pop(name) {
        const popped = FrameLogger.#timeStack.pop();
        if (popped === undefined) {
            throw new Error("No items to pop from time stack");
        } else if (popped.name !== name) {
            throw new Error(`Given name does not matched popped name (${popped.name})`);
        }

        return performance.now() - popped.time;
    }

    /**
     * Pops the difference in time in seconds
     * @param {string} name
     */
    static popSec(name) {
        return FrameLogger.pop(name) / 1000;
    }

    /**
     * Pops the difference in time in frames per second
     * @param {string} name
     */
    static popFPS(name) {
        return 1000 / FrameLogger.pop(name);
    }

    static concludeFrame() {
        if (FrameLogger.#timeStack.length !== 0) {
            const remainingNames = FrameLogger.#timeStack.map(value => value.name).join(", ");
            throw new Error(`Time stack is not empty. Remaining names: ${remainingNames}`);
        }
    }
}
