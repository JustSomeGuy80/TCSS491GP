class GUI {
    static onPlayClick() {
        const menu = document.getElementById("menu");
        const game = document.getElementById("gameWorld");
        const deathScreen = document.getElementById("death-screen");

        menu.style.display = "none";
        deathScreen.style.display = "none";
        game.focus();

        // Clear any existing game state
        if (window.gameEngine) {
            window.gameEngine.entities = [];
            window.colliders = [];
            window.enemies = [];
            window.gameEngine.running = false;
        }

        main();
    }

    static onRestartClick() {
        const deathScreen = document.getElementById("death-screen");
        const winScreen = document.getElementById("win-screen");
        const game = document.getElementById("gameWorld");

        deathScreen.style.display = "none";
        winScreen.style.display = "none";
        game.focus();

        // Clear any existing game state
        if (window.gameEngine) {
            window.gameEngine.entities = [];
            window.colliders = [];
            window.enemies = [];
            window.gameEngine.running = false;
        }

        // Stop all audio
        if (window.ASSET_MANAGER) {
            window.ASSET_MANAGER.pauseBackgroundMusic();
        }

        main();
    }

    static showDeathScreen() {
        const deathScreen = document.getElementById("death-screen");
        deathScreen.style.display = "flex";
    }

    static showWinScreen() {
        const winScreen = document.getElementById("win-screen");
        winScreen.style.display = "flex";
    }

    /**
     * @param {number} percent must be within [0.0, 1.0]
     */
    static setHealth(percent) {
        const healthBar = document.getElementById("health");
        healthBar.style.setProperty("--percentage", percent);
    }

    /**
     * @param {string} id HTML id of the ability
     * @param {number} percent must be within [0.0, 1.0]
     */
    static setCooldown(id, percent) {
        const ability = document.getElementById(id);
        ability.style.setProperty("--percentage", `${percent * 100}%`);
    }

    static showSlashControl() {
        GUI.#unhideElement("slash-control");
    }

    static showTeleportControl() {
        GUI.#unhideElement("teleport-control");
    }

    static showHookControl() {
        GUI.#unhideElement("hook-control");
    }

    /**
     * @param {string} text
     */
    static printStdOut(text) {
        const element = document.getElementById("stdout");
        const node = document.createElement("pre");
        node.textContent = text;
        element.appendChild(node);

        element.scrollTop = element.scrollHeight;
    }

    static clearStdOut() {
        const element = document.getElementById("stdout");
        element.innerHTML = "";
    }

    /**
     * @param {string} elementID
     */
    static #unhideElement(elementID) {
        document.getElementById(elementID).classList.remove("hidden");
    }
}
