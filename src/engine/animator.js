class Animator {
    constructor(spritesheet, xStart, yStart, width, height, frameCount, frameDuration) {
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
    }

    drawFrame(tick, ctx, x, y, scale, horizontalFlip, verticalFlip) {
        ctx.save();

        let horizontalFlipValue = horizontalFlip ? -1 : 1;
        let verticalFlipValue = verticalFlip ? -1 : 1;
        ctx.scale(horizontalFlipValue, verticalFlipValue);

        this.elapsedTime += tick;
        if (this.elapsedTime > this.totalTime) this.elapsedTime -= this.totalTime; //loops animation
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

    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration);
    }

    isDone() {
        return this.elapsedTime >= this.totalTime;
    }
}
