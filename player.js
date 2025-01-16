class Player {
	constructor(game) {
		this.game = game;
		this.tempGrounded = 500;
		this.jumpHeight = 550;

		this.facing = 0; // 0 = right, 1 = left
		this.state = 1; // 0 = idle, 1 = running // 2 = running backwards // 3 = rising 4 = falling

		this.jumped = 0; // 0 = can jump, 1 = can vary gravity, 2 = can't vary gravity

		this.x = 500;
		this.y = this.tempGrounded;
		this.xV = 0;
		this.yV = 0;
		this.maxSpeed = 350;
		this.walkAccel = 1050;



		this.animations = [];
		this.loadAnimations();
	};

	loadAnimations() {
		this.animations.push(new Animator(ASSET_MANAGER.getAsset("./anims/idle.png"), 0, 0, 32, 32, 2, 2));
		this.animations.push(new Animator(ASSET_MANAGER.getAsset("./anims/run.png"), 0, 0, 32, 32, 4, 0.20));
		this.animations.push(new Animator(ASSET_MANAGER.getAsset("./anims/run.png"), 0, 0, 32, 32, 4, 0.20));
		this.animations.push(new Animator(ASSET_MANAGER.getAsset("./anims/jump.png"), 0, 0, 32, 32, 1, 1));
		this.animations.push(new Animator(ASSET_MANAGER.getAsset("./anims/jump.png"), 32, 0, 32, 32, 1, 1));
	};

	update() {
		this.checkInput();
		this.calcMovement();
		this.setState();
	};

	checkInput () {
		var move = 0;
		var grounded = this.isGrounded();
		if (this.game.keys["d"]) move += 1;
		if (this.game.keys["a"]) move -= 1;

		if (this.game.keys[" "]) {
			if (grounded && this.jumped == 0) {
				this.yV = -this.jumpHeight;
				this.jumped = 1;
			} 
		} else {
			if (grounded) this.jumped = 0;
			else if (this.yV < 0 && this.jumped == 1) this.yV -= ((this.yV * 8) * this.game.clockTick)
		}

		// Don't let the player exceed max speed
		if (!((this.xV > this.maxSpeed && move == 1) || (this.xV < -this.maxSpeed && move == -1))) {
			// Accelerate the player
			this.xV += this.walkAccel * move * this.game.clockTick;
		}

		//Set facing direction
		if (move == -1) this.facing = 1;
		if (move == 1) this.facing = 0;

		// Do we apply ground friction to the player?
		var traction = this.isGrounded() && (move == 0 || (move == 1 && this.xV < 0) || (move == -1 && this.xV > 0)
		|| (this.xV > this.maxSpeed && this.xV < -this.maxSpeed))
		if (traction) {
			// Apply ground friction
			if (this.xV < 0) this.xV += this.walkAccel * this.game.clockTick;
			else if (this.xV > 0) this.xV -= this.walkAccel * this.game.clockTick;
			if (this.xV < this.maxSpeed / 20 && this.xV > -this.maxSpeed / 20) this.xV = 0;
		}

	}

	calcMovement() {
		const gravity = 1000;
		this.x += this.xV*this.game.clockTick;
		this.y += this.yV*this.game.clockTick;
		if (this.y > this.tempGrounded) this.y = this.tempGrounded;
		if (!this.isGrounded()) this.yV += gravity*this.game.clockTick;
	}

	setState() {
		if (this.isGrounded()) {
			if (this.xV == 0) this.state = 0; else this.state = 1;
		} else {
			if (this.yV < 0) this.state = 3; else this.state = 4;
		}
		
	}

	isGrounded() { //TEMPORARY
		return this.y >= this.tempGrounded;
	}

	draw(ctx) {
		if (this.facing == 1) {
			ctx.save();
			ctx.scale(-1,1);
			this.animations[this.state].drawFrame(this.game.clockTick, ctx, -this.x + 100, this.y, 3);
			ctx.restore();
		} else {
			this.animations[this.state].drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
		}
	};
}