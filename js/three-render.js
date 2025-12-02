// Three.js 3D 渲染系统
window.scene = null;
window.camera = null;
window.renderer = null;
window.controls = null;
let centerHexMesh, borderHexMesh;
let blockMeshes = new Map();
let frameCount = 0;
let lastFrameTime = 0;
let currentFPS = 60;
let qualitySettings = {
    detail: 1.0,
    shadows: true,
    antialias: true
};

// 初始化 Three.js 场景
window.initThreeJS = function() {
    // 创建场景
    window.scene = new THREE.Scene();
    window.scene.background = new THREE.Color(0x000000);
    
    // 创建透视相机
    const aspectRatio = window.innerWidth / window.innerHeight;
    const cameraDistance = window.innerWidth * 1.5;
    window.camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 10000);
    window.camera.position.set(0, cameraDistance, cameraDistance);
    window.camera.lookAt(0, 0, 0);
    
    // 创建渲染器
    window.renderer = new THREE.WebGLRenderer({ antialias: qualitySettings.antialias, alpha: true });
    window.renderer.setSize(window.innerWidth, window.innerHeight);
    window.renderer.setPixelRatio(window.devicePixelRatio || 1);
    window.renderer.shadowMap.enabled = qualitySettings.shadows;
    window.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 将渲染器添加到页面
    const canvasElement = document.getElementById('canvas');
    canvasElement.parentNode.replaceChild(window.renderer.domElement, canvasElement);
    window.renderer.domElement.id = 'canvas';
    
    // 创建轨道控制器
    window.controls = new THREE.OrbitControls(window.camera, window.renderer.domElement);
    window.controls.enableDamping = true;
    window.controls.dampingFactor = 0.05;
    window.controls.enableZoom = false;
    window.controls.enablePan = false;
    window.controls.minPolarAngle = THREE.MathUtils.degToRad(30);
    window.controls.maxPolarAngle = THREE.MathUtils.degToRad(60);
    window.controls.autoRotate = false;
    window.controls.autoRotateSpeed = 1.0;
    
    // 添加光源
    // 方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.copy(window.camera.position);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    window.scene.add(directionalLight);
    
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    window.scene.add(ambientLight);
    
    // 创建中心六边形柱体
    createCenterHex();
    
    // 创建外层边界六边形框架
    createBorderHex();
    
    // 监听窗口大小变化
    window.addEventListener('resize', onWindowResize);
}

// 创建中心六边形柱体
function createCenterHex() {
    const hexRadius = settings.baseHexWidth * settings.scale;
    const hexHeight = 20;
    
    // 创建六边形几何体
    const hexGeometry = new THREE.CylinderGeometry(hexRadius, hexRadius, hexHeight, 6);
    
    // 创建深灰色材质，带轻微光泽
    const hexMaterial = new THREE.MeshStandardMaterial({
        color: 0x34495e,
        metalness: 0.3,
        roughness: 0.6
    });
    
    centerHexMesh = new THREE.Mesh(hexGeometry, hexMaterial);
    centerHexMesh.rotation.x = THREE.MathUtils.degToRad(90);
    centerHexMesh.position.y = hexHeight / 2;
    centerHexMesh.castShadow = true;
    centerHexMesh.receiveShadow = true;
    window.scene.add(centerHexMesh);
}

// 创建外层边界六边形框架
function createBorderHex() {
    const hexRadius = (settings.rows * settings.baseBlockHeight * settings.scale) * (2/Math.sqrt(3)) + settings.baseHexWidth * settings.scale;
    const hexHeight = 30;
    
    // 创建六边形线框几何体
    const hexGeometry = new THREE.CylinderGeometry(hexRadius, hexRadius, hexHeight, 6);
    const edges = new THREE.EdgesGeometry(hexGeometry);
    
    // 创建浅灰色线条材质
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xbdc3c7 });
    
    borderHexMesh = new THREE.LineSegments(edges, lineMaterial);
    borderHexMesh.rotation.x = THREE.MathUtils.degToRad(90);
    borderHexMesh.position.y = hexHeight / 2;
    window.scene.add(borderHexMesh);
}

// 创建3D梯形柱体方块
function createBlockMesh(block) {
    // 梯形柱体的顶点坐标
    const widthTop = 2 * block.distFromHex / Math.sqrt(3);
    const widthBottom = 2 * (block.distFromHex + block.height) / Math.sqrt(3);
    const height = 15;
    
    // 创建梯形柱体几何体
    const geometry = new THREE.CylinderGeometry(widthTop / 2, widthBottom / 2, height, 6);
    
    // 创建材质
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(block.color),
        metalness: 0.2,
        roughness: 0.7
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = THREE.MathUtils.degToRad(90);
    mesh.position.y = height / 2;
    
    // 计算方块的位置
    const angleRad = THREE.MathUtils.degToRad(block.angle);
    const distance = block.distFromHex + block.height / 2;
    mesh.position.x = Math.sin(angleRad) * distance;
    mesh.position.z = Math.cos(angleRad) * distance;
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    window.scene.add(mesh);
    blockMeshes.set(block, mesh);
    
    return mesh;
}

// 更新方块的位置和旋转
function updateBlockMesh(block) {
    const mesh = blockMeshes.get(block);
    if (!mesh) return;
    
    // 更新位置
    const angleRad = THREE.MathUtils.degToRad(block.angle);
    const distance = block.distFromHex + block.height / 2;
    mesh.position.x = Math.sin(angleRad) * distance;
    mesh.position.z = Math.cos(angleRad) * distance;
    
    // 更新透明度
    mesh.material.opacity = block.opacity;
    mesh.material.transparent = block.opacity < 1;
    
    // 如果方块被删除，准备移除
    if (block.deleted === 2) {
        window.scene.remove(mesh);
        blockMeshes.delete(block);
    }
}

// 更新中心六边形的旋转
function updateCenterHexRotation() {
    const rotationAngle = THREE.MathUtils.degToRad(MainHex.angle - 30);
    centerHexMesh.rotation.z = rotationAngle;
}

// 帧率监控和质量调整
function updateQuality() {
    const currentTime = performance.now();
    if (currentTime - lastFrameTime >= 1000) {
        currentFPS = frameCount;
        frameCount = 0;
        lastFrameTime = currentTime;
        
        // 根据帧率调整质量
        if (currentFPS < 30) {
            qualitySettings.detail = 0.5;
            qualitySettings.shadows = false;
            window.renderer.shadowMap.enabled = false;
        } else if (currentFPS < 45) {
            qualitySettings.detail = 0.75;
        } else {
            qualitySettings.detail = 1.0;
            qualitySettings.shadows = true;
            window.renderer.shadowMap.enabled = true;
        }
    }
    frameCount++;
}

// 窗口大小变化处理
function onWindowResize() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    window.camera.aspect = aspectRatio;
    window.camera.updateProjectionMatrix();
    window.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // 更新相机位置
    const cameraDistance = window.innerWidth * 1.5;
    window.camera.position.set(0, cameraDistance, cameraDistance);
    window.camera.lookAt(0, 0, 0);
}

// 3D渲染主函数
function render3D() {
    // 更新质量设置
    updateQuality();
    
    // 更新控制器
    window.controls.update();
    
    // 更新中心六边形旋转
    updateCenterHexRotation();
    
    // 更新所有方块
    for (let i = 0; i < MainHex.blocks.length; i++) {
        for (let j = 0; j < MainHex.blocks[i].length; j++) {
            const block = MainHex.blocks[i][j];
            if (!blockMeshes.has(block)) {
                createBlockMesh(block);
            }
            updateBlockMesh(block);
        }
    }
    
    // 更新下落的方块
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        if (!blockMeshes.has(block)) {
            createBlockMesh(block);
        }
        updateBlockMesh(block);
    }
    
    // 渲染场景
    window.renderer.render(window.scene, window.camera);
}

// 清理所有3D资源
function disposeThreeJS() {
    window.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
    });
    
    renderer.dispose();
    controls.dispose();
}
