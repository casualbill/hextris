// Three.js 3D渲染系统
let threeScene, threeCamera, threeRenderer;
let centerHexGroup, blocksGroup, outerBorderGroup;
let centerHexMesh, outerBorderMesh;
let blockMeshes = [];
let sceneRotation = { x: Math.PI / 4, y: 0 };
let targetRotation = { x: Math.PI / 4, y: 0 };
let isDragging = false;
let lastMousePos = { x: 0, y: 0 };
let frameCount = 0;
let lastTime = performance.now();
let currentFPS = 60;

// 确保window.rush存在
if (typeof window.rush === 'undefined') {
    window.rush = 1;
}

// 初始化Three.js场景
function initThreeJS() {
    // 创建场景
    threeScene = new THREE.Scene();
    
    // 创建相机
    threeCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const cameraDistance = window.innerWidth * 1.5;
    threeCamera.position.set(0, cameraDistance, cameraDistance);
    threeCamera.lookAt(0, 0, 0);
    
    // 创建渲染器
    const container = document.getElementById('threejs-canvas');
    threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
    threeRenderer.setClearColor(0x000000, 0);
    threeRenderer.shadowMap.enabled = true;
    container.appendChild(threeRenderer.domElement);
    
    // 创建光源
    createLights();
    
    // 创建3D对象组
    centerHexGroup = new THREE.Group();
    blocksGroup = new THREE.Group();
    outerBorderGroup = new THREE.Group();
    
    threeScene.add(centerHexGroup);
    threeScene.add(blocksGroup);
    threeScene.add(outerBorderGroup);
    
    // 创建中心六边形
    createCenterHex();
    
    // 创建外边界
    createOuterBorder();
    
    // 设置交互事件
    setupInteraction();
    
    // 开始渲染循环
    animateThreeJS();
}

// 创建光源
function createLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    threeScene.add(ambientLight);
    
    // 方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.copy(threeCamera.position);
    directionalLight.castShadow = true;
    threeScene.add(directionalLight);
}

// 创建中心六边形（3D六角柱体）
function createCenterHex() {
    const sideLength = settings.hexWidth;
    const height = 20 * settings.scale;
    const geometry = new THREE.CylinderGeometry(sideLength, sideLength, height, 6, 1, false);
    const material = new THREE.MeshPhongMaterial({
        color: 0x34495e,
        shininess: 50,
        emissive: 0x2c3e50,
        emissiveIntensity: 0.2
    });
    
    centerHexMesh = new THREE.Mesh(geometry, material);
    centerHexMesh.rotation.x = -Math.PI / 2;
    centerHexMesh.position.y = height / 2;
    centerHexGroup.add(centerHexMesh);
}

// 创建外边界六边形框架
function createOuterBorder() {
    const sideLength = (settings.rows * settings.blockHeight) * (2 / Math.sqrt(3)) + settings.hexWidth;
    const height = 30 * settings.scale;
    
    const borderMaterial = new THREE.LineBasicMaterial({ 
        color: 0xbdc3c7,
        linewidth: 2
    });
    
    // 创建六边形边框
    const hexPoints = [];
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
        hexPoints.push(new THREE.Vector3(
            Math.cos(angle) * sideLength,
            0,
            Math.sin(angle) * sideLength
        ));
    }
    hexPoints.push(hexPoints[0].clone());
    
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(hexPoints);
    outerBorderMesh = new THREE.Line(lineGeometry, borderMaterial);
    
    // 创建垂直边框
    for (let i = 0; i < 6; i++) {
        const start = hexPoints[i].clone();
        const end = hexPoints[i].clone();
        end.y = height;
        const points = [start, end];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, borderMaterial);
        outerBorderGroup.add(line);
    }
    
    outerBorderMesh.position.y = height / 2;
    outerBorderGroup.add(outerBorderMesh);
}

// 创建3D方块（梯形柱体）
function createBlockMesh(block) {
    // 梯形柱体几何
    const baseSize = block.distFromHex / Math.sqrt(3);
    const topSize = (block.distFromHex + block.height) / Math.sqrt(3);
    const height = 15 * settings.scale;
    const segments = 4;
    
    const geometry = new THREE.CylinderGeometry(baseSize, topSize, height, 4, 1, false);
    const color = new THREE.Color(block.color);
    
    const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 30
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    // 计算位置
    const angle = block.angle * Math.PI / 180;
    const radius = block.distFromHex + block.height / 2;
    mesh.position.x = Math.cos(angle) * radius;
    mesh.position.z = Math.sin(angle) * radius;
    mesh.position.y = height / 2;
    
    // 设置旋转
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = -angle;
    
    return mesh;
}

// 渲染3D场景
function renderThreeJS() {
    // 更新旋转
    sceneRotation.x += (targetRotation.x - sceneRotation.x) * 0.1;
    sceneRotation.y += (targetRotation.y - sceneRotation.y) * 0.1;
    
    // 应用旋转
    threeScene.rotation.x = sceneRotation.x;
    threeScene.rotation.y = sceneRotation.y;
    
    // 渲染
    threeRenderer.render(threeScene, threeCamera);
}

// 动画循环
function animateThreeJS() {
    requestAnimationFrame(animateThreeJS);
    
    // 计算FPS
    frameCount++;
    const now = performance.now();
    if (now >= lastTime + 1000) {
        currentFPS = (frameCount * 1000) / (now - lastTime);
        frameCount = 0;
        lastTime = now;
    }
    
    // 根据FPS调整渲染质量
    if (currentFPS < 30) {
        threeRenderer.setPixelRatio(Math.min(1, window.devicePixelRatio));
    } else {
        threeRenderer.setPixelRatio(window.devicePixelRatio);
    }
    
    renderThreeJS();
}

// 设置交互事件
function setupInteraction() {
    const container = document.getElementById('threejs-canvas');
    
    // 鼠标事件
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMousePos.x = e.clientX;
        lastMousePos.y = e.clientY;
    });
    
    container.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - lastMousePos.x;
            const deltaY = e.clientY - lastMousePos.y;
            
            targetRotation.y += deltaX * 0.005;
            targetRotation.x += deltaY * 0.005;
            
            // 限制垂直旋转角度在30度到60度之间
            targetRotation.x = Math.max(Math.PI / 6, Math.min(Math.PI / 3, targetRotation.x));
            
            lastMousePos.x = e.clientX;
            lastMousePos.y = e.clientY;
        }
    });
    
    container.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    container.addEventListener('mouseleave', () => {
        isDragging = false;
    });
    
    // 触摸事件
    let touchStart = null;
    container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length === 1) {
            touchStart = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    });
    
    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && touchStart) {
            const deltaX = e.touches[0].clientX - touchStart.x;
            const deltaY = e.touches[0].clientY - touchStart.y;
            
            targetRotation.y += deltaX * 0.005;
            targetRotation.x += deltaY * 0.005;
            
            targetRotation.x = Math.max(Math.PI / 6, Math.min(Math.PI / 3, targetRotation.x));
            
            touchStart.x = e.touches[0].clientX;
            touchStart.y = e.touches[0].clientY;
        }
    });
    
    container.addEventListener('touchend', () => {
        touchStart = null;
    });
}

// 更新3D场景中的方块
function updateThreeJSBlocks() {
    // 检查blocksGroup是否已初始化
    if (!blocksGroup) {
        return;
    }
    
    // 清除旧的方块
    while (blocksGroup.children.length > 0) {
        blocksGroup.remove(blocksGroup.children[0]);
    }
    blockMeshes = [];
    
    // 添加中心六边形上的方块
    for (let i = 0; i < MainHex.blocks.length; i++) {
        for (let j = 0; j < MainHex.blocks[i].length; j++) {
            const block = MainHex.blocks[i][j];
            if (!block.deleted) {
                const mesh = createBlockMesh(block);
                blocksGroup.add(mesh);
                blockMeshes.push({ block: block, mesh: mesh });
            }
        }
    }
    
    // 添加下落中的方块
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        if (!block.deleted) {
            const mesh = createBlockMesh(block);
            blocksGroup.add(mesh);
            blockMeshes.push({ block: block, mesh: mesh });
        }
    }
}

// 窗口大小调整
function resizeThreeJS() {
    if (threeCamera && threeRenderer) {
        threeCamera.aspect = window.innerWidth / window.innerHeight;
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(window.innerWidth, window.innerHeight);
        
        // 更新相机位置
        const cameraDistance = window.innerWidth * 1.5;
        threeCamera.position.set(0, cameraDistance, cameraDistance);
        
        // 重新渲染
        renderThreeJS();
    }
}

// 窗口大小调整事件
window.addEventListener('resize', function() {
    if (typeof threeCamera !== 'undefined' && typeof threeRenderer !== 'undefined') {
        resizeThreeJS();
    }
});