import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // 1. ELEMENTOS HTML
    // =====================================================

    const viewer = document.getElementById("charpy-viewer");

    if (!viewer) {
        console.error("No se encontró charpy-viewer");
        return;
    }

    const $ = id => document.getElementById(id);

    const materialSelect = $("charpy-material");
    const temperatureSelect = $("charpy-temperature");

    const massInput = $("charpy-mass");
    const lengthInput = $("charpy-length");
    const angleInput = $("charpy-angle");

    const startButton = $("start-charpy");
    const resetButton = $("reset-charpy");

    const statusText = $("charpy-status");
    const energyText = $("charpy-energy");
    const exitAngleText = $("charpy-exit-angle");
    const specimenStateText = $("charpy-specimen-state");
    const resultMaterialText = $("charpy-result-material");

    const resultPanel = $("charpy-result");
    const resultDescription = $("charpy-result-text");

    // =====================================================
    // 2. MATERIALES
    // =====================================================

    const materials = {

        "1020": {
            name: "AISI 1020",
            energy: 125
        },

        "1045": {
            name: "AISI 1045",
            energy: 75
        },

        "4140": {
            name: "AISI 4140",
            energy: 95
        }

    };

    let selectedSteel = "1020";

    let temperature = 20;

    // =====================================================
    // 3. VARIABLES 3D
    // =====================================================

    let scene;
    let camera;
    let renderer;
    let controls;

    let pendulumPivot;
    let pendulumArm;
    let hammer;

    let specimen;
    let specimenLeft;
    let specimenRight;

    let fractureMesh;

    let supports = [];

    let running = false;
    let impacted = false;

    let elapsed = 0;

    let startAngle = -1.15;
    let endAngle = 0.65;

    let currentAngle = startAngle;

    let pendulumLength = 2.1;
    let pendulumMass = 20;

    let absorbedEnergy = 0;
    let exitAngle = 0;

    const clock = new THREE.Clock();

    // =====================================================
    // 4. ESTILO DE VISOR
    // =====================================================

    viewer.innerHTML = "";

    // =====================================================
    // 5. CREAR ESCENA
    // =====================================================

    function createScene() {

        scene = new THREE.Scene();

        scene.background = new THREE.Color(0x091321);

        scene.fog = new THREE.Fog(0x091321, 9, 25);

        camera = new THREE.PerspectiveCamera(
            45,
            viewer.clientWidth / viewer.clientHeight,
            0.1,
            100
        );

        camera.position.set(3.8, 3.4, 7);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 2)
        );

        renderer.setSize(
            viewer.clientWidth,
            viewer.clientHeight
        );

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        renderer.outputColorSpace = THREE.SRGBColorSpace;

        renderer.toneMapping = THREE.ACESFilmicToneMapping;

        renderer.toneMappingExposure = 1.1;

        viewer.appendChild(renderer.domElement);

        controls = new OrbitControls(
            camera,
            renderer.domElement
        );

        controls.enableDamping = true;
        controls.dampingFactor = 0.06;

        controls.target.set(0, 1.5, 0);

        // ILUMINACIÓN

        scene.add(
            new THREE.HemisphereLight(
                0xc8ddff,
                0x252b36,
                2.2
            )
        );

        const light = new THREE.DirectionalLight(
            0xffffff,
            3.5
        );

        light.position.set(4, 8, 5);
        light.castShadow = true;

        scene.add(light);

        const orangeLight = new THREE.PointLight(
            0xff8c2a,
            25,
            9
        );

        orangeLight.position.set(-2, 3, 2);

        scene.add(orangeLight);

        // PISO

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshStandardMaterial({
                color: 0x111e2d,
                roughness: 0.85
            })
        );

        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;

        floor.receiveShadow = true;

        scene.add(floor);

        // BASE

        const base = new THREE.Mesh(
            new THREE.BoxGeometry(4.5, 0.35, 2.2),
            new THREE.MeshStandardMaterial({
                color: 0x34465b,
                metalness: 0.8,
                roughness: 0.3
            })
        );

        base.position.set(0, 0.35, 0);

        base.castShadow = true;
        base.receiveShadow = true;

        scene.add(base);

        createMachine();

        createPendulum();

        createSupports();

        createSpecimen();

        resetPendulum();

        animate();

    }

    // =====================================================
    // 6. ESTRUCTURA DE LA MÁQUINA
    // =====================================================

    function createMachine() {

        const metal = new THREE.MeshStandardMaterial({
            color: 0x71849a,
            metalness: 0.9,
            roughness: 0.25
        });

        [-1.8, 1.8].forEach(x => {

            const column = new THREE.Mesh(
                new THREE.BoxGeometry(0.25, 3.1, 0.3),
                metal
            );

            column.position.set(x, 1.9, 0);

            column.castShadow = true;

            scene.add(column);

        });

        // Viga superior

        const beam = new THREE.Mesh(
            new THREE.BoxGeometry(4.1, 0.25, 0.45),
            metal
        );

        beam.position.set(0, 3.35, 0);

        beam.castShadow = true;

        scene.add(beam);

        // Eje horizontal

        const axle = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.2,
                0.2,
                1.3,
                32
            ),
            new THREE.MeshStandardMaterial({
                color: 0xb8c5d3,
                metalness: 0.95,
                roughness: 0.2
            })
        );

        axle.rotation.z = Math.PI / 2;

        axle.position.set(-0.45, 3.35, 0);

        scene.add(axle);

    }

    // =====================================================
    // 7. PÉNDULO
    // =====================================================

    function createPendulum() {

        pendulumPivot = new THREE.Group();

        pendulumPivot.position.set(
            -0.45,
            3.35,
            0
        );

        scene.add(pendulumPivot);

        // BRAZO

        pendulumArm = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.07,
                0.1,
                pendulumLength,
                24
            ),
            new THREE.MeshStandardMaterial({
                color: 0xaab7c7,
                metalness: 0.95,
                roughness: 0.2
            })
        );

        pendulumArm.position.y =
            -pendulumLength / 2;

        pendulumArm.castShadow = true;

        pendulumPivot.add(pendulumArm);

        // MARTILLO

        hammer = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.8,
                0.5,
                0.75
            ),
            new THREE.MeshStandardMaterial({
                color: 0xd77b20,
                metalness: 0.9,
                roughness: 0.2
            })
        );

        hammer.position.y =
            -pendulumLength;

        hammer.castShadow = true;

        pendulumPivot.add(hammer);

        // PUNTA DE IMPACTO

        const tip = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.25,
                0.2,
                0.8
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffbd55,
                metalness: 0.85,
                roughness: 0.2
            })
        );

        tip.position.set(
            0.38,
            -pendulumLength,
            0
        );

        pendulumPivot.add(tip);

    }

    // =====================================================
    // 8. APOYOS DE LA PROBETA
    // =====================================================

    function createSupports() {

        const material = new THREE.MeshStandardMaterial({
            color: 0x71849a,
            metalness: 0.85,
            roughness: 0.3
        });

        [-0.65, 0.65].forEach(x => {

            const support = new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.18,
                    0.22,
                    0.65
                ),
                material
            );

            support.position.set(
                0.45 + x,
                0.87,
                0
            );

            support.castShadow = true;

            scene.add(support);

            supports.push(support);

        });

    }

    // =====================================================
    // 9. PROBETA CON ENTALLA
    // =====================================================

    function createSpecimen() {

        specimen = new THREE.Group();

        const steel = new THREE.MeshStandardMaterial({
            color: 0xa8b5c2,
            metalness: 0.85,
            roughness: 0.28
        });

        // CUERPO

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(
                1.8,
                0.25,
                0.35
            ),
            steel
        );

        body.castShadow = true;

        specimen.add(body);

        // ENTALLA V

        const notchMaterial = new THREE.MeshStandardMaterial({
            color: 0x18232e,
            roughness: 0.9
        });

        const notch = new THREE.Mesh(
            new THREE.ConeGeometry(
                0.12,
                0.18,
                3
            ),
            notchMaterial
        );

        notch.rotation.z = Math.PI;

        notch.position.set(
            0,
            -0.1,
            0.18
        );

        specimen.add(notch);

        specimen.position.set(
            0.45,
            1.05,
            0
        );

        scene.add(specimen);

    }

    // =====================================================
    // 10. REINICIO DEL PÉNDULO
    // =====================================================

    function resetPendulum() {

        currentAngle = startAngle;

        pendulumPivot.rotation.z = currentAngle;

    }

    // =====================================================
    // 11. PARÁMETROS DEL ENSAYO
    // =====================================================

    function readParameters() {

        let selected = materialSelect.value;

        if (selected === "selected") {

            selected =
                document.getElementById("selected-steel")
                    ?.textContent.includes("1045") ? "1045" :
                document.getElementById("selected-steel")
                    ?.textContent.includes("4140") ? "4140" : "1020";

        }

        if (!materials[selected]) {
            selected = "1020";
        }

        selectedSteel = selected;

        temperature = Number(temperatureSelect.value);

        pendulumMass = Math.max(
            1,
            Math.min(100, Number(massInput.value) || 20)
        );

        pendulumLength = Math.max(
            0.2,
            Math.min(2, Number(lengthInput.value) || 0.75)
        );

        const angleDegrees = Math.max(
            30,
            Math.min(150, Number(angleInput.value) || 120)
        );

        // Ángulo respecto a la vertical.
        startAngle = -THREE.MathUtils.degToRad(
            angleDegrees - 90
        );

        endAngle = 0.55;

    }

    // =====================================================
    // 12. CÁLCULO DE ENERGÍA
    // =====================================================

    function calculateEnergy() {

        const heightDifference =
            pendulumLength *
            (Math.cos(startAngle) - Math.cos(0));

        const availableEnergy =
            pendulumMass *
            9.81 *
            heightDifference;

        let factor = 1;

        if (temperature <= -40) {
            factor = 0.45;
        } else if (temperature <= -20) {
            factor = 0.60;
        } else if (temperature <= 0) {
            factor = 0.80;
        } else {
            factor = 1;
        }

        const materialEnergy =
            materials[selectedSteel].energy * factor;

        absorbedEnergy = Math.max(
            1,
            Math.min(
                materialEnergy,
                availableEnergy * 0.7
            )
        );

        // Energía restante estimada.
        const remainingEnergy = Math.max(
            0,
            availableEnergy - absorbedEnergy
        );

        // Ángulo de salida calculado a partir de energía restante.
        const cosine = 1 -
            remainingEnergy /
            (pendulumMass * 9.81 * pendulumLength);

        exitAngle = THREE.MathUtils.radToDeg(
            Math.acos(
                THREE.MathUtils.clamp(cosine, -1, 1)
            )
        );

    }

    // =====================================================
    // 13. INICIAR ENSAYO
    // =====================================================

    function startTest() {

        if (running) return;

        readParameters();

        calculateEnergy();

        // Ajustar longitud visual del brazo.
        pendulumArm.scale.y =
            pendulumLength / 2.1;

        hammer.position.y = -pendulumLength;

        running = true;

        impacted = false;

        elapsed = 0;

        resetPendulum();

        statusText.textContent =
            "Péndulo descendiendo...";

        energyText.textContent =
            "Calculando...";

        specimenStateText.textContent =
            "Preparada";

        resultPanel.hidden = true;

        startButton.disabled = true;

        resetButton.disabled = false;

        materialSelect.disabled = true;
        temperatureSelect.disabled = true;

        massInput.disabled = true;
        lengthInput.disabled = true;
        angleInput.disabled = true;

    }

    // =====================================================
    // 14. FRACTURA
    // =====================================================

    function breakSpecimen() {

        if (!specimen) return;

        scene.remove(specimen);

        const material = new THREE.MeshStandardMaterial({
            color: 0xa8b5c2,
            metalness: 0.85,
            roughness: 0.3
        });

        specimenLeft = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.87,
                0.25,
                0.35
            ),
            material
        );

        specimenLeft.position.set(
            0,
            1.05,
            0
        );

        specimenLeft.rotation.z = -0.12;

        scene.add(specimenLeft);

        specimenRight = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.87,
                0.25,
                0.35
            ),
            material
        );

        specimenRight.position.set(
            0.9,
            1.05,
            0
        );

        specimenRight.rotation.z = 0.12;

        scene.add(specimenRight);

        fractureMesh = new THREE.Mesh(
            new THREE.ConeGeometry(
                0.1,
                0.2,
                5
            ),
            new THREE.MeshStandardMaterial({
                color: 0xe8a24a,
                metalness: 0.7
            })
        );

        fractureMesh.position.set(
            0.45,
            1.05,
            0.18
        );

        scene.add(fractureMesh);

        specimenStateText.textContent =
            "Fracturada";

    }

    // =====================================================
    // 15. FINALIZAR ENSAYO
    // =====================================================

    function finishTest() {

        running = false;

        statusText.textContent =
            "Ensayo completado";

        energyText.textContent =
            absorbedEnergy.toFixed(1) + " J";

        exitAngleText.textContent =
            exitAngle.toFixed(1) + " °";

        resultMaterialText.textContent =
            materials[selectedSteel].name;

        specimenStateText.textContent =
            "Fracturada";

        resultPanel.hidden = false;

        resultDescription.textContent =
            "El material " +
            materials[selectedSteel].name +
            " absorbió aproximadamente " +
            absorbedEnergy.toFixed(1) +
            " J a " +
            temperature +
            " °C. Resultado didáctico.";

        startButton.disabled = false;

        materialSelect.disabled = false;
        temperatureSelect.disabled = false;

        massInput.disabled = false;
        lengthInput.disabled = false;
        angleInput.disabled = false;

        startButton.textContent =
            "REPETIR ENSAYO";

        const data = {

            test: "Charpy",

            material: selectedSteel,

            value: absorbedEnergy,

            unit: "J",

            temperature: temperature,

            exitAngle: exitAngle,

            date: new Date().toISOString()

        };

        document.dispatchEvent(
            new CustomEvent("steelTestCompleted", {
                detail: data
            })
        );

        window.registrarResultadoSTEEL?.(data);

    }

    // =====================================================
    // 16. MOVIMIENTO DEL PÉNDULO
    // =====================================================

    function updateTest(delta) {

        if (!running) return;

        elapsed += delta;

        const duration = 3;

        const progress = Math.min(
            elapsed / duration,
            1
        );

        // Movimiento descendente.
        const smooth = progress * progress *
            (3 - 2 * progress);

        currentAngle =
            startAngle +
            (endAngle - startAngle) * smooth;

        pendulumPivot.rotation.z = currentAngle;

        // IMPACTO
        if (progress >= 0.62 && !impacted) {

            impacted = true;

            breakSpecimen();

            statusText.textContent =
                "Impacto realizado";

        }

        // FINAL
        if (progress >= 1) {

            finishTest();

        }

    }

    // =====================================================
    // 17. REINICIAR
    // =====================================================

    function resetTest() {

        running = false;

        impacted = false;

        elapsed = 0;

        absorbedEnergy = 0;

        if (specimen) {
            scene.remove(specimen);
            specimen = null;
        }

        if (specimenLeft) {
            scene.remove(specimenLeft);
            specimenLeft.geometry.dispose();
            specimenLeft = null;
        }

        if (specimenRight) {
            scene.remove(specimenRight);
            specimenRight.geometry.dispose();
            specimenRight = null;
        }

        if (fractureMesh) {
            scene.remove(fractureMesh);
            fractureMesh.geometry.dispose();
            fractureMesh = null;
        }

        createSpecimen();

        resetPendulum();

        statusText.textContent =
            "Sistema preparado para iniciar";

        energyText.textContent = "-- J";

        exitAngleText.textContent = "-- °";

        specimenStateText.textContent =
            "Sin impacto";

        resultMaterialText.textContent =
            materials[selectedSteel].name;

        resultPanel.hidden = true;

        startButton.disabled = false;

        materialSelect.disabled = false;
        temperatureSelect.disabled = false;

        massInput.disabled = false;
        lengthInput.disabled = false;
        angleInput.disabled = false;

        startButton.textContent =
            "LIBERAR PÉNDULO";

    }

    // =====================================================
    // 18. EVENTOS DE BOTONES
    // =====================================================

    startButton.addEventListener(
        "click",
        startTest
    );

    resetButton.addEventListener(
        "click",
        resetTest
    );

    // =====================================================
    // 19. CAMBIO DE MATERIAL
    // =====================================================

    materialSelect.addEventListener(
        "change",
        () => {

            if (materialSelect.value !== "selected") {

                selectedSteel = materialSelect.value;

            }

            resetTest();

        }
    );

    // =====================================================
    // 20. SINCRONIZACIÓN CON EL SELECTOR GENERAL
    // =====================================================

    document.addEventListener(
        "steelChanged",
        event => {

            const material =
                event.detail?.code ||
                event.detail?.steel;

            if (!materials[material]) return;

            if (materialSelect.value === "selected") {

                selectedSteel = material;

                resultMaterialText.textContent =
                    materials[material].name;

                resetTest();

            }

        }
    );

    // =====================================================
    // 21. REDIMENSIONAMIENTO
    // =====================================================

    window.addEventListener("resize", () => {

        if (!renderer || !camera) return;

        const width = viewer.clientWidth;
        const height = viewer.clientHeight;

        if (width <= 0 || height <= 0) return;

        camera.aspect = width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

    });

    // =====================================================
    // 22. ANIMACIÓN
    // =====================================================

    function animate() {

        requestAnimationFrame(animate);

        const delta = Math.min(
            clock.getDelta(),
            0.05
        );

        updateTest(delta);

        controls.update();

        renderer.render(scene, camera);

    }

    // =====================================================
    // 23. INICIALIZAR
    // =====================================================

    try {

        createScene();

        resetTest();

        console.log(
            "STEEL LAB 3D: ensayo Charpy cargado correctamente."
        );

    } catch (error) {

        console.error(
            "Error al cargar el ensayo Charpy:",
            error
        );

        viewer.innerHTML = `
            <div style="
                color:#ff7777;
                padding:25px;
                text-align:center;
            ">
                Error al cargar el péndulo Charpy.
                Revisa la consola del navegador.
            </div>
        `;

    }

});