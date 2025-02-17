class GUI {
    static onPlayClick() {
        const menu = document.getElementById("menu");
        const game = document.getElementById("gameWorld");

        menu.style.display = "none";
        game.focus();

        main();
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
