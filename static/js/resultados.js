document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // CONFIGURACIÓN
    // =====================================================

    const STORAGE_KEY = "steel_lab_resultados";

    let results = [];

    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            results = JSON.parse(saved);
        }

        if (!Array.isArray(results)) {
            results = [];
        }

    } catch (error) {
        console.warn("No se pudieron recuperar los resultados.");
        results = [];
    }

    // =====================================================
    // ESTILOS
    // =====================================================

    const style = document.createElement("style");

    style.textContent = `

        .steel-results-panel {
            background: #101c2b;
            border: 1px solid #263d55;
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
            color: #e8f0fa;
        }

        .steel-results-panel h3 {
            color: #ffad42;
            margin-top: 20px;
        }

        .steel-results-panel h3:first-child {
            margin-top: 0;
        }

        .steel-results-summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin: 18px 0;
        }

        .steel-summary-card {
            background: #091321;
            border: 1px solid #263d55;
            border-radius: 9px;
            padding: 15px;
        }

        .steel-summary-card span {
            color: #9fb0c4;
            font-size: 13px;
        }

        .steel-summary-card strong {
            display: block;
            color: #ffb34d;
            font-size: 23px;
            margin-top: 8px;
        }

        .steel-results-table-container {
            overflow-x: auto;
        }

        .steel-results-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 850px;
            margin-top: 15px;
        }

        .steel-results-table th,
        .steel-results-table td {
            padding: 12px;
            border-bottom: 1px solid #293e54;
            text-align: center;
            font-size: 13px;
        }

        .steel-results-table th {
            color: #ffbd67;
            background: #15263a;
        }

        .steel-results-table td {
            color: #d6e0ec;
        }

        .steel-results-chart {
            background: #091321;
            border: 1px solid #263d55;
            border-radius: 10px;
            padding: 15px;
            margin-top: 15px;
        }

        .steel-results-chart canvas {
            width: 100%;
            height: 280px;
            display: block;
        }

        .steel-results-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 18px;
        }

        .steel-results-actions button {
            padding: 10px 15px;
            border: none;
            border-radius: 7px;
            background: #f59e0b;
            color: #111827;
            font-weight: bold;
            cursor: pointer;
        }

        .steel-results-actions button.secondary {
            background: #29435e;
            color: white;
        }

        .steel-results-actions button:hover {
            opacity: 0.85;
        }

        .steel-results-empty {
            text-align: center;
            color: #9fb0c4;
            padding: 30px;
        }

        .steel-results-note {
            font-size: 12px;
            color: #9fb0c4;
            margin-top: 18px;
            line-height: 1.6;
        }

        @media(max-width: 650px) {

            .steel-results-summary {
                grid-template-columns: 1fr;
            }

            .steel-results-panel {
                padding: 13px;
            }
        }

        @media print {

            body {
                background: white !important;
                color: black !important;
            }

            .steel-results-panel {
                background: white !important;
                color: black !important;
                border: 1px solid #999;
            }

            .steel-results-actions {
                display: none !important;
            }

            .steel-summary-card,
            .steel-results-chart {
                background: white !important;
                color: black !important;
            }

            .steel-results-table th,
            .steel-results-table td {
                color: black !important;
                background: white !important;
            }

        }

    `;

    document.head.appendChild(style);

    // =====================================================
    // CREAR CONTENEDOR
    // =====================================================

    let container =
        document.getElementById("results-dashboard") ||
        document.getElementById("resultados");

    if (!container) {

        container = document.createElement("section");
        container.id = "results-dashboard";

        document.body.appendChild(container);
    }

    // =====================================================
    // CREAR PANEL
    // =====================================================

    let panel = document.getElementById("steel-results-panel");

    if (!panel) {

        panel = document.createElement("div");

        panel.id = "steel-results-panel";
        panel.className = "steel-results-panel";

        panel.innerHTML = `

            <h3>Resultados del laboratorio virtual</h3>

            <p>
                Registro y análisis de los ensayos realizados
                durante las simulaciones de STEEL LAB 3D.
            </p>

            <div class="steel-results-summary">

                <div class="steel-summary-card">
                    <span>Ensayos registrados</span>
                    <strong id="total-steel-tests">0</strong>
                </div>

                <div class="steel-summary-card">
                    <span>Materiales evaluados</span>
                    <strong id="total-steel-materials">0</strong>
                </div>

                <div class="steel-summary-card">
                    <span>Último ensayo</span>
                    <strong id="last-steel-test">--</strong>
                </div>

            </div>

            <h3>Gráfico de resultados</h3>

            <div class="steel-results-chart">

                <canvas id="steel-results-chart"></canvas>

                <p id="steel-chart-message"
                   class="steel-results-empty">
                    Realiza ensayos para visualizar sus resultados.
                </p>

            </div>

            <h3>Historial de ensayos</h3>

            <div class="steel-results-table-container">

                <table class="steel-results-table">

                    <thead>
                        <tr>
                            <th>N.º</th>
                            <th>Ensayo</th>
                            <th>Material</th>
                            <th>Tratamiento</th>
                            <th>Resultado</th>
                            <th>Unidad</th>
                            <th>Temperatura</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>

                    <tbody id="steel-results-body"></tbody>

                </table>

            </div>

            <div id="steel-results-empty"
                 class="steel-results-empty">

                Todavía no se han registrado ensayos.

            </div>

            <div class="steel-results-actions">

                <button id="export-steel-csv">
                    Descargar resultados CSV
                </button>

                <button id="print-steel-report" class="secondary">
                    Imprimir informe
                </button>

                <button id="clear-steel-results" class="secondary">
                    Limpiar historial
                </button>

            </div>

            <p class="steel-results-note">

                IMPORTANTE: Los resultados numéricos corresponden
                a simulaciones didácticas. No representan mediciones
                experimentales reales ni sustituyen ensayos físicos
                realizados bajo normas técnicas.

            </p>

        `;

        container.appendChild(panel);
    }

    // =====================================================
    // GUARDAR RESULTADOS
    // =====================================================

    function saveResults() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(results)
            );

        } catch (error) {

            console.warn("No se pudieron guardar los resultados.");

        }
    }

    // =====================================================
    // REGISTRAR RESULTADO
    // =====================================================

    function registerResult(data) {

        if (!data || typeof data !== "object") {
            return;
        }

        const value = Number(data.value);

        const result = {

            id: Date.now() + Math.random(),

            test: data.test || "Ensayo",

            material: data.material || "1045",

            treatment: data.treatment || "--",

            value: Number.isFinite(value) ? value : null,

            unit: data.unit || "--",

            temperature:
                data.temperature !== undefined &&
                data.temperature !== null
                    ? data.temperature
                    : "--",

            date: new Date().toLocaleString("es-PE")

        };

        results.push(result);

        saveResults();

        renderResults();

        console.log("Resultado registrado:", result);
    }

    // =====================================================
    // FUNCIÓN GLOBAL PARA OTROS MÓDULOS
    // =====================================================

    window.registrarResultadoSTEEL = registerResult;

    // =====================================================
    // ESCAPAR TEXTO HTML
    // =====================================================

    function escapeHTML(value) {

        return String(value)

            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }

    // =====================================================
    // MOSTRAR TABLA
    // =====================================================

    function renderResults() {

        const tbody =
            document.getElementById("steel-results-body");

        const empty =
            document.getElementById("steel-results-empty");

        if (!tbody) return;

        tbody.innerHTML = "";

        results.forEach((result, index) => {

            const row = document.createElement("tr");

            const valueText =
                result.value === null ||
                result.value === undefined
                    ? "--"
                    : Number(result.value).toFixed(2);

            const dateText =
                result.date || "--";

            row.innerHTML = `

                <td>${index + 1}</td>

                <td>${escapeHTML(result.test)}</td>

                <td>AISI ${escapeHTML(result.material)}</td>

                <td>${escapeHTML(result.treatment || "--")}</td>

                <td>${valueText}</td>

                <td>${escapeHTML(result.unit)}</td>

                <td>${escapeHTML(String(result.temperature))} °C</td>

                <td>${escapeHTML(dateText)}</td>

            `;

            tbody.appendChild(row);

        });

        if (empty) {

            empty.style.display =
                results.length === 0 ? "block" : "none";

        }

        updateSummary();

        drawChart();
    }

    // =====================================================
    // ACTUALIZAR RESUMEN
    // =====================================================

    function updateSummary() {

        const total =
            document.getElementById("total-steel-tests");

        const materials =
            document.getElementById("total-steel-materials");

        const last =
            document.getElementById("last-steel-test");

        if (total) {
            total.textContent = results.length;
        }

        if (materials) {

            const uniqueMaterials = [
                ...new Set(results.map(item => item.material))
            ];

            materials.textContent = uniqueMaterials.length;
        }

        if (last) {

            last.textContent =
                results.length > 0
                    ? results[results.length - 1].test
                    : "--";

        }
    }

    // =====================================================
    // GRÁFICO COMPARATIVO
    // =====================================================

    function drawChart() {

        const canvas =
            document.getElementById("steel-results-chart");

        const message =
            document.getElementById("steel-chart-message");

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        const validResults = results.filter(item =>
            item.value !== null &&
            Number.isFinite(Number(item.value))
        );

        if (validResults.length === 0) {

            canvas.style.display = "none";

            if (message) {
                message.style.display = "block";
            }

            return;
        }

        canvas.style.display = "block";

        if (message) {
            message.style.display = "none";
        }

        const width = canvas.clientWidth || 600;
        const height = 280;

        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;

        ctx.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );

        ctx.clearRect(0, 0, width, height);

        const data = validResults.slice(-8);

        const maxValue = Math.max(
            ...data.map(item => Number(item.value)),
            1
        );

        const left = 45;
        const right = 15;
        const top = 20;
        const bottom = 55;

        const chartWidth = width - left - right;
        const chartHeight = height - top - bottom;

        // Líneas horizontales

        ctx.strokeStyle = "#263d55";
        ctx.lineWidth = 1;

        for (let i = 0; i <= 4; i++) {

            const y = top + chartHeight * i / 4;

            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(width - right, y);
            ctx.stroke();

            const value =
                maxValue * (1 - i / 4);

            ctx.fillStyle = "#9fb0c4";
            ctx.font = "11px Arial";
            ctx.textAlign = "right";

            ctx.fillText(
                value.toFixed(1),
                left - 7,
                y + 4
            );

        }

        const slotWidth = chartWidth / data.length;

        data.forEach((item, index) => {

            const value = Number(item.value);

            const barHeight =
                (value / maxValue) * chartHeight;

            const x =
                left + index * slotWidth + slotWidth * 0.2;

            const y =
                top + chartHeight - barHeight;

            const barWidth = slotWidth * 0.6;

            // Barra

            ctx.fillStyle = "#f59e0b";

            ctx.fillRect(
                x,
                y,
                barWidth,
                barHeight
            );

            // Valor

            ctx.fillStyle = "#ffffff";
            ctx.font = "11px Arial";
            ctx.textAlign = "center";

            ctx.fillText(
                value.toFixed(1),
                x + barWidth / 2,
                y - 6
            );

            // Nombre del ensayo

            ctx.save();

            ctx.translate(
                x + barWidth / 2,
                height - 42
            );

            ctx.rotate(-0.35);

            ctx.fillStyle = "#b8c8da";
            ctx.font = "10px Arial";
            ctx.textAlign = "right";

            ctx.fillText(
                item.test.substring(0, 16),
                0,
                0
            );

            ctx.restore();

        });

    }

    // =====================================================
    // EXPORTAR CSV
    // =====================================================

    function exportCSV() {

        if (results.length === 0) {

            alert("Primero debes realizar al menos un ensayo.");

            return;
        }

        const rows = [

            [
                "Numero",
                "Ensayo",
                "Material",
                "Tratamiento",
                "Resultado",
                "Unidad",
                "Temperatura",
                "Fecha"
            ]

        ];

        results.forEach((result, index) => {

            rows.push([

                index + 1,

                result.test,

                "AISI " + result.material,

                result.treatment || "--",

                result.value,

                result.unit,

                result.temperature,

                result.date

            ]);

        });

        const csv = rows

            .map(row =>

                row.map(value =>

                    `"${String(value ?? "").replaceAll('"', '""')}"`

                ).join(";")

            )

            .join("\n");

        const blob = new Blob(

            ["\uFEFF" + csv],

            {
                type: "text/csv;charset=utf-8;"
            }

        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "STEEL_LAB_resultados.csv";

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

    }

    // =====================================================
    // IMPRIMIR INFORME
    // =====================================================

    function printReport() {

        if (results.length === 0) {

            alert("No existen resultados para imprimir.");

            return;
        }

        window.print();

    }

    // =====================================================
    // LIMPIAR HISTORIAL
    // =====================================================

    function clearResults() {

        const confirmation = confirm(
            "¿Deseas eliminar todos los resultados registrados?"
        );

        if (!confirmation) return;

        results = [];

        saveResults();

        renderResults();

    }

    // =====================================================
    // REGISTRAR ENSAYOS DE OTROS MÓDULOS
    // =====================================================

    window.addEventListener("steelTestCompleted", event => {

        const data = event.detail;

        if (!data) return;

        registerResult({

            test: data.test || "Ensayo mecánico",

            material: data.material,

            value: data.energy ?? data.value,

            unit: data.unit || "J",

            temperature: data.temperature,

            treatment: data.treatment

        });

    });

    // =====================================================
    // REGISTRAR TRATAMIENTOS TÉRMICOS
    // =====================================================

    document.addEventListener(
        "thermalTreatmentCompleted",
        event => {

            const data = event.detail;

            if (!data) return;

            registerResult({

                test: "Tratamiento térmico: " +
                    (data.tratamiento || "Proceso"),

                material: data.material,

                value: data.temperatura,

                unit: "°C",

                temperature: data.temperatura,

                treatment: data.tratamiento

            });

        }
    );

    // =====================================================
    // CONECTAR BOTONES
    // =====================================================

    document.getElementById("export-steel-csv")
        ?.addEventListener("click", exportCSV);

    document.getElementById("print-steel-report")
        ?.addEventListener("click", printReport);

    document.getElementById("clear-steel-results")
        ?.addEventListener("click", clearResults);

    // =====================================================
    // ACTUALIZAR GRÁFICO AL CAMBIAR EL TAMAÑO
    // =====================================================

    window.addEventListener("resize", drawChart);

    // =====================================================
    // INICIALIZAR
    // =====================================================

    renderResults();

    console.log(
        "STEEL LAB 3D: módulo de resultados cargado correctamente."
    );

});