// 单人游戏帮助函数

// 关闭帮助屏幕
function closeHelpScreen() {
    $('#helpScreen').fadeOut(150, "linear");
}

// 显示帮助屏幕
function showHelpScreen() {
    $('#helpScreen').fadeIn(150, "linear");
}

// 暂停游戏
function pauseGame() {
    if (gameState === 1) {
        gameState = 2;
        $('#pauseScreen').fadeIn(150, "linear");
        $('#pauseBtn').attr('src', "./images/btn_resume.svg");
    }
}

// 恢复游戏
function resumeGame() {
    if (gameState === 2) {
        gameState = 1;
        $('#pauseScreen').fadeOut(150, "linear");
        $('#pauseBtn').attr('src', "./images/btn_pause.svg");
    }
}

// 重启游戏
function restartGame() {
    window.location.reload();
}

// 绑定键盘事件
$(document).ready(function() {
    // H键 - 显示/隐藏帮助屏幕
    $(document).keydown(function(e) {
        if (e.key === 'h' || e.key === 'H') {
            if ($('#helpScreen').is(":visible")) {
                closeHelpScreen();
            } else {
                showHelpScreen();
            }
        }
    });
    
    // 空格键 - 暂停/恢复游戏
    $(document).keydown(function(e) {
        if (e.key === ' ') {
            e.preventDefault();
            if (gameState === 1) {
                pauseGame();
            } else if (gameState === 2) {
                resumeGame();
            }
        }
    });
    
    // 帮助按钮点击事件
    $('#openSideBar').click(function() {
        showHelpScreen();
    });
    
    // 返回按钮点击事件
    $('.backButton').click(function() {
        closeHelpScreen();
    });
    
    // 暂停按钮点击事件
    $('#pauseBtn').click(function() {
        if (gameState === 1) {
            pauseGame();
        } else if (gameState === 2) {
            resumeGame();
        }
    });
    
    // 重启按钮点击事件
    $('#restartBtn').click(function() {
        restartGame();
    });
});