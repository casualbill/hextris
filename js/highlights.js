// 精彩瞬间识别模块
function identifyHighlights() {
	var highlights = [];
	var events = window.eliminationEvents || [];
	var gameEndTime = window.gameEndTime;
	
	// 1. 识别连续消除片段（连续3次或以上消除，每次消除间隔不超过2秒）
	if (events.length >= 3) {
		var currentSequence = [events[0]];
		
		for (var i = 1; i < events.length; i++) {
			var timeDiff = events[i].time - events[i-1].time;
			
			if (timeDiff <= 2000) { // 2秒内
				currentSequence.push(events[i]);
			} else {
				if (currentSequence.length >= 3) {
					highlights.push({
						type: 'combo',
						startTime: currentSequence[0].time,
						endTime: currentSequence[currentSequence.length - 1].time,
						events: currentSequence,
						description: '连续' + currentSequence.length + '次消除'
					});
				}
				currentSequence = [events[i]];
			}
		}
		
		// 检查最后一个序列
		if (currentSequence.length >= 3) {
			highlights.push({
				type: 'combo',
				startTime: currentSequence[0].time,
				endTime: currentSequence[currentSequence.length - 1].time,
				events: currentSequence,
				description: '连续' + currentSequence.length + '次消除'
			});
		}
	}
	
	// 2. 识别高难度操作片段（在难度较高时成功消除5个或以上方块）
	// 难度较高定义为difficulty > 20
	for (var i = 0; i < events.length; i++) {
		var event = events[i];
		if (event.difficulty > 20 && event.blocksCount >= 5) {
			highlights.push({
				type: 'high_difficulty',
				startTime: event.time - 1000, // 提前1秒开始
				endTime: event.time + 2000,  // 延后2秒结束
				event: event,
				description: '高难度消除' + event.blocksCount + '个方块'
			});
		}
	}
	
	// 3. 识别最终死亡画面
	if (gameEndTime && events.length > 0) {
		// 取最后10秒的画面或从最后一次消除到结束
		var startTime = Math.max(gameEndTime - 10000, events[events.length - 1].time - 5000);
		highlights.push({
			type: 'game_over',
			startTime: startTime,
			endTime: gameEndTime,
			description: '最终死亡画面'
		});
	}
	
	// 排序并返回最多3个精彩瞬间
	highlights.sort(function(a, b) {
		// 按类型优先级排序：combo > high_difficulty > game_over
		var priority = {
			'combo': 3,
			'high_difficulty': 2,
			'game_over': 1
		};
		return priority[b.type] - priority[a.type];
	});
	
	return highlights.slice(0, 3);
}

// 检查是否有精彩瞬间
function hasHighlights() {
	var highlights = identifyHighlights();
	return highlights.length > 0;
}

// 生成精彩瞬间的时间范围（10秒）
function generateHighlightTimeRange(highlight) {
	var duration = 10000; // 10秒
	var midTime = (highlight.startTime + highlight.endTime) / 2;
	var startTime = midTime - duration / 2;
	var endTime = midTime + duration / 2;
	
	// 确保时间范围有效
	if (startTime < 0) {
		startTime = 0;
		endTime = duration;
	}
	
	return {
		startTime: startTime,
		endTime: endTime,
		duration: duration
	};
}

// 导出函数
window.identifyHighlights = identifyHighlights;
window.hasHighlights = hasHighlights;
window.generateHighlightTimeRange = generateHighlightTimeRange;