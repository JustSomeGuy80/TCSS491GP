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
            colliders.length = 0; // Clear all colliders
        }

        main();
    }

    static onRestartClick() {
        const deathScreen = document.getElementById("death-screen");
        const game = document.getElementById("gameWorld");

        deathScreen.style.display = "none";
        game.focus();

        // Clear any existing game state
        if (window.gameEngine) {
            window.gameEngine.entities = [];
            colliders.length = 0; // Clear all colliders
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
}
