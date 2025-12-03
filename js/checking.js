function search(twoD,oneD){
	// Searches a two dimensional array to see if it contains a one dimensional array. indexOf doesn't work in this case
	for(var i=0;i<twoD.length;i++){
		if(twoD[i][0] == oneD[0] && twoD[i][1] == oneD[1]) {
			return true;
		}
	}
	return false;
}

function floodFill(hex, side, index, deleting) {
	if (hex.blocks[side] === undefined || hex.blocks[side][index] === undefined) return;

	//store the color and original block type
	var originalBlock = hex.blocks[side][index];
	var color = originalBlock.color;
	var isJoker = (originalBlock.blockType === SPECIAL_BLOCKS.JOKER);
	
	//nested for loops for navigating the blocks
	for(var x =-1;x<2;x++){
		for(var y =-1;y<2;y++){
			//make sure the they aren't diagonals
			if(Math.abs(x)==Math.abs(y)){continue;}
			//calculate the side were exploring using mods
			var curSide =(side+x+hex.sides)%hex.sides;
			//calculate the index
			var curIndex = index+y;
			//making sure the block exists at this side and index
			if(hex.blocks[curSide] === undefined){continue;}
			if(hex.blocks[curSide][curIndex] !== undefined){
				var currentBlock = hex.blocks[curSide][curIndex];
				
				// 跳过障碍块 - 障碍块不能被消除，除非被爆炸
				if (currentBlock.blockType === SPECIAL_BLOCKS.OBSTACLE) {
					continue;
				}
				
				// 检查颜色匹配条件：
				// 1. 普通块：颜色必须相同
				// 2. 百搭块：可以匹配任何颜色
				var colorMatch = false;
				if (isJoker) {
					colorMatch = true; // 百搭块可以匹配任何颜色
				} else if (currentBlock.blockType === SPECIAL_BLOCKS.JOKER) {
					colorMatch = true; // 百搭块可以被任何块匹配
				} else {
					colorMatch = (currentBlock.color == color); // 普通块必须颜色相同
				}
				
				// 检查是否满足消除条件
				if(colorMatch && search(deleting,[curSide,curIndex]) === false && currentBlock.deleted === 0 ) {
					//add this to the array of already explored
					deleting.push([curSide,curIndex]);
					//recall with next block explored
					floodFill(hex,curSide,curIndex,deleting);
				}
			}
		}
	}
}

function consolidateBlocks(hex,side,index){
	//record which sides have been changed
	var sidesChanged =[];
	var deleting=[];
	var deletedBlocks = [];
	
	// 检查起始块是否是障碍块
	var startBlock = hex.blocks[side][index];
	if (startBlock.blockType === SPECIAL_BLOCKS.OBSTACLE) {
		return; // 障碍块不能被消除
	}
	
	//add start case
	deleting.push([side,index]);
	//fill deleting	
	floodFill(hex,side,index,deleting);
	//make sure there are more than 3 blocks to be deleted
	if(deleting.length<3){return;}
	var i;
	for(i=0; i<deleting.length;i++) {
		var arr = deleting[i];
		//just making sure the arrays are as they should be
		if(arr !== undefined && arr.length==2) {
			var block = hex.blocks[arr[0]][arr[1]];
			
			// 跳过障碍块 - 障碍块不能被消除，除非被爆炸
			if (block.blockType === SPECIAL_BLOCKS.OBSTACLE) {
				continue;
			}
			
			//add to sides changed if not in there
			if(sidesChanged.indexOf(arr[0])==-1){
				sidesChanged.push(arr[0]);
			}
			//mark as deleted
		block.deleted = 1;
		deletedBlocks.push(block);
		
		// 如果是爆炸块，标记为需要触发爆炸
		if (block.blockType === SPECIAL_BLOCKS.EXPLOSIVE) {
			block.explosionTimer = 0;
			block.exploded = false;
		}
		}
	}

	// add scores
	var now = MainHex.ct;
	if(now - hex.lastCombo < settings.comboTime ){
		settings.comboTime = (1/settings.creationSpeedModifier) * (waveone.nextGen/16.666667) * 3;
		hex.comboMultiplier += 1;
		hex.lastCombo = now;
		var coords = findCenterOfBlocks(deletedBlocks);
		hex.texts.push(new Text(coords['x'],coords['y'],"x "+hex.comboMultiplier.toString(),"bold Q","#fff",fadeUpAndOut));
	}
	else{
		settings.comboTime = 240;
		hex.lastCombo = now;
		hex.comboMultiplier = 1;
	}
	var jokerCount = 0;
	for (var i = 0; i < deleting.length; i++) {
		var arr = deleting[i];
		if(arr !== undefined && arr.length==2) {
			var block = hex.blocks[arr[0]][arr[1]];
			if (block.blockType === SPECIAL_BLOCKS.JOKER) {
				jokerCount++;
			}
		}
	}
	var jokerMultiplier = 1 + (jokerCount * 0.5);
	var adder = deleting.length * deleting.length * hex.comboMultiplier * jokerMultiplier;
	
	// 爆炸块额外分数
	var explosiveCount = 0;
	for (var i = 0; i < deleting.length; i++) {
		var arr = deleting[i];
		if(arr !== undefined && arr.length==2) {
			var block = hex.blocks[arr[0]][arr[1]];
			if (block.blockType === SPECIAL_BLOCKS.EXPLOSIVE) {
				explosiveCount++;
			}
		}
	}
	if (explosiveCount > 0) {
		var explosiveBonus = explosiveCount * 100 * hex.comboMultiplier;
		adder += explosiveBonus;
		hex.texts.push(new Text(hex.x, hex.y + 30, "BONUS! +" + explosiveBonus.toString(), "bold Q", "#ff6b35", fadeUpAndOut));
	}
	
	hex.texts.push(new Text(hex.x, hex.y, "+ " + adder.toString(), "bold Q ", deletedBlocks[0].color, fadeUpAndOut));
	hex.lastColorScored = deletedBlocks[0].color;
	score += adder;
}
