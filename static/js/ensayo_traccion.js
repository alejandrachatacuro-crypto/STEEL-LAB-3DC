import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('tensile-viewer');

if (!container) {
    console.error('No se encontró el visor de tracción');
} else {

    // ==========================================
    // 1. CONFIGURACIÓN DE LA ESCENA 3D
    // ==========================================

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101820);

    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );

    camera.position.set(5, 4, 7);

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Permite realizar cortes visuales en la probeta.
    renderer.localClippingEnabled = true;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(5, 8, 6);
    scene.add(light);


    // ==========================================
    // 2. MATERIALES
    // ==========================================

    const metal = new THREE.MeshStandardMaterial({
        color: 0x8999a8,
        metalness: 0.85,
        roughness: 0.25
    });

    const darkMetal = new THREE.MeshStandardMaterial({
        color: 0x273747,
        metalness: 0.75,
        roughness: 0.3
    });

    const orange = new THREE.MeshStandardMaterial({
        color: 0xff8738,
        metalness: 0.5,
        roughness: 0.3
    });


    // ==========================================
    // 3. CONSTRUCCIÓN DE LA MÁQUINA
    // ==========================================

    function pieza(geometry, material, x, y, z) {

        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(x, y, z);

        scene.add(mesh);

        return mesh;
    }

    // Base
    pieza(
        new THREE.BoxGeometry(4, 0.35, 2),
        darkMetal,
        0, 0, 0
    );

    // Columnas
    pieza(
        new THREE.BoxGeometry(0.22, 4.5, 0.22),
        metal,
        -1.65, 2.35, 0
    );

    pieza(
        new THREE.BoxGeometry(0.22, 4.5, 0.22),
        metal,
        1.65, 2.35, 0
    );

    // Parte superior
    pieza(
        new THREE.BoxGeometry(3.7, 0.45, 0.8),
        darkMetal,
        0, 4.35, 0
    );

    // Cabezal móvil
    const cabezal = pieza(
        new THREE.BoxGeometry(2.5, 0.4, 0.8),
        darkMetal,
        0, 3.3, 0
    );

    // Mordaza superior
    const mordazaSuperior = pieza(
        new THREE.BoxGeometry(0.65, 0.45, 0.55),
        orange,
        0, 2.95, 0
    );

    // Mordaza inferior
    pieza(
        new THREE.BoxGeometry(0.65, 0.45, 0.55),
        orange,
        0, 1.15, 0
    );


    // ==========================================
    // 4. CONSTRUCCIÓN DE LA PROBETA
    // ==========================================

    const forma = new THREE.Shape();

    forma.moveTo(-0.32, 0);
    forma.lineTo(0.32, 0);
    forma.lineTo(0.32, 0.55);

    forma.quadraticCurveTo(0.32, 0.7, 0.14, 0.75);

    forma.lineTo(0.14, 1.25);

    forma.quadraticCurveTo(0.32, 1.3, 0.32, 1.45);

    forma.lineTo(0.32, 1.8);
    forma.lineTo(-0.32, 1.8);
    forma.lineTo(-0.32, 1.45);

    forma.quadraticCurveTo(-0.32, 1.3, -0.14, 1.25);

    forma.lineTo(-0.14, 0.75);

    forma.quadraticCurveTo(-0.32, 0.7, -0.32, 0.55);

    forma.closePath();

    const geometriaProbeta = new THREE.ExtrudeGeometry(
        forma,
        {
            depth: 0.12,
            bevelEnabled: true,
            bevelSegments: 3,
            steps: 1,
            bevelSize: 0.025,
            bevelThickness: 0.025
        }
    );

    const probeta = pieza(
        geometriaProbeta,
        metal,
        0, 1.35, -0.06
    );


    // ==========================================
    // 5. CÁMARA INTERACTIVA
    // ==========================================

    const controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;
    controls.target.set(0, 2.2, 0);


    // ==========================================
    // 6. ELEMENTOS DEL PANEL
    // ==========================================

    const botonIniciar = document.getElementById('start-tensile');
    const botonReiniciar = document.getElementById('reset-tensile');

    const estado = document.getElementById('tensile-status');

    const canvas = document.getElementById('tensile-chart');
    const ctx = canvas ? canvas.getContext('2d') : null;

    const esfuerzoTexto = document.getElementById('current-stress');
    const deformacionTexto = document.getElementById('current-strain');
    const estadoMaterial = document.getElementById('material-state');


    // ==========================================
    // 7. PARÁMETROS DE SIMULACIÓN
    // ==========================================

    const propiedades = {

        "AISI 1020": {
            fluencia: 350,
            maxima: 450,
            fractura: 340
        },

        "AISI 1045": {
            fluencia: 450,
            maxima: 650,
            fractura: 490
        },

        "AISI 4140": {
            fluencia: 650,
            maxima: 850,
            fractura: 650
        }

    };

    let propiedadesActuales = propiedades["AISI 1020"];

    function obtenerMaterial() {

        const elemento = document.getElementById('selected-steel');

        const nombre = elemento
            ? elemento.textContent.trim()
            : "AISI 1020";

        return propiedades[nombre] || propiedades["AISI 1020"];
    }


    // ==========================================
    // 8. PANEL AUTOMÁTICO DE RESULTADOS
    // ==========================================

    const panelResultados = document.createElement('section');

    panelResultados.style.cssText = `
        display: none;
        margin-top: 18px;
        padding: 20px;
        border: 1px solid #496174;
        border-radius: 12px;
        background: #172633;
        color: #eef4f8;
        font-family: Arial, sans-serif;
    `;

    panelResultados.innerHTML = `
        <h3 style="
            margin:0 0 6px;
            color:#ff9b52;
            font-size:20px;
        ">
            Resultados del ensayo de tracción
        </h3>

        <p style="
            margin:0 0 16px;
            color:#aebdca;
            font-size:12px;
            letter-spacing:1px;
        ">
            RESULTADOS SIMULADOS · NO SON MEDICIONES EXPERIMENTALES
        </p>

        <div style="
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
            gap:12px;
        ">

            <div style="padding:14px;background:#223646;border-radius:9px;">
                <div style="color:#aebdca;font-size:12px;">Material</div>
                <strong id="result-material">—</strong>
            </div>

            <div style="padding:14px;background:#223646;border-radius:9px;">
                <div style="color:#aebdca;font-size:12px;">Esfuerzo de fluencia</div>
                <strong id="result-yield">—</strong>
            </div>

            <div style="padding:14px;background:#223646;border-radius:9px;">
                <div style="color:#aebdca;font-size:12px;">Esfuerzo máximo</div>
                <strong id="result-max-stress">—</strong>
            </div>

            <div style="padding:14px;background:#223646;border-radius:9px;">
                <div style="color:#aebdca;font-size:12px;">Deformación de fractura</div>
                <strong id="result-fracture-strain">—</strong>
            </div>

        </div>

        <p id="result-status" style="
            margin:14px 0 0;
            color:#75dfa0;
            font-weight:bold;
        ">
            Ensayo completado
        </p>
    `;

    if (canvas && canvas.parentElement) {
        canvas.parentElement.insertAdjacentElement(
            'afterend',
            panelResultados
        );
    } else {
        container.insertAdjacentElement(
            'afterend',
            panelResultados
        );
    }


    // ==========================================
    // 9. VARIABLES DEL ENSAYO
    // ==========================================

    let ensayoActivo = false;

    let tiempoInicio = 0;

    const duracion = 6000;

    const deformacionMaxima = 18;

    let deformacionActual = 0;

    let esfuerzoActual = 0;

    let datosGrafica = [];

    let lineaFractura = null;

    let fragmentoSuperior = null;

    let fragmentoInferior = null;


    // ==========================================
    // 10. MODELO MATEMÁTICO DE LA CURVA
    // ==========================================

    function calcularEsfuerzo(deformacion) {

        const fluencia = propiedadesActuales.fluencia;

        const maxima = propiedadesActuales.maxima;

        const fractura = propiedadesActuales.fractura;

        // Zona elástica
        if (deformacion <= 0.2) {

            return (deformacion / 0.2) * fluencia;

        }

        // Zona de endurecimiento plástico
        if (deformacion <= 12) {

            const avance = (deformacion - 0.2) / 11.8;

            return fluencia + (maxima - fluencia) *
                Math.pow(avance, 0.65);

        }

        // Zona de estricción
        const avance = (deformacion - 12) / 6;

        return maxima - (maxima - fractura) * avance;

    }


    // ==========================================
    // 11. DIBUJAR LA GRÁFICA
    // ==========================================

    function dibujarGrafica() {

        if (!canvas || !ctx) return;

        const ancho = canvas.width;

        const alto = canvas.height;

        const margenIzquierdo = 85;

        const margenDerecho = 35;

        const margenSuperior = 35;

        const margenInferior = 65;

        const anchoGrafica = ancho -
            margenIzquierdo - margenDerecho;

        const altoGrafica = alto -
            margenSuperior - margenInferior;

        ctx.clearRect(0, 0, ancho, alto);

        // Fondo
        ctx.fillStyle = "#101820";

        ctx.fillRect(0, 0, ancho, alto);

        // Cuadrícula horizontal
        ctx.strokeStyle = "#344653";

        ctx.lineWidth = 1;

        for (let i = 0; i <= 9; i++) {

            const y = margenSuperior + altoGrafica -
                (i / 9) * altoGrafica;

            ctx.beginPath();

            ctx.moveTo(margenIzquierdo, y);

            ctx.lineTo(ancho - margenDerecho, y);

            ctx.stroke();

            ctx.fillStyle = "#b8c5d0";

            ctx.font = "14px Arial";

            ctx.textAlign = "right";

            ctx.fillText(
                (i * 100).toString(),
                margenIzquierdo - 12,
                y + 5
            );

        }

        // Cuadrícula vertical
        for (let i = 0; i <= 10; i++) {

            const x = margenIzquierdo +
                (i / 10) * anchoGrafica;

            ctx.beginPath();

            ctx.moveTo(x, margenSuperior);

            ctx.lineTo(x, alto - margenInferior);

            ctx.stroke();

            ctx.fillStyle = "#b8c5d0";

            ctx.textAlign = "center";

            ctx.fillText(
                (i * 2).toString(),
                x,
                alto - margenInferior + 25
            );

        }

        // Ejes
        ctx.strokeStyle = "#ffffff";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(margenIzquierdo, margenSuperior);

        ctx.lineTo(margenIzquierdo, alto - margenInferior);

        ctx.lineTo(ancho - margenDerecho, alto - margenInferior);

        ctx.stroke();

        // Eje vertical
        ctx.save();

        ctx.translate(25, alto / 2);

        ctx.rotate(-Math.PI / 2);

        ctx.fillStyle = "#ffffff";

        ctx.font = "bold 16px Arial";

        ctx.textAlign = "center";

        ctx.fillText("Esfuerzo (MPa)", 0, 0);

        ctx.restore();

        // Eje horizontal
        ctx.fillStyle = "#ffffff";

        ctx.font = "bold 16px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "Deformación (%)",
            ancho / 2,
            alto - 12
        );

        // Curva de esfuerzo-deformación
        if (datosGrafica.length > 1) {

            ctx.beginPath();

            datosGrafica.forEach(function(dato, indice) {

                const x = margenIzquierdo +
                    (dato.deformacion / 20) * anchoGrafica;

                const y = margenSuperior + altoGrafica -
                    (dato.esfuerzo / 900) * altoGrafica;

                if (indice === 0) {

                    ctx.moveTo(x, y);

                } else {

                    ctx.lineTo(x, y);

                }

            });

            ctx.strokeStyle = "#ff8738";

            ctx.lineWidth = 4;

            ctx.stroke();

            // Punto actual
            const ultimo = datosGrafica[datosGrafica.length - 1];

            const puntoX = margenIzquierdo +
                (ultimo.deformacion / 20) * anchoGrafica;

            const puntoY = margenSuperior + altoGrafica -
                (ultimo.esfuerzo / 900) * altoGrafica;

            ctx.beginPath();

            ctx.arc(puntoX, puntoY, 7, 0, Math.PI * 2);

            ctx.fillStyle = "#ffffff";

            ctx.fill();

        }

    }


    // ==========================================
    // 12. MOSTRAR RESULTADOS
    // ==========================================

    function mostrarResultados() {

        const materialSeleccionado =
            document.getElementById('selected-steel');

        document.getElementById('result-material').textContent =
            materialSeleccionado
                ? materialSeleccionado.textContent.trim()
                : 'AISI 1020';

        document.getElementById('result-yield').textContent =
            propiedadesActuales.fluencia + ' MPa';

        document.getElementById('result-max-stress').textContent =
            propiedadesActuales.maxima + ' MPa';

        document.getElementById('result-fracture-strain').textContent =
            deformacionActual.toFixed(2) + ' %';

        document.getElementById('result-status').textContent =
            '✓ Ensayo completado: fractura simulada';

        panelResultados.style.display = 'block';

    }


    // ==========================================
    // 13. INICIAR ENSAYO
    // ==========================================

    if (botonIniciar) {

        botonIniciar.addEventListener('click', function() {

            if (ensayoActivo) return;

            if (probeta.userData.finalizado) {

                reiniciarEnsayo();

            }

            propiedadesActuales = obtenerMaterial();

            datosGrafica = [];

            deformacionActual = 0;

            esfuerzoActual = 0;

            tiempoInicio = performance.now();

            ensayoActivo = true;

            botonIniciar.disabled = true;

            panelResultados.style.display = 'none';

            if (estado) {

                estado.textContent =
                    'Aplicando fuerza de tracción...';

            }

            if (estadoMaterial) {

                estadoMaterial.textContent = 'Zona elástica';

            }

            console.log('Ensayo iniciado');

        });

    }


    // ==========================================
    // 14. REINICIAR ENSAYO
    // ==========================================

    function reiniciarEnsayo() {

        ensayoActivo = false;

        cabezal.position.y = 3.3;

        mordazaSuperior.position.y = 2.95;

        // Retirar fragmento superior
        if (fragmentoSuperior) {

            scene.remove(fragmentoSuperior);

            fragmentoSuperior.material.dispose();

            fragmentoSuperior = null;

        }

        // Retirar fragmento inferior
        if (fragmentoInferior) {

            scene.remove(fragmentoInferior);

            fragmentoInferior.material.dispose();

            fragmentoInferior = null;

        }

        // Restaurar probeta original
        probeta.visible = true;

        probeta.scale.set(1, 1, 1);

        probeta.material.color.set(0x8999a8);

        probeta.userData.finalizado = false;

        panelResultados.style.display = 'none';

        deformacionActual = 0;

        esfuerzoActual = 0;

        datosGrafica = [];

        // Retirar línea de fractura
        if (lineaFractura) {

            scene.remove(lineaFractura);

            lineaFractura.geometry.dispose();

            lineaFractura.material.dispose();

            lineaFractura = null;

        }

        if (botonIniciar) {

            botonIniciar.disabled = false;

        }

        if (estado) {

            estado.textContent =
                'Sistema preparado para iniciar.';

        }

        if (esfuerzoTexto) {

            esfuerzoTexto.textContent = '0 MPa';

        }

        if (deformacionTexto) {

            deformacionTexto.textContent = '0 %';

        }

        if (estadoMaterial) {

            estadoMaterial.textContent = 'Sin ensayo';

        }

        dibujarGrafica();

        console.log('Ensayo reiniciado');

    }

    if (botonReiniciar) {

        botonReiniciar.addEventListener('click', reiniciarEnsayo);

    }


    // ==========================================
    // 15. REPRESENTACIÓN DE LA FRACTURA
    // ==========================================

    function mostrarFractura() {

        // Línea irregular que representa la superficie de fractura.
        const puntos = [

            new THREE.Vector3(-0.17, 2.48, -0.14),

            new THREE.Vector3(-0.06, 2.43, -0.14),

            new THREE.Vector3(0.02, 2.49, -0.14),

            new THREE.Vector3(0.17, 2.44, -0.14)

        ];

        const geometria = new THREE.BufferGeometry()
            .setFromPoints(puntos);

        const materialLinea = new THREE.LineBasicMaterial({
            color: 0xff3b30,
            linewidth: 3
        });

        lineaFractura = new THREE.Line(
            geometria,
            materialLinea
        );

        scene.add(lineaFractura);


        // ======================================
        // SEPARACIÓN DE LAS DOS PARTES
        // ======================================

        // Plano de corte superior
        const planoSuperior = new THREE.Plane(
            new THREE.Vector3(0, 1, 0),
            -2.48
        );

        // Plano de corte inferior
        const planoInferior = new THREE.Plane(
            new THREE.Vector3(0, -1, 0),
            2.48
        );

        const materialSuperior = probeta.material.clone();

        materialSuperior.color.set(0xffa15c);

        materialSuperior.clippingPlanes = [planoSuperior];

        materialSuperior.clipShadows = true;

        const materialInferior = probeta.material.clone();

        materialInferior.color.set(0xff8738);

        materialInferior.clippingPlanes = [planoInferior];

        materialInferior.clipShadows = true;


        // Crear fragmento superior
        fragmentoSuperior = new THREE.Mesh(
            probeta.geometry,
            materialSuperior
        );

        // Crear fragmento inferior
        fragmentoInferior = new THREE.Mesh(
            probeta.geometry,
            materialInferior
        );


        // Copiar posición y dimensiones originales
        fragmentoSuperior.position.copy(probeta.position);

        fragmentoInferior.position.copy(probeta.position);

        fragmentoSuperior.rotation.copy(probeta.rotation);

        fragmentoInferior.rotation.copy(probeta.rotation);

        fragmentoSuperior.scale.copy(probeta.scale);

        fragmentoInferior.scale.copy(probeta.scale);


        // Separar ligeramente las dos partes
        fragmentoSuperior.position.y += 0.12;

        fragmentoInferior.position.y -= 0.08;


        // Añadir los fragmentos a la escena
        scene.add(fragmentoSuperior);

        scene.add(fragmentoInferior);

        // Ocultar la probeta original
        probeta.visible = false;

        probeta.userData.finalizado = true;


        // Actualizar estados
        if (estado) {

            estado.textContent =
                'Ensayo finalizado: fractura simulada.';

        }

        if (estadoMaterial) {

            estadoMaterial.textContent = 'Fractura';

        }

        // Mostrar resultados
        mostrarResultados();

        console.log('Fractura simulada');

    }


    // ==========================================
    // 16. ANIMACIÓN EN TIEMPO REAL
    // ==========================================

    function animate() {

        requestAnimationFrame(animate);

        if (ensayoActivo) {

            const tiempo = performance.now() - tiempoInicio;

            let progreso = tiempo / duracion;

            if (progreso > 1) {

                progreso = 1;

            }


            // Movimiento del cabezal
            cabezal.position.y = 3.3 + progreso * 0.65;

            mordazaSuperior.position.y =
                2.95 + progreso * 0.65;


            // Deformación visual de la probeta
            probeta.scale.y = 1 + progreso * 0.18;

            probeta.scale.x = 1 - progreso * 0.25;


            // Deformación porcentual
            deformacionActual =
                progreso * deformacionMaxima;


            // Calcular esfuerzo
            esfuerzoActual =
                calcularEsfuerzo(deformacionActual);


            // Guardar datos para la gráfica
            datosGrafica.push({

                deformacion: deformacionActual,

                esfuerzo: esfuerzoActual

            });


            // Actualizar indicador de esfuerzo
            if (esfuerzoTexto) {

                esfuerzoTexto.textContent =
                    esfuerzoActual.toFixed(1) + ' MPa';

            }


            // Actualizar indicador de deformación
            if (deformacionTexto) {

                deformacionTexto.textContent =
                    deformacionActual.toFixed(2) + ' %';

            }


            // Estado del material
            if (estadoMaterial) {

                if (deformacionActual <= 0.2) {

                    estadoMaterial.textContent = 'Zona elástica';

                } else if (deformacionActual <= 12) {

                    estadoMaterial.textContent =
                        'Deformación plástica';

                } else {

                    estadoMaterial.textContent = 'Estricción';

                }

            }


            // Estado general del ensayo
            if (estado) {

                estado.textContent =
                    'Ensayo en progreso: ' +
                    Math.round(progreso * 100) + ' %';

            }


            // Actualizar gráfica
            dibujarGrafica();


            // Finalizar ensayo
            if (progreso >= 1) {

                ensayoActivo = false;

                mostrarFractura();

                if (botonIniciar) {

                    botonIniciar.disabled = false;

                }

            }

        }

        controls.update();

        renderer.render(scene, camera);

    }


    // ==========================================
    // 17. INICIO DEL SISTEMA
    // ==========================================

    dibujarGrafica();

    animate();


    // ==========================================
    // 18. ADAPTACIÓN DE TAMAÑO
    // ==========================================

    window.addEventListener('resize', function() {

        const width = container.clientWidth;

        const height = container.clientHeight;

        if (width === 0 || height === 0) return;

        camera.aspect = width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

    });

    console.log('Máquina y gráfica de tracción listas');

}