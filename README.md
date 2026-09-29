# Pokéaventura

**Autor:** Jose Alejandro Melo M.<br>
**Aplicación publicada:** [https://josealejandromelom.github.io/Poquedex/](https://josealejandromelom.github.io/Poquedex/)

Pokéaventura es una Pokédex interactiva con estilo de videojuego Pokémon. El usuario puede explorar un mapa pixel-art, recorrer distintas regiones, encontrar Pokémon salvajes al azar y abrir sus fichas completas en la Pokédex.

## Descripción del proyecto

El proyecto combina una Pokédex informativa con una experiencia de exploración. La aplicación inicia en un pequeño pueblo desde donde se puede:

- Entrar al atlas de regiones.
- Recorrer las rutas del mapa.
- Consultar el catálogo de Pokémon de cada región.
- Encontrar Pokémon salvajes durante la exploración.
- Elegir si se quiere registrar un encuentro en la Pokédex o continuar caminando.
- Consultar un equipo inicial de compañeros.

La información de los Pokémon se obtiene en tiempo real desde [PokéAPI](https://pokeapi.co/).

## Funcionalidades principales

### Pueblo explorable

El juego comienza en Pueblo Paleta, representado con gráficos pixel-art creados con HTML y CSS. El entrenador puede desplazarse con:

- `W`, `A`, `S`, `D`.
- Flechas del teclado.
- Controles táctiles en pantallas pequeñas.

En el pueblo existen tres lugares interactivos:

- **Mapa:** abre el atlas de regiones.
- **Terminal Pokédex:** permite buscar directamente un Pokémon.
- **Casa del equipo:** muestra los Pokémon iniciales disponibles.

El jugador puede acercarse a cada edificio y pulsar `E` para interactuar.

### Atlas de regiones

El atlas muestra nueve regiones representadas en un mapa navegable:

- Kanto
- Johto
- Hoenn
- Sinnoh
- Teselia
- Kalos
- Alola
- Galar
- Paldea

Cada región está conectada por rutas. Al llegar a otra zona, la aplicación consulta la generación correspondiente en PokéAPI y carga las especies originarias de esa región.

### Encuentros salvajes

Mientras el jugador avanza por las rutas, el juego acumula distancia recorrida. Después de cierto recorrido se genera una posibilidad aleatoria de encuentro.

Cuando aparece un Pokémon salvaje:

1. El movimiento del entrenador se detiene.
2. El Pokémon aparece sobre el mapa.
3. Se muestra el nombre y la región del encuentro.
4. El jugador puede abrirlo en la Pokédex o continuar caminando.
5. La aplicación registra el número de avistamientos.

El Pokémon encontrado se elige aleatoriamente del catálogo de la región actual, por lo que cada región tiene encuentros diferentes.

### Búsqueda y Pokédex

La búsqueda acepta:

- Nombre del Pokémon.
- Número de Pokédex.
- Algunas formas regionales disponibles en PokéAPI.

La ficha incluye varias secciones:

- **Perfil:** nombre, especie, descripción, tipo, altura, peso, experiencia y habilidades.
- **Combate:** estadísticas base, movimientos y debilidades.
- **Biología:** hábitat, forma, color, crecimiento, grupos huevo y clasificación.
- **Archivo:** objetos, formas, índices de juego, sonidos y sprites.

Cada consulta presenta una pequeña secuencia visual de descubrimiento y puede reproducir el grito del Pokémon cuando el navegador lo permite.

## Lógica de la aplicación

### Flujo general

```text
Pueblo
  ↓
Atlas de regiones
  ↓
Movimiento por rutas
  ↓
Encuentro aleatorio
  ↓
Ficha Pokédex
```

### Estados principales

La aplicación usa estados de React para controlar:

- La vista actual: pueblo, atlas o equipo.
- La posición del entrenador.
- La región seleccionada.
- El catálogo de especies de la región.
- La búsqueda actual.
- El Pokémon y la especie consultados.
- El estado de carga y los errores.
- El encuentro salvaje activo.
- La cantidad de avistamientos.

Las referencias (`useRef`) se utilizan para conservar información que cambia durante la animación, como las teclas presionadas, la posición del personaje, el encuentro actual y la distancia recorrida.

### Movimiento y colisiones

El movimiento se actualiza con `requestAnimationFrame`. Cada frame calcula la dirección, aplica una velocidad y comprueba si la nueva posición está dentro de una ruta válida.

El mapa utiliza coordenadas SVG. Las rutas se guardan como segmentos y una función calcula la distancia del entrenador a cada segmento. Si el personaje está suficientemente cerca de una ruta o ciudad, puede avanzar; de lo contrario, el movimiento se bloquea.

### Encuentros aleatorios

La lógica de encuentros sigue estos pasos:

1. Se mide la distancia recorrida.
2. Cuando se supera un umbral, se lanza una probabilidad aleatoria.
3. Se selecciona una especie del catálogo de la región.
4. Se busca una posición cercana que también sea transitable.
5. Se dibuja el Pokémon salvaje y aparece el menú de interacción.

Existe un pequeño tiempo de espera después de ignorar un encuentro para evitar que aparezcan inmediatamente varios Pokémon seguidos.

### Consumo de PokéAPI

La aplicación usa `fetch` y `async/await` para consultar:

- `/api/v2/generation/{id}/` para cargar las especies de cada región.
- `/api/v2/pokemon/{nombre-o-id}` para obtener los datos principales.
- `/api/v2/pokemon-species/{nombre-o-id}` para obtener descripción, generación, hábitat, nombres y datos biológicos.

Las solicitudes se cancelan mediante `AbortController` cuando el usuario cambia de vista o realiza una nueva búsqueda. También se muestran mensajes claros cuando hay un error de conexión o el Pokémon no existe.

## Estructura del proyecto

La aplicación React está dentro de `my-app/`:

```text
my-app/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── trainer-sprites.png
├── src/
│   ├── App.tsx              # Pueblo, atlas, movimiento y encuentros
│   ├── App.css              # Mundo, mapa y estilos responsive
│   ├── Pokedex.tsx          # Ficha completa del Pokémon
│   ├── Pokedex.css          # Estilos de la ficha
│   ├── Radar.tsx            # Visualización de estadísticas
│   ├── WeaknessTree.tsx     # Debilidades y resistencias
│   ├── typeChart.ts         # Tabla de efectividades por tipo
│   ├── types.ts             # Tipos de datos de PokéAPI
│   └── main.tsx             # Punto de entrada de React
├── package.json
└── vite.config.ts
```

## Tecnologías utilizadas

- React
- TypeScript
- Vite
- HTML semántico
- CSS responsive
- SVG para el mapa y el radar
- PokéAPI

No se utilizan librerías externas para el mapa, el movimiento ni el radar. Las mecánicas principales se construyeron con React, TypeScript, CSS y APIs nativas del navegador.

## Instalación y ejecución local

Se necesita Node.js y conexión a internet para consultar PokéAPI y cargar los sprites.

```bash
cd my-app
npm install
npm run dev
```

Para generar la versión de producción:

```bash
npm run build
```

Para revisar la calidad del código:

```bash
npm run lint
```

## Verificación realizada

El proyecto fue comprobado con:

- Búsqueda por nombre y número.
- Catálogo de regiones.
- Carga de la ficha de Pikachu mediante el ID `25`.
- Manejo de un Pokémon inexistente.
- Navegación entre pueblo y atlas.
- Encuentros salvajes regionales.
- Compilación TypeScript.
- Lint.
- Build de producción con Vite.

## Publicación

La versión pública del proyecto está disponible en:

[https://josealejandromelom.github.io/Poquedex/](https://josealejandromelom.github.io/Poquedex/)
