import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ======================================================
// STEEL LAB 3D - SISTEMA DE TRATAMIENTO TÉRMICO
// Simulación didáctica de calentamiento, mantenimiento
// y enfriamiento de aceros AISI 1020, 1045 y 4140.
// Conexión automática con el microscopio metalográfico.
// ======================================================

function iniciarHorno() {

    const container = document.getElementById("furnace-viewer");

    if (!container) {
        console.error("No se encontró el visor del horno.");
        return;
    }

    // ==================================================
    // 1. CONFIGURACIÓN DE LA ESCENA 3D
    // ==================================================

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x101820);

    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / Math.max(container.clientHeight, 1),
        0.1,
        100
    );

    camera.position.set(7, 5, 9);

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.shadowMap.enabled = true;

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.innerHTML = "";

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;

    controls.dampingFactor = 0.05;

    controls.target.set(0, 1.5, 0);

    controls.minDistance = 5;

    controls.maxDistance = 18;

    // ==================================================
    // 2. ILUMINACIÓN
    // ==================================================

    scene.add(
        new THREE.AmbientLight(0xffffff, 1.2)
    );

    const mainLight = new THREE.DirectionalLight(
        0xffffff,
        2
    );

    mainLight.position.set(5, 8, 6);

    mainLight.castShadow = true;

    scene.add(mainLight);

    const furnaceLight = new THREE.PointLight(
        0xff5a16,
        0,
        15
    );

    furnaceLight.position.set(0, 2, 0);

    scene.add(furnaceLight);

    // ==================================================
    // 3. MATERIALES
    // ==================================================

    const metal = new THREE.MeshStandardMaterial({

        color: 0x394653,

        metalness: 0.85,

        roughness: 0.3

    });

    const darkMetal = new THREE.MeshStandardMaterial({

        color: 0x151c23,

        metalness: 0.7,

        roughness: 0.45

    });

    const refractory = new THREE.MeshStandardMaterial({

        color: 0x77716a,

        roughness: 0.9

    });

    const hotMaterial = new THREE.MeshStandardMaterial({

        color: 0xff4a0b,

        emissive: 0xff2600,

        emissiveIntensity: 0.2,

        roughness: 0.6

    });

    // ==================================================
    // 4. FUNCIÓN PARA CREAR PIEZAS
    // ==================================================

    function createBox(w, h, d, material, x, y, z) {

        const geometry = new THREE.BoxGeometry(w, h, d);

        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.position.set(x, y, z);

        mesh.castShadow = true;

        mesh.receiveShadow = true;

        scene.add(mesh);

        return mesh;

    }

    // ==================================================
    // 5. CUERPO DEL HORNO INDUSTRIAL
    // ==================================================

    createBox(
        5.5, 0.4, 4.5,
        darkMetal,
        0, 0.2, 0
    );

    createBox(
        5, 3.5, 4,
        metal,
        0, 2.15, 0
    );

    createBox(
        3.8, 2.5, 0.12,
        darkMetal,
        0, 2.1, 2.02
    );

    createBox(
        0.3, 2.7, 3.5,
        refractory,
        -2.1, 2.1, 0
    );

    createBox(
        0.3, 2.7, 3.5,
        refractory,
        2.1, 2.1, 0
    );

    createBox(
        4.2, 0.2, 3.5,
        refractory,
        0, 3.55, 0
    );

    createBox(
        4, 0.2, 3.5,
        refractory,
        0, 0.85, 0
    );

    // ==================================================
    // 6. RESISTENCIAS DEL HORNO
    // ==================================================

    const resistances = [];

    for (let i = 0; i < 3; i++) {

        const resistance = new THREE.Mesh(

            new THREE.TorusGeometry(
                0.65,
                0.045,
                8,
                60
            ),

            hotMaterial

        );

        resistance.rotation.y = Math.PI / 2;

        resistance.position.set(
            -1.65 + i * 1.65,
            2.1,
            1.65
        );

        scene.add(resistance);

        resistances.push(resistance);

    }

    // ==================================================
    // 7. PUERTA DEL HORNO
    // ==================================================

    const door = createBox(
        4.3, 3, 0.3,
        metal,
        0, 2.1, 2.45
    );

    const doorHandle = createBox(
        0.12, 0.7, 0.15,
        darkMetal,
        1.75, 2.1, 2.65
    );

    createBox(
        0.15, 0.5, 0.35,
        darkMetal,
        -2.2, 3.1, 2.4
    );

    createBox(
        0.15, 0.5, 0.35,
        darkMetal,
        -2.2, 1.1, 2.4
    );

    // ==================================================
    // 8. PROBETA DE ACERO
    // ==================================================

    const specimenMaterial = new THREE.MeshStandardMaterial({

        color: 0x8999a8,

        metalness: 0.9,

        roughness: 0.25,

        emissive: 0x000000

    });

    const specimen = new THREE.Mesh(

        new THREE.CylinderGeometry(
            0.16,
            0.16,
            2.2,
            32
        ),

        specimenMaterial

    );

    specimen.rotation.z = Math.PI / 2;

    specimen.position.set(0, 1.3, 0);

    specimen.castShadow = true;

    scene.add(specimen);

    createBox(
        2.8, 0.12, 0.5,
        darkMetal,
        0, 1.05, 0
    );

    // ==================================================
    // 9. PISO
    // ==================================================

    const floor = new THREE.Mesh(

        new THREE.PlaneGeometry(200, 200),

        new THREE.MeshStandardMaterial({

            color: 0x202a33,

            roughness: 0.9

        })

    );

    floor.rotation.x = -Math.PI / 2;

    floor.position.y = -0.02;

    scene.add(floor);

    // ==================================================
    // 10. VARIABLES DEL PROCESO
    // ==================================================

    const clock = new THREE.Clock();

    const AMBIENT_TEMPERATURE = 25;

    let temperature = AMBIENT_TEMPERATURE;

    let targetTemperature = 800;

    let heatingSpeed = 1;

    let holdDuration = 10;

    let holdingTime = 0;

    let elapsedTime = 0;

    let heating = false;

    let doorOpen = false;

    let phase = "idle";

    let processCancelled = false;

    let initialTemperature = AMBIENT_TEMPERATURE;

    let estimatedTotalTime = 1;

    let coolingRate = 60;

    let selectedMaterial = "1045";

    let completedTreatment = null;

    const coolingRates = {

        slow: 25,

        air: 60,

        fast: 180

    };

    const baseHeatingRate = 75;

    // ==================================================
    // 11. ELEMENTOS HTML
    // ==================================================

    const temperatureDisplay =
        document.getElementById("furnace-temperature");

    const stateDisplay =
        document.getElementById("furnace-state");

    const startButton =
        document.getElementById("start-furnace");

    const stopButton =
        document.getElementById("stop-furnace");

    const doorButton =
        document.getElementById("furnace-door");

    const targetSelect =
        document.getElementById("target-temperature");

    const speedSelect =
        document.getElementById("heating-speed");

    const progressBar =
        document.getElementById("furnace-progress");

    const progressText =
        document.getElementById("furnace-progress-text");

    const statusText =
        document.getElementById("furnace-status");

    const treatmentSelect =
        document.getElementById("heat-treatment");

    const treatmentDescription =
        document.getElementById("treatment-description");

    const treatmentStage =
        document.getElementById("treatment-stage");

    const holdSelect =
        document.getElementById("hold-time");

    const coolingSelect =
        document.getElementById("cooling-method");

    const processTimeDisplay =
        document.getElementById("process-time");

    const processProgress =
        document.getElementById("process-progress");

    const processProgressText =
        document.getElementById("process-progress-text");

    // ==================================================
    // 12. TIPOS DE TRATAMIENTO TÉRMICO
    // ==================================================

    const treatments = {

        recocido: {

            name: "Recocido",

            temperature: 800,

            cooling: "slow",

            description:
                "El acero se calienta hasta una temperatura adecuada, se mantiene y posteriormente se enfría lentamente. Busca reducir la dureza, aliviar tensiones internas y mejorar la ductilidad."

        },

        normalizado: {

            name: "Normalizado",

            temperature: 850,

            cooling: "air",

            description:
                "El acero se calienta hasta una temperatura adecuada, se mantiene y después se enfría al aire. Busca obtener una estructura más uniforme y refinar el tamaño de grano."

        },

        temple: {

            name: "Temple",

            temperature: 850,

            cooling: "fast",

            description:
                "El acero se calienta hasta una temperatura adecuada, se mantiene y después se enfría rápidamente. Este proceso favorece la formación de martensita y el aumento de dureza."

        },

        revenido: {

            name: "Revenido",

            temperature: 500,

            cooling: "air",

            description:
                "El acero previamente templado se recalienta por debajo de la temperatura crítica, se mantiene durante un tiempo y luego se enfría. Busca reducir fragilidad y ajustar las propiedades mecánicas."

        }

    };

    // ==================================================
    // 13. MATERIAL SELECCIONADO
    // ==================================================

    document.addEventListener("steelChanged", function (event) {

        if (!event.detail) return;

        selectedMaterial = String(
            event.detail.code || "1045"
        );

        console.log(
            "Horno: material seleccionado AISI " + selectedMaterial
        );

    });

    // ==================================================
    // 14. COMPLETAR OPCIONES DE TEMPERATURA
    // ==================================================

    function addTemperatureOption(value) {

        if (!targetSelect) return;

        const exists = Array.from(targetSelect.options).some(

            option => Number(option.value) === value

        );

        if (!exists) {

            const option = document.createElement("option");

            option.value = value;

            option.textContent = value + " °C";

            targetSelect.appendChild(option);

        }

    }

    [500, 800, 850].forEach(addTemperatureOption);

    // ==================================================
    // 15. FUNCIONES AUXILIARES
    // ==================================================

    function isRunning() {

        return (

            phase === "heating" ||

            phase === "holding" ||

            phase === "cooling" ||

            phase === "cancelCooling"

        );

    }

    function formatTime(seconds) {

        const totalSeconds = Math.floor(seconds);

        const minutes = Math.floor(totalSeconds / 60);

        const remainingSeconds = totalSeconds % 60;

        return (

            String(minutes).padStart(2, "0") +

            ":" +

            String(remainingSeconds).padStart(2, "0")

        );

    }

    function getCoolingMethod() {

        const selected = coolingSelect

            ? coolingSelect.value

            : "auto";

        if (selected === "auto") {

            const treatment = treatmentSelect

                ? treatments[treatmentSelect.value]

                : null;

            return treatment
                ? treatment.cooling
                : "air";

        }

        return selected;

    }

    function getCoolingRate() {

        const method = getCoolingMethod();

        return coolingRates[method] || coolingRates.air;

    }

    function updateStatus(message) {

        if (statusText) {

            statusText.textContent = message;

        }

    }

    function updateStage(message) {

        if (treatmentStage) {

            treatmentStage.textContent = message;

        }

    }

    // ==================================================
    // 16. ACTUALIZACIÓN DE INDICADORES
    // ==================================================

    function updateDisplay() {

        if (temperatureDisplay) {

            temperatureDisplay.textContent =
                Math.round(temperature) + " °C";

        }

        if (stateDisplay) {

            const states = {

                idle: "EN ESPERA",

                heating: "CALENTANDO",

                holding: "MANTENIENDO TEMPERATURA",

                cooling: "ENFRIANDO",

                cancelCooling: "ENFRIAMIENTO CANCELADO",

                completed: "TRATAMIENTO FINALIZADO",

                cancelled: "PROCESO CANCELADO"

            };

            stateDisplay.textContent =
                states[phase] || "EN ESPERA";

        }

        const heatingProgress = Math.max(

            0,

            Math.min(

                100,

                (

                    (temperature - initialTemperature) /

                    Math.max(
                        targetTemperature - initialTemperature,
                        1
                    )

                ) * 100

            )

        );

        if (progressBar) {

            progressBar.style.width =
                heatingProgress + "%";

        }

        if (progressText) {

            progressText.textContent =
                Math.round(heatingProgress) + " %";

        }

        let totalProgress = 0;

        if (phase === "completed") {

            totalProgress = 100;

        } else if (estimatedTotalTime > 0) {

            totalProgress = Math.min(

                99,

                (elapsedTime / estimatedTotalTime) * 100

            );

        }

        if (processProgress) {

            processProgress.style.width =
                totalProgress + "%";

        }

        if (processProgressText) {

            processProgressText.textContent =
                Math.round(totalProgress) + " %";

        }

        if (processTimeDisplay) {

            processTimeDisplay.textContent =
                formatTime(elapsedTime);

        }

    }

    // ==================================================
    // 17. SELECCIÓN DEL TRATAMIENTO
    // ==================================================

    function updateTreatment() {

        if (!treatmentSelect) return;

        if (isRunning()) {

            updateStatus(
                "No puedes cambiar el tratamiento mientras el ciclo está en ejecución."
            );

            return;

        }

        const treatment = treatments[treatmentSelect.value];

        if (!treatment) return;

        if (treatmentDescription) {

            treatmentDescription.textContent =
                treatment.description;

        }

        if (targetSelect) {

            targetSelect.value =
                String(treatment.temperature);

            targetTemperature =
                treatment.temperature;

        }

        if (coolingSelect && coolingSelect.value === "auto") {

            updateStatus(

                "Tratamiento seleccionado: " +

                treatment.name +

                ". Enfriamiento automático: " +

                treatment.cooling +

                "."

            );

        } else {

            updateStatus(

                "Tratamiento seleccionado: " +

                treatment.name +

                ". Puedes configurar el enfriamiento."

            );

        }

        updateStage(
            "Preparado para iniciar: " + treatment.name
        );

        updateDisplay();

    }

    if (treatmentSelect) {

        treatmentSelect.addEventListener(
            "change",
            updateTreatment
        );

    }

    // ==================================================
    // 18. CAMBIO DE TEMPERATURA OBJETIVO
    // ==================================================

    if (targetSelect) {

        targetSelect.addEventListener("change", () => {

            if (isRunning()) {

                targetSelect.value =
                    String(targetTemperature);

                updateStatus(
                    "No puedes modificar la temperatura objetivo durante el proceso."
                );

                return;

            }

            targetTemperature =
                Number(targetSelect.value);

            updateStage(

                "Preparado para alcanzar " +

                targetTemperature +

                " °C"

            );

            updateStatus(

                "Nueva temperatura objetivo: " +

                targetTemperature +

                " °C."

            );

            updateDisplay();

        });

        targetTemperature =
            Number(targetSelect.value) || 800;

    }

    // ==================================================
    // 19. VELOCIDAD DE CALENTAMIENTO
    // ==================================================

    if (speedSelect) {

        speedSelect.addEventListener("change", () => {

            heatingSpeed =
                Number(speedSelect.value) || 1;

            updateStatus(
                "Velocidad de calentamiento actualizada."
            );

        });

        heatingSpeed =
            Number(speedSelect.value) || 1;

    }

    // ==================================================
    // 20. TIEMPO DE MANTENIMIENTO
    // ==================================================

    if (holdSelect) {

        holdSelect.addEventListener("change", () => {

            if (isRunning()) {

                updateStatus(
                    "El tiempo de mantenimiento no se puede cambiar durante el ciclo."
                );

                return;

            }

            holdDuration =
                Number(holdSelect.value) || 10;

            updateStatus(

                "Tiempo de mantenimiento configurado: " +

                holdDuration +

                " segundos."

            );

        });

        holdDuration =
            Number(holdSelect.value) || 10;

    }

    // ==================================================
    // 21. MÉTODO DE ENFRIAMIENTO
    // ==================================================

    if (coolingSelect) {

        coolingSelect.addEventListener("change", () => {

            if (isRunning()) {

                updateStatus(
                    "El método de enfriamiento no se puede cambiar durante el ciclo."
                );

                return;

            }

            const method = getCoolingMethod();

            updateStatus(

                "Método de enfriamiento seleccionado: " +

                method +

                "."

            );

        });

    }

    // ==================================================
    // 22. CÁLCULO DEL TIEMPO ESTIMADO
    // ==================================================

    function calculateEstimatedTime() {

        const heatingTime =

            Math.max(
                0,
                targetTemperature - temperature
            ) /

            Math.max(
                baseHeatingRate * heatingSpeed,
                1
            );

        const holdingTime = holdDuration;

        const coolingTime =

            Math.max(
                0,
                targetTemperature - AMBIENT_TEMPERATURE
            ) /

            Math.max(
                getCoolingRate(),
                1
            );

        estimatedTotalTime =

            heatingTime +

            holdingTime +

            coolingTime;

        estimatedTotalTime = Math.max(
            estimatedTotalTime,
            1
        );

    }

    // ==================================================
    // 23. INICIAR CICLO COMPLETO
    // ==================================================

    function startProcess() {

        if (isRunning()) {

            updateStatus(
                "Ya existe un tratamiento térmico en ejecución."
            );

            return;

        }

        if (temperature > AMBIENT_TEMPERATURE + 1) {

            updateStatus(
                "Espera a que el horno alcance la temperatura ambiente antes de iniciar otro ciclo."
            );

            return;

        }

        if (targetTemperature <= AMBIENT_TEMPERATURE) {

            updateStatus(
                "Selecciona una temperatura objetivo mayor a 25 °C."
            );

            return;

        }

        completedTreatment = null;

        temperature = AMBIENT_TEMPERATURE;

        initialTemperature = temperature;

        heatingSpeed = speedSelect

            ? Number(speedSelect.value) || 1

            : 1;

        holdDuration = holdSelect

            ? Number(holdSelect.value) || 10

            : 10;

        holdingTime = 0;

        elapsedTime = 0;

        processCancelled = false;

        coolingRate = getCoolingRate();

        calculateEstimatedTime();

        phase = "heating";

        heating = true;

        doorOpen = false;

        if (doorButton) {

            doorButton.textContent = "ABRIR PUERTA";

        }

        updateStage(
            "ETAPA 1: CALENTAMIENTO DEL ACERO"
        );

        updateStatus(

            "Calentamiento iniciado. Temperatura objetivo: " +

            targetTemperature +

            " °C."

        );

        updateDisplay();

    }

    if (startButton) {

        startButton.addEventListener(
            "click",
            startProcess
        );

    }

    // ==================================================
    // 24. DETENER PROCESO
    // ==================================================

    function stopProcess() {

        if (!isRunning()) {

            updateStatus(
                "No existe un proceso activo para detener."
            );

            return;

        }

        processCancelled = true;

        heating = false;

        phase = "cancelCooling";

        coolingRate = coolingRates.fast;

        updateStage(
            "PROCESO INTERRUMPIDO: ENFRIAMIENTO DE SEGURIDAD"
        );

        updateStatus(
            "El proceso fue detenido. La probeta se enfriará hasta la temperatura ambiente."
        );

        updateDisplay();

    }

    if (stopButton) {

        stopButton.addEventListener(
            "click",
            stopProcess
        );

    }

    // ==================================================
    // 25. ABRIR Y CERRAR PUERTA
    // ==================================================

    if (doorButton) {

        doorButton.addEventListener("click", () => {

            if (isRunning()) {

                updateStatus(
                    "No se puede abrir la puerta mientras el tratamiento está en ejecución."
                );

                return;

            }

            doorOpen = !doorOpen;

            doorButton.textContent = doorOpen

                ? "CERRAR PUERTA"

                : "ABRIR PUERTA";

            updateStatus(

                doorOpen

                    ? "Puerta del horno abierta."

                    : "Puerta del horno cerrada."

            );

        });

    }

    // ==================================================
    // 26. TRANSICIONES ENTRE ETAPAS
    // ==================================================

    function startHoldingPhase() {

        phase = "holding";

        heating = false;

        temperature = targetTemperature;

        holdingTime = 0;

        updateStage(
            "ETAPA 2: MANTENIMIENTO DE TEMPERATURA"
        );

        updateStatus(

            "Temperatura objetivo alcanzada. Manteniendo " +

            targetTemperature +

            " °C durante " +

            holdDuration +

            " segundos."

        );

    }

    function startCoolingPhase() {

        phase = "cooling";

        coolingRate = getCoolingRate();

        updateStage(
            "ETAPA 3: ENFRIAMIENTO DEL ACERO"
        );

        updateStatus(

            "Mantenimiento terminado. Iniciando enfriamiento mediante: " +

            getCoolingMethod() +

            "."

        );

    }

    // ==================================================
    // 27. ENVIAR RESULTADO AL MICROSCOPIO
    // ==================================================

    function enviarResultadoMicroscopio() {

        const tratamiento = treatmentSelect

            ? treatmentSelect.value

            : "recocido";

        const datos = {

            material: selectedMaterial,

            tratamiento: tratamiento,

            temperatura: targetTemperature,

            enfriamiento: getCoolingMethod(),

            tiempoMantenimiento: holdDuration,

            tiempoProceso: elapsedTime,

            estado: "completado"

        };

        completedTreatment = datos;

        document.dispatchEvent(

            new CustomEvent(
                "thermalTreatmentCompleted",
                {
                    detail: datos
                }
            )

        );

        console.log(
            "Resultado enviado al microscopio:",
            datos
        );

    }

    // ==================================================
    // 28. FINALIZAR PROCESO
    // ==================================================

    function completeProcess() {

        temperature = AMBIENT_TEMPERATURE;

        heating = false;

        phase = processCancelled

            ? "cancelled"

            : "completed";

        updateDisplay();

        if (processCancelled) {

            updateStage(
                "PROCESO CANCELADO"
            );

            updateStatus(

                "Enfriamiento de seguridad finalizado. " +

                "El horno alcanzó la temperatura ambiente. " +

                "El tratamiento no se considera completado."

            );

            completedTreatment = null;

        } else {

            updateStage(
                "TRATAMIENTO TÉRMICO FINALIZADO"
            );

            updateStatus(

                "¡Tratamiento térmico completado! " +

                "La probeta alcanzó el ciclo de calentamiento, mantenimiento y enfriamiento. " +

                "Actualizando microscopio."

            );

            enviarResultadoMicroscopio();

        }

    }

    // ==================================================
    // 29. ACTUALIZACIÓN DEL PROCESO TÉRMICO
    // ==================================================

    function updateThermalProcess(deltaTime) {

        if (!isRunning()) return;

        elapsedTime += deltaTime;

        // ETAPA 1: CALENTAMIENTO.

        if (phase === "heating") {

            const heatingRate =
                baseHeatingRate * heatingSpeed;

            temperature += heatingRate * deltaTime;

            if (temperature >= targetTemperature) {

                temperature = targetTemperature;

                startHoldingPhase();

            }

        }

        // ETAPA 2: MANTENIMIENTO.

        else if (phase === "holding") {

            temperature = targetTemperature;

            holdingTime += deltaTime;

            if (holdingTime >= holdDuration) {

                startCoolingPhase();

            }

        }

        // ETAPA 3: ENFRIAMIENTO NORMAL.

        else if (phase === "cooling") {

            temperature -= coolingRate * deltaTime;

            if (temperature <= AMBIENT_TEMPERATURE) {

                completeProcess();

            }

        }

        // ENFRIAMIENTO DE SEGURIDAD.

        else if (phase === "cancelCooling") {

            temperature -= coolingRate * deltaTime;

            if (temperature <= AMBIENT_TEMPERATURE) {

                completeProcess();

            }

        }

        temperature = Math.max(

            AMBIENT_TEMPERATURE,

            Math.min(
                targetTemperature,
                temperature
            )

        );

    }

    // ==================================================
    // 30. EFECTOS VISUALES DEL CALOR
    // ==================================================

    function updateHeatEffects(deltaTime) {

        const heat = Math.max(

            0,

            Math.min(

                1,

                (temperature - AMBIENT_TEMPERATURE) / 875

            )

        );

        furnaceLight.intensity = heat * 4;

        hotMaterial.emissiveIntensity =
            0.1 + heat * 2;

        resistances.forEach((item, index) => {

            item.rotation.x +=
                deltaTime * (index + 1) * 0.5;

        });

        specimenMaterial.color.setRGB(

            0.5 + heat * 0.5,

            0.6 - heat * 0.45,

            0.7 - heat * 0.6

        );

        specimenMaterial.emissive.setRGB(

            heat * 0.5,

            heat * 0.08,

            0

        );

        const targetDoorPosition = doorOpen

            ? -4.5

            : 0;

        door.position.x +=

            (targetDoorPosition - door.position.x) *

            Math.min(1, deltaTime * 6);

        doorHandle.position.x +=

            (targetDoorPosition - doorHandle.position.x) *

            Math.min(1, deltaTime * 6);

    }

    // ==================================================
    // 31. ANIMACIÓN PRINCIPAL
    // ==================================================

    function animate() {

        requestAnimationFrame(animate);

        const deltaTime = Math.min(

            clock.getDelta(),

            0.05

        );

        updateThermalProcess(deltaTime);

        updateHeatEffects(deltaTime);

        controls.update();

        updateDisplay();

        renderer.render(scene, camera);

    }

    // ==================================================
    // 32. INICIALIZACIÓN
    // ==================================================

    if (treatmentSelect) {

        updateTreatment();

    }

    if (doorButton) {

        doorButton.textContent = "ABRIR PUERTA";

    }

    if (processTimeDisplay) {

        processTimeDisplay.textContent = "00:00";

    }

    updateDisplay();

    animate();

    // ==================================================
    // 33. ADAPTACIÓN A CAMBIOS DE TAMAÑO
    // ==================================================

    window.addEventListener("resize", () => {

        const width = container.clientWidth;

        const height = container.clientHeight;

        if (width === 0 || height === 0) return;

        camera.aspect = width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

        renderer.setPixelRatio(

            Math.min(window.devicePixelRatio || 1, 2)

        );

    });

    console.log(
        "Sistema de tratamiento térmico y conexión con microscopio cargados."
    );

}

// ======================================================
// INICIALIZAR CUANDO EL DOCUMENTO ESTÉ DISPONIBLE
// ======================================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarHorno,
        { once: true }
    );

} else {

    iniciarHorno();

}