let canvas = document.createElement("canvas"),
	ctx = canvas.getContext("2d"),
	base = document.createElement("canvas"),
	pen = base.getContext("2d"),
	cover = document.createElement("canvas"),
	overlay = cover.getContext("2d")
let key = {};
function start() {
	document.body.appendChild(canvas);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	cover.width = window.innerWidth;
	cover.height = window.innerHeight;
	base.width = window.innerWidth;
	base.height = window.innerHeight;
	update();
}
let ability = false, cur = 0, lives = 3, killed = 1, delay = 0, wave = 0, end = 0, time = 0, score = 0, added = 0, prev
let waves = [
	{
		background : "#00000033",
		fight : "#AA000055",
		fightOver : "#AA000055",
		backreset : "#0000007f",
		fightreset : "#AA0000",
		boss : BulletBoss,
		killed : 15,
		delay : 100
	},
	{
		background : "#005500AA",
		fight : "#AAAA0077",
		fightOver : "#AAAA0055",
		backreset : "#005500CC",
		fightreset : "#AAAA0077",
		boss : TrackerBoss,
		killed : 25,
		delay : 100
	},
	{
		get background() {
			return (Math.random() > 0.75) ? "#EEEEEE77" : "#DDDDDD77"
		},
		get fight() {
			for(let col in this.colors) {
				this.colors[col] += Math.random() * 10 - 5
				if(this.colors[col] > 255) this.colors[col] = 255
				if(this.colors[col] < 0) this.colors[col] = 0
			}
			return `rgba(${this.colors[0]}, ${this.colors[1]}, ${this.colors[2]}, 0.5)`
		},
		colors : [0, 0, 0],
		colors2 : [0, 0, 0],
		get fightOver() {
			for(let col in this.colors) {
				this.colors2[col] += Math.random() * 10 - 5
				if(this.colors2[col] > 255) this.colors2[col] = 255
				if(this.colors2[col] < 0) this.colors2[col] = 0
			}
			return `rgba(${this.colors2[0]}, ${this.colors2[1]}, ${this.colors2[2]}, 0.2)`
		},
		backreset : "#DDDDDD",
		get fightreset() {
			return `rgba(${this.colors[0]}, ${this.colors[1]}, ${this.colors[2]})`
		},
		boss : FinalBoss,
		killed : 40,
		delay : 250
	}
]
function update() {
	while(game.width / 2 < 30) scale--
	if(!ability) {
		if(!enemies.length || player.isDead) {
			player = new Player
			enemies = []
			exp = []
			if(wave < 2) {
				spawn(new Enemy)
				spawn(new Chaser)
			}
			spawn(new Shooter)
			spawn(new Collector)
			if(wave > 0) {
				spawn(new Teleporter)
				spawn(new Tracker)
			}
			if(wave > 1) {
				spawn(new Ender)
				spawn(new Destroyer)
				spawn(new Illusioner)
			}
		}
		player.sk = 999999999
		enemies = enemies.filter((enemy) => enemy.alive)
		exp = exp.filter((xp) => xp.alive)
		player.update();
		for(let enemy of enemies) enemy.update()
		for(let xp of exp) xp.update()
		dualLoop(enemies, function(e, e2) {
			if(touch(e, e2) && e.parent != e2 && e2.parent != e && e2.parent != e.parent) {
				e.die()
				e2.die()
			}
		})
		for(let enemy of enemies) if(touch(player, enemy) && enemy.parent != player) {enemy.die(); player.die();}
		for(let xp of exp) if(touch(player, xp)) {xp.die(); player.xp++; player.sk++; if(player.xp % 250 == 0) lives}
		if(time % 100 != 0) pen.fillStyle = waves[wave].background;
		else pen.fillStyle = waves[wave].backreset
		pen.fillRect(0, 0, canvas.width, canvas.height);
		overlay.clearRect(0, 0, canvas.width, canvas.height)
		pen.fillStyle = "green"
		overlay.strokeStyle = "blue"
		text(0, 0, "Select Ability")
		let a
		switch(wave) {
			case 0 :
				a = ["Invinciblity(K)", "Shoot(Arrow Keys)", "Invisiblity(K)", "Force Push(J, K)"]
			break;
			case 1 :
				a = ["Invinciblity(K)", "Shoot(Arrow Keys, K)", "Invisiblity(K)", "Force Push(J, K)", "Shoot2(Arrow Keys, K)", "Teleport(Click, K, Arrow Keys)"]
			break;
			case 2 :
				a = ["Invinciblity(K)", "Shoot(Arrow Keys, K)", "Invisiblity(K)", "Force Push(J, K)", "Shoot2(Arrow Keys, K)", "Teleport(Click, K, Arrow Keys)", "Resistance(K)"]
			break;
		}
		text(game.width / 3 - pen.measureText(a[cur]).width / scale / 3, 0, a[cur])
		text(0, (game.height - 2) / 1.5, "Enter to select, Shift to go to next")
		player.draw();
		for(let enemy of enemies) enemy.draw()
		for(let xp of exp) xp.draw()
		ctx.drawImage(base, 0, 0);
		ctx.drawImage(cover, 0, 0);
		if(key.Shift == 1) {
			cur += 1
			cur %= a.length
			player.isDead = true
		}
		if(key.Enter == 1) {
			ability = cur + 1
			player = new Player
			enemies = []
			exp = []
		}
		if(key["="] == 1) {
			scale++
			player.isDead = true
		}
		if(key["+"] == 1) {
			scale++
			player.isDead = true
		}
		if(key["-"] == 1) {
			scale--
			player.isDead = true
			if(scale < 5) scale++
		}
		document.title = `Bullets(Power Select : Wave ${wave})`
	}else{
		enemies = enemies.filter((enemy) => enemy.alive)
		exp = exp.filter((xp) => xp.alive)
		exp.sort((a, b) => a.xp - b.xp)
		while((end >= 450 || Math.random() < 0.01) && killed < waves[wave].killed && wave == 0) {
			let option = weight([
				10,
				5,
				1,
				exp.length / 10
			])
			let choices = [
				Enemy,
				Chaser,
				Shooter,
				Collector
			]
			killed++
			spawn(new choices[option])
		}
		while((end >= 450 || Math.random() < 0.015) && killed < waves[wave].killed && wave == 1) {
			let option = weight([
				3,
				2,
				3,
				exp.length / 10,
				2,
				1
			])
			let choices = [
				Enemy,
				Chaser,
				Shooter,
				Collector,
				Tracker,
				Teleporter
			]
			killed++
			spawn(new choices[option])
		}
		while((end >= 450 || Math.random() < 0.02) && killed < waves[wave].killed && wave == 2) {
			let option = weight([
				3,
				exp.length / 10,
				2,
				1,
				5,
				5,
				4
			])
			let choices = [
				Shooter,
				Collector,
				Tracker,
				Teleporter,
				Ender,
				Destroyer,
				Illusioner
			]
			killed++
			spawn(new choices[option])
		}
		if(killed >= waves[wave].killed && enemies.length == 0) {
			if(++delay == waves[wave].delay) spawn(new waves[wave].boss)
		}
		if(killed == waves[wave].killed && enemies.length == prev && delay == 0) {
			if(++end >= 500) enemies[0].die()
		}else{
			end = 0
		}
		prev = enemies.length
		if(killed == 0) delay = 0
		if(!player.isDead) player.update();
		for(let enemy of enemies) enemy.update()
		for(let xp of exp) xp.update()
		dualLoop(enemies, function(e, e2) {
			if(touch(e, e2) && e.parent != e2 && e2.parent != e && e2.parent != e.parent) {
				e.die()
				e2.die()
			}
		})
		for(let enemy of enemies) if(touch(player, enemy) && enemy.parent != player) {enemy.die(); player.die();}
		for(let xp of exp) if(touch(player, xp)) {xp.die(); player.xp += xp.xp; player.sk += xp.xp; if(!xp.pla) score += xp.xp}
		if(time % 100 != 0)
			pen.fillStyle = delay == 0 ? waves[wave].background : waves[wave].fight;
		else
			pen.fillStyle = delay == 0 ? waves[wave].backreset : waves[wave].fightreset;
		pen.fillRect(0, 0, canvas.width, canvas.height);
		overlay.clearRect(0, 0, canvas.width, canvas.height)
		pen.fillStyle = "green"
		overlay.strokeStyle = "blue"
		text(0, 0, `Score : ${score}`)
		overlay.strokeRect(scale * 0.5, scale * 1.35 * 1.5, scale, scale)
		text(1.25, 1, `x ${lives}`)
		for(let xp of exp) xp.draw()
		if(!player.isDead) player.draw();
		else if(lives) {
			player = new Player;
			lives--;
			for(let enemy of enemies) if(enemy.leave) enemy.leave()
			if(!delay) killed = 0;
			for(let enemy of enemies) {
				if(distanceTo(enemy, player) < 15) enemy.die()
			}
		}
		for(let enemy of enemies) enemy.draw()
		ctx.drawImage(base, 0, 0);
		ctx.drawImage(cover, 0, 0);
		if(delay > 25) {
			ctx.fillStyle = waves[wave].fightOver
			ctx.fillRect(0, 0, canvas.width, canvas.height)
		}
		if(key.Shift == 1) {
			player = new Player(0, 0)
			enemies = []
			exp = []
			lives = 3
			killed = 0
			score = 0
		}
		if(key.Enter == 1) {
			player = new Player(0, 0)
			enemies = []
			exp = []
			lives = 3
			ability = false
			killed = 0
			score = 0
		}
		if(!delay) {
			document.title = `Bullets(Campain : Wave ${wave})`
		}else{
			document.title = `Bullets(Campain : Boss ${wave})`
		}
	}
	while(score > Math.pow(2, added) * 100) {++added; ++lives}
	for(let ky in key) {
		key[ky] = 2
	}
	click = undefined
	time++
	setTimeout(update, 15);
}
let scale = 25
let game = {
	get width() {
		return canvas.width / scale
	},
	get height() {
		return canvas.height / scale
	}
}
function box(x, y, s) {
	overlay.lineWidth = Math.sqrt(s * scale) / 2
	pen.fillRect(x * scale, canvas.height - (y + s) * scale, s * scale, s * scale)
	overlay.strokeRect(x * scale, canvas.height - (y + s) * scale, s * scale, s * scale)
}
function text(x, y, text) {
	scale *= 1.5
	pen.font = `${scale}px Arial`
	overlay.font = `${scale}px Arial`
	overlay.lineWidth = scale / 25
	pen.fillText(text, scale * x, scale * y + scale)
	overlay.strokeText(text, scale * x, scale * y + scale)
	scale /= 1.5
}
function weight(weights) {
	let total = 0
	for(let value of weights) total += value
	let acu = 0
	let opt = Math.random() * total
	let chosen = 0
	for(let id in weights) {
		let value = weights[id]
		if(acu < opt)
			chosen = Number(id)
		acu += value
	}
	return chosen
}
function Entity(x, y) {
	this.x = x
	this.y = y
	this.s = 1
	this.con = 0
	this.parent = this
	this.alive = true
	this.outline = "white"
	this.color = "grey"
	this.speed = 0.1
	this.xp = 0
	this.draw = function() {
		pen.fillStyle = this.color
		overlay.strokeStyle = this.outline
		box(this.x, this.y, this.s)
	}
	this.die = function() {
		if(this.alive) {
			this.alive = false
			xp(this.xp, this.x, this.y)
		}
	}
	this.force = function() {};
	this.move = function() {
		let {radian, total} = this.velocity
		total /= 5
		if(this.con) {
			this.con--
			total *= -1
		}
		if(!this.sup) {
			if(total > 1/3) total = 1/3
		}else{
			this.sup--
		}
		this.x += Math.cos(radian) * total
		this.y += Math.sin(radian) * total
		if(this.x < 0) {
			this.x = 0
			this.velocity.x = Math.abs(this.velocity.x)
		}
		if(this.y < 0) {
			this.y = 0
			this.velocity.y = Math.abs(this.velocity.y)
		}
		if(this.x + this.s > game.width) {
			this.x = game.width - this.s
			this.velocity.x = -Math.abs(this.velocity.x)
		}
		if(this.y + this.s > game.height) {
			this.y = game.height - this.s
			this.velocity.y = -Math.abs(this.velocity.y)
		}
	};
	this.friction = function() {
		this.velocity.total *= 0.9
	}
	this.velocity = {
		get total() {
			return Math.sqrt(this.x * this.x + this.y * this.y)
		},
		get radian() {
			return Math.atan2(this.y, this.x)
		},
		set total(value) {
			let {radian} = this
			this.x = Math.cos(radian) * value
			this.y = Math.sin(radian) * value
		},
		set radian(value) {
			let {total} = this
			this.x = Math.cos(value) * total
			this.y = Math.sin(value) * total
		},
		x : 0,
		y : 0
	}
	this.update = function() {
		this.force();
		this.friction();
		this.move();
	}
}
function xp(amount, x, y, pla) {
	while(amount > 250) {
		amount -= 250
		new Exp2(x, y, pla)
	}
	while(amount > 25) {
		amount -= 25
		new Exp2(x, y, pla)
	}
	while(amount > 0) {
		amount -= 1
		new Exp(x, y, pla)
	}
}
function Exp(x, y, pla) {
	Entity.call(this, x, y);
	this.color = "#FFFFFFAA"
	this.pla = pla
	this.s = 0.4
	this.x += 0.2
	this.y += 0.2
	this.xp = 1
	this.speed = 0.1
	this.velocity.total = 0.2 * Math.random() + 0.8
	this.velocity.radian = Math.PI * Math.random() * 2
	this.die = function() {
		this.alive = false
	}
	this.close = function() {
		if(!player.isDead && player.alive && distanceTo(this, player) < 10 && !touch(this, player)) {
			let radian = radianTo(this, player)
			this.velocity.x += Math.cos(radian) * this.speed / distanceTo(this, player)
			this.velocity.y += Math.sin(radian) * this.speed / distanceTo(this, player)
		}
		for(let enemy of enemies) {
			if((enemy instanceof Collector || (enemy.parent == player && wave == 2)) && distanceTo(this, enemy) < 10) {
				let radian = radianTo(this, enemy)
				this.velocity.x += Math.cos(radian) * this.speed / distanceTo(this, enemy)
				this.velocity.y += Math.sin(radian) * this.speed / distanceTo(this, enemy)
			}
		}
	}
	this.force = function() {
		this.close()
	}
	exp.push(this)
}
function Exp2(x, y, pla) {
	Exp.call(this, x, y, pla);
	this.color = "#FFFF7FAA"
	this.outline = "black"
}
function Exp3(x, y, pla) {
	Exp.call(this, x, y, pla)
	this.colors = [Math.random() * 255, Math.random() * 255, Math.random() * 255]
	this.colors2 = [Math.random() * 255, Math.random() * 255, Math.random() * 255]
	this.xp = 250
	this.force = function() {
		for(let col in this.colors) {
			this.colors[col] += Math.random() * 30 - 15
			if(this.colors[col] > 255) this.colors[col] = 255
			if(this.colors[col] < 0) this.colors[col] = 0
			this.colors2[col] += Math.random() * 30 - 15
			if(this.colors2[col] > 255) this.colors2[col] = 255
			if(this.colors2[col] < 0) this.colors2[col] = 0
		}
		this.color = `rgb(${this.colors[0]}, ${this.colors[1]}, ${this.colors[2]})`
		this.outline = `rgb(${this.colors2[0]}, ${this.colors2[1]}, ${this.colors2[2]})`
		this.close()
	}
}
function Player(x, y) {
	Entity.call(this, x, y);
	this.x = game.width / 2 - 0.5
	this.y = game.height / 2 - 0.5
	this.color = "blue";
	this.bullet = "#00ffff"
	this.lives = 10
	this.sk = 100;
	this.inv = 0
	this.last = 0
	this.force = function() {
		if(key.d && this.velocity.x < 1) this.velocity.x += this.speed
		if(key.a && this.velocity.x > -1) this.velocity.x -= this.speed
		if(key.w && this.velocity.y < 1) this.velocity.y += this.speed
		if(key.s && this.velocity.y > -1) this.velocity.y -= this.speed
		this.sk += 0.1
		if(ability == 7 || cur == 6) {
			if(this.inv) this.inv--
			let sk = this.sk
			if(sk > 500) sk = 500
			let green = sk * 0.255 * 2
			let blue = 255 - green
			blue /= 255
			green /= 255
			if(blue < green) {
				blue /= green
				green = 1
			}else{
				green /= blue
				blue = 1
			}
			blue *= 255
			green *= 255
			if(key.k && this.sk > 100 && this.lives < 10) {this.lives++; this.sk -= 100}
			this.color = `rgb(0, ${green * this.lives / 10}, ${blue * this.lives / 10})`
		}else{
			if(this.sk < 100) this.color = `rgb(0, ${this.sk * 2.55}, ${255 - this.sk * 2.55})`
			else this.color = "#00ff00"
		}
		if(ability == 1 || cur == 0) {
			this.outline = "white"
			if((this.sk > 25 || this.inv) && this.sk > 0) {
				if(key.k) {
					this.sk--
					if(this.sk) {
						if(wave > 0 && !this.inv) {
							this.s = 2
							this.x -= 0.5
							this.y -= 0.5
						}
						this.inv = true
						this.outline = this.color
					}
				}else{
					if(wave > 0 && this.inv) {
						this.s = 1
						this.x += 0.5
						this.y += 0.5
					}
					this.inv = false
				}
			}else{
				if(wave > 0 && this.inv) {
					this.s = 1
					this.x += 0.5
					this.y += 0.5
				}
				this.inv = false
			}
		}
		if(ability == 2 || cur == 1) {
			if(!this.last) {
				if((!key.k || this.sk < 50) || wave == 0) {
					let x = this.x + 0.3, y = this.y + 0.3
					if(!key.ArrowLeft || !key.ArrowRight) {
						if(key.ArrowLeft) x--
						if(key.ArrowRight) x++
					}
					if(!key.ArrowDown || !key.ArrowUp) {
						if(key.ArrowDown) y--
						if(key.ArrowUp) y++
					}
					if((x != this.x + 0.3 || y != this.y + 0.3) && this.sk >= 10) {
						new Bullet(x, y, radianTo(this, {x, y, s : 0.4}), this)
						this.last = 10
						this.sk -= 10
					}
				}else{
					let x = this.x + 0.3, y = this.y + 0.3
					for(let ra = 0; ra < Math.PI * 2; ra += Math.PI / 4) {
						new Bullet(x + Math.sign(Math.round(Math.cos(ra) * 10) / 10) * 2, y + Math.sign(Math.round(Math.sin(ra) * 10) / 10) * 2, ra, this)
					}
					this.last = 50
					this.sk -= 50
				}
			}else this.last--
		}
		if(ability == 3 || cur == 2) {
			this.outline = "white"
			if(!this.alive && (this.sk <= 0 || !key.k)) {
				for(let enemy of enemies) if(distanceTo(this, enemy) < 5 && this.sk > 10) {enemy.die(); this.sk -= 10}
			}
			if((this.sk > 25 || !this.alive) && this.sk > 0) {
				if(key.k) {
					this.sk--
					if(this.sk) {
						this.alive = false
						if(this.sk < 100) this.color = `rgba(0, ${this.sk * 2.55}, ${255 - this.sk * 2.55}, 0.25)`
						else this.color = "#00ff0037"
						this.outline = "#00000000"
						if(wave != 0) {
							this.sup = true
							this.speed = 2
						}
					}
				}else{
					this.alive = true
					if(wave != 0) {
						this.sup = false
						this.speed = 0.1
					}
				}
			}else{
				this.alive = true
				if(wave != 0) {
					this.sup = false
					this.speed = 0.1
				}
			}
		}
		if(ability == 4 || cur == 3) {
			if(key.k == 1 && this.sk > 10){
				this.sk -= 10
				for(let enemy of enemies) {
					if(distanceTo(this, enemy) < 25) {
						let radian = radianTo(this, enemy)
						enemy.velocity.x += Math.cos(radian) / distanceTo(this, enemy) * 10
						enemy.velocity.y += Math.sin(radian) / distanceTo(this, enemy) * 10
					}
					if(distanceTo(this, enemy) < 17.5) {
						if(enemy.parent != enemy) {
							enemy.parent = this
							enemy.color = this.bullet
						}
					}
					if(distanceTo(this, enemy) < 10) {
						enemy.sup = 25
					}
				}
			}
			if(key.j && this.sk > 0.1){
				this.sk -= 0.1
				for(let enemy of enemies) {
					if(distanceTo(this, enemy) < 15) {
						let radian = radianTo(this, enemy)
						enemy.velocity.x += Math.cos(radian) / distanceTo(this, enemy)
						enemy.velocity.y += Math.sin(radian) / distanceTo(this, enemy)
					}
					if(distanceTo(this, enemy) < 10) {
						if(enemy.parent != enemy) {
							enemy.parent = this
							enemy.color = this.bullet
						}
					}
					if(distanceTo(this, enemy) < 5) {
						enemy.sup = 10
					}
				}
			}
		}
		if(ability == 5 || cur == 4) {
			if(!this.last) {
				if((!key.k || this.sk < 75)) {
					let x = this.x + 0.3, y = this.y + 0.3
					if(!key.ArrowLeft || !key.ArrowRight) {
						if(key.ArrowLeft) x--
						if(key.ArrowRight) x++
					}
					if(!key.ArrowDown || !key.ArrowUp) {
						if(key.ArrowDown) y--
						if(key.ArrowUp) y++
					}
					if((x != this.x + 0.3 || y != this.y + 0.3) && this.sk >= 25) {
						new Bullet2(x, y, radianTo(this, {x, y, s : 0.4}), this)
						this.last = 15
						this.sk -= 25
					}
				}else{
					let x = this.x + 0.3, y = this.y + 0.3
					for(let ra = 0; ra < Math.PI * 2; ra += Math.PI / 4) {
						new Bullet2(x + Math.sign(Math.round(Math.cos(ra) * 10) / 10) * 2, y + Math.sign(Math.round(Math.sin(ra) * 10) / 10) * 2, ra, this)
					}
					this.last = 60
					this.sk -= 75
				}
			}else this.last--
		}
		if(ability == 6 || cur == 5) {
			if(click && this.sk > 25) {
				pen.fillStyle = this.color
				box(this.x - 0.5, this.y - 0.5, this.s + 1)
				this.sk -= 25
				this.x = click.x - this.s / 2
				this.y = click.y - this.s / 2
				for(let enemy of enemies) if(distanceTo(this, enemy) < 10 && this.sk > 15) {enemy.die();
					this.sk -= 10
				}
			}
			if(key.k == 1 && this.sk > 10) {
				box(this.x - 0.5, this.y - 0.5, this.s + 1)
				this.sk -= 10
				this.x = Math.random() * (game.width - this.s)
				this.y = Math.random() * (game.height - this.s)
				for(let enemy of enemies) if(distanceTo(this, enemy) < 10 && this.sk > 15) {enemy.die();
					this.sk -= 10
				}
			}
			let {x, y} = this
			if(!(key.ArrowLeft == 1) || !(key.ArrowRight == 1)) {
				if(key.ArrowLeft == 1) x -= 5
				if(key.ArrowRight == 1) x += 5
			}
			if(!(key.ArrowDown == 1) || !(key.ArrowUp == 1)) {
				if(key.ArrowDown == 1) y -= 5
				if(key.ArrowUp == 1) y += 5
			}
			if((x != this.x || y != this.y) && this.sk >= 5) {
				box(this.x - 0.5, this.y - 0.5, this.s + 1)
				this.x = x
				this.y = y
				this.sk -= 25
			}
		}
	};
	this.die = function() {
		if(ability == 7 || cur == 6) {
			if(this.alive && !this.lives) {
				this.isDead = true
				this.alive = false
				xp(this.xp * 0.75, this.x, this.y, true)
			}else{
				if(!this.inv) {
					xp(this.xp * 0.75 / 20, this.x, this.y, true)
					this.inv = 25
					this.lives--
				}
			}
		}else{
			if(this.alive && !this.inv) {
				this.alive = false
				this.isDead = true
				xp(this.xp * 0.75, this.x, this.y, true)
			}
		}
	}
}
function Enemy(x, y) {
	Entity.call(this, x, y);
	this.xp = 10
	if(wave > 0) this.xp *= 2.5
	this.velocity.total = this.speed
	this.velocity.radian = Math.PI * Math.random() * 2
	this.force = function() {
		for(let enemy of enemies) {
			if(distanceTo(this, enemy) < 3 && enemy != this && wave != 0 && Math.random() < 0.001 * wave) {
				this.velocity.radian = radianTo(enemy, this)
			}
		}
		this.velocity.total += this.speed
	}
	this.color = "yellow";
}
function Teleporter(x, y) {
	Entity.call(this, x, y);
	this.xp = 10
	this.velocity.total = this.speed
	this.velocity.radian = Math.PI * Math.random() * 2
	this.force = function() {
		if(Math.random() < 0.001 * wave) {
			do{
				this.x = (game.width - this.s) * Math.random()
				this.y = (game.height - this.s) * Math.random()
			}while(distanceTo(this, player) < 10)
			if(wave == 2) this.velocity.radian = radianTo(this, player)
		}
		this.velocity.total += this.speed
	}
	this.color = "#ff55ff";
}
function BulletBoss(x, y) {
	Entity.call(this, x, y)
	this.s = 2
	this.bullet = "#770077"
	this.time = 0n
	this.xp = 1000
	this.lives = 10
	let num = 5n
	this.leave = function() {
		do{
			this.x = (game.width - this.s) * Math.random()
			this.y = (game.height - this.s) * Math.random()
		}while(distanceTo(this, player) > 15 || distanceTo(this, player) < 10)
	}
	this.force = function() {
		this.color = `rgb(${this.lives / 10 * 255}, 0, ${this.lives / 10 * 255})`
		if(player.alive) {
			if(this.time == 10n * num) {
				let x = this.x + 0.8, y = this.y + 0.8
				for(let ra = 0; ra < Math.PI * 2; ra += Math.PI / 4) {
					new Bullet(x + Math.sign(Math.round(Math.cos(ra) * 10) / 10) * 2, y + Math.sign(Math.round(Math.sin(ra) * 10) / 10) * 2, ra, this)
				}
			}
			if(this.time == 25n * num) {
				this.leave()
			}
			if(this.time >= 30n * num && this.time <= 75n * num) {
				if(this.time % (num * num) == 0) {
					let radian = radianTo(this, player)
					let num = Math.PI / 4
					radian = Math.round(radian / num) * num
					let x = this.x + 0.8, y = this.y + 0.8
					new Bullet(x + Math.sign(Math.round(Math.cos(radian))) * 2, y + Math.sign(Math.round(Math.sin(radian))) * 2, radian, this)
				}
			}
			if(this.time == 90n * num) {
				this.leave()
				let x = this.x + 0.8, y = this.y + 0.8
				for(let ra = 0; ra < Math.PI * 2; ra += Math.PI / 4) {
					new Bullet(x + Math.sign(Math.round(Math.cos(ra) * 10) / 10) * 2, y + Math.sign(Math.round(Math.sin(ra) * 10) / 10) * 2, ra, this)
				}
			}
			if(this.time > 90n * num && this.time % (num * num) == 0) {
				let x = this.x + 0.8, y = this.y + 0.8
				for(let ra = 0; ra < Math.PI * 2; ra += Math.PI / 4) {
					new Bullet(x + Math.sign(Math.round(Math.cos(ra) * 10) / 10) * 2, y + Math.sign(Math.round(Math.sin(ra) * 10) / 10) * 2, ra, this)
				}
				if(this.time >= 125n * num) this.time = 0n
			}
			this.time++
		}
	}
	this.hit = this.leave
	this.die = function() {
		if(this.alive && !this.lives && !this.inv) {
			this.alive = false
			this.isDead = true
			xp(this.xp / 2, this.x + 0.5, this.y + 0.5)
			wave++
			killed = 0
		}else{
			if(!this.inv) {
				xp(this.xp / 20, this.x + 0.5, this.y + 0.5)
				this.hit()
				this.lives--
			}
		}
	}
}
function TrackerBoss(x, y) {
	BulletBoss.call(this, x, y)
	this.xp = 2500
	this.last = 0
	let num = 5n
	this.hit = function() {this.time = 50n * num}
	this.force = function() {
		this.color = `rgb(${this.lives / 10 * 255}, ${this.lives / 20 * 255}, ${this.lives / 20 * 255})`
		if(player.alive) {
			if(this.time < 50n * num) {
				if(distanceTo(this, player) > 15 && wave != 0) {
					let radian = radianTo(this, player)
					this.velocity.x += Math.cos(radian) * this.speed
					this.velocity.y += Math.sin(radian) * this.speed
				}else if(distanceTo(this, player) < 5 && wave != 0) {
					let radian = radianTo(this, player)
					this.velocity.x -= Math.cos(radian) * this.speed
					this.velocity.y -= Math.sin(radian) * this.speed
				}else{
					if(this.last) {
						this.last--
					}else{
						let radian = radianTo(this, player)
						let num = Math.PI / 4
						radian = Math.round(radian / num) * num
						let x = this.x + 0.8, y = this.y + 0.8
						new Bullet2(x + Math.sign(Math.round(Math.cos(radian))) * 2, y + Math.sign(Math.round(Math.sin(radian))) * 2, radian, this)
						this.last = 10
					}
				}
			}else{
				if(distanceTo(this, player) < 15 && wave != 0) {
					let radian = radianTo(this, player)
					this.velocity.x -= Math.cos(radian) * this.speed
					this.velocity.y -= Math.sin(radian) * this.speed
				}
				if(this.last) {
					this.last--
				}else{
					let radian = Math.random() * Math.PI * 2
					let num = Math.PI / 4
					radian = Math.round(radian / num) * num
					let x = this.x + 0.5, y = this.y + 0.5
					enemy = (new Tracker(x + Math.sign(Math.round(Math.cos(radian))), y + Math.sign(Math.round(Math.sin(radian)))))
					enemies.push(enemy)
					enemy.parent = this
					this.last = 100
				}
				if(this.time == 100) this.time = 0
			}
			this.time++
		}
	}
}
function Shooter(x, y) {
	Entity.call(this, x, y);
	this.direction = Math.PI * Math.random() * 2
	this.xp = 50
	if(wave > 0) this.xp *= 1.5
	this.last = 0
	this.velocity.total = this.speed
	this.velocity.radian = Math.PI * Math.random() * 2
	this.force = function() {
		this.velocity.total += this.speed
		if(player.alive && distanceTo(this, player) < 15) {
			if(distanceTo(this, player) > 10 && wave != 0) {
				let radian = radianTo(this, player)
				this.velocity.x += Math.cos(radian) * this.speed
				this.velocity.y += Math.sin(radian) * this.speed
			}
			if(distanceTo(this, player) < 5 && wave != 0) {
				let radian = radianTo(this, player)
				this.velocity.x -= Math.cos(radian) * this.speed
				this.velocity.y -= Math.sin(radian) * this.speed
			}
			if(this.last) {
				this.last--
			}else{
				let radian = radianTo(this, player)
				let num = Math.PI / 4
				radian = Math.round(radian / num) * num
				let x = this.x + 0.3, y = this.y + 0.3
				new Bullet(x + Math.sign(Math.cos(radian)), y + Math.sign(Math.sin(radian)), radian, this)
				this.last = 50
			}
		}else{
			for(let enemy of enemies) {
				if(distanceTo(this, enemy) < 5 && enemy != this && Math.random() < 0.001 * wave) {
					let radian = radianTo(this, enemy)
					this.velocity.x -= Math.cos(radian) * this.speed
					this.velocity.y -= Math.sin(radian) * this.speed
				}
			}
		}
	}
	this.color = "orange";
}
function Tracker(x, y) {
	Entity.call(this, x, y);
	this.direction = Math.PI * Math.random() * 2
	this.xp = 50
	this.last = 0
	this.velocity.total = this.speed
	this.velocity.radian = Math.PI * Math.random() * 2
	this.force = function() {
		this.velocity.total += this.speed
		if(player.alive && distanceTo(this, player) < 15) {
			if(this.last) {
				this.last--
			}else{
				let radian = radianTo(this, player)
				let num = Math.PI / 4
				radian = Math.round(radian / num) * num
				let x = this.x + 0.3, y = this.y + 0.3
				new Bullet2(x + Math.sign(Math.cos(radian)), y + Math.sign(Math.sin(radian)), radian, this)
				this.last = 50
			}
		}else{
			for(let enemy of enemies) {
				if(distanceTo(this, enemy) < 5 && enemy != this&& Math.random() < 0.001 * wave) {
					let radian = radianTo(this, enemy)
					this.velocity.x -= Math.cos(radian) * this.speed
					this.velocity.y -= Math.sin(radian) * this.speed
				}
			}
		}
	}
	this.color = "purple";
}
function Collector(x, y) {
	Entity.call(this, x, y);
	this.direction = Math.PI * Math.random() * 2
	this.xp = 0
	this.pla = 0
	this.velocity.total = this.speed
	this.velocity.radian = Math.PI * Math.random() * 2
	this.force = function() {
		this.velocity.total += this.speed
		this.color = `rgb(${this.xp * 2.55}, ${this.xp * 2.55}, ${this.xp * 2.55})`
		let avo = true
		for(let xp of exp) {
			if(distanceTo(this, xp) < 15) {
				if(avo) {
					let radian = radianTo(this, xp)
					avo = false
					this.velocity.x += Math.cos(radian) * this.speed / distanceTo(this, xp)
					this.velocity.y += Math.sin(radian) * this.speed / distanceTo(this, xp)
				}
				if(touch(this, xp)) {
					if(xp.pla) this.pla += xp.xp
					else this.xp += xp.xp
					xp.die()
				}
			}
		}
		if(avo) {
			for(let enemy of enemies) {
				if(distanceTo(this, enemy) < 3 && enemy != this && Math.random() < 100 / (this.xp + this.pla + 1)) {
					let radian = radianTo(this, enemy)
					this.velocity.x -= Math.cos(radian) * this.speed / distanceTo(this, enemy)
					this.velocity.y -= Math.sin(radian) * this.speed / distanceTo(this, enemy)
				}
			}
		}
	}
	this.die = function() {
		if(this.alive) {
			this.alive = false
			xp(this.xp * 0.75, this.x, this.y)
			xp(this.pla * 0.75, this.x, this.y, true)
		}
	}
	this.color = "black";
}
function Bullet(x, y, radian, parent, boom=true) {
	Entity.call(this, x, y);
	this.parent = parent
	this.alive = wave ? 50 : 150
	this.s = 0.4
	this.velocity.total = 0.5
	this.velocity.radian = radian
	this.force = function() {
		this.velocity.total = 1
		if(!this.parent.alive) {
			this.color = "#000000"
		}
		if(this.parent == player) {
			for(let xp of exp) if(touch(this, xp)) {
				xp.x = player.x + 0.3
				xp.y = player.y + 0.3
			}
			let sk = player.sk
			if(sk > 100) sk = 100
			let green = sk * 2.55
			let blue = 255 - green
			blue /= 255
			green /= 255
			if(blue < green) {
				blue /= green
				green = 1
			}else{
				green /= blue
				blue = 1
			}
			blue *= 255
			green *= 255
			this.color = `rgb(0, ${green}, ${blue})`
		}
		if(this.alive) this.alive--
		if(wave != 0) if(this.alive <= 0) {this.alive = 1; this.die()}
	}
	this.die = function() {
		if(this.alive) {
			this.alive = false
			if(wave != 0 && boom) {
				let {x, y} = this
				for(let ra = 0; ra < Math.PI * 2; ra += Math.PI / 4) {
					new Bullet(x + Math.sign(Math.round(Math.cos(ra) * 10) / 10) * 0.4, y + Math.sign(Math.round(Math.sin(ra) * 10) / 10) * 0.4, ra, this.parent, false)
				}
			}
		}
	}
	this.color = parent.bullet || "yellow";
	enemies.push(this)
}
function Bullet2(x, y, radian, parent) {
	Entity.call(this, x, y);
	this.parent = parent
	this.color = parent.bullet || "purple";
	let target
	this.alive = 250
	this.s = 0.4
	this.velocity.total = 0.5
	this.velocity.radian = radian
	this.force = function() {
		if(!this.parent.alive) {
			this.color = "#000000"
		}
		if(this.parent == player) {
			for(let xp of exp) if(touch(this, xp)) {
				xp.x = player.x + 0.3
				xp.y = player.y + 0.3
			}
			let sk = player.sk
			if(sk > 100) sk = 100
			let green = sk * 2.55
			let blue = 255 - green
			blue /= 255
			green /= 255
			if(blue < green) {
				blue /= green
				green = 1
			}else{
				green /= blue
				blue = 1
			}
			blue *= 255
			green *= 255
			this.color = `rgb(0, ${green}, ${blue})`
		}
		{
			let array = []
			for(let enemy of enemies) array.push(enemy)
			array.push(player)
			if(this.parent == player && player.sk < 100) array.concat(exp)
			array = array.filter((a) => a.alive && a != parent && a.parent != this.parent && (distanceTo(this.parent, a) < 10 || distanceTo(this, a) < 10))
			array.sort((a, b) => distanceTo(this.parent, a) - distanceTo(this.parent, b))
			target = array[0]
		}
		this.velocity.total += this.speed
		if(target) {
			let radian = radianTo(this, target)
			this.velocity.x += Math.cos(radian) * this.speed
			this.velocity.y += Math.sin(radian) * this.speed
		}else{
			if(distanceTo(this, this.parent) > 5 && wave != 0) {
				let radian = radianTo(this, this.parent)
				this.velocity.x += Math.cos(radian) * this.speed
				this.velocity.y += Math.sin(radian) * this.speed
			}
			if(distanceTo(this, this.parent) < 2.5 && wave != 0) {
				let radian = radianTo(this, this.parent)
				this.velocity.x -= Math.cos(radian) * this.speed
				this.velocity.y -= Math.sin(radian) * this.speed
			}
			this.velocity.radian += Math.PI / 16 * (Math.random() * 2 - 1)
		}
		if(this.alive) this.alive--
	}
	enemies.push(this)
}
function Ender(x, y) {
	Entity.call(this, x, y);
	this.color = "#ffaaaa";
	let target
	this.lives = 5
	this.s = 1
	this.xp = 500
	this.velocity.total = this.speed
	this.velocity.radian = Math.random() * Math.PI * 2
	this.force = function() {
		this.color = `rgb(${this.lives / 5 * 255}, ${this.lives / 5 * 170}, ${this.lives / 5 * 170})`
		{
			let array = [player]
			for(let enemy of enemies) array.push(enemy)
			array = array.filter((a) => a.alive && a != this.parent && (distanceTo(this, a) < 15))
			array.sort((a, b) => distanceTo(this, a) - distanceTo(this, b))
			target = array[0]
		}
		if(target) {
			let radian = radianTo(this, target)
			this.velocity.x += Math.cos(radian) * this.speed
			this.velocity.y += Math.sin(radian) * this.speed
		}else{
			this.velocity.total = 1
		}
	}
	this.die = function() {
		if(this.alive && !this.lives) {
			this.alive = false
			xp(this.xp / 2, this.x, this.y)
		}else{
			xp(this.xp / 10, this.x, this.y)
			this.lives--
		}
	}
}
function Destroyer(x, y) {
	Entity.call(this, x, y);
	this.direction = Math.PI * Math.random() * 2
	this.lastSaw = 0
	this.xp = 750
	this.force = function() {
		if(player.alive && distanceTo(this, player) < 7) {
			let radian = radianTo(this, player)
			this.direction = radian
			this.velocity.x += Math.cos(radian) * this.speed
			this.velocity.y += Math.sin(radian) * this.speed
			this.lastSaw = 0
		}else{
			let radian = this.direction
			this.velocity.x += Math.cos(radian) * this.speed
			this.velocity.y += Math.sin(radian) * this.speed
			this.direction += Math.random() * this.lastSaw - this.lastSaw / 2
			for(let enemy of enemies) {
				if(distanceTo(this, enemy) < 3 && enemy != this && Math.random() < 0.001 * wave) {
					let radian = radianTo(this, enemy)
					this.velocity.x -= Math.cos(radian) * this.speed
					this.velocity.y -= Math.sin(radian) * this.speed
				}
				if(distanceTo(this, enemy) < 15 && (enemy.parent != enemy) && Math.random() < 0.07) {
					enemy.die()
				}
			}
			this.lastSaw += 0.01
			if(this.lastSaw > Math.PI / 4) this.lastSaw = Math.PI / 4
		}
	}
	this.color = "#5555ff";
}
function Chaser(x, y) {
	Entity.call(this, x, y);
	this.direction = Math.PI * Math.random() * 2
	this.lastSaw = 0
	this.xp = 25
	this.force = function() {
		if(player.alive && distanceTo(this, player) < 7) {
			let radian = radianTo(this, player)
			this.direction = radian
			this.velocity.x += Math.cos(radian) * this.speed
			this.velocity.y += Math.sin(radian) * this.speed
			this.lastSaw = 0
		}else{
			let radian = this.direction
			this.velocity.x += Math.cos(radian) * this.speed
			this.velocity.y += Math.sin(radian) * this.speed
			this.direction += Math.random() * this.lastSaw - this.lastSaw / 2
			for(let enemy of enemies) {
				if(distanceTo(this, enemy) < 3 && enemy != this && Math.random() < 0.001 * wave) {
					let radian = radianTo(this, enemy)
					this.velocity.x -= Math.cos(radian) * this.speed
					this.velocity.y -= Math.sin(radian) * this.speed
				}
			}
			this.lastSaw += 0.01
			if(this.lastSaw > Math.PI / 4) this.lastSaw = Math.PI / 4
		}
	}
	this.color = "red";
}
function Illusioner(x, y) {
	Entity.call(this, x, y);
	this.direction = Math.PI * Math.random() * 2
	this.lastSaw = 0
	this.xp = 250
	this.colors = [Math.random() * 255, Math.random() * 255, Math.random() * 255]
	this.force = function() {
		this.con = 0
		for(let col in this.colors) {
			this.colors[col] += Math.random() * 30 - 15
			if(this.colors[col] > 255) this.colors[col] = 255
			if(this.colors[col] < 0) this.colors[col] = 0
		}
		this.color = `rgb(${this.colors[0]}, ${this.colors[1]}, ${this.colors[2]})`
		if(player.alive && distanceTo(this, player) < 10) {
			let radian = radianTo(this, player)
			this.direction = radian
			this.velocity.x += Math.cos(radian) * this.speed
			this.velocity.y += Math.sin(radian) * this.speed
			this.lastSaw = 0
			if(distanceTo(this, player) < 5) player.con = 100
		}else{
			let radian = this.direction
			this.velocity.x += Math.cos(radian) * this.speed
			this.velocity.y += Math.sin(radian) * this.speed
			this.direction += Math.random() * this.lastSaw - this.lastSaw / 2
			for(let enemy of enemies) {
				if(distanceTo(this, enemy) < 3 && enemy != this && Math.random() < 0.001 * wave) {
					let radian = radianTo(this, enemy)
					this.velocity.x -= Math.cos(radian) * this.speed
					this.velocity.y -= Math.sin(radian) * this.speed
				}
				if(distanceTo(this, enemy) < 5) enemy.con = 100
			}
			this.lastSaw += 0.01
			if(this.lastSaw > Math.PI / 4) this.lastSaw = Math.PI / 4
		}
	}
	this.color = "red";
}
function FinalBoss(x, y) {
	BulletBoss.call(this)
	this.inv = 250
	this.xp = 10000
	let p = 0
	this.time = 0n
	let num = 5n
	this.color = "black"
	this.hit = function() {
		switch(p) {
			case 0:
				if(!this.last) {
					let x = this.x + 0.8, y = this.y + 0.8
					for(let ra = 0; ra < Math.PI * 2; ra += Math.PI / 8) {
						new Bullet2(x + Math.sign(Math.round(Math.cos(ra) * 10) / 10) * 2, y + Math.sign(Math.round(Math.sin(ra) * 10) / 10) * 2, ra, this)
					}
					this.last = 25
				}
			break;
			case 1.5:
				if(this.time > 100n * num) change(1)
			case 1:
				this.color = "red"
				this.inv = 100
			break;
		}
	}
	this.bullet = false
	function change(m) {
		do{
			p = Math.ceil(Math.random() * 2)
		}while(m == p)
		this.time = 0n
	}
	this.force = function() {
		if(this.last) this.last--
		if(touch(this, player)) this.hit()
		switch(p) {
			case 0:
				this.inv--
				this.color = `rgb(${255 - this.inv * 0.255 * 4}, ${255 - this.inv * 0.255 * 4}, ${255 - this.inv * 0.255 * 4})`
				if(this.inv <= 0) {p++; this.inv = 0}
			break;
			case 1:
				if(this.time == 0n) this.leave()
				this.color = "green"
				let radian = radianTo(player, this)
				player.velocity.total *= 1.1
				player.velocity.radian = radian
				this.time++
				if(this.time >= 50n * num) p = 1.5
			break;
			case 1.5:
				if(this.time % (num * num) == 0n && this.time < 100n) {
					if(Math.random() < 0.5) {
						let x = this.x + 0.8, y = this.y + 0.8
						for(let ra = 0; ra < Math.PI * 2; ra += Math.PI / 8) {
							new Bullet(x + Math.sign(Math.round(Math.cos(ra) * 10) / 10) * 2, y + Math.sign(Math.round(Math.sin(ra) * 10) / 10) * 2, ra, this)
						}
					}else{
						let x = this.x + 0.8, y = this.y + 0.8
						for(let ra = 0; ra < Math.PI * 2; ra += Math.PI / 8) {
							new Bullet2(x + Math.sign(Math.round(Math.cos(ra) * 10) / 10) * 2, y + Math.sign(Math.round(Math.sin(ra) * 10) / 10) * 2, ra, this)
						}
					}
				}
				if(this.time > 150n * num) {
					change(1)
				}else{
					this.color = "lime"
					this.time++
				}
			break;
			case 2 :
				if(this.time % (num * num) == 0n && this.time < 100n) {
					if(Math.random() < 0.5) {
						let x = this.x + 0.8, y = this.y + 0.8
						for(let ra = 0; ra < Math.PI * 2; ra += Math.PI / 2) {
							new Bullet(x + Math.sign(Math.round(Math.cos(ra) * 10) / 10) * 2, y + Math.sign(Math.round(Math.sin(ra) * 10) / 10) * 2, ra, this)
						}
					}
				}
				if(this.time > 150n * num) {
					change(2)
				}else{
					this.color = "#ff55aa"
					this.time++
				}
			break;
		}
	}
}
function spawn(what) {
	function isToClose() {
		for(let enemy of enemies) if(distanceTo(what, enemy) < (i > 500 ? 15 : (i > 250 ? 10 : 5))) return true
	}
	let i = 1000
	do{
		what.x = Math.random() * (canvas.width / scale)
		what.y = Math.random() * (canvas.height / scale)
	}while(distanceTo(what, player) < 20 || (isToClose() && i--))
	enemies.push(what)
}
function distanceTo(a, b) {
	return Math.sqrt(Math.pow((a.x + a.s / 2) - (b.x + b.s / 2), 2) + Math.pow((a.y + a.s / 2) - (b.y + b.s / 2), 2))
}
function radianTo(a, b) {
	return Math.atan2((b.y + b.s / 2) - (a.y + a.s / 2), (b.x + b.s / 2) - (a.x + a.s / 2))
}
function touch(a, b) {
	return (
		Math.abs((a.x + a.s / 2) - (b.x + b.s / 2)) < (a.s + b.s) / 2
	) && (
		Math.abs((a.y + a.s / 2) - (b.y + b.s / 2)) < (a.s + b.s) / 2
	) && (a.alive && b.alive)
}
let player = new Player(0, 0)
let enemies = []
let exp = []
function dualLoop(array, func) {
	for(let i = 0; i < array.length; i++) {
		for(let j = i + 1; j < array.length; j++) {
			func(array[i], array[j])
		}
	}
}
addEventListener("keydown", function(e) {
	if(!key[e.key]) key[e.key] = 1
});
addEventListener("keyup", function(e) {
	delete key[e.key];
});
addEventListener("click", function(e) {
	click = {
		x : e.x / scale,
		y : (canvas.height - e.y) / scale
	}
})
addEventListener("load", start);