
console.log("STEEL LAB: sistema de materiales iniciado");

const tarjetas = document.querySelectorAll(".material-card");

tarjetas.forEach(function(tarjeta) {

    tarjeta.addEventListener("click", function() {

        // Quitar la selección anterior
        tarjetas.forEach(function(item) {
            item.classList.remove("selected");
        });

        // Seleccionar el acero elegido
        tarjeta.classList.add("selected");

        // Obtener el código del acero
        const acero = tarjeta.dataset.steel;

        console.log("Material seleccionado: AISI " + acero);

    });

});

console.log("Tarjetas encontradas: " + tarjetas.length);
