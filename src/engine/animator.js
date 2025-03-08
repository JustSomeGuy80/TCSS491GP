class Animator {
    constructor(
        spritesheet,
        xStart,
        yStart,
        width,
        height,
        frameCount,
        frameDuration,
        loops = true
    ) {
        Object.assign(this, {
            spritesheet,
            xStart,
            yStart,
            width,
            height,
            frameCount,
            frameDuration,
        });

        this.elapsedTime = 0;
        this.totalTime = frameCount * frameDuration;
        this.frameCount = frameCount;
        this.loops = loops;
        this.done = false;
    }

    drawFrame(tick, ctx, x, y, scale, horizontalFlip, verticalFlip) {
        ctx.save();

        let horizontalFlipValue = horizontalFlip ? -1 : 1;
        let verticalFlipValue = verticalFlip ? -1 : 1;
        ctx.scale(horizontalFlipValue, verticalFlipValue);

        this.elapsedTime += tick;
        if (this.elapsedTime > this.totalTime) {
            if (this.loops) this.elapsedTime -= this.totalTime; //loops animation
            this.done = true;
        }
        const frame = this.currentFrame();
        ctx.drawImage(
            this.spritesheet,
            this.xStart + this.width * frame,
            this.yStart,
            this.width,
            this.height,
            x * horizontalFlipValue,
            y * verticalFlipValue,
            this.width * scale * horizontalFlipValue,
            this.height * scale * verticalFlipValue
        );

        ctx.restore();
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    currentFrame() {
        var frame = Math.floor(this.elapsedTime / this.frameDuration);
        if (frame >= this.frameCount) frame = this.frameCount - 1;
        return frame;
    }

    isDone() {
        return this.done;
    }

    reset() {
        this.elapsedTime = 0;
        this.done = false;
    }
}
