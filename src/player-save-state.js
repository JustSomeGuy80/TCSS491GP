/**
 * @typedef {{position: Vector, canShoot: boolean, canSlash: boolean, canTeleport: boolean}} SaveState
 */

class PlayerSaveState {
    /** @type {SaveState[]} */
    static #saveStates = [];

    /**
     * @param {SaveState} saveState
     */
    static save(saveState) {
        this.#saveStates.push(saveState);
    }

    static load() {
        if (this.#saveStates.length > 0) {
            return this.#saveStates[this.#saveStates.length - 1];
        }

        return undefined;
    }

    static reset() {
        this.#saveStates.length = 0;
    }
}
