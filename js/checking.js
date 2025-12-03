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

	//store the color and block type
	var color = hex.blocks[side][index].color;
	var blockType = hex.blocks[side][index].blockType;
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
				// 检查是否匹配：
				// 1. 颜色相同，或者
				// 2. 当前块是百搭块，或者
				// 3. 相邻块是百搭块
				var isMatch = (hex.blocks[curSide][curIndex].color == color) ||
							   (blockType == 'wildcard') ||
							   (hex.blocks[curSide][curIndex].blockType == 'wildcard');
				
				if(isMatch && search(deleting,[curSide,curIndex]) === false && hex.blocks[curSide][curIndex].deleted === 0 ) {
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
			//add to sides changed if not in there
			if(sidesChanged.indexOf(arr[0])==-1){
				sidesChanged.push(arr[0]);
			}
			//mark as deleted
			hex.blocks[arr[0]][arr[1]].deleted = 1;
			deletedBlocks.push(hex.blocks[arr[0]][arr[1]]);
		}
	}

	// 检查是否有爆炸块被删除，如果有则触发爆炸效果
	var hasExplosive = false;
	for(i=0; i<deletedBlocks.length; i++) {
		if(deletedBlocks[i].blockType == 'explosive') {
			hasExplosive = true;
			break;
		}
	}
	
	if(hasExplosive) {
		// 0.5秒后清除爆炸块周围4个方向的所有颜色块
		setTimeout(function() {
			// 找到爆炸块的位置
			var explosivePos = null;
			for(i=0; i<deletedBlocks.length; i++) {
				if(deletedBlocks[i].blockType == 'explosive') {
					explosivePos = [deletedBlocks[i].attachedLane, deletedBlocks[i].getIndex()];
					break;
				}
			}
			
			if(explosivePos) {
				var exSide = explosivePos[0];
				var exIndex = explosivePos[1];
				
				// 清除周围4个方向的所有颜色块（包括障碍块）
				var directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
				for(var d=0; d<directions.length; d++) {
					var dir = directions[d];
					var curSide = (exSide + dir[0] + hex.sides) % hex.sides;
					var curIndex = exIndex + dir[1];
					
					// 检查该位置是否有块
					if(hex.blocks[curSide] !== undefined && hex.blocks[curSide][curIndex] !== undefined) {
						// 标记为删除
						hex.blocks[curSide][curIndex].deleted = 1;
						// 添加到改变的边
						if(sidesChanged.indexOf(curSide) == -1) {
							sidesChanged.push(curSide);
						}
					}
				}
			}
		}, 500); // 0.5秒延迟
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
	var adder = deleting.length * deleting.length * hex.comboMultiplier;
	hex.texts.push(new Text(hex.x,hex.y,"+ "+adder.toString(),"bold Q ",deletedBlocks[0].color,fadeUpAndOut));
		hex.lastColorScored = deletedBlocks[0].color;
	score += adder;
}
