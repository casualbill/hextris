// 3D渲染相关变量
var scene, camera, renderer;
var centerHex3D, outerHex3D;
var blocks3D = [];
var light, ambientLight;
var is3DRender = false;
var cameraRotation = { x: 45, y: 0 };
var targetCameraRotation = { x: 45, y: 0 };
var cameraRotationSpeed = 0.05;

// 初始化3D场景
function init3D() {
    // 创建场景
    scene = new THREE.Scene();
    
    // 创建透视相机
    var width = window.innerWidth;
    var height = window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.z = width * 1.5;
    camera.position.y = width * 1.5;
    camera.lookAt(0, 0, 0);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    
    // 将渲染器添加到页面
    var canvas3D = document.createElement('div');
    canvas3D.id = 'canvas3D';
    canvas3D.style.position = 'absolute';
    canvas3D.style.top = '0';
    canvas3D.style.left = '0';
    canvas3D.style.width = '100%';
    canvas3D.style.height = '100%';
    canvas3D.style.zIndex = '1';
    document.body.appendChild(canvas3D);
    canvas3D.appendChild(renderer.domElement);
    
    // 创建光源
    light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(0, 1, 1);
    scene.add(light);
    
    ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    // 创建中心六边形（3D六角柱体）
    var centerHexGeometry = new THREE.CylinderGeometry(80, 80, 20, 6);
    var centerHexMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 50,
        specular: 0x444444
    });
    centerHex3D = new THREE.Mesh(centerHexGeometry, centerHexMaterial);
    scene.add(centerHex3D);
    
    // 创建外层边界六边形（线框模式）
    var outerHexGeometry = new THREE.CylinderGeometry(120, 120, 30, 6);
    var outerHexMaterial = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        wireframe: true
    });
    outerHex3D = new THREE.Mesh(outerHexGeometry, outerHexMaterial);
    scene.add(outerHex3D);
    
    // 设置鼠标交互
    setupMouseInteraction();
    
    // 启动渲染循环
    animate3D();
}

// 设置鼠标交互
function setupMouseInteraction() {
    var isDragging = false;
    var previousMousePosition = { x: 0, y: 0 };
    
    renderer.domElement.addEventListener('mousedown', function(e) {
        isDragging = true;
    });
    
    renderer.domElement.addEventListener('mousemove', function(e) {
        if (isDragging) {
            var deltaMove = {
                x: e.offsetX - previousMousePosition.x,
                y: e.offsetY - previousMousePosition.y
            };
            
            // 限制垂直旋转角度在30-60度之间
            targetCameraRotation.x = Math.max(30, Math.min(60, targetCameraRotation.x + deltaMove.y * 0.5));
            targetCameraRotation.y += deltaMove.x * 0.5;
        }
        
        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
    });
    
    renderer.domElement.addEventListener('mouseup', function(e) {
        isDragging = false;
    });
    
    renderer.domElement.addEventListener('mouseleave', function(e) {
        isDragging = false;
    });
}

// 更新3D场景
function update3D() {
    // 更新相机旋转
    cameraRotation.x += (targetCameraRotation.x - cameraRotation.x) * cameraRotationSpeed;
    cameraRotation.y += (targetCameraRotation.y - cameraRotation.y) * cameraRotationSpeed;
    
    // 应用相机旋转
    var radius = window.innerWidth * 1.5;
    camera.position.x = Math.sin(cameraRotation.y * Math.PI / 180) * Math.sin(cameraRotation.x * Math.PI / 180) * radius;
    camera.position.y = Math.cos(cameraRotation.x * Math.PI / 180) * radius;
    camera.position.z = Math.cos(cameraRotation.y * Math.PI / 180) * Math.sin(cameraRotation.x * Math.PI / 180) * radius;
    camera.lookAt(0, 0, 0);
    
    // 更新中心六边形旋转
    if (typeof MainHex !== 'undefined' && centerHex3D) {
        centerHex3D.rotation.y = MainHex.angle * Math.PI / 180;
    }
    
    // 更新外层六边形旋转
    if (typeof MainHex !== 'undefined' && outerHex3D) {
        outerHex3D.rotation.y = MainHex.angle * Math.PI / 180;
    }
    
    // 更新所有3D方块
    if (typeof MainHex !== 'undefined') {
        updateBlocks3D();
    }
}

// 更新3D方块
function updateBlocks3D() {
    // 清除旧的3D方块
    for (var i = 0; i < blocks3D.length; i++) {
        scene.remove(blocks3D[i]);
    }
    blocks3D = [];
    
    // 创建新的3D方块
    if (typeof MainHex !== 'undefined' && MainHex.blocks) {
        for (var i = 0; i < MainHex.blocks.length; i++) {
            for (var j = 0; j < MainHex.blocks[i].length; j++) {
                var block = MainHex.blocks[i][j];
                
                // 计算方块位置
                var angle = (30 + i * 60) * Math.PI / 180;
                var distance = block.distFromHex;
                
                // 创建3D方块（梯形柱体）
                var blockGeometry = new THREE.CylinderGeometry(
                    distance / 2, 
                    (distance + block.height) / 2, 
                    15, 
                    4
                );
                
                var blockMaterial = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(block.color),
                    shininess: 30
                });
                
                var block3D = new THREE.Mesh(blockGeometry, blockMaterial);
                
                // 设置方块位置和旋转
                block3D.position.x = Math.sin(angle) * (distance + block.height / 2);
                block3D.position.z = Math.cos(angle) * (distance + block.height / 2);
                block3D.rotation.y = angle;
                
                scene.add(block3D);
                blocks3D.push(block3D);
            }
        }
    }
    
    // 更新下落的方块
    if (typeof blocks !== 'undefined') {
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            
            // 计算方块位置
            var angle = block.angle * Math.PI / 180;
            var distance = block.distFromHex;
            
            // 创建3D方块
            var blockGeometry = new THREE.CylinderGeometry(
                distance / 2, 
                (distance + block.height) / 2, 
                15, 
                4
            );
            
            var blockMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color(block.color),
                shininess: 30
            });
            
            var block3D = new THREE.Mesh(blockGeometry, blockMaterial);
            
            // 设置方块位置和旋转
            block3D.position.x = Math.sin(angle) * (distance + block.height / 2);
            block3D.position.z = Math.cos(angle) * (distance + block.height / 2);
            block3D.rotation.y = angle;
            
            scene.add(block3D);
            blocks3D.push(block3D);
        }
    }
}

// 渲染3D场景
function render3D() {
    renderer.render(scene, camera);
}

// 动画循环
function animate3D() {
    requestAnimationFrame(animate3D);
    update3D();
    render3D();
}

// 切换到3D渲染模式
function switchTo3DRender() {
    is3DRender = true;
    init3D();
}

// 切换到2D渲染模式
function switchTo2DRender() {
    is3DRender = false;
    if (renderer) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
}

// 窗口大小改变时调整3D渲染器
function onWindowResize3D() {
    if (is3DRender && camera && renderer) {
        var width = window.innerWidth;
        var height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        
        // 调整相机距离
        var radius = width * 1.5;
        camera.position.x = Math.sin(cameraRotation.y * Math.PI / 180) * Math.sin(cameraRotation.x * Math.PI / 180) * radius;
        camera.position.y = Math.cos(cameraRotation.x * Math.PI / 180) * radius;
        camera.position.z = Math.cos(cameraRotation.y * Math.PI / 180) * Math.sin(cameraRotation.x * Math.PI / 180) * radius;
    }
}

// 监听窗口大小改变事件
window.addEventListener('resize', onWindowResize3D, false);