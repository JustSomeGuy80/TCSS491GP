const colliders = [];

export class ColliderRect {
    constructor(parent, xOffset, yOffset, w, h) {
        this.parent = parent;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.w = w;
        this.h = h;

        colliders.push(this);
    }

    update() {}

    getCollision() {
        for (const collider of colliders) {
            if (this !== collider && this.collidesWith(collider)) {
                return collider;
            }
        }

        return null;
    }

    getBounds() {
        const xStart = this.parent.x + this.xOffset - Math.round(this.w / 2);
        const yStart = this.parent.y + this.yOffset - Math.round(this.h / 2);

        return {
            xStart,
            xEnd: xStart + this.w,
            yStart,
            yEnd: yStart + this.h,
        };
    }

    collidesWith(other) {
        const selfBounds = this.getBounds();
        const otherBounds = other.getBounds();

        return !(
            selfBounds.xStart >= otherBounds.xEnd ||
            otherBounds.xStart >= selfBounds.xEnd ||
            selfBounds.yStart >= otherBounds.yEnd ||
            otherBounds.yStart >= selfBounds.yEnd
        );
    }

    draw(ctx) {
        const bounds = this.getBounds();
        ctx.strokeRect(bounds.xStart, bounds.yStart, this.w, this.h);
    }
}
