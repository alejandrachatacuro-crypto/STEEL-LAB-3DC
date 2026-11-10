
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ======================================================
// STEEL LAB 3D
// ENSAYO VIRTUAL DE DUREZA
// Resultados didácticos, no mediciones experimentales.
// ======================================================

const viewer = document.getElementById("hardness-viewer");

if (viewer) {

    viewer.innerHTML = "";

    // ==================================================
    // ESCENA 3D
    // ==================================================

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101923);

    const camera = new THREE.PerspectiveCamera(
        45,
        viewer.clientWidth / Math.max(viewer.clientHeight, 1),
        0.1,
        100
    );

    camera.position.set(4.5, 3.6, 6);

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    viewer.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 1.5, 0);
    controls.maxPolarAngle = Math.PI / 2;

    // ==================================================
    // ILUMINACIÓN
    // ==================================================

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(4, 7, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x2879ff, 35, 10);
    blueLight.position.set(-3, 2, 3);
    scene.add(blueLight);

    // ==================================================
    // MATERIALES
    // ==================================================

    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x526779,
        metalness: 0.85,
        roughness: 0.3
    });

    const darkMetal = new THREE.MeshStandardMaterial({
        color: 0x263746,
        metalness: 0.8,
        roughness: 0.35
    });

    const orangeMaterial = new THREE.MeshStandardMaterial({
        color: 0xff8a25,
        metalness: 0.6,
        roughness: 0.3
    });

    const sampleMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b9aa8,
        metalness: 0.85,
        roughness: 0.25
    });

    // ==================================================
    // FUNCIÓN PARA CREAR PIEZAS
    // ==================================================

    function addBox(name, x, y, z, sx, sy, sz, material) {

        const geometry = new THREE.BoxGeometry(sx, sy, sz);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.name = name;
        mesh.position.set(x, y, z);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add(mesh);

        return mesh;
    }

    // ==================================================
    // ESTRUCTURA DE LA MÁQUINA
    // ==================================================

    addBox("Base", 0, 0.15, 0, 3.5, 0.3, 2.5, darkMetal);

    addBox(
        "Pata izquierda",
        -1.25, 0.65, 0,
        0.25, 0.8, 0.3,
        metalMaterial
    );

    addBox(
        "Pata derecha",
        1.25, 0.65, 0,
        0.25, 0.8, 0.3,
        metalMaterial
    );

    addBox(
        "Columna izquierda",
        -1.25, 2.0, 0,
        0.25, 2.1, 0.35,
        metalMaterial
    );

    addBox(
        "Columna derecha",
        1.25, 2.0, 0,
        0.25, 2.1, 0.35,
        metalMaterial
    );

    addBox(
        "Viga superior",
        0, 3.1, 0,
        2.9, 0.4, 0.65,
        darkMetal
    );

    addBox(
        "Panel frontal",
        0, 2.85, 0.36,
        0.8, 0.22, 0.08,
        orangeMaterial
    );

    // ==================================================
    // PLATAFORMA Y PROBETA
    // ==================================================

    addBox(
        "Plataforma",
        0, 0.62, 0,
        2.0, 0.18, 1.3,
        metalMaterial
    );

    const sample = addBox(
        "Probeta de acero",
        0, 0.98, 0,
        1.45, 0.55, 1.0,
        sampleMaterial
    );

    // ==================================================
    // PORTAINDENTADOR
    // ==================================================

    const INITIAL_POSITION = 2.45;
    const PENETRATION_DISTANCE = 0.25;

    const indenterGroup = new THREE.Group();

    scene.add(indenterGroup);

    indenterGroup.position.set(0, INITIAL_POSITION, 0);

    const holder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.55, 32),
        darkMetal
    );

    holder.position.y = 0.05;
    holder.castShadow = true;

    indenterGroup.add(holder);

    const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.65, 24),
        orangeMaterial
    );

    rod.position.y = -0.48;

    indenterGroup.add(rod);

    let indenter = null;

    // ==================================================
    // HUELLA DE PENETRACIÓN
    // ==================================================

    const mark = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.012, 32),
        new THREE.MeshStandardMaterial({
            color: 0x17212b,
            roughness: 0.8
        })
    );

    mark.position.set(0, 1.26, 0);
    mark.visible = false;

    scene.add(mark);

    // ==================================================
    // CREAR INDENTADORES
    // ==================================================

    function createIndenter(method) {

        if (indenter) {

            indenterGroup.remove(indenter);
            indenter.geometry.dispose();
            indenter.material.dispose();
        }

        if (method === "rockwell") {

            indenter = new THREE.Mesh(
                new THREE.ConeGeometry(0.22, 0.55, 32),
                new THREE.MeshStandardMaterial({
                    color: 0x8ed8ff,
                    metalness: 0.9,
                    roughness: 0.15
                })
            );

            indenter.rotation.x = Math.PI;
            indenter.position.y = -0.72;

        } else if (method === "brinell") {

            indenter = new THREE.Mesh(
                new THREE.SphereGeometry(0.22, 32, 24),
                new THREE.MeshStandardMaterial({
                    color: 0xd7e0e8,
                    metalness: 0.95,
                    roughness: 0.12
                })
            );

            indenter.position.y = -0.73;

        } else {

            indenter = new THREE.Mesh(
                new THREE.ConeGeometry(0.24, 0.48, 4),
                new THREE.MeshStandardMaterial({
                    color: 0xffc36b,
                    metalness: 0.85,
                    roughness: 0.18
                })
            );

            indenter.rotation.x = Math.PI;
            indenter.rotation.y = Math.PI / 4;
            indenter.position.y = -0.71;
        }

        indenter.castShadow = true;

        indenterGroup.add(indenter);
    }

    // ==================================================
    // RESULTADOS DIDÁCTICOS
    // ==================================================

    const demoResults = {

        rockwell: {
            "AISI 1020": "18 HRC",
            "AISI 1045": "24 HRC",
            "AISI 4140": "32 HRC"
        },

        brinell: {
            "AISI 1020": "160 HB",
            "AISI 1045": "220 HB",
            "AISI 4140": "300 HB"
        },

        vickers: {
            "AISI 1020": "170 HV",
            "AISI 1045": "230 HV",
            "AISI 4140": "315 HV"
        }
    };

    // ==================================================
    // ELEMENTOS HTML
    // ==================================================

    const methodSelect = document.getElementById("hardness-method");
    const startButton = document.getElementById("start-hardness");
    const resetButton = document.getElementById("reset-hardness");

    const materialLabel = document.getElementById("hardness-material");
    const indenterLabel = document.getElementById("hardness-indenter");
    const stateLabel = document.getElementById("hardness-state");
    const statusLabel = document.getElementById("hardness-status");

    const resultBox = document.getElementById("hardness-result");
    const resultValue = document.getElementById("hardness-value");

    // ==================================================
    // ESTADO DEL ENSAYO
    // ==================================================

    let running = false;
    let animationFrame = null;
    let startTime = 0;

    const durationDown = 1200;
    const durationHold = 700;
    const durationUp = 1200;

    // ==================================================
    // OBTENER MATERIAL
    // ==================================================

    function getMaterial() {

        const selected = document.getElementById("selected-steel");

        if (selected) {

            const text = selected.textContent.trim();

            if (text.includes("1020")) return "AISI 1020";
            if (text.includes("1045")) return "AISI 1045";
            if (text.includes("4140")) return "AISI 4140";
        }

        return "AISI 1020";
    }

    function updateMaterial() {

        const material = getMaterial();

        if (materialLabel) {
            materialLabel.textContent = material;
        }
    }

    // ==================================================
    // PANEL DE GRÁFICA
    // ==================================================

    const graphPanel = document.createElement("div");

    graphPanel.style.cssText = `
        margin-top:18px;
        padding:18px;
        background:#172431;
        border:1px solid #34495e;
        border-radius:12px;
        color:#ffffff;
        width:100%;
        box-sizing:border-box;
    `;

    graphPanel.innerHTML = `
        <h3 style="margin:0 0 5px 0;color:#ffffff;">
            Curva de carga - penetración
        </h3>

        <p style="margin:0 0 12px 0;color:#aab9c8;font-size:12px;">
            Evolución didáctica de la carga durante el ensayo
        </p>

        <canvas id="hardness-graph"
            style="width:100%;height:240px;display:block;">
        </canvas>

        <div style="
            display:flex;
            justify-content:space-between;
            flex-wrap:wrap;
            gap:10px;
            margin-top:10px;
            font-size:12px;
            color:#c5d3df;
        ">
            <span>Profundidad: <b id="graph-depth">0.000 mm</b></span>
            <span>Carga: <b id="graph-load">0 %</b></span>
        </div>

        <p style="margin:12px 0 0;color:#8296a8;font-size:11px;">
            Gráfica ilustrativa. No representa una curva calibrada de un durómetro.
        </p>
    `;

    viewer.insertAdjacentElement("afterend", graphPanel);

    const graphCanvas = document.getElementById("hardness-graph");
    const graphContext = graphCanvas.getContext("2d");

    const depthLabel = document.getElementById("graph-depth");
    const loadLabel = document.getElementById("graph-load");

    let graphPoints = [];

    // ==================================================
    // TAMAÑO Y DIBUJO DE LA GRÁFICA
    // ==================================================

    function resizeGraph() {

        const width = graphCanvas.clientWidth;
        const height = 240;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);

        if (width === 0) return;

        graphCanvas.width = width * ratio;
        graphCanvas.height = height * ratio;

        graphContext.setTransform(
            ratio, 0, 0, ratio, 0, 0
        );

        drawGraph();
    }

    function drawGraph() {

        const width = graphCanvas.clientWidth;
        const height = 240;

        if (width === 0) return;

        const ctx = graphContext;

        ctx.clearRect(0, 0, width, height);

        const left = 48;
        const right = width - 18;
        const top = 18;
        const bottom = height - 35;

        // Fondo
        ctx.fillStyle = "#172431";
        ctx.fillRect(0, 0, width, height);

        // Cuadrícula y valores
        ctx.strokeStyle = "#34495e";
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {

            const y = bottom - (i / 5) * (bottom - top);

            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.stroke();

            ctx.fillStyle = "#aab9c8";
            ctx.font = "10px Arial";
            ctx.textAlign = "right";

            ctx.fillText((i * 20) + "%", left - 8, y + 4);
        }

        for (let i = 0; i <= 5; i++) {

            const x = left + (i / 5) * (right - left);

            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();

            ctx.fillStyle = "#aab9c8";
            ctx.textAlign = "center";

            ctx.fillText((i * 0.05).toFixed(2), x, bottom + 17);
        }

        // Ejes
        ctx.strokeStyle = "#d4e0ea";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left, bottom);
        ctx.lineTo(right, bottom);
        ctx.stroke();

        // Etiquetas
        ctx.fillStyle = "#ffffff";
        ctx.font = "11px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "Profundidad (mm)",
            (left + right) / 2,
            height - 3
        );

        ctx.save();
        ctx.translate(12, (top + bottom) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("Carga (%)", 0, 0);
        ctx.restore();

        // Curva
        if (graphPoints.length > 0) {

            ctx.beginPath();

            graphPoints.forEach((point, index) => {

                const x =
                    left + (point.depth / PENETRATION_DISTANCE) *
                    (right - left);

                const y =
                    bottom - (point.load / 100) *
                    (bottom - top);

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.strokeStyle = "#ff963b";
            ctx.lineWidth = 3;
            ctx.lineJoin = "round";
            ctx.stroke();

            // Punto actual
            const last = graphPoints[graphPoints.length - 1];

            const px =
                left + (last.depth / PENETRATION_DISTANCE) *
                (right - left);

            const py =
                bottom - (last.load / 100) *
                (bottom - top);

            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);

            ctx.fillStyle = "#ffd166";
            ctx.fill();
        }
    }

    // ==================================================
    // REGISTRO DE PUNTOS
    // ==================================================

    function recordGraph(depth, load) {

        const point = {
            depth: Math.max(
                0,
                Math.min(PENETRATION_DISTANCE, depth)
            ),

            load: Math.max(
                0,
                Math.min(100, load)
            )
        };

        graphPoints.push(point);

        drawGraph();

        depthLabel.textContent =
            point.depth.toFixed(3) + " mm";

        loadLabel.textContent =
            Math.round(point.load) + " %";
    }

    function clearGraph() {

        graphPoints = [];

        depthLabel.textContent = "0.000 mm";
        loadLabel.textContent = "0 %";

        drawGraph();
    }

    resizeGraph();

    window.addEventListener("resize", resizeGraph);

    // ==================================================
    // CAMBIAR MÉTODO
    // ==================================================

    function updateMethod() {

        const method = methodSelect
            ? methodSelect.value
            : "rockwell";

        createIndenter(method);

        const names = {
            rockwell: "Cono de diamante",
            brinell: "Bola de acero",
            vickers: "Pirámide de diamante"
        };

        if (indenterLabel) {
            indenterLabel.textContent = names[method];
        }

        if (stateLabel) {
            stateLabel.textContent = "Listo para iniciar";
        }

        if (statusLabel) {
            statusLabel.textContent =
                "Seleccione el método e inicie el ensayo.";
        }

        if (resultBox) {
            resultBox.style.display = "none";
        }

        mark.visible = false;

        indenterGroup.position.y = INITIAL_POSITION;

        clearGraph();
    }

    // ==================================================
    // MOVIMIENTO SUAVE
    // ==================================================

    function easeInOut(value) {

        return value < 0.5
            ? 2 * value * value
            : 1 - Math.pow(-2 * value + 2, 2) / 2;
    }

    // ==================================================
    // ANIMACIÓN DEL ENSAYO
    // ==================================================

    function animateTest(timestamp) {

        if (!running) return;

        if (!startTime) {
            startTime = timestamp;
        }

        const elapsed = timestamp - startTime;

        let progress;
        let graphDepth = 0;
        let graphLoad = 0;

        // FASE 1: DESCENSO
        if (elapsed <= durationDown) {

            progress = elapsed / durationDown;

            const movement = easeInOut(progress);

            indenterGroup.position.y =
                INITIAL_POSITION -
                PENETRATION_DISTANCE * movement;

            graphDepth = PENETRATION_DISTANCE * movement;
            graphLoad = progress * 100;

            if (stateLabel) {
                stateLabel.textContent = "Aplicando carga...";
            }

            if (statusLabel) {
                statusLabel.textContent =
                    "El penetrador está descendiendo hacia la probeta.";
            }
        }

        // FASE 2: MANTENIMIENTO
        else if (elapsed <= durationDown + durationHold) {

            indenterGroup.position.y =
                INITIAL_POSITION - PENETRATION_DISTANCE;

            graphDepth = PENETRATION_DISTANCE;
            graphLoad = 100;

            if (stateLabel) {
                stateLabel.textContent = "Manteniendo carga...";
            }

            if (statusLabel) {
                statusLabel.textContent =
                    "Se mantiene la carga durante el ensayo.";
            }
        }

        // FASE 3: RETIRADA
        else if (
            elapsed <= durationDown + durationHold + durationUp
        ) {

            progress =
                (elapsed - durationDown - durationHold) /
                durationUp;

            const movement = easeInOut(progress);

            indenterGroup.position.y =
                INITIAL_POSITION -
                PENETRATION_DISTANCE +
                PENETRATION_DISTANCE * movement;

            graphDepth =
                PENETRATION_DISTANCE * (1 - movement);

            graphLoad = 100 * (1 - progress);

            if (stateLabel) {
                stateLabel.textContent = "Retirando penetrador...";
            }

            if (statusLabel) {
                statusLabel.textContent =
                    "El penetrador se está retirando de la superficie.";
            }
        }

        // FASE 4: FINALIZACIÓN
        else {

            finishTest();
            return;
        }

        recordGraph(graphDepth, graphLoad);

        animationFrame = requestAnimationFrame(animateTest);
    }

    // ==================================================
    // INICIAR ENSAYO
    // ==================================================

    function startTest() {

        if (running) return;

        running = true;
        startTime = 0;

        indenterGroup.position.y = INITIAL_POSITION;

        mark.visible = false;

        clearGraph();

        if (resultBox) {
            resultBox.style.display = "none";
        }

        if (startButton) {
            startButton.disabled = true;
            startButton.textContent = "Ensayo en proceso...";
        }

        if (methodSelect) {
            methodSelect.disabled = true;
        }

        if (stateLabel) {
            stateLabel.textContent = "Iniciando...";
        }

        animationFrame = requestAnimationFrame(animateTest);
    }

    // ==================================================
    // FINALIZAR ENSAYO
    // ==================================================

    function finishTest() {

        running = false;

        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        indenterGroup.position.y = INITIAL_POSITION;

        // Punto final de la gráfica
        recordGraph(0, 0);

        const method = methodSelect
            ? methodSelect.value
            : "rockwell";

        const material = getMaterial();

        const result = demoResults[method][material];

        mark.visible = true;

        if (stateLabel) {
            stateLabel.textContent = "Ensayo finalizado";
        }

        if (statusLabel) {
            statusLabel.textContent =
                "Ensayo completado. Resultado demostrativo generado.";
        }

        if (resultValue) {
            resultValue.textContent = result;
        }

        if (resultBox) {
            resultBox.style.display = "block";
        }

        if (startButton) {
            startButton.disabled = false;
            startButton.textContent = "Iniciar ensayo";
        }

        if (methodSelect) {
            methodSelect.disabled = false;
        }
    }

    // ==================================================
    // REINICIAR ENSAYO
    // ==================================================

    function resetTest() {

        running = false;

        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        startTime = 0;

        indenterGroup.position.y = INITIAL_POSITION;

        mark.visible = false;

        clearGraph();

        if (resultBox) {
            resultBox.style.display = "none";
        }

        if (stateLabel) {
            stateLabel.textContent = "Listo para iniciar";
        }

        if (statusLabel) {
            statusLabel.textContent =
                "Seleccione el método e inicie el ensayo.";
        }

        if (startButton) {
            startButton.disabled = false;
            startButton.textContent = "Iniciar ensayo";
        }

        if (methodSelect) {
            methodSelect.disabled = false;
        }
    }

    // ==================================================
    // EVENTOS
    // ==================================================

    if (methodSelect) {
        methodSelect.addEventListener("change", updateMethod);
    }

    if (startButton) {
        startButton.addEventListener("click", startTest);
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetTest);
    }

    // ==================================================
    // INICIALIZACIÓN
    // ==================================================

    updateMaterial();
    updateMethod();

    // ==================================================
    // REDIMENSIONAMIENTO DEL VISOR
    // ==================================================

    function resizeViewer() {

        const width = viewer.clientWidth;
        const height = viewer.clientHeight;

        if (width === 0 || height === 0) return;

        camera.aspect = width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    }

    window.addEventListener("resize", resizeViewer);

    // ==================================================
    // RENDERIZADO CONTINUO
    // ==================================================

    function render() {

        requestAnimationFrame(render);

        controls.update();

        renderer.render(scene, camera);
    }

    render();
}
