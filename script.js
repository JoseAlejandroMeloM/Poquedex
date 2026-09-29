const pokemonInput = document.getElementById("pokemonInput");
const buscarBtn = document.getElementById("buscarBtn");
const mensaje = document.getElementById("mensaje");
const resultado = document.getElementById("resultado");

async function buscarPokemon() {
    const pokemonBuscado = pokemonInput.value.trim().toLowerCase();

    if (!pokemonBuscado) {
        mostrarError("Por favor, escribe el nombre o el ID de un Pokémon.");
        return;
    }

    buscarBtn.disabled = true;
    mensaje.textContent = "Buscando Pokémon...";
    resultado.hidden = true;

    try {
        const respuesta = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(pokemonBuscado)}`
        );

        if (!respuesta.ok) {
            throw new Error("Pokémon no encontrado");
        }

        const datos = await respuesta.json();
        mostrarPokemon(datos);
    } catch (error) {
        mostrarError("No se encontró el Pokémon. Verifica el nombre o el ID.");
    } finally {
        buscarBtn.disabled = false;
    }
}

function mostrarPokemon(datos) {
    const tipos = datos.types
        .map((tipo) => tipo.type.name)
        .join(", ");

    const imagen =
        datos.sprites.other["official-artwork"].front_default ||
        datos.sprites.front_default;

    document.getElementById("pokemonNombre").textContent = datos.name;
    document.getElementById("pokemonEspecie").textContent = datos.species.name;
    document.getElementById("pokemonTipo").textContent = tipos;
    document.getElementById("pokemonId").textContent = datos.id;

    document.getElementById("pokemonAltura").textContent = `${datos.height / 10} m`;
    document.getElementById("pokemonPeso").textContent = `${datos.weight / 10} kg`;
    document.getElementById("pokemonExperiencia").textContent =
        datos.base_experience ?? "No disponible";

    const pokemonImagen = document.getElementById("pokemonImagen");
    pokemonImagen.src = imagen || "";
    pokemonImagen.alt = `Imagen de ${datos.name}`;
    pokemonImagen.hidden = !imagen;

    mensaje.textContent = "";
    resultado.hidden = false;
}

function mostrarError(texto) {
    mensaje.textContent = texto;
    resultado.hidden = true;
}

buscarBtn.addEventListener("click", buscarPokemon);

pokemonInput.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        buscarPokemon();
    }
});
