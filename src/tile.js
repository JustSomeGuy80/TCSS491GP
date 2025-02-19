class Tile {
    static AssetManager = null;

    static SIZE = 48;

    static PLAYER = -1;
    static SLASHER = -2;
    static SHOOTER = -3;
    static BLOCKER = -4;

    static SHOOT_PICKUP = -5;
    static SLASH_PICKUP = -6;
    static TELEPORT_PICKUP = -7;

    static HEALTH_PICKUP = -8;

    static AIR = 0;
    static DIRT = 1;
    static DIRT_STAIR_BL = 2;
    static DIRT_STAIR_BR = 3;
    static DIRT_STAIR_TL = 4;
    static DIRT_STAIR_TR = 5;

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
        }
    }
}
