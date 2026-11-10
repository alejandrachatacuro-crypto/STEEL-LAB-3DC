// ======================================================
// STEEL LAB 3D - MICROSCOPIO METALOGRÁFICO
// Microscopio interactivo conectado al horno térmico.
// Simulación didáctica de microestructuras del acero.
// ======================================================

function iniciarMicroscopio() {

    const canvas = document.getElementById("microstructure-canvas");

    if (!canvas) {
        console.error("No se encontró el canvas del microscopio.");
        return;
    }

    const ctx = canvas.getContext("2d");

    const selector = document.getElementById("microstructure-type");
    const zoom = document.getElementById("microstructure-zoom");

    const nombre = document.getElementById("microstructure-name");
    const descripcion = document.getElementById("microstructure-description");
    const propiedades = document.getElementById("microstructure-properties");
    const zoomTexto = document.getElementById("microstructure-zoom-value");

    // Información de las microestructuras.

    const informacion = {

        ferrita: {
            nombre: "Ferrita",
            descripcion: "Fase de hierro alfa con estructura cristalina cúbica centrada en el cuerpo. Se observa como granos poligonales con límites definidos.",
            propiedades: "Blanda · Dúctil · Baja dureza"
        },

        perlita: {
            nombre: "Perlita",
            descripcion: "Constituyente formado por láminas alternadas de ferrita y cementita, agrupadas en colonias con distintas orientaciones.",
            propiedades: "Resistencia moderada · Estructura laminar"
        },

        austenita: {
            nombre: "Austenita",
            descripcion: "Fase de hierro gamma con estructura cristalina cúbica centrada en las caras. Presenta granos equiaxiales.",
            propiedades: "Alta temperatura · Disolución de carbono"
        },

        martensita: {
            nombre: "Martensita",
            descripcion: "Microestructura obtenida mediante enfriamiento rápido desde la austenita. Presenta placas o listones finos orientados en diferentes direcciones.",
            propiedades: "Alta dureza · Alta resistencia · Menor ductilidad"
        },

        bainita: {
            nombre: "Bainita",
            descripcion: "Microestructura formada durante transformaciones a temperaturas intermedias. Presenta agrupaciones de placas y agujas.",
            propiedades: "Buena resistencia · Buena tenacidad"
        },

        revenida: {
            nombre: "Martensita revenida",
            descripcion: "Estructura obtenida al recalentar acero previamente templado por debajo de la temperatura crítica. La martensita evoluciona y precipitan carburos, reduciendo su fragilidad.",
            propiedades: "Buena combinación de dureza, resistencia y tenacidad"
        }

    };

    // ==================================================
    // 1. VARIABLES
    // ==================================================

    let fase = "ferrita";

    let aumento = 100;

    let ancho = 0;

    let alto = 0;

    let materialActual = "1045";

    let tratamientoActual = "Sin tratamiento";

    let enfriamientoActual = "Sin enfriamiento";

    let temperaturaActual = 25;

    let resultadoDelHorno = false;

    // ==================================================
    // 2. FUNCIONES ALEATORIAS
    // ==================================================

    function aleatorio(n) {

        const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;

        return x - Math.floor(x);

    }

    // ==================================================
    // 3. PREPARAR CANVAS
    // ==================================================

    function prepararCanvas() {

        const rect = canvas.getBoundingClientRect();

        if (rect.width < 20 || rect.height < 20) {

            return false;

        }

        ancho = rect.width;

        alto = rect.height;

        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

        const nuevoAncho = Math.round(ancho * dpr);

        const nuevoAlto = Math.round(alto * dpr);

        if (canvas.width !== nuevoAncho || canvas.height !== nuevoAlto) {

            canvas.width = nuevoAncho;

            canvas.height = nuevoAlto;

        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        return true;

    }

    // ==================================================
    // 4. FONDO METALOGRÁFICO
    // ==================================================

    function fondo() {

        const gradiente = ctx.createRadialGradient(

            ancho * 0.48,
            alto * 0.45,
            10,

            ancho * 0.5,
            alto * 0.5,
            Math.max(ancho, alto)

        );

        gradiente.addColorStop(0, "#e3d4bd");

        gradiente.addColorStop(0.65, "#bca88e");

        gradiente.addColorStop(1, "#796c5b");

        ctx.fillStyle = gradiente;

        ctx.fillRect(0, 0, ancho, alto);

    }

    // ==================================================
    // 5. RECORTAR POLÍGONOS
    // ==================================================

    function recortarPoligono(poligono, a, b, c) {

        const resultado = [];

        if (poligono.length === 0) return resultado;

        for (let i = 0; i < poligono.length; i++) {

            const actual = poligono[i];

            const siguiente = poligono[(i + 1) % poligono.length];

            const valorA = a * actual.x + b * actual.y - c;

            const valorB = a * siguiente.x + b * siguiente.y - c;

            const dentroA = valorA <= 0.0001;

            const dentroB = valorB <= 0.0001;

            if (dentroA && dentroB) {

                resultado.push(siguiente);

            } else if (dentroA && !dentroB) {

                const t = valorA / (valorA - valorB);

                resultado.push({

                    x: actual.x + t * (siguiente.x - actual.x),

                    y: actual.y + t * (siguiente.y - actual.y)

                });

            } else if (!dentroA && dentroB) {

                const t = valorA / (valorA - valorB);

                resultado.push({

                    x: actual.x + t * (siguiente.x - actual.x),

                    y: actual.y + t * (siguiente.y - actual.y)

                });

                resultado.push(siguiente);

            }

        }

        return resultado;

    }

    // ==================================================
    // 6. GENERAR GRANOS METALOGRÁFICOS
    // ==================================================

    function crearGranos() {

        const columnas = Math.max(5, Math.round(ancho / 95));

        const filas = Math.max(4, Math.round(alto / 85));

        const sitios = [];

        for (let y = 0; y < filas; y++) {

            for (let x = 0; x < columnas; x++) {

                const id = y * columnas + x;

                sitios.push({

                    x: (x + 0.5 + (aleatorio(id + 10) - 0.5) * 0.65) * ancho / columnas,

                    y: (y + 0.5 + (aleatorio(id + 80) - 0.5) * 0.65) * alto / filas,

                    id: id

                });

            }

        }

        const granos = [];

        sitios.forEach(function (sitio) {

            let poligono = [

                { x: -20, y: -20 },

                { x: ancho + 20, y: -20 },

                { x: ancho + 20, y: alto + 20 },

                { x: -20, y: alto + 20 }

            ];

            sitios.forEach(function (otro) {

                if (otro.id === sitio.id) return;

                const a = otro.x - sitio.x;

                const b = otro.y - sitio.y;

                const c = (

                    otro.x * otro.x +
                    otro.y * otro.y -
                    sitio.x * sitio.x -
                    sitio.y * sitio.y

                ) / 2;

                poligono = recortarPoligono(poligono, a, b, c);

            });

            if (poligono.length > 2) {

                granos.push({

                    puntos: poligono,

                    id: sitio.id

                });

            }

        });

        return granos;

    }

    function trazarGrano(puntos) {

        ctx.beginPath();

        ctx.moveTo(puntos[0].x, puntos[0].y);

        for (let i = 1; i < puntos.length; i++) {

            ctx.lineTo(puntos[i].x, puntos[i].y);

        }

        ctx.closePath();

    }

    // ==================================================
    // 7. TEXTURA SUPERFICIAL
    // ==================================================

    function textura() {

        for (let i = 0; i < 2200; i++) {

            const x = aleatorio(i + 1500) * ancho;

            const y = aleatorio(i + 2500) * alto;

            ctx.fillStyle = i % 2 === 0

                ? "rgba(55,40,30,0.055)"

                : "rgba(255,255,255,0.08)";

            ctx.fillRect(x, y, 1.2, 1.2);

        }

    }

    // ==================================================
    // 8. FERRITA
    // ==================================================

    function dibujarFerrita(granos) {

        granos.forEach(function (grano) {

            trazarGrano(grano.puntos);

            const tono = Math.floor(aleatorio(grano.id + 400) * 25);

            ctx.fillStyle = `rgb(${211 + tono},${192 + tono},${160 + tono})`;

            ctx.fill();

            ctx.strokeStyle = "#514537";

            ctx.lineWidth = 2;

            ctx.stroke();

            ctx.save();

            trazarGrano(grano.puntos);

            ctx.clip();

            const x = grano.puntos[0].x;

            const y = grano.puntos[0].y;

            const gradiente = ctx.createLinearGradient(

                x, y, x + 100, y + 80

            );

            gradiente.addColorStop(0, "rgba(255,255,255,0.20)");

            gradiente.addColorStop(1, "rgba(80,55,35,0.12)");

            ctx.fillStyle = gradiente;

            ctx.fillRect(0, 0, ancho, alto);

            ctx.restore();

        });

    }

    // ==================================================
    // 9. AUSTENITA
    // ==================================================

    function dibujarAustenita(granos) {

        granos.forEach(function (grano) {

            trazarGrano(grano.puntos);

            const tono = Math.floor(aleatorio(grano.id + 700) * 20);

            ctx.fillStyle = `rgb(${185 + tono},${126 + tono},${116 + tono})`;

            ctx.fill();

            ctx.strokeStyle = "#754d48";

            ctx.lineWidth = 2.5;

            ctx.stroke();

            ctx.save();

            trazarGrano(grano.puntos);

            ctx.clip();

            ctx.fillStyle = "rgba(255,215,190,0.12)";

            for (let i = 0; i < 5; i++) {

                const x = aleatorio(grano.id * 20 + i) * ancho;

                const y = aleatorio(grano.id * 30 + i) * alto;

                ctx.beginPath();

                ctx.arc(

                    x,
                    y,
                    3 + aleatorio(i + grano.id) * 5,
                    0,
                    Math.PI * 2

                );

                ctx.fill();

            }

            ctx.restore();

        });

    }

    // ==================================================
    // 10. PERLITA
    // ==================================================

    function dibujarPerlita(granos) {

        granos.forEach(function (grano) {

            trazarGrano(grano.puntos);

            ctx.fillStyle = "#b6a18a";

            ctx.fill();

            ctx.strokeStyle = "#4b3b31";

            ctx.lineWidth = 1.8;

            ctx.stroke();

            ctx.save();

            trazarGrano(grano.puntos);

            ctx.clip();

            const centroX = grano.puntos.reduce(

                (s, p) => s + p.x, 0

            ) / grano.puntos.length;

            const centroY = grano.puntos.reduce(

                (s, p) => s + p.y, 0

            ) / grano.puntos.length;

            ctx.translate(centroX, centroY);

            ctx.rotate(aleatorio(grano.id + 800) * Math.PI);

            const tamano = 110;

            const separacion = 5;

            for (let i = -tamano; i <= tamano; i += separacion) {

                ctx.beginPath();

                ctx.moveTo(-tamano, i);

                ctx.lineTo(tamano, i);

                ctx.strokeStyle = Math.round(i / separacion) % 2 === 0

                    ? "#eee0c9"

                    : "#40352f";

                ctx.lineWidth = 2.1;

                ctx.stroke();

            }

            ctx.restore();

        });

    }

    // ==================================================
    // 11. MARTENSITA
    // ==================================================

    function dibujarMartensita(granos) {

        granos.forEach(function (grano) {

            trazarGrano(grano.puntos);

            ctx.fillStyle = "#827b83";

            ctx.fill();

            ctx.strokeStyle = "#443e48";

            ctx.lineWidth = 1.5;

            ctx.stroke();

            ctx.save();

            trazarGrano(grano.puntos);

            ctx.clip();

            const centroX = grano.puntos.reduce(

                (s, p) => s + p.x, 0

            ) / grano.puntos.length;

            const centroY = grano.puntos.reduce(

                (s, p) => s + p.y, 0

            ) / grano.puntos.length;

            ctx.translate(centroX, centroY);

            for (let i = 0; i < 22; i++) {

                const angulo = aleatorio(grano.id * 50 + i) * Math.PI;

                const longitud = 30 + aleatorio(i + grano.id * 70) * 95;

                const x = (aleatorio(i + 500 + grano.id) - 0.5) * 150;

                const y = (aleatorio(i + 700 + grano.id) - 0.5) * 120;

                ctx.save();

                ctx.translate(x, y);

                ctx.rotate(angulo);

                ctx.beginPath();

                ctx.moveTo(-longitud / 2, 0);

                ctx.lineTo(-longitud / 4, -3);

                ctx.lineTo(longitud / 2, 0);

                ctx.lineTo(-longitud / 4, 3);

                ctx.closePath();

                ctx.fillStyle = i % 2 === 0

                    ? "#e0d8e1"

                    : "#b5a8bd";

                ctx.fill();

                ctx.strokeStyle = "#554c5b";

                ctx.lineWidth = 1;

                ctx.stroke();

                ctx.restore();

            }

            ctx.restore();

        });

    }

    // ==================================================
    // 12. BAINITA
    // ==================================================

    function dibujarBainita(granos) {

        granos.forEach(function (grano) {

            trazarGrano(grano.puntos);

            ctx.fillStyle = "#aa997d";

            ctx.fill();

            ctx.strokeStyle = "#554735";

            ctx.lineWidth = 1.8;

            ctx.stroke();

            ctx.save();

            trazarGrano(grano.puntos);

            ctx.clip();

            const cx = grano.puntos.reduce(

                (s, p) => s + p.x, 0

            ) / grano.puntos.length;

            const cy = grano.puntos.reduce(

                (s, p) => s + p.y, 0

            ) / grano.puntos.length;

            ctx.translate(cx, cy);

            for (let grupo = 0; grupo < 4; grupo++) {

                const angulo = aleatorio(grano.id * 30 + grupo) * Math.PI;

                const baseX = (aleatorio(grupo + grano.id) - 0.5) * 100;

                const baseY = (aleatorio(grupo + grano.id + 50) - 0.5) * 80;

                ctx.save();

                ctx.translate(baseX, baseY);

                ctx.rotate(angulo);

                for (let j = 0; j < 9; j++) {

                    const longitud = 30 + aleatorio(j + grupo * 20) * 65;

                    ctx.beginPath();

                    ctx.moveTo(-longitud / 2, j * 4);

                    ctx.lineTo(longitud / 2, j * 4 - 10);

                    ctx.strokeStyle = j % 2 === 0

                        ? "#ead9b8"

                        : "#695b47";

                    ctx.lineWidth = 2.5;

                    ctx.stroke();

                }

                ctx.restore();

            }

            ctx.restore();

        });

    }

    // ==================================================
    // 13. MARTENSITA REVENIDA
    // ==================================================

    function dibujarRevenida(granos) {

        granos.forEach(function (grano) {

            trazarGrano(grano.puntos);

            ctx.fillStyle = "#a99b91";

            ctx.fill();

            ctx.strokeStyle = "#51443c";

            ctx.lineWidth = 1.8;

            ctx.stroke();

            ctx.save();

            trazarGrano(grano.puntos);

            ctx.clip();

            const centroX = grano.puntos.reduce(

                (s, p) => s + p.x, 0

            ) / grano.puntos.length;

            const centroY = grano.puntos.reduce(

                (s, p) => s + p.y, 0

            ) / grano.puntos.length;

            ctx.translate(centroX, centroY);

            for (let i = 0; i < 30; i++) {

                const x = (aleatorio(grano.id * 40 + i) - 0.5) * 150;

                const y = (aleatorio(grano.id * 70 + i) - 0.5) * 120;

                ctx.beginPath();

                ctx.ellipse(

                    x,
                    y,
                    4 + aleatorio(i + 30) * 5,
                    1.5,
                    aleatorio(i + 60) * Math.PI,
                    0,
                    Math.PI * 2

                );

                ctx.fillStyle = i % 2 === 0

                    ? "#554b48"

                    : "#e1c9a8";

                ctx.fill();

            }

            ctx.restore();

        });

    }

    // ==================================================
    // 14. INDICADORES DEL MICROSCOPIO
    // ==================================================

    function dibujarIndicadores() {

        ctx.fillStyle = "rgba(15,20,26,0.78)";

        ctx.fillRect(12, 10, 190, 28);

        ctx.fillStyle = "#ffffff";

        ctx.font = "bold 14px Arial";

        ctx.fillText(fase.toUpperCase(), 22, 29);

        ctx.fillStyle = "rgba(15,20,26,0.78)";

        ctx.fillRect(12, alto - 52, 205, 42);

        ctx.fillStyle = "#ffffff";

        ctx.font = "11px Arial";

        ctx.fillText("ESCALA VISUAL", 22, alto - 34);

        ctx.fillRect(22, alto - 26, 90, 3);

        ctx.fillText("Simulación didáctica", 22, alto - 13);

    }

    // ==================================================
    // 15. DIBUJAR MICROESTRUCTURA
    // ==================================================

    function dibujar() {

        if (!prepararCanvas()) return;

        ctx.clearRect(0, 0, ancho, alto);

        ctx.save();

        ctx.translate(ancho / 2, alto / 2);

        ctx.scale(aumento / 100, aumento / 100);

        ctx.translate(-ancho / 2, -alto / 2);

        fondo();

        const granos = crearGranos();

        if (fase === "ferrita") dibujarFerrita(granos);

        if (fase === "perlita") dibujarPerlita(granos);

        if (fase === "austenita") dibujarAustenita(granos);

        if (fase === "martensita") dibujarMartensita(granos);

        if (fase === "bainita") dibujarBainita(granos);

        if (fase === "revenida") dibujarRevenida(granos);

        textura();

        ctx.restore();

        dibujarIndicadores();

    }

    // ==================================================
    // 16. ACTUALIZAR INFORMACIÓN
    // ==================================================

    function actualizarInformacion() {

        const dato = informacion[fase];

        if (!dato) return;

        if (nombre) {

            nombre.textContent = dato.nombre;

        }

        if (descripcion) {

            descripcion.textContent = dato.descripcion;

        }

        if (propiedades) {

            propiedades.textContent = dato.propiedades;

        }

        dibujar();

    }

    // ==================================================
    // 17. INFORMACIÓN DEL MATERIAL SELECCIONADO
    // ==================================================

    document.addEventListener("steelChanged", function (event) {

        if (!event.detail) return;

        materialActual = String(event.detail.code || "1045");

        console.log(
            "Microscopio: material seleccionado AISI " + materialActual
        );

        if (resultadoDelHorno) {

            actualizarInformacion();

        }

    });

    // ==================================================
    // 18. DETERMINAR MICROESTRUCTURA ORIENTATIVA
    // ==================================================

    function determinarMicroestructura(datos) {

        const tratamiento = datos.tratamiento;

        const acero = datos.material;

        const enfriamiento = datos.enfriamiento;

        if (tratamiento === "recocido") {

            return {

                fase: "perlita",

                explicacion:
                    "El recocido favorece una estructura de ferrita y perlita, generalmente con mayor suavidad y ductilidad. La proporción depende del contenido de carbono."

            };

        }

        if (tratamiento === "normalizado") {

            return {

                fase: "perlita",

                explicacion:
                    "El normalizado favorece una estructura de ferrita y perlita más fina que la obtenida mediante un enfriamiento lento, según la composición del acero."

            };

        }

        if (tratamiento === "temple") {

            if (enfriamiento === "fast") {

                if (acero === "1020") {

                    return {

                        fase: "martensita",

                        explicacion:
                            "El enfriamiento rápido puede producir martensita, aunque el acero AISI 1020 tiene baja templabilidad y puede presentar una transformación incompleta dependiendo del tamaño de la pieza."

                    };

                }

                if (acero === "4140") {

                    return {

                        fase: "martensita",

                        explicacion:
                            "El acero AISI 4140 presenta una templabilidad relativamente elevada. El enfriamiento rápido puede favorecer la formación de martensita."

                    };

                }

                return {

                    fase: "martensita",

                    explicacion:
                        "El enfriamiento rápido del AISI 1045 puede favorecer la formación de martensita. La cantidad obtenida depende de la sección y de la velocidad real de enfriamiento."

                };

            }

            return {

                fase: "perlita",

                explicacion:
                    "El enfriamiento seleccionado no representa un temple rápido. La transformación puede generar estructuras diferentes a una martensita predominante."

            };

        }

        if (tratamiento === "revenido") {

            return {

                fase: "revenida",

                explicacion:
                    "El revenido se representa mediante martensita revenida. Este proceso debe aplicarse a un acero previamente templado; el resultado real depende de la temperatura y del tiempo de revenido."

            };

        }

        return {

            fase: "ferrita",

            explicacion:
                "No se ha identificado un tratamiento térmico completado."

        };

    }

    // ==================================================
    // 19. RECIBIR RESULTADO DEL HORNO
    // ==================================================

    document.addEventListener("thermalTreatmentCompleted", function (event) {

        const datos = event.detail;

        if (!datos) return;

        resultadoDelHorno = true;

        materialActual = String(datos.material || materialActual);

        tratamientoActual = datos.tratamiento || "Sin tratamiento";

        enfriamientoActual = datos.enfriamiento || "Sin enfriamiento";

        temperaturaActual = Number(datos.temperatura) || 25;

        const resultado = determinarMicroestructura({

            material: materialActual,

            tratamiento: tratamientoActual,

            enfriamiento: enfriamientoActual,

            temperatura: temperaturaActual

        });

        fase = resultado.fase;

        if (selector) {

            selector.value = fase;

        }

        if (descripcion) {

            descripcion.textContent = resultado.explicacion;

        }

        if (nombre) {

            nombre.textContent = informacion[fase].nombre;

        }

        if (propiedades) {

            propiedades.textContent = informacion[fase].propiedades;

        }

        dibujar();

        console.log("================================");

        console.log("RESULTADO DEL TRATAMIENTO TÉRMICO");

        console.log("Material: AISI " + materialActual);

        console.log("Tratamiento: " + tratamientoActual);

        console.log("Enfriamiento: " + enfriamientoActual);

        console.log("Temperatura: " + temperaturaActual + " °C");

        console.log("Microestructura: " + informacion[fase].nombre);

        console.log("================================");

    });

    // ==================================================
    // 20. SELECTOR MANUAL
    // ==================================================

    if (selector) {

        selector.addEventListener("change", function () {

            if (informacion[this.value]) {

                fase = this.value;

                actualizarInformacion();

            }

        });

    }

    // ==================================================
    // 21. CONTROL DE ZOOM
    // ==================================================

    if (zoom) {

        aumento = Number(zoom.value) || 100;

        if (zoomTexto) {

            zoomTexto.textContent = aumento + " %";

        }

        zoom.addEventListener("input", function () {

            aumento = Number(this.value);

            if (zoomTexto) {

                zoomTexto.textContent = aumento + " %";

            }

            dibujar();

        });

    }

    // ==================================================
    // 22. INICIALIZACIÓN
    // ==================================================

    function iniciar() {

        if (prepararCanvas()) {

            actualizarInformacion();

        } else {

            requestAnimationFrame(iniciar);

        }

    }

    iniciar();

    window.addEventListener("resize", dibujar);

    if ("ResizeObserver" in window) {

        const observador = new ResizeObserver(function () {

            dibujar();

        });

        if (canvas.parentElement) {

            observador.observe(canvas.parentElement);

        }

    }

    console.log("Microscopio metalográfico conectado y cargado.");

}

// ======================================================
// INICIAR CUANDO EL DOCUMENTO ESTÉ DISPONIBLE
// ======================================================

if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", iniciarMicroscopio, { once: true });

} else {

    iniciarMicroscopio();

}