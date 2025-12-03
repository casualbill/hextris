function Block(fallingLane, color, iter, distFromHex, settled, blockType) {
	// whether or not a block is rested on the center hex or another block
	this.settled = (settled === undefined) ? 0 : 1;
	this.height = settings.blockHeight;
	//the lane which the block was shot from
	this.fallingLane = fallingLane;

	this.checked=0;
	//the angle at which the block falls
	this.angle = 90 - (30 + 60 * fallingLane);
	//for calculating the rotation of blocks attached to the center hex
	this.angularVelocity = 0;
	this.targetAngle = this.angle;
	this.color = color;
	//blocks that are slated to be deleted after a valid score has happened
	this.deleted = 0;
	//blocks slated to be removed from falling and added to the hex
	this.removed = 0;
	//value for the opacity of the white blcok drawn over falling block to give it the glow as it attaches to the hex
	this.tint = 0;
	//value used for deletion animation
	this.opacity = 1;
	//boolean for when the block is expanding
	this.initializing = 1;
	this.ict = MainHex.ct;
	//speed of block
	this.iter = iter;
	//number of iterations before starting to drop
	this.initLen = settings.creationDt;
	//side which block is attached too
	this.attachedLane = 0;
	//distance from center hex
	this.distFromHex = distFromHex || settings.startDist * settings.scale ;
	
	// 特殊块属性
	this.blockType = blockType || SPECIAL_BLOCKS.REGULAR;
	this.explosionTimer = 0; // 爆炸块的延迟爆炸计时器
	this.exploded = false; // 是否已经爆炸
	this.explosionRadius = 1; // 爆炸范围，默认1格

	this.incrementOpacity = function() {
		if (this.deleted) {
			//add shakes
			if (this.opacity >= 0.925) {
				var tLane = this.attachedLane - MainHex.position;
				tLane = MainHex.sides - tLane;
				while (tLane < 0) {
					tLane += MainHex.sides;
				}

				tLane %= MainHex.sides;
				MainHex.shakes.push({lane:tLane, magnitude:3 * (window.devicePixelRatio ? window.devicePixelRatio : 1) * (settings.scale)});
			}
			//fade out the opacity
			this.opacity = this.opacity - 0.075 * MainHex.dt;
			if (this.opacity <= 0) {
				//slate for final deletion
				this.opacity = 0;
				this.deleted = 2;
				if (gameState == 1 || gameState==0) {
					localStorage.setItem("saveState", exportSaveState());
				}
			}
		}
	};

	this.getIndex = function (){
		//get the index of the block in its stack
		var parentArr = MainHex.blocks[this.attachedLane];
		for (var i = 0; i < parentArr.length; i++) {
			if (parentArr[i] == this) {
				return i;
			}
		}
	};

	this.draw = function(attached, index) {
		this.height = settings.blockHeight;
		if (Math.abs(settings.scale - settings.prevScale) > 0.000000001) {
			this.distFromHex *= (settings.scale/settings.prevScale);
		}

		this.incrementOpacity();
		if(attached === undefined)
			attached = false;

		if(this.angle > this.targetAngle) {
			this.angularVelocity -= angularVelocityConst * MainHex.dt;
		}
		else if(this.angle < this.targetAngle) {
			this.angularVelocity += angularVelocityConst * MainHex.dt;
		}

		if (Math.abs(this.angle - this.targetAngle + this.angularVelocity) <= Math.abs(this.angularVelocity)) { //do better soon
			this.angle = this.targetAngle;
			this.angularVelocity = 0;
		}
		else {
			this.angle += this.angularVelocity;
		}
		
		this.width = 2 * this.distFromHex / Math.sqrt(3);
		this.widthWide = 2 * (this.distFromHex + this.height) / Math.sqrt(3);
		//this.widthWide = this.width + this.height + 3;
		var p1;
		var p2;
		var p3;
		var p4;
		if (this.initializing) {
			var rat = ((MainHex.ct - this.ict)/this.initLen);
			if (rat > 1) {
															
				rat = 1;
			}
			p1 = rotatePoint((-this.width / 2) * rat, this.height / 2, this.angle);
			p2 = rotatePoint((this.width / 2) * rat, this.height / 2, this.angle);
			p3 = rotatePoint((this.widthWide / 2) * rat, -this.height / 2, this.angle);
			p4 = rotatePoint((-this.widthWide / 2) * rat, -this.height / 2, this.angle);
			if ((MainHex.ct - this.ict) >= this.initLen) {
				this.initializing = 0;
			}
		} else {
			p1 = rotatePoint(-this.width / 2, this.height / 2, this.angle);
			p2 = rotatePoint(this.width / 2, this.height / 2, this.angle);
			p3 = rotatePoint(this.widthWide / 2, -this.height / 2, this.angle);
			p4 = rotatePoint(-this.widthWide / 2, -this.height / 2, this.angle);
		}

		// 根据块类型设置颜色
		var fillColor;
		if (this.deleted) {
			fillColor = "#FFF";
		} else if (gameState === 0) {
			if (this.color.charAt(0) == 'r') {
				fillColor = rgbColorsToTintedColors[this.color];
			} else {
				fillColor = hexColorsToTintedColors[this.color];
			}
		} else {
			// 特殊块颜色
			switch(this.blockType) {
				case SPECIAL_BLOCKS.OBSTACLE:
					fillColor = "#95a5a6"; // 灰色障碍块
					break;
				case SPECIAL_BLOCKS.JOKER:
					// 彩虹渐变效果
					fillColor = "#ff0000"; // 使用渐变的起始色
					break;
				case SPECIAL_BLOCKS.EXPLOSIVE:
					fillColor = "#ff6b35"; // 红黄渐变的爆炸块
					break;
				default:
					fillColor = this.color;
					break;
			}
		}
		
		ctx.fillStyle = fillColor;

		ctx.globalAlpha = this.opacity;
		var baseX = trueCanvas.width / 2 + Math.sin((this.angle) * (Math.PI / 180)) * (this.distFromHex + this.height / 2) + gdx;
		var baseY = trueCanvas.height / 2 - Math.cos((this.angle) * (Math.PI / 180)) * (this.distFromHex + this.height / 2) + gdy;
		ctx.beginPath();
		ctx.moveTo(baseX + p1.x, baseY + p1.y);
		ctx.lineTo(baseX + p2.x, baseY + p2.y);
		ctx.lineTo(baseX + p3.x, baseY + p3.y);
		ctx.lineTo(baseX + p4.x, baseY + p4.y);
		//ctx.lineTo(baseX + p1.x, baseY + p1.y);
		ctx.closePath();
		ctx.fill();

		if (this.tint) {
			if (this.opacity < 1) {
				if (gameState == 1 || gameState==0) {
					localStorage.setItem("saveState", exportSaveState());
				}

				this.iter = 2.25;
				this.tint = 0;
			}

			ctx.fillStyle = "#FFF";
			ctx.globalAlpha = this.tint;
			ctx.beginPath();
			ctx.moveTo(baseX + p1.x, baseY + p1.y);
			ctx.lineTo(baseX + p2.x, baseY + p2.y);
			ctx.lineTo(baseX + p3.x, baseY + p3.y);
			ctx.lineTo(baseX + p4.x, baseY + p4.y);
			ctx.lineTo(baseX + p1.x, baseY + p1.y);
			ctx.closePath();
			ctx.fill();
			this.tint -= 0.02 * MainHex.dt;
			if (this.tint < 0) {
				this.tint = 0;
			}
		}

		// 绘制特殊块的标识图标
		if (this.blockType !== SPECIAL_BLOCKS.REGULAR) {
			ctx.save();
			ctx.translate(baseX, baseY);
			ctx.rotate((this.angle - 90) * (Math.PI / 180));
			
			var iconSize = this.height * 0.6;
			ctx.font = iconSize + "px Font Awesome 6 Free";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "rgba(255,255,255,0.9)";
			
			switch(this.blockType) {
				case SPECIAL_BLOCKS.OBSTACLE:
					ctx.fillText(String.fromCharCode(0xf023), 0, 0); // 锁链图标
					break;
				case SPECIAL_BLOCKS.JOKER:
					ctx.font = "bold " + iconSize + "px Font Awesome 6 Free"; // 星形图标需要粗体
					ctx.fillText(String.fromCharCode(0xf005), 0, 0); // 星形图标
					break;
				case SPECIAL_BLOCKS.EXPLOSIVE:
					ctx.font = "bold " + iconSize + "px Font Awesome 6 Free"; // 爆炸图标需要粗体
					ctx.fillText(String.fromCharCode(0xf1e2), 0, 0); // 爆炸图标
					break;
			}
			ctx.restore();
		}
		
		ctx.globalAlpha = 1;
	};
	
	// 更新块状态（主要用于爆炸块的延迟爆炸）
	this.update = function(dt, hex) {
		if (this.blockType === SPECIAL_BLOCKS.EXPLOSIVE && this.deleted && !this.exploded) {
			this.explosionTimer += dt;
			// 0.5秒后触发爆炸
			if (this.explosionTimer >= 500) { // 500毫秒=0.5秒
				this.triggerExplosion(hex);
				this.exploded = true;
			}
		}
	};
	
	// 触发爆炸效果
	this.triggerExplosion = function(hex) {
		if (this.exploded) return;
		
		this.exploded = true;
		
		// 定义爆炸范围 - 4个方向相邻的块
		var directions = [
			[0, 1],   // 右侧
			[0, -1],  // 左侧
			[1, 0],   // 下侧
			[-1, 0],  // 上侧
		];
		
		// 清除当前块
		this.deleted = 2;
		
		// 清除相邻的所有块（包括障碍块）
		for (var dir of directions) {
			var side = (this.attachedLane + dir[0] + hex.sides) % hex.sides;
			var index = this.getIndex() + dir[1];
			
			if (hex.blocks[side] && hex.blocks[side][index]) {
				var adjacentBlock = hex.blocks[side][index];
				adjacentBlock.deleted = 2;
				
				// 连锁爆炸 - 如果相邻块也是爆炸块，立即触发爆炸
				if (adjacentBlock.blockType === SPECIAL_BLOCKS.EXPLOSIVE) {
					adjacentBlock.triggerExplosion(hex);
				}
			}
		}
	};
}

function findCenterOfBlocks(arr) {
	var avgDFH = 0;
	var avgAngle = 0;
	for (var i = 0; i < arr.length; i++) {
		avgDFH += arr[i].distFromHex;
		var ang = arr[i].angle;
		while (ang < 0) {
			ang += 360;
		}
		
		avgAngle += ang % 360;
	}

	avgDFH /= arr.length;
	avgAngle /= arr.length;

	return {
		x:trueCanvas.width/2 + Math.cos(avgAngle * (Math.PI / 180)) * avgDFH,
		y:trueCanvas.height/2 + Math.sin(avgAngle * (Math.PI / 180)) * avgDFH
	};
}
