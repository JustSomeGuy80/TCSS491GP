class Tile {
    // SPECIAL [0, 0]
    static AIR = 0;

    // TILES [1, 80]
    static DIRT = 1;
    static DIRT_STAIR_BL = 2;
    static DIRT_STAIR_BR = 3;
    static DIRT_STAIR_TL = 4;
    static DIRT_STAIR_TR = 5;
    static BRICK = 6;
    static BRICK_BG = 7;
    static BRICK_BL = 8;
    static BRICK_BR = 9;
    static BRICK_TL = 10;
    static BRICK_TR = 11;
    static WOOD = 12;
    static WOOD_BG = 13;
    static WOOD_BL = 14;
    static WOOD_BR = 15;
    static WOOD_TL = 16;
    static WOOD_TR = 17;
    static LEAF = 18;
    static LEAF_BG = 19;
    static LEAF_BL = 20;
    static LEAF_BR = 21;
    static LEAF_TL = 22;
    static LEAF_TR = 23;

    static BRICK_BG_BL = 24;
    static BRICK_BG_BR = 25;
    static BRICK_BG_TL = 26;
    static BRICK_BG_TR = 27;

    static LEAF_BG_TR = 28;
    static WOOD_BG_BL = 29;
    static WOOD_BG_TR = 30;

    static TERRAIN_BG = 31;
    static TERRAIN_BG_BL = 32;
    static TERRAIN_BG_BR = 33;
    static TERRAIN_BG_TL = 34;
    static TERRAIN_BG_TR = 35;

    static GRASS = 36;
    static FLOWER = 37;

    // OBJECTS [81, 99]
    static PLAYER = 81;
    static SLASHER = 82;
    static SHOOTER = 83;
    static BLOCKER = 84;
    static SHOOT_PICKUP = 85;
    static SLASH_PICKUP = 86;
    static TELEPORT_PICKUP = 87;
    static HEALTH_PICKUP = 88;
    static END_PICKUP = 89;
    static FLYER = 90;

    static #precision = Tile.#getDigits(Object.values(Tile).reduce((a, b) => Math.max(a, b)));
    static #precision10 = Math.pow(10, Tile.#precision);

    static AssetManager = null;

    static SIZE = 48;
    static STEP_SIZE = Tile.SIZE / 4;

    constructor() {
        throw new Error("Tile is a static class and should not have any instances");
    }

    /**
     * @param {number} tile
     * @param {CanvasRenderingContext2D} ctx
     * @param {Vector} position
     */
    static drawTile(tile, ctx, position) {
        // the tiles are size 48 but we do 48.5 to avoid the "grid lines" in between tiles
        const args = [position.x, position.y, 48.5, 48.5];
        for (const layer of Tile.iterate(tile)) {
            switch (layer) {
                case Tile.DIRT:
                    ctx.drawImage(this.AssetManager.getAsset("images/dirt.png"), ...args);
                    break;
                case Tile.DIRT_STAIR_BL:
                    ctx.drawImage(this.AssetManager.getAsset("images/dirt_stair_BL.png"), ...args);
                    break;
                case Tile.DIRT_STAIR_BR:
                    ctx.drawImage(this.AssetManager.getAsset("images/dirt_stair_BR.png"), ...args);
                    break;
                case Tile.DIRT_STAIR_TL:
                    ctx.drawImage(this.AssetManager.getAsset("images/dirt_stair_TL.png"), ...args);
                    break;
                case Tile.DIRT_STAIR_TR:
                    ctx.drawImage(this.AssetManager.getAsset("images/dirt_stair_TR.png"), ...args);
                    break;
                case Tile.BRICK:
                    ctx.drawImage(this.AssetManager.getAsset("images/brick.png"), ...args);
                    break;
                case Tile.BRICK_BG:
                    ctx.drawImage(this.AssetManager.getAsset("images/brick_bg.png"), ...args);
                    break;
                case Tile.BRICK_BL:
                    ctx.drawImage(this.AssetManager.getAsset("images/brick_bl.png"), ...args);
                    break;
                case Tile.BRICK_BR:
                    ctx.drawImage(this.AssetManager.getAsset("images/brick_br.png"), ...args);
                    break;
                case Tile.BRICK_TL:
                    ctx.drawImage(this.AssetManager.getAsset("images/brick_tl.png"), ...args);
                    break;
                case Tile.BRICK_TR:
                    ctx.drawImage(this.AssetManager.getAsset("images/brick_tr.png"), ...args);
                    break;
                case Tile.WOOD:
                    ctx.drawImage(this.AssetManager.getAsset("images/wood.png"), ...args);
                    break;
                case Tile.WOOD_BG:
                    ctx.drawImage(this.AssetManager.getAsset("images/wood_bg.png"), ...args);
                    break;
                case Tile.WOOD_BL:
                    ctx.drawImage(this.AssetManager.getAsset("images/wood_bl.png"), ...args);
                    break;
                case Tile.WOOD_BR:
                    ctx.drawImage(this.AssetManager.getAsset("images/wood_br.png"), ...args);
                    break;
                case Tile.WOOD_TL:
                    ctx.drawImage(this.AssetManager.getAsset("images/wood_tl.png"), ...args);
                    break;
                case Tile.WOOD_TR:
                    ctx.drawImage(this.AssetManager.getAsset("images/wood_tr.png"), ...args);
                    break;
                case Tile.LEAF:
                    ctx.drawImage(this.AssetManager.getAsset("images/leaf.png"), ...args);
                    break;
                case Tile.LEAF_BG:
                    ctx.drawImage(this.AssetManager.getAsset("images/leaf_bg.png"), ...args);
                    break;
                case Tile.LEAF_BL:
                    ctx.drawImage(this.AssetManager.getAsset("images/leaf_bl.png"), ...args);
                    break;
                case Tile.LEAF_BR:
                    ctx.drawImage(this.AssetManager.getAsset("images/leaf_br.png"), ...args);
                    break;
                case Tile.LEAF_TL:
                    ctx.drawImage(this.AssetManager.getAsset("images/leaf_tl.png"), ...args);
                    break;
                case Tile.LEAF_TR:
                    ctx.drawImage(this.AssetManager.getAsset("images/leaf_tr.png"), ...args);
                    break;
                case Tile.BRICK_BG_BL:
                    ctx.drawImage(this.AssetManager.getAsset("images/brick_bg_bl.png"), ...args);
                    break;
                case Tile.BRICK_BG_BR:
                    ctx.drawImage(this.AssetManager.getAsset("images/brick_bg_br.png"), ...args);
                    break;
                case Tile.BRICK_BG_TL:
                    ctx.drawImage(this.AssetManager.getAsset("images/brick_bg_tl.png"), ...args);
                    break;
                case Tile.BRICK_BG_TR:
                    ctx.drawImage(this.AssetManager.getAsset("images/brick_bg_tr.png"), ...args);
                    break;
                case Tile.LEAF_BG_TR:
                    ctx.drawImage(this.AssetManager.getAsset("images/leaf_bg_tr.png"), ...args);
                    break;
                case Tile.WOOD_BG_BL:
                    ctx.drawImage(this.AssetManager.getAsset("images/wood_bg_bl.png"), ...args);
                    break;
                case Tile.WOOD_BG_TR:
                    ctx.drawImage(this.AssetManager.getAsset("images/wood_bg_tr.png"), ...args);
                    break;
                case Tile.TERRAIN_BG:
                    ctx.drawImage(this.AssetManager.getAsset("images/terrain_bg.png"), ...args);
                    break;
                case Tile.TERRAIN_BG_BL:
                    ctx.drawImage(this.AssetManager.getAsset("images/terrain_bg_bl.png"), ...args);
                    break;
                case Tile.TERRAIN_BG_BR:
                    ctx.drawImage(this.AssetManager.getAsset("images/terrain_bg_br.png"), ...args);
                    break;
                case Tile.TERRAIN_BG_TL:
                    ctx.drawImage(this.AssetManager.getAsset("images/terrain_bg_tl.png"), ...args);
                    break;
                case Tile.TERRAIN_BG_TR:
                    ctx.drawImage(this.AssetManager.getAsset("images/terrain_bg_tr.png"), ...args);
                    break;
                case Tile.GRASS:
                    ctx.drawImage(this.AssetManager.getAsset("images/grass.png"), ...args);
                    break;
                case Tile.FLOWER:
                    ctx.drawImage(this.AssetManager.getAsset("images/flower.png"), ...args);
                    break;
            }
        }
    }

    static *getBoundaries(tile) {
        for (const layer of Tile.iterate(tile)) {
            switch (layer) {
                case Tile.DIRT:
                case Tile.WOOD:
                case Tile.BRICK:
                case Tile.LEAF:
                    yield new Boundary(0, Tile.SIZE, 0, Tile.SIZE);
                    break;
                case Tile.DIRT_STAIR_BR:
                case Tile.WOOD_BR:
                case Tile.BRICK_BR:
                case Tile.LEAF_BR:
                    for (let i = 1; i <= 4; i++) {
                        yield new Boundary(
                            Tile.SIZE - i * Tile.STEP_SIZE,
                            Tile.SIZE,
                            (i - 1) * Tile.STEP_SIZE,
                            Tile.SIZE
                        );
                    }
                    break;
                case Tile.DIRT_STAIR_BL:
                case Tile.WOOD_BL:
                case Tile.BRICK_BL:
                case Tile.LEAF_BL:
                    for (let i = 1; i <= 4; i++) {
                        yield new Boundary(
                            0,
                            Tile.STEP_SIZE * i,
                            (i - 1) * Tile.STEP_SIZE,
                            Tile.SIZE
                        );
                    }
                    break;
                case Tile.DIRT_STAIR_TR:
                case Tile.WOOD_TR:
                case Tile.BRICK_TR:
                case Tile.LEAF_TR:
                    for (let i = 4; i >= 1; i--) {
                        yield new Boundary(
                            Tile.SIZE - i * Tile.STEP_SIZE,
                            Tile.SIZE,
                            0,
                            (4 - (i - 1)) * Tile.STEP_SIZE
                        );
                    }
                    break;
                case Tile.DIRT_STAIR_TL:
                case Tile.WOOD_TL:
                case Tile.BRICK_TL:
                case Tile.LEAF_TL:
                    for (let i = 4; i >= 1; i--) {
                        yield new Boundary(
                            0,
                            i * Tile.STEP_SIZE,
                            0,
                            (4 - (i - 1)) * Tile.STEP_SIZE
                        );
                    }
                    break;
            }
        }
    }

    static #getDigits(value) {
        if (value === 0) return 0;
        return Math.trunc(Math.log10(value)) + 1;
    }

    static getTileLayer(tile, layer) {
        return Tile.splitTileLayer(tile, layer).quotient;
    }

    static splitTileLayer(tile, layer) {
        const remaining = Math.trunc(tile / Math.pow(10, this.#precision * layer));

        return {
            quotient: remaining % Tile.#precision10,
            remainder: Math.trunc(remaining / Tile.#precision10),
        };
    }

    static *iterate(tile) {
        if (tile === Tile.AIR) return tile;

        let remaining = tile;
        while (true) {
            const { quotient, remainder } = Tile.splitTileLayer(remaining, 0);
            if (quotient === Tile.AIR && remainder === Tile.AIR) {
                break;
            }

            yield quotient;
            remaining = remainder;
        }
    }

    /**
     * Checks if a tile is solid (platforms, walls, etc.)
     * @param {number} tile - The tile to check
     * @return {boolean} True if the tile is solid
     */
    static isSolid(tile) {
        // Check all 4 layers
        for (const layerValue of Tile.iterate(tile)) {
            // Check if any layer contains a solid tile
            if (layerValue >= Tile.DIRT && layerValue <= Tile.FLOWER) {
                // Skip background tiles
                if (
                    !(
                        layerValue === Tile.BRICK_BG ||
                        layerValue === Tile.WOOD_BG ||
                        layerValue === Tile.LEAF_BG ||
                        layerValue === Tile.BRICK_BG_BL ||
                        layerValue === Tile.BRICK_BG_BR ||
                        layerValue === Tile.BRICK_BG_TL ||
                        layerValue === Tile.BRICK_BG_TR ||
                        layerValue === Tile.LEAF_BG_TR ||
                        layerValue === Tile.WOOD_BG_BL ||
                        layerValue === Tile.WOOD_BG_TR ||
                        layerValue === Tile.TERRAIN_BG ||
                        layerValue === Tile.TERRAIN_BG_BL ||
                        layerValue === Tile.TERRAIN_BG_BR ||
                        layerValue === Tile.TERRAIN_BG_TL ||
                        layerValue === Tile.TERRAIN_BG_TR
                    )
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Checks if a tile is a background tile
     * @param {number} tile - The tile to check
     * @return {boolean} True if the tile is a background
     */
    static isBackground(tile) {
        // Check all 4 layers
        for (const layerValue of Tile.iterate(tile)) {
            // Check if any layer contains a background tile
            if (
                layerValue === Tile.BRICK_BG ||
                layerValue === Tile.WOOD_BG ||
                layerValue === Tile.LEAF_BG ||
                layerValue === Tile.BRICK_BG_BL ||
                layerValue === Tile.BRICK_BG_BR ||
                layerValue === Tile.BRICK_BG_TL ||
                layerValue === Tile.BRICK_BG_TR ||
                layerValue === Tile.LEAF_BG_TR ||
                layerValue === Tile.WOOD_BG_BL ||
                layerValue === Tile.WOOD_BG_TR ||
                layerValue === Tile.TERRAIN_BG ||
                layerValue === Tile.TERRAIN_BG_BL ||
                layerValue === Tile.TERRAIN_BG_BR ||
                layerValue === Tile.TERRAIN_BG_TL ||
                layerValue === Tile.TERRAIN_BG_TR
            ) {
                return true;
            }
        }
        return false;
    }
}
