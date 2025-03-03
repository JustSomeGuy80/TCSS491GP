class Tile {
    static AssetManager = null;

    static SIZE = 48;
    static STEP_SIZE = Tile.SIZE / 4;

    static PLAYER = -1;
    static SLASHER = -2;
    static SHOOTER = -3;
    static BLOCKER = -4;

    static SHOOT_PICKUP = -5;
    static SLASH_PICKUP = -6;
    static TELEPORT_PICKUP = -7;

    static HEALTH_PICKUP = -8;
    static END_PICKUP = -9;

    static AIR = 0;
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
    static LEAF_BL_BG = 24;
    static LEAF_BR_BG = 25;
    static LEAF_TL_BG = 26;
    static LEAF_TR_BG = 27;

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
        switch (tile) {
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
            case Tile.LEAF_BL_BG:
                ctx.drawImage(this.AssetManager.getAsset("images/leaf_bl_bg.png"), ...args);
                break;
            case Tile.LEAF_BR_BG:
                ctx.drawImage(this.AssetManager.getAsset("images/leaf_br_bg.png"), ...args);
                break;
            case Tile.LEAF_TL_BG:
                ctx.drawImage(this.AssetManager.getAsset("images/leaf_tl_bg.png"), ...args);
                break;
            case Tile.LEAF_TR_BG:
                ctx.drawImage(this.AssetManager.getAsset("images/leaf_tr_bg.png"), ...args);
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

    static *getBoundaries(tile) {
        switch (tile) {
            case Tile.DIRT:
            case Tile.BRICK:
                yield new Boundary(0, Tile.SIZE, 0, Tile.SIZE);
                break;
            case Tile.DIRT_STAIR_BR:
            case Tile.BRICK_BR:
            case Tile.LEAF_BR:
            case Tile.LEAF_BR_BG:
            case Tile.TERRAIN_BG_BR:
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
            case Tile.BRICK_BL:
            case Tile.LEAF_BL:
            case Tile.LEAF_BL_BG:
            case Tile.TERRAIN_BG_BL:
                for (let i = 1; i <= 4; i++) {
                    yield new Boundary(0, Tile.STEP_SIZE * i, (i - 1) * Tile.STEP_SIZE, Tile.SIZE);
                }
                break;
            case Tile.DIRT_STAIR_TR:
            case Tile.BRICK_TR:
            case Tile.LEAF_TR:
            case Tile.LEAF_TR_BG:
            case Tile.TERRAIN_BG_TR:
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
            case Tile.BRICK_TL:
            case Tile.LEAF_TL:
            case Tile.LEAF_TL_BG:
            case Tile.TERRAIN_BG_TL:
                for (let i = 4; i >= 1; i--) {
                    yield new Boundary(0, i * Tile.STEP_SIZE, 0, (4 - (i - 1)) * Tile.STEP_SIZE);
                }
                break;
        }
    }
}
