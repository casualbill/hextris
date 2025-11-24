// 道具系统管理
var itemSystem = {
	items: {
		"clearInnerCircle": {
			count: 1,
			cooldown: 60000, // 60秒
			lastUsed: 0,
			icon: "🔴",
			name: "消除最内圈"
		},
		"clearRandomColor": {
			count: 1,
			cooldown: 90000, // 90秒
			lastUsed: 0,
			icon: "🟡",
			name: "消除随机颜色"
		},
		"clearMostBlocksSide": {
			count: 1,
			cooldown: 120000, // 120秒
			lastUsed: 0,
			icon: "🟢",
			name: "消除最多边"
		}
	},
	animationState: {
		playing: false,
		type: null,
		progress: 0,
		targetBlocks: [],
		color: null,
		side: null
	},
	pauseGameTime: 2000 // 2秒
};

// 使用道具
function useItem(itemName) {
	var item = itemSystem.items[itemName];
	var currentTime = Date.now();
	
	// 检查道具是否可用
	if (itemSystem.animationState.playing) {
		return; // 正在播放动画，无法使用道具
	}
	
	if (item.count <= 0) {
		alert("道具数量不足！");
		return;
	}
	
	if (currentTime - item.lastUsed < item.cooldown) {
		var remainingTime = Math.ceil((item.cooldown - (currentTime - item.lastUsed)) / 1000);
		alert("道具正在冷却中，剩余 " + remainingTime + " 秒！");
		return;
	}
	
	// 开始使用道具
	item.count--;
	item.lastUsed = currentTime;
	updateItemUI();
	
	// 根据道具类型执行相应操作
	switch (itemName) {
		case "clearInnerCircle":
			clearInnerCircle();
			break;
		case "clearRandomColor":
			clearRandomColor();
			break;
		case "clearMostBlocksSide":
			clearMostBlocksSide();
			break;
	}
}

// 更新道具界面
function updateItemUI() {
	for (var itemName in itemSystem.items) {
		var item = itemSystem.items[itemName];
		var itemElement = document.getElementById("道具-" + itemName);
		var countElement = itemElement.querySelector(".道具数量");
		var cooldownElement = itemElement.querySelector(".道具冷却时间");
		
		countElement.textContent = item.count;
		
		// 更新冷却时间显示
		var currentTime = Date.now();
		var remainingCooldown = item.cooldown - (currentTime - item.lastUsed);
		
		if (remainingCooldown > 0) {
			cooldownElement.textContent = Math.ceil(remainingCooldown / 1000) + "s";
			itemElement.classList.add("disabled");
		} else {
			cooldownElement.textContent = "";
			itemElement.classList.remove("disabled");
		}
	}
}

// 消除最内圈
function clearInnerCircle() {
	var innerCircleBlocks = [];
	var innerCircleRadius = settings.blockHeight * 2; // 最内圈半径设置为2个方块高度
	
	// 找到最内圈的方块
	for (var i = 0; i < MainHex.blocks.length; i++) {
		for (var j = 0; j < MainHex.blocks[i].length; j++) {
			var block = MainHex.blocks[i][j];
			if (!block.deleted && block.distFromHex <= innerCircleRadius) {
				innerCircleBlocks.push(block);
			}
		}
	}
	
	if (innerCircleBlocks.length === 0) {
		alert("没有可消除的最内圈方块！");
		return;
	}
	
	// 开始动画
	startClearAnimation("消除最内圈", innerCircleBlocks);
}

// 消除随机颜色
function clearRandomColor() {
	// 获取所有不同的颜色
	var colorList = [];
	var colorCount = {};
	
	for (var i = 0; i < MainHex.blocks.length; i++) {
		for (var j = 0; j < MainHex.blocks[i].length; j++) {
			var block = MainHex.blocks[i][j];
			if (!block.deleted && !colorCount[block.color]) {
				colorCount[block.color] = true;
				colorList.push(block.color);
			}
		}
	}
	
	if (colorList.length === 0) {
		alert("没有可消除的方块！");
		return;
	}
	
	// 随机选择一种颜色
	var randomColor = colorList[Math.floor(Math.random() * colorList.length)];
	
	// 找到所有该颜色的方块
	var targetBlocks = [];
	for (var i = 0; i < MainHex.blocks.length; i++) {
		for (var j = 0; j < MainHex.blocks[i].length; j++) {
			var block = MainHex.blocks[i][j];
			if (!block.deleted && block.color === randomColor) {
				targetBlocks.push(block);
			}
		}
	}
	
	// 开始动画
	startClearAnimation("消除随机颜色", targetBlocks, randomColor);
}

// 消除最多的一条边
function clearMostBlocksSide() {
	var sideBlockCounts = [];
	
	// 计算每条边的方块数量
	for (var i = 0; i < MainHex.blocks.length; i++) {
		var count = 0;
		for (var j = 0; j < MainHex.blocks[i].length; j++) {
			if (!MainHex.blocks[i][j].deleted) {
				count++;
			}
		}
		sideBlockCounts.push({sideIndex: i, count: count});
	}
	
	// 找到方块数量最多的边
	sideBlockCounts.sort(function(a, b) { return b.count - a.count; });
	var mostBlocksSide = sideBlockCounts[0];
	
	if (mostBlocksSide.count === 0) {
		alert("没有可消除的方块！");
		return;
	}
	
	// 找到该边上的所有方块
	var targetBlocks = [];
	for (var j = 0; j < MainHex.blocks[mostBlocksSide.sideIndex].length; j++) {
		var block = MainHex.blocks[mostBlocksSide.sideIndex][j];
		if (!block.deleted) {
			targetBlocks.push(block);
		}
	}
	
	// 开始动画
	startClearAnimation("消除最多的一条边", targetBlocks, null, mostBlocksSide.sideIndex);
}

// 开始消除动画
function startClearAnimation(animationType, targetBlocks, color, sideIndex) {
	// 暂停游戏
	var originalGameState = gameState;
	gameState = -1; // 暂停状态
	
	// 设置动画状态
	itemSystem.animationState.playing = true;
	itemSystem.animationState.type = animationType;
	itemSystem.animationState.progress = 0;
	itemSystem.animationState.targetBlocks = targetBlocks;
	itemSystem.animationState.color = color;
	itemSystem.animationState.side = sideIndex;
	
	// 播放动画
	var animationInterval = setInterval(function() {
		itemSystem.animationState.progress += 0.02;
		
		if (itemSystem.animationState.progress >= 1) {
			// 动画结束，删除方块
			clearInterval(animationInterval);
			deleteTargetBlocks(targetBlocks);
			
			// 恢复游戏
			setTimeout(function() {
				gameState = originalGameState;
				itemSystem.animationState.playing = false;
			}, 500);
		}
	}, 16); // 约60fps
}

// 删除目标方块
function deleteTargetBlocks(targetBlocks) {
	for (var i = 0; i < targetBlocks.length; i++) {
		var block = targetBlocks[i];
		block.deleted = 1;
		block.opacity = 1;
	}
}

// 渲染道具动画
function renderItemAnimation() {
	if (!itemSystem.animationState.playing) {
		return;
	}
	
	var progress = itemSystem.animationState.progress;
	var targetBlocks = itemSystem.animationState.targetBlocks;
	
	switch (itemSystem.animationState.type) {
		case "消除最内圈":
			renderClearInnerCircleAnimation(progress, targetBlocks);
			break;
		case "消除随机颜色":
			renderClearRandomColorAnimation(progress, targetBlocks);
			break;
		case "消除最多的一条边":
			renderClearMostBlocksSideAnimation(progress, targetBlocks);
			break;
	}
}

// 渲染消除最内圈动画
function renderClearInnerCircleAnimation(progress, targetBlocks) {
	// 绘制波纹效果
	var centerX = trueCanvas.width / 2;
	var centerY = trueCanvas.height / 2;
	var maxRadius = MainHex.sideLength / 2 * Math.sqrt(3) + settings.blockHeight;
	var currentRadius = maxRadius * progress;
	
	ctx.globalAlpha = 0.5 * (1 - progress);
	ctx.strokeStyle = "#ffffff";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
	ctx.stroke();
	ctx.globalAlpha = 1;
	
	// 闪烁方块
	for (var i = 0; i < targetBlocks.length; i++) {
		var block = targetBlocks[i];
		if (Math.floor(progress * 10) % 2 === 0) {
			block.tint = 1;
		} else {
			block.tint = 0;
		}
	}
}

// 渲染消除随机颜色动画
function renderClearRandomColorAnimation(progress, targetBlocks) {
	// 闪烁方块
	for (var i = 0; i < targetBlocks.length; i++) {
		var block = targetBlocks[i];
		if (Math.floor(progress * 10) % 2 === 0) {
			block.tint = 1;
		} else {
			block.tint = 0;
		}
	}
}

// 渲染消除最多的一条边动画
function renderClearMostBlocksSideAnimation(progress, targetBlocks) {
	// 高亮显示边
	var sideIndex = itemSystem.animationState.side;
	var sideAngle = 30 + sideIndex * 60;
	var sideLength = (settings.rows * settings.blockHeight) * (2 / Math.sqrt(3)) + settings.hexWidth;
	
	var startX = trueCanvas.width / 2 + Math.cos(sideAngle * Math.PI / 180) * MainHex.sideLength;
	var startY = trueCanvas.height / 2 - Math.sin(sideAngle * Math.PI / 180) * MainHex.sideLength;
	var endX = trueCanvas.width / 2 + Math.cos((sideAngle + 60) * Math.PI / 180) * MainHex.sideLength;
	var endY = trueCanvas.height / 2 - Math.sin((sideAngle + 60) * Math.PI / 180) * MainHex.sideLength;
	
	// 绘制闪烁的边
	if (Math.floor(progress * 10) % 2 === 0) {
		ctx.globalAlpha = 0.8;
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();
		ctx.globalAlpha = 1;
	}
	
	// 闪烁方块
	for (var i = 0; i < targetBlocks.length; i++) {
		var block = targetBlocks[i];
		if (Math.floor(progress * 10) % 2 === 0) {
			block.tint = 1;
		} else {
			block.tint = 0;
		}
	}
}

// 定期更新道具界面
setInterval(function() {
	updateItemUI();
}, 1000);

// 在游戏渲染循环中添加道具动画渲染
function tryAddItemAnimationRender() {
	if (typeof render !== 'undefined') {
		var originalRenderFunction = render;
		render = function() {
			originalRenderFunction();
			renderItemAnimation();
		};
		return true;
	}
	return false;
}

// 尝试立即添加，如果失败则在window.onload中重试
if (!tryAddItemAnimationRender()) {
	window.addEventListener('load', function() {
		tryAddItemAnimationRender();
	});
}

// 初始化道具系统
function initItemSystem() {
	updateItemUI();
}

// 如果window.onload已经被定义，我们将在其之后添加初始化代码
if (window.onload) {
	var originalOnload = window.onload;
	window.onload = function() {
		originalOnload();
		initItemSystem();
	};
} else {
	window.onload = initItemSystem;
}