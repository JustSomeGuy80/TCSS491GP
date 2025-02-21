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
                for (let i = 1; i <= 4; i++) {
                    yield new Boundary(0, Tile.STEP_SIZE * i, (i - 1) * Tile.STEP_SIZE, Tile.SIZE);
                }
                break;
            case Tile.DIRT_STAIR_TR:
            case Tile.BRICK_TR:
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
                for (let i = 4; i >= 1; i--) {
                    yield new Boundary(0, i * Tile.STEP_SIZE, 0, (4 - (i - 1)) * Tile.STEP_SIZE);
                }
                break;
        }
    }
}
