// script.js - 4D Interactive Construction Scene

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ===== SCENE SETUP =====
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f1a);
scene.fog = new THREE.Fog(0x0b0f1a, 30, 60);

// ===== CAMERA =====
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(25, 15, 30);
camera.lookAt(0, 0, 0);

// ===== RENDERERS =====
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
container.appendChild(labelRenderer.domElement);

// ===== CONTROLS =====
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;
controls.target.set(0, 5, 0);
controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 10;
controls.maxDistance = 50;

// ===== LIGHTS =====
const ambientLight = new THREE.AmbientLight(0x404066, 0.5);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffeedd, 2.0);
mainLight.position.set(15, 30, 15);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 60;
mainLight.shadow.camera.left = -30;
mainLight.shadow.camera.right = 30;
mainLight.shadow.camera.top = 30;
mainLight.shadow.camera.bottom = -30;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0x4488ff, 0.4);
fillLight.position.set(-10, 10, -15);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffaa55, 0.5);
rimLight.position.set(-5, 5, -20);
scene.add(rimLight);

// ===== GROUND =====
const groundGeo = new THREE.PlaneGeometry(50, 50);
const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1a2636,
    roughness: 0.9,
    metalness: 0.0,
    transparent: true,
    opacity: 0.8
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
ground.receiveShadow = true;
scene.add(ground);

// Grid
const gridHelper = new THREE.GridHelper(40, 30, 0x00d4ff, 0x1a2a44);
gridHelper.position.y = 0;
scene.add(gridHelper);

// ===== BUILDING =====
const buildingGroup = new THREE.Group();

// Foundation
const foundationMat = new THREE.MeshStandardMaterial({ color: 0x3a4a5a, roughness: 0.6, metalness: 0.2 });
const foundation = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 10), foundationMat);
foundation.position.set(0, 0.25, 0);
foundation.receiveShadow = true;
foundation.castShadow = true;
buildingGroup.add(foundation);

// Columns and Floors
const colMat = new THREE.MeshStandardMaterial({ color: 0x6a7a8a, roughness: 0.3, metalness: 0.5 });
const slabMat = new THREE.MeshStandardMaterial({
    color: 0x4a5a6a,
    roughness: 0.5,
    metalness: 0.2,
    transparent: true,
    opacity: 0.6
});

const columnPositions = [
    [-5.5, -3.5],
    [-5.5, 3.5],
    [0, -3.5],
    [0, 3.5],
    [5.5, -3.5],
    [5.5, 3.5]
];

const floorHeights = [1.2, 2.8, 4.4, 6.0, 7.6];
const floorColors = [0x4a5a6a, 0x5a6a7a, 0x6a7a8a, 0x5a6a7a, 0x4a5a6a];

// Columns
columnPositions.forEach(([x, z]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 8.5, 8), colMat);
    col.position.set(x, 4.5, z);
    col.castShadow = true;
    buildingGroup.add(col);

    // Rebar rings
    const rebarMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.05 });
    for (let h = 0.5; h < 8.5; h += 1.2) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 12), rebarMat);
        ring.position.set(x, h + 0.3, z);
        ring.rotation.x = Math.PI / 2;
        buildingGroup.add(ring);
    }
});

// Floors
floorHeights.forEach((y, i) => {
    const floor = new THREE.Mesh(new THREE.BoxGeometry(12, 0.15, 8), slabMat);
    floor.material.color.setHex(floorColors[i]);
    floor.position.set(0, y, 0);
    floor.receiveShadow = true;
    floor.castShadow = true;
    buildingGroup.add(floor);

    // Edge outline
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(12, 0.15, 8));
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.15
    }));
    line.position.copy(floor.position);
    buildingGroup.add(line);
});

// Roof
const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a6a7a, roughness: 0.4, metalness: 0.2 });
const roof = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.3, 8.5), roofMat);
roof.position.set(0, 9.2, 0);
roof.castShadow = true;
roof.receiveShadow = true;
buildingGroup.add(roof);

// ===== SCAFFOLDING =====
const scaffoldMat = new THREE.MeshStandardMaterial({ color: 0x8a7a4a, roughness: 0.8, metalness: 0.1 });
const scaffoldGroup = new THREE.Group();

for (let i = 0; i < 4; i++) {
    const x = (i - 1.5) * 3.5;
    for (let j = 0; j < 3; j++) {
        const y = 1.5 + j * 2.8;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 4), scaffoldMat);
        pole.position.set(x, y, -5.2);
        scaffoldGroup.add(pole);
        const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 4), scaffoldMat);
        pole2.position.set(x, y, 5.2);
        scaffoldGroup.add(pole2);
    }
}
// Horizontal bars
for (let j = 0; j < 3; j++) {
    const y = 1.5 + j * 2.8;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.04, 0.04), scaffoldMat);
    bar.position.set(0, y, -5.2);
    scaffoldGroup.add(bar);
    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.04, 0.04), scaffoldMat);
    bar2.position.set(0, y, 5.2);
    scaffoldGroup.add(bar2);
}
buildingGroup.add(scaffoldGroup);

// ===== CRANE =====
const craneGroup = new THREE.Group();
const craneMat = new THREE.MeshStandardMaterial({ color: 0xcc8844, roughness: 0.4, metalness: 0.6 });

// Tower
const tower = new THREE.Mesh(new THREE.BoxGeometry(0.4, 12, 0.4), craneMat);
tower.position.set(8.5, 6, 0);
craneGroup.add(tower);

// Jib arm
const jib = new THREE.Mesh(new THREE.BoxGeometry(6, 0.15, 0.15), craneMat);
jib.position.set(11.5, 12, 0);
craneGroup.add(jib);

// Counter jib
const counterJib = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 0.15), craneMat);
counterJib.position.set(6, 12, 0);
craneGroup.add(counterJib);

// Hook with animation
const hookMat = new THREE.MeshStandardMaterial({ color: 0xffaa33, emissive: 0xffaa33, emissiveIntensity: 0.1 });
const hook = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), hookMat);
hook.position.set(12.5, 8, 0);
craneGroup.add(hook);

const cableMat = new THREE.MeshStandardMaterial({ color: 0x555577 });
const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3.8, 4), cableMat);
cable.position.set(12.5, 10, 0);
craneGroup.add(cable);

buildingGroup.add(craneGroup);

// ===== LASBCA STAFF (Animated People - Simple Geometry) =====
const staffGroup = new THREE.Group();

function createPerson(color, labelText, x, z) {
    const group = new THREE.Group();

    // Body (torso)
    const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.7, 6), bodyMat);
    body.position.y = 0.8;
    body.castShadow = true;
    group.add(body);

    // Head
    const headMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.8 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), headMat);
    head.position.y = 1.3;
    group.add(head);

    // Hard hat
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.3 });
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.15, 6), hatMat);
    hat.position.y = 1.45;
    group.add(hat);

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2a3a4a, roughness: 0.8 });
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 4), legMat);
    leg1.position.set(-0.1, 0.2, 0);
    group.add(leg1);
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 4), legMat);
    leg2.position.set(0.1, 0.2, 0);
    group.add(leg2);

    // LASBCA Vest (just a colored overlay)
    const vestMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.05 });
    const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.37, 0.5, 6), vestMat);
    vest.position.y = 0.85;
    group.add(vest);

    // Clipboard (for LASBCA staff)
    if (labelText.includes('LASBCA')) {
        const clipMat = new THREE.MeshStandardMaterial({ color: 0x8a7a4a });
        const clip = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 0.02), clipMat);
        clip.position.set(0.4, 0.75, 0);
        group.add(clip);
    }

    group.position.set(x, 0, z);

    // Random rotation to face different directions
    group.rotation.y = Math.random() * Math.PI * 2;

    return group;
}

// Add LASBCA Staff
const staffPositions = [
    { x: -2, z: 2, color: 0x2a5a7a, label: 'LASBCA Staff' },
    { x: 3, z: -3, color: 0x2a5a7a, label: 'LASBCA Staff' },
    { x: -4, z: -2, color: 0x3a6a4a, label: 'Worker' },
    { x: 0, z: -4, color: 0x3a6a4a, label: 'Worker' },
    { x: 5, z: 1, color: 0x2a5a7a, label: 'LASBCA Staff' },
    { x: -3, z: 4, color: 0x3a6a4a, label: 'Worker' },
    { x: 4, z: -2, color: 0x2a5a7a, label: 'LASBCA Staff' },
    { x: 1, z: 4.5, color: 0x3a6a4a, label: 'Worker' },
];

staffPositions.forEach((pos) => {
    const person = createPerson(pos.color, pos.label, pos.x, pos.z);
    // Store for animation
    person.userData = {
        speed: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        startX: pos.x,
        startZ: pos.z,
        range: 0.5 + Math.random() * 0.5,
    };
    staffGroup.add(person);
});

scene.add(staffGroup);

// ===== FLOATING LABELS =====
const labelGroup = new THREE.Group();

// Building stage labels
const stageLabels = ['Foundation', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', 'Roof'];
const stageY = [0.8, 1.8, 3.4, 5.0, 6.6, 9.6];

stageLabels.forEach((text, i) => {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.color = '#b9c8e6';
    div.style.fontSize = '9px';
    div.style.fontWeight = '600';
    div.style.fontFamily = 'Inter, sans-serif';
    div.style.background = 'rgba(11, 15, 26, 0.7)';
    div.style.padding = '2px 12px';
    div.style.borderRadius = '20px';
    div.style.border = '1px solid rgba(0, 212, 255, 0.15)';
    div.style.backdropFilter = 'blur(4px)';
    div.style.letterSpacing = '0.5px';
    div.style.textShadow = '0 2px 8px rgba(0,0,0,0.8)';
    const label = new CSS2DObject(div);
    label.position.set(-8.5, stageY[i], 0);
    labelGroup.add(label);
});

// LASBCA Site Sign
const signDiv = document.createElement('div');
signDiv.textContent = '🏗️ LASBCA SITE · BUILD RIGHT, AVOID COLLAPSE';
signDiv.style.color = '#00d4ff';
signDiv.style.fontSize = '11px';
signDiv.style.fontWeight = '700';
signDiv.style.fontFamily = 'Inter, sans-serif';
signDiv.style.background = 'rgba(11, 15, 26, 0.8)';
signDiv.style.padding = '6px 20px';
signDiv.style.borderRadius = '30px';
signDiv.style.border = '2px solid #00d4ff';
signDiv.style.backdropFilter = 'blur(4px)';
signDiv.style.letterSpacing = '2px';
const signLabel = new CSS2DObject(signDiv);
signLabel.position.set(0, 11, 7);
labelGroup.add(signLabel);

scene.add(labelGroup);

// ===== PARTICLES (Construction dust) =====
const particleCount = 500;
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) {
    particlePos[i] = (Math.random() - 0.5) * 60;
    if (i % 3 === 1) particlePos[i] = Math.random() * 12 + 1;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particleMat = new THREE.PointsMaterial({
    color: 0x00d4ff,
    size: 0.04,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ===== ANIMATION LOOP =====
let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Auto-rotate
    controls.update();

    // Crane hook animation
    const hookObj = craneGroup.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry');
    if (hookObj) {
        hookObj.position.y = 8 + Math.sin(time * 0.8) * 0.5;
    }

    // Animate people (simple bobbing)
    staffGroup.children.forEach((person, i) => {
        const data = person.userData;
        if (data) {
            // Bob up and down slightly
            person.position.y = Math.sin(time * data.speed + data.phase) * 0.05;
            // Slight sway
            person.rotation.z = Math.sin(time * data.speed * 0.5 + data.phase) * 0.02;
            // Walk cycle for legs (simplified - move whole body slightly)
            person.position.x = data.startX + Math.sin(time * data.speed * 0.5 + data.phase) * data.range * 0.1;
            person.position.z = data.startZ + Math.cos(time * data.speed * 0.3 + data.phase) * data.range * 0.1;
        }
    });

    // Rotate particles
    particles.rotation.y += 0.0003;

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

animate();

// ===== RESIZE =====
window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
});

// Toggle auto-rotate on user interaction
renderer.domElement.addEventListener('mousedown', () => {
    controls.autoRotate = false;
});
renderer.domElement.addEventListener('mouseup', () => {
    setTimeout(() => { controls.autoRotate = true; }, 3000);
});

// Touch support
renderer.domElement.addEventListener('touchstart', () => {
    controls.autoRotate = false;
});
renderer.domElement.addEventListener('touchend', () => {
    setTimeout(() => { controls.autoRotate = true; }, 3000);
});

console.log('🏗️ 4D Construction Scene Loaded!');
