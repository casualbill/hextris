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

	//store the color and special type
	var color = hex.blocks[side][index].color;
	var isWild = hex.blocks[side][index].specialType === 'WILD';
	
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
				// Skip obstacle blocks
				if(hex.blocks[curSide][curIndex].specialType === 'OBSTACLE'){
					continue;
				}
				
				// checking equivalency of color, if its already been explored, and if it isn't already deleted
				// Wild blocks can match any color
				var colorMatch = isWild || hex.blocks[curSide][curIndex].specialType === 'WILD' || hex.blocks[curSide][curIndex].color == color;
								
				if(colorMatch && search(deleting,[curSide,curIndex]) === false && hex.blocks[curSide][curIndex].deleted === 0 ) {
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
	var hasExplosive = false;
	var explosivePositions = [];
	
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
			
			// Check if this is an explosive block
			if(block.specialType === 'EXPLOSIVE') {
				hasExplosive = true;
				explosivePositions.push({side: arr[0], index: arr[1]});
			}
			
			// Skip obstacle blocks unless they're being exploded
			if(block.specialType !== 'OBSTACLE'){
				//add to sides changed if not in there
				if(sidesChanged.indexOf(arr[0])==-1){
					sidesChanged.push(arr[0]);
				}
				//mark as deleted
				block.deleted = 1;
				deletedBlocks.push(block);
			}
		}
	}

	// Handle explosive blocks - clear surrounding blocks after 0.5 seconds
	if(hasExplosive){
		setTimeout(function(){
			explosivePositions.forEach(function(pos){
				// Clear blocks in all 6 directions around the explosive block
				for(var x =-1;x<2;x++){
					for(var y =-1;y<2;y++){
						if(Math.abs(x)==Math.abs(y)){continue;}
						var curSide =(pos.side + x + hex.sides) % hex.sides;
						var curIndices = [pos.index -1, pos.index, pos.index +1];
						
						curIndices.forEach(function(curIndex){
							if(hex.blocks[curSide] && hex.blocks[curSide][curIndex] && hex.blocks[curSide][curIndex].deleted === 0){
								hex.blocks[curSide][curIndex].deleted = 1;
								deletedBlocks.push(hex.blocks[curSide][curIndex]);
								if(sidesChanged.indexOf(curSide)==-1){
									sidesChanged.push(curSide);
								}
							}
						});
					}
				}
			});
		}, 500);
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
