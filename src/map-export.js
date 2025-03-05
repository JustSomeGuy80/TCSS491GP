/** @typedef {import("./engine/types/boundary")} */
/** @typedef {import("./tile")} */

class MapExport {
    /** @type {MapExport} */
    static currentMap = null;

    /**
     * @param {number} top
     * @param {number} left
     * @param {number[][]} tiles
     */
    constructor(game, top, left, tiles) {
        this.game = game;
        this.top = top;
        this.left = left;
        this.tiles = tiles;
    }

    static init(map) {
        this.currentMap = map;
    }

    update() {}

    /**
     *
     * @param {Boundary} boundary
     */
    *getColliders(boundary) {
        for (const { x, y, tile } of this.getTilesInBoundary(boundary)) {
            for (const tileBoundary of Tile.getBoundaries(tile)) {
                tileBoundary.move(new Vector(x, y));
                if (boundary.containsBoundary(tileBoundary)) {
                    yield tileBoundary;
                }
            }
        }
    }

    /**
     *
     * @param {Boundary} boundary
     */
    *getTilesInBoundary(boundary) {
        const left = Math.max(Math.floor(boundary.left / Tile.SIZE) - 1, 0);
        const right = Math.min(Math.ceil(boundary.right / Tile.SIZE), this.tiles.length - 1);
        const top = Math.max(Math.floor(boundary.top / Tile.SIZE) - 1, 0);
        const bottom = Math.min(Math.ceil(boundary.bottom / Tile.SIZE), this.tiles[0].length - 1);

        for (let xIndex = left; xIndex <= right; xIndex++) {
            for (let yIndex = top; yIndex <= bottom; yIndex++) {
                const x = xIndex * Tile.SIZE;
                const y = yIndex * Tile.SIZE;
                const tile = this.tiles[xIndex][yIndex];

                yield { x, y, tile };
            }
        }
    }

    draw(ctx) {
        const { width, height } = ctx.canvas;
        const screenBounds = new Boundary(0, width, 0, height);

        for (const { x, y, tile } of this.#getTiles()) {
            if (screenBounds.containsBoundary(new Boundary(x, x + Tile.SIZE, y, y + Tile.SIZE))) {
                Tile.drawTile(tile, ctx, new Vector(x, y));
            }
        }
    }

    *#getTiles() {
        for (let xIndex = 0; xIndex < this.tiles.length; xIndex++) {
            for (let yIndex = 0; yIndex < this.tiles[xIndex].length; yIndex++) {
                const x = xIndex * Tile.SIZE - this.game.camera.x;
                const y = yIndex * Tile.SIZE - this.game.camera.y;
                const tile = this.tiles[xIndex][yIndex];

                yield { x, y, tile };
            }
        }
    }
}
