// 录制功能模块
window.Recorder = (function() {
    let isRecording = false;
    let recordRTC = null;
    let selectedFormat = null;
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

    // 初始化录制功能
    function init() {
        // 确保页面加载完成后再进行操作
        $(document).ready(function() {
            // 绑定录制按钮点击事件
            $('#recordBtn').on('click', toggleRecording);
            // 显示录制按钮
            $('#recordBtn').show();
        });
    }

    // 切换录制状态
    function toggleRecording() {
        // 检查游戏状态变量是否存在
        if (typeof window.gameState === 'undefined') {
            console.log('Error: gameState variable is not defined');
            alert('游戏状态未初始化，请刷新页面重试！');
            return;
        }
        
        if (window.gameState !== 1) {
            console.log('Game state is not 1 (current state: ' + window.gameState + ')');
            alert('请先开始游戏后再进行录制！');
            return;
        }

        console.log('Toggling recording... Current state: ' + isRecording);
        
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    }

    // 开始录制
    function startRecording() {
        // 显示格式选择对话框
        showFormatDialog();
    }

    // 显示格式选择对话框
    function showFormatDialog() {
        sweetAlert({
            title: '选择视频格式',
            text: '请选择录制视频的格式:',
            type: 'info',
            showCancelButton: false,
            closeOnConfirm: false,
            confirmButtonText: 'MP4',
            confirmButtonColor: '#3498db',
            showLoaderOnConfirm: false,
            html: true,
            customClass: 'format-dialog',
            onOpen: function() {
                setTimeout(function() {
                    // 添加格式选项按钮
                    $('.sa-button-container').append(`
                        <button class="sweet-alert-button sweet-alert-button--confirm sweet-alert-button--format" data-format="webm" style="margin-left: 10px;">WebM</button>
                    `);
                    
                    // 绑定格式选择事件
                    $('.sweet-alert-button--format').on('click', function() {
                        selectedFormat = $(this).data('format');
                        startRecordingWithFormat();
                        $('.sweet-overlay, .sweet-alert').hide();
                    });
                    
                    // 绑定MP4格式选择事件
                    $('.sa-confirm-button-container').find('button').on('click', function() {
                        selectedFormat = 'mp4';
                        startRecordingWithFormat();
                    });
                }, 100);
            }
        });
    }

    // 使用选定的格式开始录制
    function startRecordingWithFormat() {
        const canvas = document.getElementById('canvas');
        
        // 配置录制参数
        const options = {
            type: 'video',
            mimeType: selectedFormat === 'mp4' ? 'video/mp4' : 'video/webm',
            video: {
                width: trueCanvas.width,
                height: trueCanvas.height,
                frameRate: 60
            },
            quality: 100, // 高质量
            disableLogs: true
        };

        // 创建RecordRTC实例
        recordRTC = RecordRTC(canvas, options);
        
        // 开始录制
        recordRTC.startRecording();
        
        // 更新UI状态
        isRecording = true;
        $('#recordBtn').addClass('recording').text('录制中');
        $('#recordingIndicator').show();
        
        // 监控文件大小
        monitorFileSize();
    }

    // 监控文件大小
    function monitorFileSize() {
        if (!isRecording || !recordRTC) return;

        // 定期检查文件大小
        setTimeout(function() {
            if (isRecording && recordRTC) {
                const fileSize = recordRTC.getBlob().size;
                
                // 如果文件大小超过100MB，自动停止录制
                if (fileSize >= MAX_FILE_SIZE) {
                    autoStopRecording();
                    return;
                }
                
                // 继续监控
                monitorFileSize();
            }
        }, 1000); // 每秒检查一次
    }

    // 自动停止录制
    function autoStopRecording() {
        stopRecording();
        sweetAlert({
            title: '录制停止',
            text: '录制文件过大，已自动停止',
            type: 'warning',
            confirmButtonColor: '#e74c3c'
        });
    }

    // 停止录制
    function stopRecording() {
        if (!isRecording || !recordRTC) return;

        // 停止录制
        recordRTC.stopRecording(function() {
            const blob = recordRTC.getBlob();
            
            // 更新UI状态
            isRecording = false;
            $('#recordBtn').removeClass('recording').text('录制');
            $('#recordingIndicator').hide();
            
            // 显示下载对话框
            showDownloadDialog(blob);
        });
    }

    // 显示下载对话框
    function showDownloadDialog(blob) {
        const fileSize = (blob.size / (1024 * 1024)).toFixed(2); // 转换为MB
        const fileName = `hextris-recording-${Date.now()}.${selectedFormat}`;
        
        sweetAlert({
            title: '录制完成',
            text: `录制文件大小: ${fileSize} MB<br>格式: ${selectedFormat.toUpperCase()}`,
            type: 'success',
            html: true,
            showCancelButton: true,
            confirmButtonText: '下载',
            confirmButtonColor: '#3498db',
            cancelButtonText: '取消',
            closeOnConfirm: false,
            closeOnCancel: true,
            onConfirm: function() {
                downloadVideo(blob, fileName);
                sweetAlert.close();
            }
        });
    }

    // 下载录制的视频
    function downloadVideo(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // 释放URL对象
        setTimeout(function() {
            URL.revokeObjectURL(url);
        }, 100);
    }

    // 导出公共方法
    return {
        init: init,
        toggleRecording: toggleRecording,
        isRecording: function() { return isRecording; }
    };
})();

// 页面加载完成后初始化录制功能
$(document).ready(function() {
    Recorder.init();
});