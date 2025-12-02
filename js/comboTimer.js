function drawTimer(ctx) {
	if(gameState==1){
		var leftVertexes = [];
		var rightVertexes = [];
	if(MainHex.ct - MainHex.lastCombo < settings.comboTime){
		for(var i=0;i<6;i++){
			var done = (MainHex.ct -MainHex.lastCombo);
			if(done<(settings.comboTime)*(5-i)*(1/6)){
				leftVertexes.push(calcSide(ctx, i,i+1,1,1));
								rightVertexes.push(calcSide(ctx, 12-i,11-i,1,1));
			}
			else{
				leftVertexes.push(calcSide(ctx, i,i+1,1-((done*6)/settings.comboTime)%(1),1));
				rightVertexes.push(calcSide(ctx, 12-i,11-i,1-((done*6)/settings.comboTime)%(1),1));
				break;
			}
		}
	}
		if(rightVertexes.length !== 0) drawSide(ctx, rightVertexes);
		if(leftVertexes.length !== 0) drawSide(ctx, leftVertexes);
	}
}

function calcSide(ctx, startVertex,endVertex,fraction,offset){
	startVertex = (startVertex+offset)%12;
	endVertex = (endVertex+offset)%12;
	ctx.globalAlpha=1;
	ctx.beginPath();
	ctx.lineCap = "round";

	var radius = (settings.rows * settings.blockHeight) * (2/Math.sqrt(3)) + settings.hexWidth ;
	var halfRadius = radius/2;
	var triHeight = radius *(Math.sqrt(3)/2);
	var Vertexes =[
		[(halfRadius*3)/2,triHeight/2],
		[radius,0],
		[(halfRadius*3)/2,-triHeight/2],
		[halfRadius,-triHeight],
		[0,-triHeight],
		[-halfRadius,-triHeight],
		[-(halfRadius*3)/2,-triHeight/2],
		[-radius,0],
		[-(halfRadius*3)/2,triHeight/2],
		[-halfRadius,triHeight],
		[0,triHeight],
		[halfRadius,triHeight]
	].reverse();
	var startX =trueCanvas.width/2 + Vertexes[startVertex][0];
	var startY =trueCanvas.height/2 + Vertexes[startVertex][1];
	var endX = trueCanvas.width/2 + Vertexes[endVertex][0];
	var endY = trueCanvas.height/2 + Vertexes[endVertex][1];
		return [[startX,startY],[((endX-startX)*fraction)+startX,((endY-startY)*fraction)+startY]];
}
function drawSide(ctx, vertexes){
	if (gameState === 0) {
		ctx.strokeStyle = hexColorsToTintedColors[MainHex.lastColorScored];
	} else {
		ctx.strokeStyle = MainHex.lastColorScored;
	}
	ctx.lineWidth =4*settings.scale;
		ctx.moveTo(vertexes[0][0][0],vertexes[0][0][1]);
	ctx.lineTo(vertexes[0][1][0],vertexes[0][1][1]);
		for(var i=1;i<vertexes.length;i++){
			ctx.lineTo(vertexes[i][1][0],vertexes[i][1][1]);
			ctx.moveTo(vertexes[i][1][0],vertexes[i][1][1]);
		}
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

}
