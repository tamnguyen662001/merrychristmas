// ============== FIREWORK_START ==============//
var message = [['MERRY', 'CHRISTMAS'], ['FUJINET', 'QUYNHƠN']];

var currentGroupIndex = 0, 
    currentStringIndex = 0, 
    w = c.width = window.innerWidth,
	h = c.height = window.innerHeight,
	ctx = c.getContext('2d'),

	hw = w / 2,
	hh = h / 2,

	opts = {
		strings: message,
		charSize: 40,
		charSpacing: 40,
		lineHeight: 45,

		cx: w / 2,
		cy: h / 2,

		fireworkPrevPoints: 10,
		fireworkBaseLineWidth: 5,
		fireworkAddedLineWidth: 8,
		fireworkSpawnTime: 200,
		fireworkBaseReachTime: 30,
		fireworkAddedReachTime: 30,
		fireworkCircleBaseSize: 20,
		fireworkCircleAddedSize: 10,
		fireworkCircleBaseTime: 30,
		fireworkCircleAddedTime: 30,
		fireworkCircleFadeBaseTime: 10,
		fireworkCircleFadeAddedTime: 5,
		fireworkBaseShards: 5,
		fireworkAddedShards: 5,
		fireworkShardPrevPoints: 3,
		fireworkShardBaseVel: 4,
		fireworkShardAddedVel: 2,
		fireworkShardBaseSize: 3,
		fireworkShardAddedSize: 3,
		gravity: .1,
		upFlow: -.1,
		letterContemplatingWaitTime: 360,
		balloonSpawnTime: 20,
		balloonBaseInflateTime: 10,
		balloonAddedInflateTime: 10,
		balloonBaseSize: 20,
		balloonAddedSize: 20,
		balloonBaseVel: .4,
		balloonAddedVel: .4,
		balloonBaseRadian: -(Math.PI / 2 - .5),
		balloonAddedRadian: -1,
	},
	calc = {
		totalWidth: opts.strings.reduce((maxLength, group) => {
			let groupWidth = group.reduce((max, str) => {
				return Math.max(max, str.length);
			}, 0);
			return Math.max(maxLength, groupWidth);
		}, 0) * opts.charSpacing
	};

	Tau = Math.PI * 2,
	TauQuarter = Tau / 4,

	letters = [];

ctx.font = opts.charSize + 'px Verdana';

function Letter(char, x, y) {
	this.char = char;
	this.x = x;
	this.y = y;

	this.dx = -ctx.measureText(char).width / 2;
	this.dy = +opts.charSize / 2;

	this.fireworkDy = this.y - hh;

	var hue = x / calc.totalWidth * 360;

	this.color = 'hsl(hue,80%,50%)'.replace('hue', hue);
	this.lightAlphaColor = 'hsla(hue,80%,light%,alp)'.replace('hue', hue);
	this.lightColor = 'hsl(hue,80%,light%)'.replace('hue', hue);
	this.alphaColor = 'hsla(hue,80%,50%,alp)'.replace('hue', hue);

	this.reset();
}
Letter.prototype.reset = function () {

	this.phase = 'firework';
	this.tick = 0;
	this.spawned = false;
	this.spawningTime = opts.fireworkSpawnTime * Math.random() | 0;
	this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() | 0;
	this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
	this.prevPoints = [[0, hh, 0]];
}
Letter.prototype.step = function () {

	if (this.phase === 'firework') {

		if (!this.spawned) {

			++this.tick;
			if (this.tick >= this.spawningTime) {

				this.tick = 0;
				this.spawned = true;
			}

		} else {

			++this.tick;

			var linearProportion = this.tick / this.reachTime,
				armonicProportion = Math.sin(linearProportion * TauQuarter),

				x = linearProportion * this.x,
				y = hh + armonicProportion * this.fireworkDy;

			if (this.prevPoints.length > opts.fireworkPrevPoints)
				this.prevPoints.shift();

			this.prevPoints.push([x, y, linearProportion * this.lineWidth]);

			var lineWidthProportion = 1 / (this.prevPoints.length - 1);

			for (var i = 1; i < this.prevPoints.length; ++i) {

				var point = this.prevPoints[i],
					point2 = this.prevPoints[i - 1];

				ctx.strokeStyle = this.alphaColor.replace('alp', i / this.prevPoints.length);
				ctx.lineWidth = point[2] * lineWidthProportion * i;
				ctx.beginPath();
				ctx.moveTo(point[0], point[1]);
				ctx.lineTo(point2[0], point2[1]);
				ctx.stroke();

			}

			if (this.tick >= this.reachTime) {

				this.phase = 'contemplate';

				this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
				this.circleCompleteTime = opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random() | 0;
				this.circleCreating = true;
				this.circleFading = false;

				this.circleFadeTime = opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random() | 0;
				this.tick = 0;
				this.tick2 = 0;

				this.shards = [];

				var shardCount = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() | 0,
					angle = Tau / shardCount,
					cos = Math.cos(angle),
					sin = Math.sin(angle),

					x = 1,
					y = 0;

				for (var i = 0; i < shardCount; ++i) {
					var x1 = x;
					x = x * cos - y * sin;
					y = y * cos + x1 * sin;

					this.shards.push(new Shard(this.x, this.y, x, y, this.alphaColor));
				}
			}

		}
	} else if (this.phase === 'contemplate') {

		++this.tick;

		if (this.circleCreating) {

			++this.tick2;
			var proportion = this.tick2 / this.circleCompleteTime,
				armonic = -Math.cos(proportion * Math.PI) / 2 + .5;

			ctx.beginPath();
			ctx.fillStyle = this.lightAlphaColor.replace('light', 50 + 50 * proportion).replace('alp', proportion);
			ctx.beginPath();
			ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
			ctx.fill();

			if (this.tick2 > this.circleCompleteTime) {
				this.tick2 = 0;
				this.circleCreating = false;
				this.circleFading = true;
			}
		} else if (this.circleFading) {

			ctx.fillStyle = this.lightColor.replace('light', 70);
			ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

			++this.tick2;
			var proportion = this.tick2 / this.circleFadeTime,
				armonic = -Math.cos(proportion * Math.PI) / 2 + .5;

			ctx.beginPath();
			ctx.fillStyle = this.lightAlphaColor.replace('light', 100).replace('alp', 1 - armonic);
			ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
			ctx.fill();

			if (this.tick2 >= this.circleFadeTime)
				this.circleFading = false;

		} else {

			ctx.fillStyle = this.lightColor.replace('light', 70);
			ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
		}

		for (var i = 0; i < this.shards.length; ++i) {

			this.shards[i].step();

			if (!this.shards[i].alive) {
				this.shards.splice(i, 1);
				--i;
			}
		}

		if (this.tick > opts.letterContemplatingWaitTime) {

			this.phase = 'balloon';

			this.tick = 0;
			this.spawning = true;
			this.spawnTime = opts.balloonSpawnTime * Math.random() | 0;
			this.inflating = false;
			this.inflateTime = opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random() | 0;
			this.size = opts.balloonBaseSize + opts.balloonAddedSize * Math.random() | 0;

			var rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
				vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();

			this.vx = Math.cos(rad) * vel;
			this.vy = Math.sin(rad) * vel;
		}
	} else if (this.phase === 'balloon') {

		ctx.strokeStyle = this.lightColor.replace('light', 80);

		if (this.spawning) {

			++this.tick;
			ctx.fillStyle = this.lightColor.replace('light', 70);
			ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

			if (this.tick >= this.spawnTime) {
				this.tick = 0;
				this.spawning = false;
				this.inflating = true;
			}
		} else if (this.inflating) {

			++this.tick;

			var proportion = this.tick / this.inflateTime,
				x = this.cx = this.x,
				y = this.cy = this.y - this.size * proportion;

			ctx.fillStyle = this.alphaColor.replace('alp', proportion);
			ctx.beginPath();
			generateBalloonPath(x, y, this.size * proportion);
			ctx.fill();

			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x, this.y);
			ctx.stroke();

			ctx.fillStyle = this.lightColor.replace('light', 70);
			ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

			if (this.tick >= this.inflateTime) {
				this.tick = 0;
				this.inflating = false;
			}

		} else {

			this.cx += this.vx;
			this.cy += this.vy += opts.upFlow;

			ctx.fillStyle = this.color;
			ctx.beginPath();
			generateBalloonPath(this.cx, this.cy, this.size);
			ctx.fill();

			ctx.beginPath();
			ctx.moveTo(this.cx, this.cy);
			ctx.lineTo(this.cx, this.cy + this.size);
			ctx.stroke();

			ctx.fillStyle = this.lightColor.replace('light', 70);
			ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);

			if (this.cy + this.size < -hh || this.cx < -hw || this.cy > hw)
				this.phase = 'done';

		}
	}
}
function Shard(x, y, vx, vy, color) {

	var vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();

	this.vx = vx * vel;
	this.vy = vy * vel;

	this.x = x;
	this.y = y;

	this.prevPoints = [[x, y]];
	this.color = color;

	this.alive = true;

	this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
}
Shard.prototype.step = function () {

	this.x += this.vx;
	this.y += this.vy += opts.gravity;

	if (this.prevPoints.length > opts.fireworkShardPrevPoints)
		this.prevPoints.shift();

	this.prevPoints.push([this.x, this.y]);

	var lineWidthProportion = this.size / this.prevPoints.length;

	for (var k = 0; k < this.prevPoints.length - 1; ++k) {

		var point = this.prevPoints[k],
			point2 = this.prevPoints[k + 1];

		ctx.strokeStyle = this.color.replace('alp', k / this.prevPoints.length);
		ctx.lineWidth = k * lineWidthProportion;
		ctx.beginPath();
		ctx.moveTo(point[0], point[1]);
		ctx.lineTo(point2[0], point2[1]);
		ctx.stroke();

	}

	if (this.prevPoints[0][1] > hh)
		this.alive = false;
}
function generateBalloonPath(x, y, size) {

	ctx.moveTo(x, y);
	ctx.bezierCurveTo(x - size / 2, y - size / 2,
		x - size / 4, y - size,
		x, y - size);
	ctx.bezierCurveTo(x + size / 4, y - size,
		x + size / 2, y - size / 2,
		x, y);
}

function anim() {

	if (isCanvasActive) {
		window.requestAnimationFrame(anim);

		ctx.fillStyle = '#111';
		ctx.fillRect(0, 0, w, h);

		ctx.translate(hw, hh);

		var done = true;
		for (var l = 0; l < letters.length; ++l) {

			letters[l].step();
			if (letters[l].phase !== 'done')
				done = false;
		}

		ctx.translate(-hw, -hh);

		if (done)
			resetLetters();
	}
}
// ============== FIREWORK_END ==============//

// ============== PLAY_SONG_START ==============//
var isCanvasActive = true,
	canvasArea     = document.getElementById("c"),
	audioArea      = document.getElementById("song"),
	buttonArea     = document.getElementById("button"),
	user           = document.getElementById('name');

function start(user) {
	message[1][1] = user; // message.push([user]);
	canvasArea.style.display = "block";
	buttonArea.style.display = "none";
	audioArea.play();
	console.table(message)
}

function validate() {
	username = user.value.toUpperCase();
	if (!username.trim()) return user.focus();
	start(username);
}
// ============== PLAY_SONG_END ==============//

// ============== DISPLAY_MESSAGE_START ==============//
function resetLetters() {
    letters = [];
    let currentGroup = opts.strings[currentGroupIndex];

    for (let i = 0; i < currentGroup.length; ++i) {
        let currentString = currentGroup[i];
        for (var j = 0; j < currentString.length; ++j) {
            letters.push(new Letter(currentString[j],
                j * opts.charSpacing + opts.charSpacing / 2 - currentString.length * opts.charSize / 2,
                i * opts.lineHeight + opts.lineHeight / 2 - currentGroup.length * opts.lineHeight / 2));
        }
    }

    currentGroupIndex = (currentGroupIndex + 1) % opts.strings.length;
    currentStringIndex = 0; 
}

anim();
// ============== DISPLAY_MESSAGE_END ==============//

// ============== EVENT_START ==============//
window.addEventListener('resize', function () {

	w = c.width = window.innerWidth;
	h = c.height = window.innerHeight;

	hw = w / 2;
	hh = h / 2;

	ctx.font = opts.charSize + 'px Verdana';
})

canvasArea.addEventListener("dblclick", function () {
	isCanvasActive = !isCanvasActive;
	isCanvasActive ? audioArea.play() : audioArea.pause();
	anim();
});

document.addEventListener("DOMContentLoaded", function () {
    const snowContainer = document.getElementById("snow");

    const particlesPerThousandPixels = 0.1;
    const fallSpeed = 1.25;
    const pauseWhenNotActive = true;
    const maxSnowflakes = 200;
    const snowflakes = [];

    let snowflakeInterval;
    let isTabActive = true;

    function resetSnowflake(snowflake) {
        const size = Math.random() * 5 + 1;
        const viewportWidth = window.innerWidth - size; // Adjust for snowflake size
        const viewportHeight = window.innerHeight;

        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${Math.random() * viewportWidth}px`; // Constrain within viewport width
        snowflake.style.top = `-${size}px`;

        const animationDuration = (Math.random() * 3 + 2) / fallSpeed;
        snowflake.style.animationDuration = `${animationDuration}s`;
        snowflake.style.animationTimingFunction = "linear";
        snowflake.style.animationName =
            Math.random() < 0.5 ? "fall" : "diagonal-fall";

        setTimeout(() => {
            if (parseInt(snowflake.style.top, 10) < viewportHeight) {
                resetSnowflake(snowflake);
            } else {
                snowflake.remove(); // Remove when it goes off the bottom edge
            }
        }, animationDuration * 1000);
    }

    function createSnowflake() {
        if (snowflakes.length < maxSnowflakes) {
            const snowflake = document.createElement("div");
            snowflake.classList.add("snowflake");
            snowflakes.push(snowflake);
            snowContainer.appendChild(snowflake);
            resetSnowflake(snowflake);
        }
    }

    function generateSnowflakes() {
        const numberOfParticles =
            Math.ceil((window.innerWidth * window.innerHeight) / 1000) *
            particlesPerThousandPixels;
        const interval = 5000 / numberOfParticles;

        clearInterval(snowflakeInterval);
        snowflakeInterval = setInterval(() => {
            if (isTabActive && snowflakes.length < maxSnowflakes) {
                requestAnimationFrame(createSnowflake);
            }
        }, interval);
    }

    function handleVisibilityChange() {
        if (!pauseWhenNotActive) return;

        isTabActive = !document.hidden;
        if (isTabActive) {
            generateSnowflakes();
        } else {
            clearInterval(snowflakeInterval);
        }
    }

    generateSnowflakes();

    window.addEventListener("resize", () => {
        clearInterval(snowflakeInterval);
        setTimeout(generateSnowflakes, 1000);
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
});
// ============== EVENT_END ==============//