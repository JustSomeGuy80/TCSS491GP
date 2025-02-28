/** @typedef {import("./ColliderRect")} */
/** @typedef {import("./position")} */
/** @typedef {import("../engine/gameengine")} */
/** @typedef {import("../primitives/vector")} */
/** @typedef {import("../engine/assetmanager")} */
/** @typedef {import("./sprite")} */

class Grapple {
    static #G = 1000;
    /**
     * @param {GameEngine} game
     * @param {AssetManager} assetManager
     * @param {Player} player
     * @param {Position} source
     * @param {number} xOffset
     * @param {number} yOffset
     * @param {Position} dest
     * @param {vector} vect
     */
    constructor(game, assetManager, player, source, xOffset, yOffset, dest, mag) {
        this.game = game;
        this.assetManager = assetManager;
        this.player = player;
        this.source = source;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.dest = dest;
        this.mag = mag;

        this.lastInnerPos = dest.asVector().subtract(this.player.position.asVector());
        this.locked = false;

        this.debugMode = false;

        // For debugging info
        this.exitPoint = new Vector(0, 0);
        this.linkVector = new Vector(0, 0);
        this.currentPos = new Vector(0, 0);

        this.maxSwing = 0.2;
        this.leftFuel = this.maxSwing;
        this.rightFuel = this.maxSwing;
    }

    update() {
        var currentPos = this.player.position.asVector().subtract(this.dest.asVector());

        if (currentPos.x <= 0) this.rightFuel = this.maxSwing;
        if (currentPos.x >= 0) this.leftFuel = this.maxSwing;

        if (currentPos.getMagnitude() > this.mag) {
            if (!this.player.isPhysicsGrounded()) {
                this.player.jumped = 3;
            }

            var exitPoint = this.runCollisions(currentPos);
            // Calculate the player's current energy (Gravity * height + 1/2 * velocity^2)
            // We do this to know how much velocity the player should have after adjustment

            var energy =
                Grapple.#G * (this.mag + -exitPoint.y) +
                (1 / 2) * this.player.velocity.getMagnitude() ** 2;

            var diffVector = currentPos.subtract(exitPoint);
            var angle =
                Math.atan2(diffVector.y, diffVector.x) - Math.atan2(exitPoint.y, exitPoint.x);

            if (angle < -Math.PI) angle = angle + 2 * Math.PI;
            else if (angle > Math.PI) angle = angle - 2 * Math.PI;

            // Place player in their new position
            var diffAngle = (diffVector.getMagnitude() / this.mag) * (angle / Math.abs(angle));
            this.player.position.x =
                this.dest.x + Math.cos(Math.atan2(exitPoint.y, exitPoint.x) + diffAngle) * this.mag;
            this.player.position.y =
                this.dest.y + Math.sin(Math.atan2(exitPoint.y, exitPoint.x) + diffAngle) * this.mag;

            // Update lastInnerPos to current position
            this.lastInnerPos = this.player.position.asVector().subtract(this.dest.asVector());

            // Correct player's velocity
            var mult;
            if (!this.locked && (Math.abs(angle) * 2) / Math.PI < 0.75)
                mult = ((4 / 3) * (Math.abs(angle) * 2)) / Math.PI;
            else mult = 1 - (1 - (Math.abs(angle) * 2) / Math.PI) * this.game.clockTick;
            var velMag =
                Math.sqrt(2 * (energy - Grapple.#G * (this.mag + -this.lastInnerPos.y))) * mult;
            if (isNaN(velMag)) velMag = 0;
            this.player.velocity.x =
                Math.cos(Math.atan2(this.player.velocity.y, this.player.velocity.x) + diffAngle) *
                velMag;
            this.player.velocity.y =
                Math.sin(Math.atan2(this.player.velocity.y, this.player.velocity.x) + diffAngle) *
                velMag;

            // Counteract gravity if necessary
            if (this.lastInnerPos.y > 0) {
                this.player.velocity.y -=
                    (this.lastInnerPos.y / this.mag) * Grapple.#G * this.game.clockTick;
            }
            this.locked = true;
        } else {
            if (this.player.jumped == 3) this.player.jumped = 2;
            if (this.currentPos.getMagnitude() <= this.mag * 0.99) this.locked = false;
            this.lastInnerPos = currentPos;
        }
    }

    runCollisions(currentPos) {
        var linkVector = currentPos.subtract(this.lastInnerPos);
        var m;
        if (linkVector.x !== 0) m = linkVector.y / linkVector.x;
        else if (linkVector.y > 0) m = Infinity;
        else m = -Infinity;

        var yInt;
        if (m === Infinity || m === -Infinity) {
            yInt = this.lastInnerPos.x === 0 ? 0 : false;
        } else yInt = -m * this.lastInnerPos.x + this.lastInnerPos.y;

        var vector1;
        var vector2;

        if (m === Infinity || m === -Infinity) {
            var y = this.mag * Math.sin(Math.acos(Math.abs(this.lastInnerPos.x) / this.mag));
            vector1 = new Vector(this.lastInnerPos.x, y);
            vector2 = new Vector(this.lastInnerPos.x, -y);
        } else {
            var a = 1 + m * m;
            var b = 2 * (m * yInt);
            var c = yInt * yInt - this.mag * this.mag;

            var d = b * b - 4 * a * c;

            var x1 = (-b + Math.sqrt(d)) / (2 * a);
            var y1 = x1 * m + yInt;
            vector1 = new Vector(x1, y1);

            var x2 = (-b - Math.sqrt(d)) / (2 * a);
            var y2 = x2 * m + yInt;
            vector2 = new Vector(x2, y2);
        }

        var exitPoint;
        if (
            currentPos.subtract(vector1).getMagnitude() <
            currentPos.subtract(vector2).getMagnitude()
        )
            exitPoint = vector1;
        else exitPoint = vector2;

        this.currentPos = currentPos;
        this.exitPoint = exitPoint;

        return exitPoint;
    }

    grappleCheck(move) {
        var returnee = false;
        if (move == 1) {
            if (this.rightFuel > 0) returnee = true;
            this.rightFuel -= this.game.clockTick;
        } else if (move == -1) {
            if (this.leftFuel > 0) returnee = true;
            this.leftFuel -= this.game.clockTick;
        } else returnee = true;
        return returnee;
    }

    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = "rgb(110, 200, 250)";
        ctx.beginPath();
        ctx.moveTo(this.source.x - this.game.camera.x, this.source.y - this.game.camera.y);
        ctx.lineTo(this.dest.x - this.game.camera.x, this.dest.y - this.game.camera.y);
        ctx.stroke();
        ctx.restore();

        if (this.debugMode) {
            ctx.save();
            ctx.strokeStyle = "yellow";
            ctx.strokeRect(
                this.dest.x - 5 - this.game.camera.x,
                this.dest.y - 5 - this.game.camera.y,
                10,
                10
            );

            ctx.beginPath();
            ctx.strokeStyle = "red";
            ctx.arc(
                this.dest.x - this.game.camera.x,
                this.dest.y - this.game.camera.y,
                this.mag,
                0,
                2 * Math.PI
            );
            ctx.stroke();

            ctx.strokeStyle = "purple";
            ctx.strokeRect(
                this.dest.x + this.exitPoint.x - 5 - this.game.camera.x,
                this.dest.y + this.exitPoint.y - 5 - this.game.camera.y,
                10,
                10
            );
            ctx.beginPath();
            ctx.moveTo(
                this.dest.x + this.currentPos.x - this.game.camera.x,
                this.dest.y + this.currentPos.y - this.game.camera.y
            );
            ctx.lineTo(
                this.dest.x + this.lastInnerPos.x - this.game.camera.x,
                this.dest.y + this.lastInnerPos.y - this.game.camera.y
            );
            ctx.stroke();

            ctx.strokeStyle = "green";
            ctx.beginPath();
            ctx.moveTo(this.dest.x - this.game.camera.x, this.dest.y - this.game.camera.y);
            ctx.lineTo(
                this.dest.x + this.lastInnerPos.x - this.game.camera.x,
                this.dest.y + this.lastInnerPos.y - this.game.camera.y
            );
            ctx.stroke();

            ctx.restore();
        }
    }
}
