# Pokédex · Edición Explorador

Proyecto de clase con React, Vite y TypeScript básico. El diseño se inspira en una Pokédex física: carcasa roja, pantalla de sprites, ficha verde y radar de combate.

## Ejecutar

Desde la carpeta principal del ejercicio:

```sh
cd my-app
npm install
npm run dev
```

Abre la dirección que indique Vite. La aplicación necesita internet para consultar PokéAPI y cargar imágenes. Si ya tienes las dependencias instaladas, puedes omitir `npm install`.

## Cómo funciona React aquí

- `src/App.tsx`: buscador y consola. `useState` guarda lo que escribe el usuario, el Pokémon, la especie, el estado de carga y los errores. React actualiza la pantalla cuando cambian esos estados.
- `useEffect` consulta la API al iniciar (Pikachu) y al cambiar la búsqueda. Su función de limpieza cancela solicitudes anteriores.
- `src/Radar.tsx`: componente que recibe las estadísticas mediante una prop llamada `stats` y dibuja seis ejes en SVG, sin librerías adicionales.
- `src/types.ts`: describe los datos que usamos de la API. Son anotaciones de TypeScript; la lógica sigue siendo JavaScript.
- `src/App.css`: apariencia de la consola y adaptación a pantallas pequeñas.
- `src/index.css`: estilos generales.
- `src/main.tsx`: monta el componente App en el HTML.

El código anterior usaba `getElementById`, `textContent` y eventos manuales. Ahora los datos se muestran con JSX, los eventos con `onClick` y `onSubmit`, y la información se conserva en estados.

## Datos y controles

Consulta `https://pokeapi.co/api/v2/pokemon/{nombre-o-id}` y luego la URL `species.url` para obtener la categoría y descripción en español. Si falta la categoría traducida, muestra el nombre de especie de la API.

La ficha verde contiene nombre, ID, tipo y especie. El radar muestra vida, ataque, defensa, ataque especial, defensa especial y velocidad. Su escala fija es 0–255; los números de cada eje son los valores reales, no porcentajes. Altura y peso se convierten de decímetros y hectogramos a metros y kilogramos.

Puedes buscar con Enter o el botón Buscar, navegar por ID con las flechas y elegir un Pokémon aleatorio entre los IDs 1 y 1025. Las formas alternativas tienen IDs especiales, por lo que no todos los IDs consecutivos existen; en ese caso se muestra un error y puedes realizar otra búsqueda.

## Verificación

```sh
npm run build
npm run lint
```

Prueba `pikachu`, `25`, `bulbasaur`, una búsqueda vacía y un nombre inexistente. El HTML y JavaScript originales en la carpeta superior se conservan como referencia; la versión React se ejecuta desde `my-app`.
