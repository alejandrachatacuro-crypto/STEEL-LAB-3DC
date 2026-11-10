
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ======================================================
// STEEL LAB 3D
// VISOR INTERACTIVO DE PROBETAS DE ACERO
// ======================================================

const container = document.getElementById("steel-viewer");

if (!container) {

    console.error("No se encontró el visor 3D.");

} else {

    container.innerHTML = "";

    // ==================================================
    // 1. ESCENA
    // ==================================================

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x101820);

    scene.fog = new THREE.Fog(0x101820, 12, 25);

    // ==================================================
    // 2. CÁMARA
    // ==================================================

    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / Math.max(container.clientHeight, 1),
        0.1,
        100
    );

    camera.position.set(4.5, 3.2, 5.5);

    // ==================================================
    // 3. RENDERIZADOR
    // ==================================================

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // ==================================================
    // 4. CONTROLES DE CÁMARA
    // ==================================================

    const controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;

    controls.dampingFactor = 0.05;

    controls.enablePan = true;

    controls.minDistance = 3;

    controls.maxDistance = 12;

    controls.target.set(0, 0.1, 0);

    controls.autoRotate = true;

    controls.autoRotateSpeed = 0.8;

    // ==================================================
    // 5. ILUMINACIÓN
    // ==================================================

    const ambientLight = new THREE.AmbientLight(
        0xffffff,
        1.1
    );

    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(
        0xffffff,
        3
    );

    mainLight.position.set(4, 7, 5);

    mainLight.castShadow = true;

    mainLight.shadow.mapSize.width = 2048;

    mainLight.shadow.mapSize.height = 2048;

    scene.add(mainLight);

    const blueLight = new THREE.PointLight(
        0x3989c9,
        2,
        12
    );

    blueLight.position.set(-4, 2, -3);

    scene.add(blueLight);

    const orangeLight = new THREE.PointLight(
        0xff8738,
        0.8,
        10
    );

    orangeLight.position.set(3, 1, -4);

    scene.add(orangeLight);

    // ==================================================
    // 6. MATERIALES
    // ==================================================

    const steelMaterial = new THREE.MeshPhysicalMaterial({

        color: 0x9ba8b5,

        metalness: 0.95,

        roughness: 0.22,

        clearcoat: 0.8,

        clearcoatRoughness: 0.2

    });

    const darkMetal = new THREE.MeshStandardMaterial({

        color: 0x172331,

        metalness: 0.85,

        roughness: 0.35

    });

    const supportMaterial = new THREE.MeshStandardMaterial({

        color: 0x34475a,

        metalness: 0.8,

        roughness: 0.4

    });

    const orangeMaterial = new THREE.MeshStandardMaterial({

        color: 0xff8738,

        metalness: 0.65,

        roughness: 0.3,

        emissive: 0x441500,

        emissiveIntensity: 0.3

    });

    // ==================================================
    // 7. GRUPO PRINCIPAL
    // ==================================================

    const laboratory = new THREE.Group();

    scene.add(laboratory);

    // ==================================================
    // 8. BASE INDUSTRIAL
    // ==================================================

    function createBox(
        width,
        height,
        depth,
        material,
        x,
        y,
        z,
        parent
    ) {

        const geometry = new THREE.BoxGeometry(
            width,
            height,
            depth
        );

        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.position.set(x, y, z);

        mesh.castShadow = true;

        mesh.receiveShadow = true;

        parent.add(mesh);

        return mesh;

    }

    const platform = createBox(
        4.6,
        0.2,
        2.5,
        darkMetal,
        0,
        -0.85,
        0,
        laboratory
    );

    // Bordes de la plataforma.

    createBox(
        4.4,
        0.06,
        0.08,
        orangeMaterial,
        0,
        -0.72,
        1.18,
        laboratory
    );

    createBox(
        4.4,
        0.06,
        0.08,
        orangeMaterial,
        0,
        -0.72,
        -1.18,
        laboratory
    );

    // ==================================================
    // 9. SOPORTES DE LA PROBETA
    // ==================================================

    const leftSupport = createBox(
        0.5,
        0.55,
        0.8,
        supportMaterial,
        -1.35,
        -0.48,
        0,
        laboratory
    );

    const rightSupport = createBox(
        0.5,
        0.55,
        0.8,
        supportMaterial,
        1.35,
        -0.48,
        0,
        laboratory
    );

    // Detalles superiores de los soportes.

    createBox(
        0.54,
        0.08,
        0.84,
        darkMetal,
        -1.35,
        -0.18,
        0,
        laboratory
    );

    createBox(
        0.54,
        0.08,
        0.84,
        darkMetal,
        1.35,
        -0.18,
        0,
        laboratory
    );

    // ==================================================
    // 10. GEOMETRÍA DE LA PROBETA
    // ==================================================

    // Perfil longitudinal:
    // extremos gruesos y zona central reducida.

    const profile = [

        new THREE.Vector2(0.32, -1.65),

        new THREE.Vector2(0.36, -1.55),

        new THREE.Vector2(0.36, -1.10),

        new THREE.Vector2(0.34, -0.85),

        new THREE.Vector2(0.28, -0.68),

        new THREE.Vector2(0.22, -0.48),

        new THREE.Vector2(0.20, -0.30),

        new THREE.Vector2(0.20, 0.30),

        new THREE.Vector2(0.22, 0.48),

        new THREE.Vector2(0.28, 0.68),

        new THREE.Vector2(0.34, 0.85),

        new THREE.Vector2(0.36, 1.10),

        new THREE.Vector2(0.36, 1.55),

        new THREE.Vector2(0.32, 1.65)

    ];

    const specimenGeometry = new THREE.LatheGeometry(
        profile,
        80
    );

    const specimen = new THREE.Mesh(
        specimenGeometry,
        steelMaterial
    );

    specimen.rotation.z = Math.PI / 2;

    specimen.position.y = 0.05;

    specimen.castShadow = true;

    specimen.receiveShadow = true;

    laboratory.add(specimen);

    // ==================================================
    // 11. ANILLOS DE IDENTIFICACIÓN
    // ==================================================

    function createRing(x, radius) {

        const geometry = new THREE.TorusGeometry(
            radius,
            0.025,
            12,
            80
        );

        const ring = new THREE.Mesh(
            geometry,
            orangeMaterial
        );

        ring.rotation.y = Math.PI / 2;

        ring.position.set(x, 0.05, 0);

        laboratory.add(ring);

        return ring;

    }

    const rings = [

        createRing(-1.15, 0.355),

        createRing(1.15, 0.355),

        createRing(-0.35, 0.205),

        createRing(0.35, 0.205)

    ];

    // ==================================================
    // 12. DETALLES DE LA BASE
    // ==================================================

    for (let i = 0; i < 4; i++) {

        const x = -1.8 + i * 1.2;

        createBox(
            0.16,
            0.04,
            0.16,
            orangeMaterial,
            x,
            -0.72,
            0.9,
            laboratory
        );

        createBox(
            0.16,
            0.04,
            0.16,
            orangeMaterial,
            x,
            -0.72,
            -0.9,
            laboratory
        );

    }

    // ==================================================
    // 13. PISO Y REJILLA
    // ==================================================

    const floor = new THREE.Mesh(

        new THREE.PlaneGeometry(200, 200),

        new THREE.MeshStandardMaterial({

            color: 0x111b26,

            roughness: 0.85,

            metalness: 0.2

        })

    );

    floor.rotation.x = -Math.PI / 2;

    floor.position.y = -0.98;

    floor.receiveShadow = true;

    scene.add(floor);

    const grid = new THREE.GridHelper(
        30,
        30,
        0x344960,
        0x202f40
    );

    grid.position.y = -0.97;

    scene.add(grid);

    // ==================================================
    // 14. CONFIGURACIÓN DE MATERIALES AISI
    // ==================================================

    const steelTypes = {

        "1020": {

            name: "AISI 1020",

            color: 0xa9b7c5,

            roughness: 0.25

        },

        "1045": {

            name: "AISI 1045",

            color: 0x8799aa,

            roughness: 0.22

        },

        "4140": {

            name: "AISI 4140",

            color: 0x718da8,

            roughness: 0.19

        }

    };

    let selectedSteel = "1020";

    function changeSteel(code) {

        const steel = steelTypes[code];

        if (!steel) return;

        selectedSteel = code;

        steelMaterial.color.setHex(steel.color);

        steelMaterial.roughness = steel.roughness;

        console.log(
            "Material visualizado:",
            steel.name
        );

    }

    // ==================================================
    // 15. DETECTAR SELECCIÓN DE MATERIAL
    // ==================================================

    const materialCards = document.querySelectorAll(
        ".material-card[data-steel]"
    );

    materialCards.forEach(card => {

        card.addEventListener("click", () => {

            const code = card.dataset.steel;

            changeSteel(code);

        });

    });

    // Identificar tarjeta seleccionada al cargar.

    const activeCard = document.querySelector(
        ".material-card.selected[data-steel]"
    );

    if (activeCard) {

        changeSteel(activeCard.dataset.steel);

    } else {

        changeSteel("1020");

    }

    // ==================================================
    // 16. ANIMACIÓN
    // ==================================================

    const clock = new THREE.Clock();

    function animate() {

        requestAnimationFrame(animate);

        const deltaTime = Math.min(
            clock.getDelta(),
            0.05
        );

        // Rotación automática controlada.

        controls.update();

        // Pequeña variación de iluminación.

        orangeLight.intensity =
            0.8 + Math.sin(clock.elapsedTime * 1.5) * 0.12;

        renderer.render(scene, camera);

    }

    animate();

    // ==================================================
    // 17. CAMBIO DE TAMAÑO DE PANTALLA
    // ==================================================

    function resizeViewer() {

        const width = container.clientWidth;

        const height = container.clientHeight;

        if (width === 0 || height === 0) return;

        camera.aspect = width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

    }

    window.addEventListener(
        "resize",
        resizeViewer
    );

    // ==================================================
    // 18. FINALIZACIÓN
    // ==================================================

    console.log(
        "STEEL LAB 3D: visor de probetas cargado correctamente."
    );

}
