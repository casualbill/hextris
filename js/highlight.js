// 精彩瞬间功能实现
var highlights = [];
var highlightClips = [];

// 记录消除事件
function recordElimination(deletedBlocksCount) {
    var now = MainHex.ct;
    highlights.push({
        time: now,
        type: 'elimination',
        count: deletedBlocksCount,
        difficulty: calculateDifficulty()
    });
}

// 计算当前难度
function calculateDifficulty() {
    // 可以根据游戏时间、速度 modifier 等因素计算难度
    return Math.min(10, Math.floor(MainHex.ct / 1000) + settings.speedModifier * 2);
}

// 识别精彩瞬间
function identifyHighlights() {
    highlightClips = [];
    
    // 识别连续消除片段
    var consecutiveEliminations = [];
    for (var i = 0; i < highlights.length; i++) {
        var h = highlights[i];
        if (h.type === 'elimination') {
            consecutiveEliminations.push(h);
            
            // 检查是否连续3次或以上消除，每次间隔不超过2秒
            if (consecutiveEliminations.length >= 3) {
                var first = consecutiveEliminations[0];
                var last = consecutiveEliminations[consecutiveEliminations.length - 1];
                if (last.time - first.time <= 2000) {
                    // 添加连续消除片段
                    highlightClips.push({
                        type: 'consecutive',
                        startTime: first.time - 500, // 提前0.5秒
                        endTime: last.time + 500, // 延迟0.5秒
                        description: '连续消除 ' + consecutiveEliminations.length + ' 次'
                    });
                    consecutiveEliminations = [];
                }
            }
        } else {
            consecutiveEliminations = [];
        }
        
        // 检查间隔是否超过2秒
        if (i > 0 && h.time - highlights[i-1].time > 2000) {
            consecutiveEliminations = [];
        }
    }
    
    // 识别高难度操作片段
    for (var i = 0; i < highlights.length; i++) {
        var h = highlights[i];
        if (h.type === 'elimination' && h.count >= 5 && h.difficulty >= 7) {
            highlightClips.push({
                type: 'difficult',
                startTime: h.time - 1000, // 提前1秒
                endTime: h.time + 1000, // 延迟1秒
                description: '高难度消除 ' + h.count + ' 个方块'
            });
        }
    }
    
    // 添加最终死亡画面
    highlightClips.push({
        type: 'gameover',
        startTime: Math.max(0, MainHex.ct - 3000), // 最后3秒
        endTime: MainHex.ct,
        description: '最终死亡画面'
    });
    
    // 最多保留3个精彩片段
    highlightClips = highlightClips.slice(0, 3);
    
    // 检查是否有精彩瞬间
    if (highlightClips.length === 0) {
        $('#generateHighlightBtn').addClass('disabled').prop('disabled', true);
        $('#generateHighlightBtn').attr('title', '本局游戏没有精彩瞬间');
    } else {
        $('#generateHighlightBtn').removeClass('disabled').prop('disabled', false);
        $('#generateHighlightBtn').attr('title', '');
    }
}

// 生成GIF动画
function generateGIF(clip, callback) {
    // 检查浏览器是否支持Canvas
    if (!canvas || !canvas.getContext) {
        alert('您的浏览器不支持Canvas，无法生成GIF动画！');
        return;
    }
    
    // 创建GIF实例
    var gif = new GIF({
        workers: 2,
        quality: 10,
        width: trueCanvas.width,
        height: trueCanvas.height,
        fps: 30
    });
    
    // 显示生成进度
    showGIFProgress();
    
    // 监听进度事件
    gif.on('progress', function(p) {
        updateGIFProgress(p);
    });
    
    // 监听完成事件
    gif.on('finished', function(blob) {
        hideGIFProgress();
        callback(blob);
    });
    
    // 生成GIF帧
    var duration = clip.endTime - clip.startTime;
    var frameCount = Math.floor(duration / (1000 / 30)); // 30fps
    
    // 确保GIF时长至少为10秒
    if (duration < 10000) {
        frameCount = 300; // 30fps * 10秒 = 300帧
    }
    
    // 简化实现：使用当前游戏状态生成10秒GIF
    // 实际项目中需要根据游戏历史记录重建每一帧
    var currentFrame = 0;
    var tempHex = JSON.parse(JSON.stringify(MainHex)); // 复制当前游戏状态
    var tempCT = tempHex.ct;
    
    // 生成GIF帧
    function addFrame() {
        if (currentFrame >= frameCount) {
            gif.render();
            return;
        }
        
        try {
            // 更新游戏状态
            tempHex.ct = tempCT + (currentFrame * (1000 / 30));
            
            // 渲染游戏到canvas
            render();
            
            // 将canvas内容添加到GIF
            gif.addFrame(canvas, {copy: true, delay: 1000/30});
            
            currentFrame++;
            
            // 继续生成下一帧
            requestAnimationFrame(addFrame);
        } catch (error) {
            console.error('生成GIF帧时出错：', error);
            hideGIFProgress();
            alert('生成GIF动画时出错，请重试！');
        }
    }
    
    // 开始生成GIF帧
    addFrame();
}

// 显示GIF生成进度
function showGIFProgress() {
    // 移除已存在的进度条（防止重复添加）
    $('#gifProgressOverlay').remove();
    
    // 创建进度条HTML
    var progressHTML = `
        <div id='gifProgressOverlay' style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; flex-direction: column; justify-content: center; align-items: center;'>
            <div style='color: white; font-size: 24px; margin-bottom: 20px;'>正在生成GIF...</div>
            <div style='width: 300px; height: 20px; background: #333; border-radius: 10px; overflow: hidden;'>
                <div id='gifProgressBar' style='width: 0%; height: 100%; background: #4CAF50; transition: width 0.3s;'></div>
            </div>
        </div>
    `;
    
    // 添加到页面
    $('body').append(progressHTML);
}

// 更新GIF生成进度
function updateGIFProgress(progress) {
    // 确保进度条存在
    if ($('#gifProgressBar').length > 0) {
        // 更新进度条宽度
        $('#gifProgressBar').css('width', (progress * 100) + '%');
    }
}

// 隐藏GIF生成进度
function hideGIFProgress() {
    // 移除进度条
    $('#gifProgressOverlay').remove();
}

// 显示精彩片段选择界面
function showHighlightSelection() {
    // 重新识别精彩瞬间，确保数据最新
    identifyHighlights();
    
    if (highlightClips.length === 0) {
        // 没有精彩瞬间
        alert('本局游戏没有精彩瞬间！');
        return;
    }
    
    // 创建选择界面HTML
    var selectionHTML = `
        <div id='highlightSelectionOverlay' style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; justify-content: center; align-items: center;'>
            <div style='background: white; padding: 20px; border-radius: 10px; max-width: 600px; width: 90%;'>
                <h2 style='text-align: center; margin-bottom: 20px;'>选择精彩瞬间</h2>
                <div id='highlightClipsList' style='margin-bottom: 20px;'>
                    ${highlightClips.map((clip, index) => `
                        <div class='highlightClipItem' style='padding: 10px; margin-bottom: 10px; background: #f0f0f0; border-radius: 5px; cursor: pointer;' data-index='${index}'>
                            <div style='font-weight: bold;'>${clip.description}</div>
                            <div style='font-size: 12px; color: #666;'>${formatTime(clip.startTime)} - ${formatTime(clip.endTime)}</div>
                        </div>
                    `).join('')}
                </div>
                <div style='text-align: center;'>
                    <button id='cancelHighlightBtn' style='padding: 10px 20px; background: #ccc; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;'>取消</button>
                    <button id='confirmHighlightBtn' style='padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;'>确认选择</button>
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面
    $('body').append(selectionHTML);
    
    // 绑定事件
    $('.highlightClipItem').click(function() {
        $('.highlightClipItem').removeClass('selected');
        $(this).addClass('selected');
    });
    
    $('#cancelHighlightBtn').click(function() {
        $('#highlightSelectionOverlay').remove();
    });
    
    $('#confirmHighlightBtn').click(function() {
        var selectedIndex = $('.highlightClipItem.selected').data('index');
        if (selectedIndex !== undefined) {
            $('#highlightSelectionOverlay').remove();
            generateGIF(highlightClips[selectedIndex], function(blob) {
                showGIFPreview(blob);
            });
        } else {
            alert('请选择一个精彩瞬间！');
        }
    });
}

// 显示GIF预览界面
function showGIFPreview(blob) {
    // 检查是否有有效的blob
    if (!blob) {
        alert('GIF生成失败，请重试！');
        return;
    }
    
    // 创建URL对象
    var url = URL.createObjectURL(blob);
    
    // 创建预览界面HTML
    var previewHTML = `
        <div id='gifPreviewOverlay' style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; flex-direction: column; justify-content: center; align-items: center;'>
            <div style='background: white; padding: 20px; border-radius: 10px; max-width: 800px; width: 90%;'>
                <h2 style='text-align: center; margin-bottom: 20px;'>精彩瞬间预览</h2>
                <div style='text-align: center; margin-bottom: 20px;'>
                    <img src='${url}' style='max-width: 100%; height: auto; border-radius: 5px;'>
                </div>
                <div style='display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;'>
                    <button id='downloadGIFBtn' style='padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;'>下载</button>
                    <button id='shareTwitterBtn' style='padding: 10px 20px; background: #1DA1F2; color: white; border: none; border-radius: 5px; cursor: pointer;'>分享到Twitter</button>
                    <button id='shareFacebookBtn' style='padding: 10px 20px; background: #4267B2; color: white; border: none; border-radius: 5px; cursor: pointer;'>分享到Facebook</button>
                    <button id='closePreviewBtn' style='padding: 10px 20px; background: #ccc; border: none; border-radius: 5px; cursor: pointer;'>关闭</button>
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面
    $('body').append(previewHTML);
    
    // 绑定事件
    $('#downloadGIFBtn').click(function() {
        downloadGIF(blob);
    });
    
    $('#shareTwitterBtn').click(function() {
        shareToTwitter(url);
    });
    
    $('#shareFacebookBtn').click(function() {
        shareToFacebook(url);
    });
    
    $('#closePreviewBtn').click(function() {
        $('#gifPreviewOverlay').remove();
        URL.revokeObjectURL(url);
    });
    
    // 点击遮罩层关闭预览
    $('#gifPreviewOverlay').click(function(e) {
        if (e.target === this) {
            $('#gifPreviewOverlay').remove();
            URL.revokeObjectURL(url);
        }
    });
}

// 下载GIF文件
function downloadGIF(blob) {
    // 检查是否有有效的blob
    if (!blob) {
        alert('GIF文件不存在，无法下载！');
        return;
    }
    
    // 创建URL对象
    var url = URL.createObjectURL(blob);
    
    // 创建下载链接
    var a = document.createElement('a');
    a.href = url;
    a.download = 'Hextris_Highlight_' + getCurrentTimeString() + '.gif';
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // 释放资源
    URL.revokeObjectURL(url);
}

// 分享到Twitter
function shareToTwitter(gifUrl) {
    // 检查是否有有效的URL
    if (!gifUrl) {
        alert('GIF文件不存在，无法分享！');
        return;
    }
    
    // 构建分享文本和URL
    var text = encodeURIComponent('我在Hextris中创造了精彩瞬间！分数：' + score);
    var shareUrl = 'https://twitter.com/intent/tweet?text=' + text + '&url=' + encodeURIComponent(gifUrl);
    
    // 打开分享窗口
    window.open(shareUrl, 'twitter-share', 'width=600,height=400');
}

// 分享到Facebook
function shareToFacebook(gifUrl) {
    // 检查是否有有效的URL
    if (!gifUrl) {
        alert('GIF文件不存在，无法分享！');
        return;
    }
    
    // 构建分享URL
    var shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(gifUrl);
    
    // 打开分享窗口
    window.open(shareUrl, 'facebook-share', 'width=600,height=400');
}

// 格式化时间
function formatTime(milliseconds) {
    var seconds = Math.floor(milliseconds / 1000);
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

// 获取当前时间字符串
function getCurrentTimeString() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var seconds = String(now.getSeconds()).padStart(2, '0');
    return year + month + day + '_' + hours + minutes + seconds;
}

// 初始化精彩瞬间功能
function initHighlightFeature() {
    console.log('initHighlightFeature called');
    console.log('MainHex.gameover:', MainHex.gameover);
    // 确保游戏已经结束
    if (!MainHex.gameover) {
        console.log('Game is not over, returning');
        return;
    }
    
    console.log('bottomContainer exists:', $('#bottomContainer').length > 0);
    
    // 移除已存在的按钮（防止重复添加）
    $('#generateHighlightBtn').remove();
    
    // 在游戏结束界面添加生成精彩瞬间按钮
    var generateBtnHTML = `
        <button id='generateHighlightBtn' style='padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 10px;'>生成精彩瞬间</button>
    `;
    $('#bottomContainer').append(generateBtnHTML);
    
    console.log('Button added:', $('#generateHighlightBtn').length > 0);
    
    // 先识别精彩瞬间，确定按钮状态
    identifyHighlights();
    
    // 绑定按钮事件
    $('#generateHighlightBtn').click(function() {
        if (!$(this).hasClass('disabled')) {
            showHighlightSelection();
        }
    });
}

// 在游戏结束时调用
function onGameOver() {
    console.log('onGameOver called');
    initHighlightFeature();
}

// 修改consolidateBlocks函数来记录消除事件
var originalConsolidateBlocks = consolidateBlocks;
consolidateBlocks = function(hex, side, index) {
    var result = originalConsolidateBlocks.apply(this, arguments);
    
    // 计算消除的方块数量
    var deleting = [];
    deleting.push([side, index]);
    floodFill(hex, side, index, deleting);
    
    if (deleting.length >= 3) {
        recordElimination(deleting.length);
    }
    
    return result;
};

// 修改gameOverDisplay函数来调用onGameOver
console.log('Modifying gameOverDisplay function');
var originalGameOverDisplay = gameOverDisplay;
if (originalGameOverDisplay) {
    console.log('Original gameOverDisplay function found');
    gameOverDisplay = function() {
        console.log('gameOverDisplay called');
        originalGameOverDisplay.apply(this, arguments);
        onGameOver();
    };
} else {
    console.log('gameOverDisplay function not found');
}