// t: current time, b: begInnIng value, c: change In value, d: duration
function easeOutCubic(t, b, c, d) {
	return c * ((t = t / d - 1) * t * t + 1) + b;
}

function renderText(x, y, fontSize, color, text, font) {
	ctx.save();
	if (!font) {
		var font = '20px Exo';
	}

	fontSize *= settings.scale;
	ctx.font = fontSize + font;
	ctx.textAlign = 'center';
	ctx.fillStyle = color;
	ctx.fillText(text, x, y + (fontSize / 2) - 9 * settings.scale);
	ctx.restore();
}

function drawScoreboard() {
	if (scoreOpacity < 1) {
		scoreOpacity += 0.01;
		textOpacity += 0.01;
	}
	ctx.globalAlpha = textOpacity;
	var scoreSize = 50;
	var scoreString = String(score);
	if (scoreString.length == 6) {
		scoreSize = 43;
	} else if (scoreString.length == 7) {
		scoreSize = 35;
	} else if (scoreString.length == 8) {
		scoreSize = 31;
	} else if (scoreString.length == 9) {
		scoreSize = 27;
	}
	//if (rush ==1){
		var color = "rgb(236, 240, 241)";
	//}
    var fontSize = settings.platform == 'mobile' ? 35 : 30;
    var h = trueCanvas.height / 2 + gdy + 100 * settings.scale;
	if (gameState === 0) {
		renderText(trueCanvas.width / 2 + gdx + 6 * settings.scale, trueCanvas.height / 2 + gdy, 60, "rgb(236, 240, 241)", String.fromCharCode("0xf04b"), 'px FontAwesome');
		renderText(trueCanvas.width / 2 + gdx + 6 * settings.scale, trueCanvas.height / 2.1 + gdy - 155 * settings.scale, 150, "#2c3e50", "Hextris");
		// 绘制"Play!"按钮
		renderText(trueCanvas.width / 2 + gdx + 5 * settings.scale, h + 10, fontSize, "rgb(44,62,80)", 'Play!');
		// 绘制"多人对战"按钮
		var multiplayerFontSize = settings.platform == 'mobile' ? 28 : 24;
		var multiplayerY = h + 60;
		renderText(trueCanvas.width / 2 + gdx + 5 * settings.scale, multiplayerY, multiplayerFontSize, "rgb(44,62,80)", '多人对战');
	} else if (gameState != 0 && textOpacity > 0) {
		textOpacity -= 0.05;
		renderText(trueCanvas.width / 2 + gdx + 6 * settings.scale, trueCanvas.height / 2 + gdy, 60, "rgb(236, 240, 241)", String.fromCharCode("0xf04b"), 'px FontAwesome');
		renderText(trueCanvas.width / 2 + gdx + 6 * settings.scale, trueCanvas.height / 2 + gdy - 155 * settings.scale, 150, "#2c3e50", "Hextris");
		// 绘制"Play!"按钮
		renderText(trueCanvas.width / 2 + gdx + 5 * settings.scale, h, fontSize, "rgb(44,62,80)", 'Play!');
		// 绘制"多人对战"按钮
		var multiplayerFontSize = settings.platform == 'mobile' ? 28 : 24;
		var multiplayerY = h + 50;
		renderText(trueCanvas.width / 2 + gdx + 5 * settings.scale, multiplayerY, multiplayerFontSize, "rgb(44,62,80)", '多人对战');
		ctx.globalAlpha = scoreOpacity;
		renderText(trueCanvas.width / 2 + gdx, trueCanvas.height / 2 + gdy, scoreSize, color, score);
	} else {
		ctx.globalAlpha = scoreOpacity;
		renderText(trueCanvas.width / 2 + gdx, trueCanvas.height / 2 + gdy, scoreSize, color, score);
	}

	ctx.globalAlpha = 1;
}

// 显示多人对战大厅
function showMultiplayerLobby() {
    document.getElementById('multiplayerLobby').style.display = 'block';
    document.getElementById('multiplayerRoom').style.display = 'none';
    document.getElementById('multiplayerGame').style.display = 'none';
    
    // 刷新房间列表
    if (window.multiplayer) {
        // 这里可以添加请求房间列表的逻辑
        window.multiplayer.requestRoomList();
    }
}

// 显示多人对战房间
function showMultiplayerRoom() {
    document.getElementById('multiplayerLobby').style.display = 'none';
    document.getElementById('multiplayerRoom').style.display = 'block';
    document.getElementById('multiplayerGame').style.display = 'none';
}

// 隐藏多人对战界面
function hideMultiplayerInterface() {
    document.getElementById('multiplayerLobby').style.display = 'none';
    document.getElementById('multiplayerRoom').style.display = 'none';
    document.getElementById('multiplayerGame').style.display = 'none';
}

// 更新玩家列表
function updatePlayerList(players, isHost) {
    var playerListHTML = '';
    players.forEach(function(player, index) {
        var isCurrentPlayer = (window.multiplayer && window.multiplayer.currentPlayer === player.id);
        var isHostPlayer = (index === 0 && isHost); // 假设第一个玩家是房主
        
        playerListHTML += '<div style="margin: 5px 0; padding: 5px; border-radius: 3px; background-color: ' + (isCurrentPlayer ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)') + ';">';
        playerListHTML += '<span style="font-weight: bold;">' + (player.name || '玩家' + (index + 1)) + '</span>';
        if (isCurrentPlayer) {
            playerListHTML += ' <span style="color: #3498db;">(你)</span>';
        }
        if (isHostPlayer) {
            playerListHTML += ' <span style="color: #e74c3c;">(房主)</span>';
        }
        playerListHTML += '</div>';
    });
    
    document.getElementById('playerList').innerHTML = playerListHTML;
    
    // 隐藏或显示开始游戏按钮
    if (isHost && players.length >= 2) {
        document.getElementById('startGameBtn').style.display = 'block';
    } else {
        document.getElementById('startGameBtn').style.display = 'none';
    }
}

// 更新房间列表
function updateRoomList(rooms) {
    if (window.multiplayer) {
        window.multiplayer.updateRoomList(rooms);
    }
}

// 初始化多人对战游戏
function initMultiplayerGame(players, currentPlayer) {
    // 这里可以添加初始化多人对战游戏的逻辑
    // 例如：设置游戏区域，初始化玩家状态等
    
    // 清空游戏区域
    document.getElementById('multiplayerGame').innerHTML = '';
    
    // 创建玩家游戏区域
    players.forEach(function(player, index) {
        var isCurrentPlayer = (player.id === currentPlayer);
        
        // 创建游戏区域div
        var gameArea = document.createElement('div');
        gameArea.id = 'playerGameArea_' + player.id;
        gameArea.style.cssText = 'width: 50%; height: 50%; float: left; border: 1px solid #3498db; box-sizing: border-box;';
        
        // 添加玩家名称
        var playerName = document.createElement('div');
        playerName.style.cssText = 'padding: 5px; background-color: rgba(52, 152, 219, 0.2); color: #3498db; font-weight: bold;';
        playerName.textContent = player.name + (isCurrentPlayer ? ' (你)' : '');
        
        // 添加游戏画布
        var canvas = document.createElement('canvas');
        canvas.id = 'playerCanvas_' + player.id;
        canvas.width = 300;
        canvas.height = 300;
        canvas.style.cssText = 'display: block; margin: 10px auto;';
        
        // 添加分数显示
        var scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'playerScore_' + player.id;
        scoreDisplay.style.cssText = 'padding: 5px; text-align: center; color: #ecf0f1; font-weight: bold;';
        scoreDisplay.textContent = '分数: 0';
        
        // 添加存活状态显示
        var statusDisplay = document.createElement('div');
        statusDisplay.id = 'playerStatus_' + player.id;
        statusDisplay.style.cssText = 'padding: 5px; text-align: center; color: #2ecc71; font-weight: bold;';
        statusDisplay.textContent = '存活';
        
        // 组装游戏区域
        gameArea.appendChild(playerName);
        gameArea.appendChild(canvas);
        gameArea.appendChild(scoreDisplay);
        gameArea.appendChild(statusDisplay);
        
        // 添加到游戏容器
        document.getElementById('multiplayerGame').appendChild(gameArea);
    });
}

// 更新玩家游戏状态
function updatePlayerGameState(playerId, score, isAlive) {
    // 更新分数
    var scoreElement = document.getElementById('playerScore_' + playerId);
    if (scoreElement) {
        scoreElement.textContent = '分数: ' + score;
    }
    
    // 更新存活状态
    var statusElement = document.getElementById('playerStatus_' + playerId);
    if (statusElement) {
        if (isAlive) {
            statusElement.textContent = '存活';
            statusElement.style.color = '#2ecc71';
        } else {
            statusElement.textContent = '已失败';
            statusElement.style.color = '#e74c3c';
        }
    }
    
    // 更新游戏区域样式
    var gameArea = document.getElementById('playerGameArea_' + playerId);
    if (gameArea) {
        if (isAlive) {
            gameArea.style.opacity = '1';
        } else {
            gameArea.style.opacity = '0.5';
        }
    }
}

// 显示游戏结束排名
function showGameOverRanking(rankings) {
    // 清空游戏区域
    document.getElementById('multiplayerGame').innerHTML = '';
    
    // 创建排名显示div
    var rankingDiv = document.createElement('div');
    rankingDiv.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #ecf0f1;';
    
    // 添加标题
    var title = document.createElement('h1');
    title.textContent = '游戏结束';
    title.style.cssText = 'margin-bottom: 20px;';
    
    // 添加排名列表
    var rankingList = document.createElement('div');
    rankingList.style.cssText = 'text-align: center;';
    
    rankings.forEach(function(ranking, index) {
        var rankingItem = document.createElement('div');
        rankingItem.style.cssText = 'margin: 10px 0; font-size: 18px;';
        
        var rank = index + 1;
        var playerName = ranking.playerName;
        var score = ranking.score;
        var result = ranking.isWinner ? '胜利' : '失败';
        
        rankingItem.textContent = '第' + rank + '名: ' + playerName + ' - 分数: ' + score + ' - ' + result;
        
        // 为第一名添加特殊样式
        if (rank === 1) {
            rankingItem.style.cssText += ' color: #f1c40f; font-weight: bold;';
        }
        
        rankingList.appendChild(rankingItem);
    });
    
    // 添加返回大厅按钮
    var backToLobbyBtn = document.createElement('button');
    backToLobbyBtn.textContent = '返回大厅';
    backToLobbyBtn.style.cssText = 'margin-top: 20px; padding: 10px 20px; font-size: 16px; background-color: #3498db; color: #ecf0f1; border: none; border-radius: 5px; cursor: pointer;';
    backToLobbyBtn.addEventListener('mousedown', function() {
        // 返回大厅
        if (window.multiplayer) {
            window.multiplayer.leaveRoom();
        }
    });
    
    // 组装排名显示
    rankingDiv.appendChild(title);
    rankingDiv.appendChild(rankingList);
    rankingDiv.appendChild(backToLobbyBtn);
    
    // 添加到游戏容器
    document.getElementById('multiplayerGame').appendChild(rankingDiv);
}

// 初始化多人对战UI事件
function initMultiplayerUIEvents() {
    // 绑定返回主菜单按钮事件
    var backToMainBtn = document.getElementById('backToMainBtn');
    if (backToMainBtn) {
        backToMainBtn.addEventListener('mousedown', function() {
            hideMultiplayerInterface();
            showText = 'main';
        });
    }
    
    // 绑定返回大厅按钮事件
    var backToLobbyBtn = document.getElementById('backToLobbyBtn');
    if (backToLobbyBtn) {
        backToLobbyBtn.addEventListener('mousedown', function() {
            // 这里可以添加离开房间的逻辑
            if (window.multiplayer) {
                window.multiplayer.leaveRoom();
            }
        });
    }
    
    // 绑定房主开始游戏按钮事件
    var startGameBtn = document.getElementById('startGameBtn');
    if (startGameBtn) {
        startGameBtn.addEventListener('mousedown', function() {
            // 这里可以添加开始游戏的逻辑
            if (window.multiplayer) {
                window.multiplayer.startGameRequest();
            }
        });
    }
    
    // 绑定创建房间按钮事件
    var createRoomBtn = document.getElementById('createRoomBtn');
    if (createRoomBtn) {
        createRoomBtn.addEventListener('mousedown', function() {
            if (window.multiplayer) {
                window.multiplayer.createRoom();
            }
        });
    }
    
    // 绑定加入房间按钮事件
    var joinRoomBtn = document.getElementById('joinRoomBtn');
    if (joinRoomBtn) {
        joinRoomBtn.addEventListener('mousedown', function() {
            // 弹出输入框，要求输入6位数字房间号
            var roomId = prompt('请输入6位数字房间号:', '');
            if (roomId) {
                if (window.multiplayer) {
                    window.multiplayer.joinRoom(roomId);
                }
            }
        });
    }
}

function clearGameBoard() {
	drawPolygon(trueCanvas.width / 2, trueCanvas.height / 2, 6, trueCanvas.width / 2, 30, hexagonBackgroundColor, 0, 'rgba(0,0,0,0)');
}

function drawPolygon(x, y, sides, radius, theta, fillColor, lineWidth, lineColor) {
	ctx.fillStyle = fillColor;
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = lineColor;

	ctx.beginPath();
	var coords = rotatePoint(0, radius, theta);
	ctx.moveTo(coords.x + x, coords.y + y);
	var oldX = coords.x;
	var oldY = coords.y;
	for (var i = 0; i < sides; i++) {
		coords = rotatePoint(oldX, oldY, 360 / sides);
		ctx.lineTo(coords.x + x, coords.y + y);
		oldX = coords.x;
		oldY = coords.y;
	}

	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.strokeStyle = 'rgba(0,0,0,0)';
}

function toggleClass(element, active) {
	if ($(element).hasClass(active)) {
		$(element).removeClass(active);
	} else {
		$(element).addClass(active);
	}
}

function showText(text) {
	var messages = {
		'paused': "<div class='centeredHeader unselectable'>Game Paused</div>",
		'pausedAndroid': "<div class='centeredHeader unselectable'>Game Paused</div><div class='unselectable centeredSubHeader' style='position:absolute;margin-left:-150px;left:50%;margin-top:20px;width:300px;font-size:16px;'><a href = 'https://play.google.com/store/apps/details?id=com.hextris.hextrisadfree' target='_blank'Want to support the developers? Don't like ads? Tap for Hextris ad-free!</a></div>",
		'pausediOS': "<div class='centeredHeader unselectable'>Game Paused</div><div class='unselectable centeredSubHeader' style='position:absolute;margin-left:-150px;left:50%;margin-top:20px;width:300px;font-size:16px;'><a href = 'https://itunes.apple.com/us/app/hextris-ad-free/id912895524?mt=8' target='_blank'>Want to support the developers? Don't like ads? Tap for Hextris ad-free!</a></div>",
		'pausedOther': "<div class='centeredHeader unselectable'>Game Paused</div><div class='unselectable centeredSubHeader' style='margin-top:10px;position:absolute;left:50%;margin-left:-190px;max-width:380px;font-size:18px;'><a href = 'http://hextris.github.io/' target='_blank'>Want to support the developers? Click here to buy one of the ad-free mobile versions!</a></div>",
		'start': "<div class='centeredHeader unselectable' style='line-height:80px;'>Press enter to start</div>"
	};

	if (text == 'paused') {
		if (settings.os == 'android') {
			text = 'pausedAndroid'
		} else if (settings.os == 'ios') {
            text = 'pausediOS'
        } else if (settings.platform == 'nonmobile') {
            text = 'pausedOther'
        }
	}

	if (text == 'gameover') {
	   //Clay('client.share.any', {text: 'Think you can beat my score of '+ score + ' in Super Cool Game?'})
		$("#gameoverscreen").fadeIn();
    	}
	$(".overlay").html(messages[text]);
	$(".overlay").fadeIn("1000", "swing");

}

function setMainMenu() {
	gameState = 4;
	canRestart = false;
	setTimeout(function() {
		canRestart = 's';
	}, 500);
	$('#restartBtn').hide();
	if ($("#pauseBtn").replace(/^.*[\\\/]/, '') == "btn_pause.svg") {
		$("#pauseBtn").attr("src","./images/btn_resume.svg");
	} else {
		$("#pauseBtn").attr("src","./images/btn_pause.svg");
	}
}

function hideText() {
	$(".overlay").fadeOut(150, function() {
		$(".overlay").html("");
	})
}

function gameOverDisplay() {
	settings.ending_block=false;
	Cookies.set("visited",true);
	var c = document.getElementById("canvas");
	c.className = "blur";
	updateHighScores();
	if (highscores.length === 0 ){
		$("#currentHighScore").text(0);
	}
	else {
		$("#currentHighScore").text(highscores[0])
	}
	$("#gameoverscreen").fadeIn();
	$("#buttonCont").fadeIn();
	$("#container").fadeIn();
	$("#socialShare").fadeIn();
	$("#restart").fadeIn();
    set_score_pos();
}

function updateHighScores (){
    $("#cScore").text(score);
    $("#1place").text(highscores[0]);
    $("#2place").text(highscores[1]);
    $("#3place").text(highscores[2]);
}

var pausable = true;
function pause(o) {
    if (gameState == 0 || gameState == 2 || !pausable) {
        return;
    }

	pausable = false;
	writeHighScores();
	var message;
	if (o) {
		message = '';
	} else {
		message = 'paused';
	}

	var c = document.getElementById("canvas");
	if (gameState == -1) {
		$('#fork-ribbon').fadeOut(300, 'linear');
		$('#restartBtn').fadeOut(300, "linear");
		$('#buttonCont').fadeOut(300, "linear");
		if ($('#helpScreen').is(':visible')) {
			$('#helpScreen').fadeOut(300, "linear");
		}

		$("#pauseBtn").attr("src", "./images/btn_pause.svg");
		$('.helpText').fadeOut(300, 'linear');
		$('#overlay').fadeOut(300, 'linear');
		hideText();
		setTimeout(function() {
			gameState = prevGameState;
			pausable =true;
		}, 400);
	} else if (gameState != -2 && gameState !== 0 && gameState !== 2) {
		$('#restartBtn').fadeIn(300, "linear");
		$('#buttonCont').fadeIn(300, "linear");
		$('.helpText').fadeIn(300, 'linear');
		if (message == 'paused') {
			showText(message);
		}
		$('#fork-ribbon').fadeIn(300, 'linear');
		$("#pauseBtn").attr("src","./images/btn_resume.svg");
		$('#overlay').fadeIn(300, 'linear');
		prevGameState = gameState;
		setTimeout(function() {
		    pausable = true;
		}, 400);
		gameState = -1;
	}
}
