
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('steel-viewer');

if (!container) {
    console.error('No se encontró steel-viewer');
} else {

    container.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101820);

    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );

    camera.position.set(4, 3, 5);

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // Iluminación
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(4, 5, 5);
    scene.add(light);

    // Probeta metálica
    const geometry = new THREE.CylinderGeometry(
        0.65, 0.65, 2.8, 64
    );

    const material = new THREE.MeshStandardMaterial({
        color: 0x9ba8b5,
        metalness: 0.9,
        roughness: 0.25
    });

    const steel = new THREE.Mesh(geometry, material);
    steel.rotation.z = Math.PI / 2;
    scene.add(steel);

    // Controles para girar y acercar
    const controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;

    // Animación
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // Ajustar al tamaño de pantalla
    window.addEventListener('resize', function() {
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (width === 0 || height === 0) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    });

    console.log('Modelo 3D cargado correctamente');
}
