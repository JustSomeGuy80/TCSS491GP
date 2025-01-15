class Player {
	constructor(game) {
		this.game = game;
		this.tempGrounded = 500;

		this.facing = 0; // 0 = right, 1 = left
		this.state = 1; // 0 = idle, 1 = running // 2 = running backwards // 3 = rising 4 = falling

		this.x = 500;
		this.y = this.tempGrounded;
		this.xV = 0;
		this.yV = 0;
		this.speed = 350;



		this.animations = [];
		this.loadAnimations();
	};

	loadAnimations() {
		this.animations.push(new Animator(ASSET_MANAGER.getAsset("./idle.png"), 0, 0, 32, 32, 2, 2));
		this.animations.push(new Animator(ASSET_MANAGER.getAsset("./run.png"), 0, 0, 32, 32, 4, 0.20));
		this.animations.push(new Animator(ASSET_MANAGER.getAsset("./run.png"), 0, 0, 32, 32, 4, 0.20));
		this.animations.push(new Animator(ASSET_MANAGER.getAsset("./jump.png"), 0, 0, 32, 32, 1, 1));
		this.animations.push(new Animator(ASSET_MANAGER.getAsset("./jump.png"), 32, 0, 32, 32, 1, 1));
	};

	update() {
		this.checkInput();
		this.calcMovement();
		this.setState();
	};

	checkInput () {
		var move = 0;
		if (this.game.keys["d"]) move += 1;
		if (this.game.keys["a"]) move -= 1;

		if (this.game.keys[" "]) {
			if (this.isGrounded()) this.yV = -550;
		}

		this.xV = this.speed * move;
		if (move == -1) this.facing = 1;
		if (move == 1) this.facing = 0;

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
		console.log(this.y);
		console.log(this.tempGrounded);

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