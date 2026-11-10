// ============================================================
// STEEL LAB 3D - DIAGRAMAS METALÚRGICOS INTERACTIVOS
// Fe-C / TTT / CCT
// ============================================================

function iniciarDiagramas() {

    // Evitar inicializar dos veces
    if (document.getElementById("steel-diagrams-app")) return;

    const main =
        document.querySelector(".main-content") ||
        document.querySelector("main") ||
        document.body;

    // ========================================================
    // 1. CREAR INTERFAZ
    // ========================================================

    const app = document.createElement("div");

    app.id = "steel-diagrams-app";

    app.innerHTML = `

        <style>

            #steel-diagrams-app {
                width: 100%;
                margin: 35px auto;
                color: #e8eef7;
                font-family: Arial, sans-serif;
            }

            #steel-diagrams-app .diagram-heading {
                margin-bottom: 22px;
            }

            #steel-diagrams-app .diagram-heading h2 {
                color: #ffffff;
                font-size: 25px;
                margin-bottom: 8px;
            }

            #steel-diagrams-app .diagram-heading p {
                color: #9eafc3;
                line-height: 1.6;
            }

            #steel-diagrams-app .diagram-card {
                background: linear-gradient(145deg, #142338, #0c1726);
                border: 1px solid #30445c;
                border-radius: 13px;
                padding: 20px;
                margin-bottom: 25px;
                overflow: hidden;
            }

            #steel-diagrams-app .diagram-card h3 {
                color: #ffad55;
                font-size: 19px;
                margin-bottom: 8px;
            }

            #steel-diagrams-app .diagram-description {
                color: #aabbd0;
                font-size: 13px;
                line-height: 1.6;
                margin-bottom: 15px;
            }

            #steel-diagrams-app canvas {
                display: block;
                width: 100%;
                height: 440px;
                background: #0a1421;
                border: 1px solid #263d56;
                border-radius: 8px;
                cursor: crosshair;
            }

            #steel-diagrams-app .diagram-controls {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 12px;
                margin: 15px 0;
            }

            #steel-diagrams-app button {
                background: #203650;
                color: white;
                border: 1px solid #45617e;
                padding: 10px 17px;
                border-radius: 7px;
                cursor: pointer;
                font-weight: bold;
            }

            #steel-diagrams-app button.active {
                background: #e98628;
                border-color: #ffb15b;
                color: #101820;
            }

            #steel-diagrams-app button:hover {
                filter: brightness(1.2);
            }

            #steel-diagrams-app input {
                accent-color: #ff963c;
                max-width: 220px;
            }

            #steel-diagrams-app .diagram-data {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 15px;
            }

            #steel-diagrams-app .data-box {
                flex: 1;
                min-width: 140px;
                background: #172a40;
                border: 1px solid #304b67;
                border-radius: 8px;
                padding: 12px;
            }

            #steel-diagrams-app .data-box small {
                display: block;
                color: #91a9c3;
                margin-bottom: 6px;
            }

            #steel-diagrams-app .data-box strong {
                color: #ffb15b;
                font-size: 17px;
            }

            #steel-diagrams-app .diagram-note {
                margin-top: 15px;
                color: #91a4ba;
                font-size: 12px;
                line-height: 1.6;
            }

            #steel-diagrams-app .diagram-legend {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin-top: 12px;
                color: #c4d1df;
                font-size: 12px;
            }

            #steel-diagrams-app .legend-item {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            #steel-diagrams-app .legend-color {
                width: 13px;
                height: 13px;
                border-radius: 3px;
            }

            @media(max-width: 650px) {

                #steel-diagrams-app .diagram-card {
                    padding: 12px;
                }

                #steel-diagrams-app canvas {
                    height: 340px;
                }

                #steel-diagrams-app .diagram-heading h2 {
                    font-size: 21px;
                }

            }

        </style>

        <div class="diagram-heading">

            <h2>DIAGRAMAS METALÚRGICOS</h2>

            <p>
                Analiza las transformaciones del acero según su
                composición química, temperatura y velocidad de enfriamiento.
            </p>

        </div>

        <!-- DIAGRAMA FE-C -->

        <div class="diagram-card">

            <h3>01. Diagrama hierro-carbono (Fe-C)</h3>

            <p class="diagram-description">
                Representa las fases y transformaciones de las aleaciones
                hierro-carbono en función de la temperatura y del porcentaje
                de carbono.
            </p>

            <div class="diagram-controls">

                <label>
                    Composición de carbono:
                    <strong id="fe-carbon-value">0.45 %</strong>
                </label>

                <input
                    type="range"
                    id="fe-carbon-slider"
                    min="0"
                    max="6.67"
                    step="0.01"
                    value="0.45"
                >

            </div>

            <canvas id="fe-c-canvas"></canvas>

            <div class="diagram-data">

                <div class="data-box">
                    <small>Composición seleccionada</small>
                    <strong id="fe-carbon-result">0.45 % C</strong>
                </div>

                <div class="data-box">
                    <small>Clasificación</small>
                    <strong id="fe-type-result">Hipoeutectoide</strong>
                </div>

                <div class="data-box">
                    <small>Temperatura eutectoide</small>
                    <strong>727 °C</strong>
                </div>

            </div>

            <div class="diagram-legend">

                <div class="legend-item">
                    <span class="legend-color" style="background:#e9a34d"></span>
                    Austenita
                </div>

                <div class="legend-item">
                    <span class="legend-color" style="background:#4c9bca"></span>
                    Ferrita
                </div>

                <div class="legend-item">
                    <span class="legend-color" style="background:#b76bce"></span>
                    Cementita
                </div>

                <div class="legend-item">
                    <span class="legend-color" style="background:#d1c36b"></span>
                    Perlita
                </div>

            </div>

            <p class="diagram-note">
                Valores característicos aproximados del diagrama metastable
                Fe-Fe3C. La composición seleccionada se indica mediante una
                línea vertical.
            </p>

        </div>

        <!-- DIAGRAMA TTT / CCT -->

        <div class="diagram-card">

            <h3>02. Diagramas de transformación TTT y CCT</h3>

            <p class="diagram-description">
                Estudia cómo cambia la microestructura del acero durante
                el enfriamiento. Selecciona el diagrama para observar
                las curvas de transformación.
            </p>

            <div class="diagram-controls">

                <button
                    id="show-ttt"
                    class="active"
                    type="button"
                >
                    Diagrama TTT
                </button>

                <button
                    id="show-cct"
                    type="button"
                >
                    Diagrama CCT
                </button>

            </div>

            <canvas id="ttt-canvas"></canvas>

            <div class="diagram-data">

                <div class="data-box">
                    <small>Diagrama mostrado</small>
                    <strong id="ttt-type">TTT</strong>
                </div>

                <div class="data-box">
                    <small>Temperatura Ms ilustrativa</small>
                    <strong>220 °C</strong>
                </div>

                <div class="data-box">
                    <small>Transformación principal</small>
                    <strong id="ttt-phase">Perlita / Bainita</strong>
                </div>

            </div>

            <div class="diagram-legend">

                <div class="legend-item">
                    <span class="legend-color" style="background:#4cb5e5"></span>
                    Inicio de transformación
                </div>

                <div class="legend-item">
                    <span class="legend-color" style="background:#e98d45"></span>
                    Fin de transformación
                </div>

                <div class="legend-item">
                    <span class="legend-color" style="background:#db4d60"></span>
                    Martensita
                </div>

            </div>

            <p class="diagram-note" id="ttt-description">
                TTT: muestra la transformación isotérmica de la austenita
                mantenida a temperatura constante.
            </p>

        </div>

    `;

    main.appendChild(app);

    // ========================================================
    // 2. FUNCIONES GENERALES DE CANVAS
    // ========================================================

    function prepareCanvas(canvas) {

        const rect = canvas.getBoundingClientRect();

        const width = Math.max(rect.width, 300);
        const height = Math.max(rect.height, 250);

        const dpr = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        const ctx = canvas.getContext("2d");

        ctx.setTransform(
            dpr, 0, 0, dpr, 0, 0
        );

        return {
            ctx,
            width,
            height
        };

    }

    function drawText(ctx, text, x, y, size = 12, color = "#dce7f3") {

        ctx.fillStyle = color;
        ctx.font = `${size}px Arial`;
        ctx.fillText(text, x, y);

    }

    // ========================================================
    // 3. DIAGRAMA HIERRO-CARBONO
    // ========================================================

    const feCanvas = document.getElementById("fe-c-canvas");

    const carbonSlider = document.getElementById("fe-carbon-slider");

    let carbonSelected = Number(carbonSlider.value);

    let fePointer = null;

    function drawFeC() {

        const {
            ctx,
            width,
            height
        } = prepareCanvas(feCanvas);

        ctx.clearRect(0, 0, width, height);

        const left = 65;
        const right = width - 25;
        const top = 25;
        const bottom = height - 55;

        const plotWidth = right - left;
        const plotHeight = bottom - top;

        function X(c) {
            return left + (c / 6.67) * plotWidth;
        }

        function Y(t) {
            return bottom - (t / 1600) * plotHeight;
        }

        // Fondo

        ctx.fillStyle = "#0b1827";
        ctx.fillRect(left, top, plotWidth, plotHeight);

        // Cuadrícula

        ctx.strokeStyle = "#263b52";
        ctx.lineWidth = 1;

        for (let c = 0; c <= 6; c++) {

            ctx.beginPath();
            ctx.moveTo(X(c), top);
            ctx.lineTo(X(c), bottom);
            ctx.stroke();

            drawText(ctx, c.toString(), X(c) - 3, bottom + 19, 11);

        }

        for (let t = 0; t <= 1600; t += 200) {

            ctx.beginPath();
            ctx.moveTo(left, Y(t));
            ctx.lineTo(right, Y(t));
            ctx.stroke();

            drawText(ctx, t.toString(), 12, Y(t) + 4, 11);

        }

        // Ejes

        ctx.strokeStyle = "#d0dbe7";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left, bottom);
        ctx.lineTo(right, bottom);
        ctx.stroke();

        drawText(
            ctx,
            "Carbono (% en peso)",
            width / 2 - 65,
            height - 12,
            12,
            "#ffffff"
        );

        ctx.save();

        ctx.translate(17, height / 2);
        ctx.rotate(-Math.PI / 2);

        drawText(
            ctx,
            "Temperatura (°C)",
            -65,
            0,
            12,
            "#ffffff"
        );

        ctx.restore();

        // Línea eutectoide A1

        ctx.strokeStyle = "#d8c56d";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(X(0), Y(727));
        ctx.lineTo(X(6.67), Y(727));
        ctx.stroke();

        drawText(
            ctx,
            "727 °C - A1",
            X(5.1),
            Y(727) - 8,
            11,
            "#e9d879"
        );

        // Línea A3

        ctx.strokeStyle = "#53b6e9";
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(X(0), Y(912));
        ctx.quadraticCurveTo(
            X(0.25),
            Y(800),
            X(0.76),
            Y(727)
        );

        ctx.stroke();

        // Línea Acm

        ctx.strokeStyle = "#ce82e1";
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(X(0.76), Y(727));
        ctx.lineTo(X(2.11), Y(1147));
        ctx.stroke();

        // Punto eutectoide

        ctx.fillStyle = "#fff1a3";

        ctx.beginPath();
        ctx.arc(X(0.76), Y(727), 5, 0, Math.PI * 2);
        ctx.fill();

        drawText(
            ctx,
            "0.76 % C",
            X(0.76) + 8,
            Y(727) + 18,
            11,
            "#fff1a3"
        );

        // Punto eutéctico

        ctx.fillStyle = "#ffae5b";

        ctx.beginPath();
        ctx.arc(X(4.3), Y(1147), 5, 0, Math.PI * 2);
        ctx.fill();

        drawText(
            ctx,
            "Eutéctico 4.3 % C",
            X(4.3) + 8,
            Y(1147) - 12,
            11,
            "#ffb66f"
        );

        // Regiones

        drawText(ctx, "Austenita", X(0.9), Y(1100), 13, "#e9a34d");

        drawText(ctx, "Ferrita +", X(0.12), Y(650), 11, "#70c7f2");
        drawText(ctx, "Perlita", X(0.12), Y(620), 11, "#70c7f2");

        drawText(ctx, "Perlita", X(0.9), Y(650), 12, "#e4d47e");

        drawText(ctx, "Austenita", X(2.6), Y(1350), 12, "#e9a34d");

        drawText(ctx, "Líquido", X(4.7), Y(1450), 12, "#ffffff");

        drawText(ctx, "Cementita", X(5.2), Y(650), 11, "#ce82e1");

        drawText(ctx, "Ferrita + cementita", X(2.7), Y(450), 11, "#b8c8da");

        // Composición elegida

        const selectedX = X(carbonSelected);

        ctx.strokeStyle = "#ff8d35";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([7, 5]);

        ctx.beginPath();
        ctx.moveTo(selectedX, top);
        ctx.lineTo(selectedX, bottom);
        ctx.stroke();

        ctx.setLineDash([]);

        ctx.fillStyle = "#ff8d35";

        ctx.beginPath();
        ctx.arc(selectedX, bottom, 5, 0, Math.PI * 2);
        ctx.fill();

        // Lectura del cursor

        if (fePointer) {

            ctx.strokeStyle = "#ffffff";
            ctx.setLineDash([4, 4]);

            ctx.beginPath();
            ctx.moveTo(fePointer.x, top);
            ctx.lineTo(fePointer.x, bottom);
            ctx.stroke();

            ctx.setLineDash([]);

        }

    }

    function updateCarbon() {

        carbonSelected = Number(carbonSlider.value);

        document.getElementById("fe-carbon-value").textContent =
            carbonSelected.toFixed(2) + " %";

        document.getElementById("fe-carbon-result").textContent =
            carbonSelected.toFixed(2) + " % C";

        let classification = "";

        if (carbonSelected < 0.76) {

            classification = "Hipoeutectoide";

        } else if (carbonSelected <= 2.11) {

            classification = "Hipereutectoide";

        } else {

            classification = "Fundición";

        }

        document.getElementById("fe-type-result").textContent =
            classification;

        drawFeC();

    }

    carbonSlider.addEventListener("input", updateCarbon);

    feCanvas.addEventListener("pointermove", event => {

        const rect = feCanvas.getBoundingClientRect();

        fePointer = {
            x: event.clientX - rect.left
        };

        drawFeC();

    });

    feCanvas.addEventListener("pointerleave", () => {

        fePointer = null;

        drawFeC();

    });

    // ========================================================
    // 4. DIAGRAMAS TTT Y CCT
    // ========================================================

    const tttCanvas = document.getElementById("ttt-canvas");

    let diagramMode = "TTT";

    let tttPointer = null;

    function drawTTT() {

        const {
            ctx,
            width,
            height
        } = prepareCanvas(tttCanvas);

        ctx.clearRect(0, 0, width, height);

        const left = 70;
        const right = width - 25;
        const top = 25;
        const bottom = height - 55;

        const plotWidth = right - left;
        const plotHeight = bottom - top;

        const minTime = 0.01;
        const maxTime = 10000;

        function X(time) {

            const value =
                (Math.log10(time) - Math.log10(minTime)) /
                (Math.log10(maxTime) - Math.log10(minTime));

            return left + value * plotWidth;

        }

        function Y(temp) {

            return bottom - (temp / 1000) * plotHeight;

        }

        // Fondo

        ctx.fillStyle = "#0b1827";

        ctx.fillRect(
            left,
            top,
            plotWidth,
            plotHeight
        );

        // Cuadrícula vertical logarítmica

        ctx.strokeStyle = "#293e55";

        const times = [
            0.01, 0.1, 1, 10, 100, 1000, 10000
        ];

        times.forEach(time => {

            ctx.beginPath();
            ctx.moveTo(X(time), top);
            ctx.lineTo(X(time), bottom);
            ctx.stroke();

            drawText(
                ctx,
                time.toString(),
                X(time) - 10,
                bottom + 19,
                10
            );

        });

        // Cuadrícula horizontal

        for (let temp = 100; temp <= 1000; temp += 100) {

            ctx.beginPath();
            ctx.moveTo(left, Y(temp));
            ctx.lineTo(right, Y(temp));
            ctx.stroke();

            drawText(
                ctx,
                temp.toString(),
                28,
                Y(temp) + 4,
                10
            );

        }

        // Ejes

        ctx.strokeStyle = "#d0dbe7";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left, bottom);
        ctx.lineTo(right, bottom);
        ctx.stroke();

        drawText(
            ctx,
            "Tiempo (segundos - escala logarítmica)",
            width / 2 - 130,
            height - 12,
            11,
            "#ffffff"
        );

        ctx.save();

        ctx.translate(17, height / 2);
        ctx.rotate(-Math.PI / 2);

        drawText(
            ctx,
            "Temperatura (°C)",
            -65,
            0,
            12,
            "#ffffff"
        );

        ctx.restore();

        // Curvas TTT o CCT

        if (diagramMode === "TTT") {

            drawText(
                ctx,
                "Transformación isotérmica",
                left + 10,
                top + 17,
                11,
                "#ffffff"
            );

            // INICIO DE TRANSFORMACIÓN

            ctx.strokeStyle = "#4cb5e5";
            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.moveTo(X(0.08), Y(800));

            ctx.bezierCurveTo(
                X(0.15), Y(650),
                X(0.4), Y(570),
                X(1.2), Y(550)
            );

            ctx.bezierCurveTo(
                X(2.0), Y(540),
                X(2.2), Y(650),
                X(5), Y(720)
            );

            ctx.stroke();

            // FIN DE TRANSFORMACIÓN

            ctx.strokeStyle = "#e98d45";
            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.moveTo(X(0.4), Y(800));

            ctx.bezierCurveTo(
                X(0.8), Y(620),
                X(2), Y(490),
                X(8), Y(460)
            );

            ctx.bezierCurveTo(
                X(20), Y(450),
                X(35), Y(620),
                X(100), Y(720)
            );

            ctx.stroke();

            // Región bainítica esquemática

            ctx.fillStyle = "rgba(85, 166, 125, 0.10)";

            ctx.fillRect(
                X(2),
                Y(550),
                X(1000) - X(2),
                Y(250) - Y(550)
            );

            drawText(
                ctx,
                "PERLITA",
                X(0.15),
                Y(500),
                12,
                "#78c9ec"
            );

            drawText(
                ctx,
                "BAINITA",
                X(15),
                Y(350),
                12,
                "#78d6a0"
            );

            drawText(
                ctx,
                "AUSTENITA",
                X(0.03),
                Y(900),
                11,
                "#e9a34d"
            );

        } else {

            drawText(
                ctx,
                "Enfriamiento continuo",
                left + 10,
                top + 17,
                11,
                "#ffffff"
            );

            // Curva de inicio CCT

            ctx.strokeStyle = "#4cb5e5";
            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.moveTo(X(0.1), Y(850));

            ctx.bezierCurveTo(
                X(0.4), Y(700),
                X(1), Y(620),
                X(5), Y(580)
            );

            ctx.bezierCurveTo(
                X(15), Y(540),
                X(30), Y(500),
                X(80), Y(400)
            );

            ctx.stroke();

            // Curva de fin CCT

            ctx.strokeStyle = "#e98d45";
            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.moveTo(X(0.4), Y(850));

            ctx.bezierCurveTo(
                X(1.5), Y(650),
                X(10), Y(540),
                X(40), Y(480)
            );

            ctx.bezierCurveTo(
                X(100), Y(420),
                X(300), Y(350),
                X(800), Y(250)
            );

            ctx.stroke();

            // Velocidades de enfriamiento esquemáticas

            const coolingCurves = [
                {
                    points: [
                        [0.02, 850],
                        [0.2, 700],
                        [1, 450],
                        [5, 200]
                    ],
                    color: "#dc9c51",
                    label: "Rápido"
                },
                {
                    points: [
                        [0.02, 850],
                        [0.5, 750],
                        [5, 550],
                        [100, 250]
                    ],
                    color: "#8c9de2",
                    label: "Intermedio"
                },
                {
                    points: [
                        [0.02, 850],
                        [2, 780],
                        [30, 650],
                        [1000, 300]
                    ],
                    color: "#65c998",
                    label: "Lento"
                }
            ];

            coolingCurves.forEach(curve => {

                ctx.strokeStyle = curve.color;
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);

                ctx.beginPath();

                curve.points.forEach((point, index) => {

                    if (index === 0) {

                        ctx.moveTo(
                            X(point[0]),
                            Y(point[1])
                        );

                    } else {

                        ctx.lineTo(
                            X(point[0]),
                            Y(point[1])
                        );

                    }

                });

                ctx.stroke();

                ctx.setLineDash([]);

                const last =
                    curve.points[curve.points.length - 1];

                drawText(
                    ctx,
                    curve.label,
                    X(last[0]) - 45,
                    Y(last[1]) - 8,
                    10,
                    curve.color
                );

            });

        }

        // Temperaturas martensíticas

        ctx.strokeStyle = "#db4d60";
        ctx.lineWidth = 2;

        ctx.setLineDash([8, 5]);

        ctx.beginPath();
        ctx.moveTo(left, Y(220));
        ctx.lineTo(right, Y(220));
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(left, Y(100));
        ctx.lineTo(right, Y(100));
        ctx.stroke();

        ctx.setLineDash([]);

        drawText(
            ctx,
            "Ms",
            right - 25,
            Y(220) - 7,
            12,
            "#ff7587"
        );

        drawText(
            ctx,
            "Mf",
            right - 25,
            Y(100) - 7,
            12,
            "#ff7587"
        );

        // Cursor interactivo

        if (tttPointer) {

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);

            ctx.beginPath();

            ctx.moveTo(tttPointer.x, top);
            ctx.lineTo(tttPointer.x, bottom);

            ctx.stroke();

            ctx.setLineDash([]);

        }

    }

    // ========================================================
    // 5. CAMBIAR ENTRE TTT Y CCT
    // ========================================================

    const tttButton = document.getElementById("show-ttt");
    const cctButton = document.getElementById("show-cct");

    function setDiagram(mode) {

        diagramMode = mode;

        tttButton.classList.toggle(
            "active",
            mode === "TTT"
        );

        cctButton.classList.toggle(
            "active",
            mode === "CCT"
        );

        document.getElementById("ttt-type").textContent =
            mode;

        if (mode === "TTT") {

            document.getElementById("ttt-phase").textContent =
                "Perlita / Bainita";

            document.getElementById("ttt-description").textContent =
                "TTT: muestra la transformación isotérmica de la austenita mantenida a temperatura constante.";

        } else {

            document.getElementById("ttt-phase").textContent =
                "Depende del enfriamiento";

            document.getElementById("ttt-description").textContent =
                "CCT: muestra las transformaciones durante el enfriamiento continuo. Las curvas punteadas representan velocidades de enfriamiento ilustrativas.";

        }

        drawTTT();

    }

    tttButton.addEventListener(
        "click",
        () => setDiagram("TTT")
    );

    cctButton.addEventListener(
        "click",
        () => setDiagram("CCT")
    );

    tttCanvas.addEventListener("pointermove", event => {

        const rect = tttCanvas.getBoundingClientRect();

        tttPointer = {
            x: event.clientX - rect.left
        };

        drawTTT();

    });

    tttCanvas.addEventListener("pointerleave", () => {

        tttPointer = null;

        drawTTT();

    });

    // ========================================================
    // 6. ACTUALIZAR AL CAMBIAR TAMAÑO
    // ========================================================

    let resizeTimer;

    window.addEventListener("resize", () => {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {

            drawFeC();
            drawTTT();

        }, 150);

    });

    // ========================================================
    // 7. INICIALIZACIÓN
    // ========================================================

    updateCarbon();

    setDiagram("TTT");

    console.log(
        "STEEL LAB 3D: diagramas Fe-C, TTT y CCT cargados."
    );

}


// ============================================================
// EJECUTAR CUANDO EL DOCUMENTO ESTÉ DISPONIBLE
// ============================================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarDiagramas,
        { once: true }
    );

} else {

    iniciarDiagramas();

}