/** @typedef {import("./engine/gameengine")} */
/** @typedef {import("./player")} */
/** @typedef {import("./tile")} */
/** @typedef {import("./map-export")} */

class MiniMap {
    /**
     * Creates a mini map instance
     * @param {GameEngine} gameEngine - The game engine
     * @param {Player} player - Reference to the player
     */
    constructor(gameEngine, player) {
        this.gameEngine = gameEngine;
        this.player = player;
        this.width = 180;
        this.height = 120;
        this.scale = 0.08;

        // Track explored areas
        this.exploredAreas = new Set();

        // Get the mini-map div element
        this.miniMapDiv = document.getElementById("mini-map");

        // Create the mini map canvas and add it to the DOM
        try {
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.canvas.style.display = "block";

            // Set canvas styling
            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;

            // Clear the div and add our canvas
            if (this.miniMapDiv) {
                this.miniMapDiv.innerHTML = "";
                this.miniMapDiv.appendChild(this.canvas);

                // Make sure the minimap is visible
                this.miniMapDiv.classList.remove("hidden");
            }

            this.ctx = this.canvas.getContext("2d");
        } catch (e) {
            console.error("Error creating minimap canvas:", e);
        }
    }

    /**
     * Updates the mini map based on the player's position
     */
    update() {
        try {
            if (!this.player || !this.player.position) return;

            // Record the current player location as explored
            const tileX = Math.floor(this.player.position.x / Tile.SIZE);
            const tileY = Math.floor(this.player.position.y / Tile.SIZE);
            this.exploredAreas.add(`${tileX},${tileY}`);

            // Also mark neighboring tiles as explored
            for (let dx = -8; dx <= 8; dx++) {
                for (let dy = -6; dy <= 6; dy++) {
                    this.exploredAreas.add(`${tileX + dx},${tileY + dy}`);
                }
            }

            // Redraw the minimap
            this.drawMapContent();
        } catch (e) {
            console.error("Error in minimap update:", e);
        }
    }

    /**
     * Draws the mini map content
     */
    draw() {
        // No longer needed as we're drawing directly in update
        // This method is kept for compatibility with the SceneManager
    }

    /**
     * Draws the map content on the mini map
     */
    drawMapContent() {
        try {
            if (!this.ctx) return;

            // Clear the mini map canvas
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Draw background and border
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            this.ctx.fillRect(0, 0, this.width, this.height);

            // Draw border
            this.ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(0, 0, this.width, this.height);

            // Draw the map content if possible
            if (
                this.player &&
                this.player.position &&
                MapExport.currentMap &&
                MapExport.currentMap.tiles &&
                MapExport.currentMap.tiles.length > 0
            ) {
                const playerX = this.player.position.x;
                const playerY = this.player.position.y;
                const centerX = this.width / 2;
                const centerY = this.height / 2;
                const map = MapExport.currentMap;

                // Calculate the visible area
                const tilesVisibleX = Math.ceil(this.width / (Tile.SIZE * this.scale) / 2);
                const tilesVisibleY = Math.ceil(this.height / (Tile.SIZE * this.scale) / 2);

                const playerTileX = Math.floor(playerX / Tile.SIZE);
                const playerTileY = Math.floor(playerY / Tile.SIZE);

                const startTileX = Math.max(0, playerTileX - tilesVisibleX);
                const endTileX = Math.min(map.tiles.length - 1, playerTileX + tilesVisibleX);
                const startTileY = Math.max(0, playerTileY - tilesVisibleY);
                const endTileY = Math.min(map.tiles[0].length - 1, playerTileY + tilesVisibleY);

                // Draw tiles
                for (let tileX = startTileX; tileX <= endTileX; tileX++) {
                    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
                        // Only draw explored areas
                        if (this.exploredAreas.has(`${tileX},${tileY}`)) {
                            const tile = map.tiles[tileX][tileY];

                            // Calculate position relative to player
                            const x = centerX + (tileX * Tile.SIZE - playerX) * this.scale;
                            const y = centerY + (tileY * Tile.SIZE - playerY) * this.scale;
                            const tileSize = Tile.SIZE * this.scale;

                            // Check if this is an air tile (all layers are Tile.AIR or 0)
                            const isAirTile = this.isAirTile(tile);

                            if (isAirTile) {
                                // Draw air tile with a distinct color
                                this.ctx.fillStyle = "rgba(60, 90, 120, 0.25)"; // Light blue for air
                                this.ctx.fillRect(x, y, tileSize, tileSize);
                            } else {
                                let hasDrawnTile = false;

                                // Check for solid tiles to draw
                                for (const layerValue of Tile.iterate(tile)) {
                                    if (
                                        layerValue >= Tile.DIRT &&
                                        layerValue <= Tile.FLOWER &&
                                        !this.isBackgroundTile(layerValue)
                                    ) {
                                        // Draw solid terrain
                                        this.ctx.fillStyle = "rgba(150, 100, 50, 0.8)";
                                        this.ctx.fillRect(x, y, tileSize, tileSize);
                                        hasDrawnTile = true;
                                        break;
                                    }
                                }

                                // Draw background tiles if no solid tile was drawn
                                if (!hasDrawnTile) {
                                    for (const layerValue of Tile.iterate(tile)) {
                                        if (this.isBackgroundTile(layerValue)) {
                                            this.ctx.fillStyle = "rgba(100, 100, 150, 0.3)";
                                            this.ctx.fillRect(x, y, tileSize, tileSize);
                                            break;
                                        }
                                    }
                                }
                            }

                            // Draw special objects
                            for (const layerValue of Tile.iterate(tile)) {
                                // Draw pickups, enemies, etc. with different colors
                                if (layerValue >= Tile.PLAYER && layerValue <= Tile.END_PICKUP) {
                                    this.drawSpecialTile(x, y, tileSize, layerValue);
                                }
                            }
                        }
                    }
                }

                // Draw player
                this.ctx.fillStyle = "#00FFFF"; // Cyan
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } catch (e) {
            console.error("Error drawing map content:", e);
        }
    }

    /**
     * Checks if a tile is an air tile (all layers are Tile.AIR)
     * @param {number} tile - The tile to check
     * @return {boolean} Whether it's an air tile
     */
    isAirTile(tile) {
        for (const layerValue of Tile.iterate(tile)) {
            if (layerValue !== Tile.AIR) {
                return false;
            }
        }
        return true;
    }

    /**
     * Determines if a tile is a background tile
     * @param {number} layerValue - The tile layer value
     * @return {boolean} Whether it's a background tile
     */
    isBackgroundTile(layerValue) {
        const bgTiles = [
            Tile.BRICK_BG,
            Tile.WOOD_BG,
            Tile.LEAF_BG,
            Tile.BRICK_BG_BL,
            Tile.BRICK_BG_BR,
            Tile.BRICK_BG_TL,
            Tile.BRICK_BG_TR,
            Tile.LEAF_BG_TR,
            Tile.WOOD_BG_BL,
            Tile.WOOD_BG_TR,
            Tile.TERRAIN_BG,
            Tile.TERRAIN_BG_BL,
            Tile.TERRAIN_BG_BR,
            Tile.TERRAIN_BG_TL,
            Tile.TERRAIN_BG_TR,
        ];

        return bgTiles.includes(layerValue);
    }

    /**
     * Draws special tiles like pickups, enemies, etc.
     * @param {number} x - X position on the minimap
     * @param {number} y - Y position on the minimap
     * @param {number} size - Size of the tile on the minimap
     * @param {number} tileType - The type of special tile
     */
    drawSpecialTile(x, y, size, tileType) {
        try {
            const halfSize = size / 2;
            const centerX = x + halfSize;
            const centerY = y + halfSize;

            switch (tileType) {
                case Tile.PLAYER:
                    // Player start position - green dot
                    this.ctx.fillStyle = "rgba(0, 255, 0, 0.7)";
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, halfSize * 0.7, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;

                case Tile.SLASHER:
                case Tile.SHOOTER:
                case Tile.BLOCKER:
                    // Enemies - red dot
                    this.ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, halfSize * 0.6, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;

                case Tile.SHOOT_PICKUP:
                case Tile.SLASH_PICKUP:
                case Tile.TELEPORT_PICKUP:
                case Tile.HEALTH_PICKUP:
                    // Pickups - yellow dot
                    this.ctx.fillStyle = "rgba(255, 255, 0, 0.7)";
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, halfSize * 0.6, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;

                case Tile.END_PICKUP:
                    // End pickup - purple dot
                    this.ctx.fillStyle = "rgba(255, 0, 255, 0.7)";
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, halfSize * 0.8, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
            }
        } catch (e) {
            console.error("Error drawing special tile:", e);
        }
    }
}
