import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, PointerEvent } from "react";
import type { Especie, Pokemon } from "./types";
import { Pokedex } from "./Pokedex";
import "./App.css";

type Vista = "pueblo" | "atlas" | "equipo";
type Lugar = "laboratorio" | "casa" | "terminal";
type Direccion = "down" | "left" | "right" | "up";
type Posicion = { x: number; y: number };

const regiones = [
  { nombre: "Galar", color: "#80b977", camino: "M70 90h32V50h24v24h16v32h-12v20h12v32h-16v24H96v-24H82v-30H70z", x: 106, y: 139, lugares: "Pueblo Par · Ciudad Artejo" },
  { nombre: "Kalos", color: "#b6c971", camino: "M226 90h16V70h34V60h36v20h28v24h-12v34h-20v22h-58v-16h-24v-26h-12z", x: 278, y: 123, lugares: "Pueblo Boceto · Ciudad Luminalia" },
  { nombre: "Sinnoh", color: "#8cc5ab", camino: "M440 78h32V60h34V42h26v20h32v28h-18v24h-16v28h-70v-16h-22v-25h-16z", x: 494, y: 104, lugares: "Pueblo Hojaverde · Ciudad Jubileo" },
  { nombre: "Kanto", color: "#91c476", camino: "M85 230h20v-18h38v-18h44v18h30v30h-14v34h-23v18h-58v-20H92v-26H76z", x: 147, y: 251, lugares: "Pueblo Paleta · Ciudad Celeste" },
  { nombre: "Johto", color: "#c0ca6f", camino: "M245 217h20v-23h42v-16h35v20h27v28h-15v27h-18v26h-65v-18h-30v-24z", x: 305, y: 236, lugares: "Pueblo Primavera · Ciudad Trigal" },
  { nombre: "Teselia", color: "#91c29c", camino: "M500 220h23v-18h43v16h30v27h-14v27h-20v24h-46v-20h-28v-27h-15z", x: 541, y: 251, lugares: "Pueblo Arcilla · Ciudad Porcelana" },
  { nombre: "Hoenn", color: "#a5c97d", camino: "M70 365h32v-18h54v-22h32v27h22v31h-18v28h-23v16H96v-22H62v-25z", x: 138, y: 384, lugares: "Villa Raíz · Ciudad Portual" },
  { nombre: "Paldea", color: "#b9c77a", camino: "M297 345h26v-23h55v-15h43v23h26v32h-20v28h-24v22h-72v-22h-34v-24z", x: 371, y: 362, lugares: "Pueblo Cahíz · Ciudad Meseta" },
  { nombre: "Alola", color: "#91c88f", camino: "M618 350h28v18h20v24h-18v16h-30v-15h-15v-24z M672 396h27v20h-12v19h-29v-16h-13v-16z M583 414h22v20h-11v17h-25v-18h-11v-13z", x: 635, y: 389, lugares: "Pueblo Lilii · Ciudad Hauoli" },
];

// Los caminos también definen por dónde puede desplazarse el entrenador.
const rutasMapa: Posicion[][] = [
  [{ x: 147, y: 251 }, { x: 106, y: 251 }, { x: 106, y: 139 }],
  [{ x: 147, y: 251 }, { x: 305, y: 251 }, { x: 305, y: 236 }],
  [{ x: 147, y: 251 }, { x: 147, y: 384 }, { x: 138, y: 384 }],
  [{ x: 305, y: 236 }, { x: 305, y: 123 }, { x: 278, y: 123 }],
  [{ x: 278, y: 123 }, { x: 494, y: 123 }, { x: 494, y: 104 }],
  [{ x: 305, y: 236 }, { x: 541, y: 236 }, { x: 541, y: 251 }],
  [{ x: 305, y: 236 }, { x: 305, y: 362 }, { x: 371, y: 362 }],
  [{ x: 371, y: 362 }, { x: 635, y: 362 }, { x: 635, y: 389 }],
];
const caminosSvg = rutasMapa.map((ruta) => `M${ruta.map((punto) => `${punto.x} ${punto.y}`).join("L")}`).join(" ");
const generacionesPorRegion: Record<string, number> = { Kanto: 1, Johto: 2, Hoenn: 3, Sinnoh: 4, Teselia: 5, Kalos: 6, Alola: 7, Galar: 8, Paldea: 9 };

function distanciaASegmento(punto: Posicion, inicio: Posicion, fin: Posicion) {
  const dx = fin.x - inicio.x;
  const dy = fin.y - inicio.y;
  const fraccion = Math.max(0, Math.min(1, ((punto.x - inicio.x) * dx + (punto.y - inicio.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(punto.x - inicio.x - fraccion * dx, punto.y - inicio.y - fraccion * dy);
}

function puedeCaminarEnMapa(punto: Posicion) {
  if (regiones.some((item) => Math.hypot(punto.x - item.x, punto.y - item.y) < 38)) return true;
  return rutasMapa.some((ruta) => ruta.slice(1).some((fin, indice) => distanciaASegmento(punto, ruta[indice], fin) < 18));
}

const equipo = [
  { id: 1, nombre: "Bulbasaur", tipo: "Planta" },
  { id: 4, nombre: "Charmander", tipo: "Fuego" },
  { id: 7, nombre: "Squirtle", tipo: "Agua" },
  { id: 25, nombre: "Pikachu", tipo: "Eléctrico" },
];

type EntradaRegional = { id: number; nombre: string };
type Generacion = { pokemon_species: { name: string; url: string }[] };

function lugarCercano({ x, y }: Posicion): Lugar | null {
  if (Math.abs(x - 50) < 13 && y >= 32 && y < 49) return "laboratorio";
  if (x > 12 && x < 36 && y > 55 && y < 72) return "casa";
  if (x > 64 && x < 88 && y > 55 && y < 72) return "terminal";
  return null;
}

function chocaConEdificio(x: number, y: number) {
  return (
    (x > 33 && x < 67 && y < 37) ||
    (x > 12 && x < 36 && y > 33 && y < 58) ||
    (x > 64 && x < 88 && y > 33 && y < 58) ||
    ((x < 11 || x > 89) && y > 37 && y < 61)
  );
}

function App() {
  const [vista, setVista] = useState<Vista>("pueblo");
  const [posicion, setPosicion] = useState<Posicion>({ x: 50, y: 79 });
  const posicionRef = useRef(posicion);
  const teclas = useRef(new Set<string>());
  const recorrido = useRef<Posicion[]>([]);
  const [direccion, setDireccion] = useState<Direccion>("down");
  const [caminando, setCaminando] = useState(false);
  const [region, setRegion] = useState("Kanto");
  const [posicionMapa, setPosicionMapa] = useState<Posicion>({ x: 147, y: 251 });
  const posicionMapaRef = useRef<Posicion>({ x: 147, y: 251 });
  const [caminandoMapa, setCaminandoMapa] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [consulta, setConsulta] = useState("");
  const [intento, setIntento] = useState(0);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [especie, setEspecie] = useState<Especie | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mostrarFicha, setMostrarFicha] = useState(false);
  const [revelando, setRevelando] = useState(false);
  const [faseDex, setFaseDex] = useState<"foto" | "abrir" | "datos">("datos");
  const [catalogo, setCatalogo] = useState<EntradaRegional[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [errorCatalogo, setErrorCatalogo] = useState("");
  const [intentoCatalogo, setIntentoCatalogo] = useState(0);
  const cacheCatalogo = useRef(new Map<string, EntradaRegional[]>());
  const temporizadoresDex = useRef<number[]>([]);
  const buscarRef = useRef<HTMLInputElement>(null);
  const enfocarBusqueda = useRef(false);
  const temporizadorRevelacion = useRef<number | null>(null);
  const sonidoPokemon = useRef<HTMLAudioElement | null>(null);

  const cercano = lugarCercano(posicion);
  const regionActual = regiones.find((item) => item.nombre === region) ?? regiones[3];

  function limpiarAnimaciones() {
    if (temporizadorRevelacion.current !== null) window.clearTimeout(temporizadorRevelacion.current);
    temporizadoresDex.current.forEach((temporizador) => window.clearTimeout(temporizador));
    temporizadoresDex.current = [];
    sonidoPokemon.current?.pause();
    sonidoPokemon.current = null;
  }

  function entrar(lugar: Lugar | null) {
    if (!lugar) return;
    teclas.current.clear();
    recorrido.current = [];
    setCaminando(false);
    if (lugar === "casa") {
      setVista("equipo");
      return;
    }
    enfocarBusqueda.current = lugar === "terminal";
    setVista("atlas");
  }

  function pulsarEdificio(lugar: Lugar) {
    if (lugarCercano(posicionRef.current) === lugar) { entrar(lugar); return; }
    const entrada = lugar === "laboratorio" ? { x: 50, y: 43 } : lugar === "casa" ? { x: 23, y: 65 } : { x: 77, y: 65 };
    // La fila inferior es un pasillo libre: primero salimos a él y luego subimos a la puerta.
    recorrido.current = [
      { x: posicionRef.current.x, y: 75 },
      { x: entrada.x, y: 75 },
      entrada,
    ];
  }

  function volverAlPueblo() {
    limpiarAnimaciones();
    setVista("pueblo");
    setMostrarFicha(false);
    setRevelando(false);
    setFaseDex("datos");
    setCargando(false);
    setConsulta("");
  }

  useEffect(() => {
    if (vista !== "pueblo") return;
    const teclasEnVista = teclas.current;
    let frame = 0;
    let tiempoAnterior = performance.now();
    const mover = (ahora: number) => {
      const paso = Math.min((ahora - tiempoAnterior) / 16.67, 2);
      tiempoAnterior = ahora;
      const pulsadas = teclas.current;
      let dx = Number(pulsadas.has("d") || pulsadas.has("arrowright")) - Number(pulsadas.has("a") || pulsadas.has("arrowleft"));
      let dy = Number(pulsadas.has("s") || pulsadas.has("arrowdown")) - Number(pulsadas.has("w") || pulsadas.has("arrowup"));
      if (!dx && !dy && recorrido.current.length) {
        const destino = recorrido.current[0];
        const faltaX = destino.x - posicionRef.current.x;
        const faltaY = destino.y - posicionRef.current.y;
        if (Math.abs(faltaX) < .45 && Math.abs(faltaY) < .45) recorrido.current.shift();
        else if (Math.abs(faltaX) >= Math.abs(faltaY)) dx = Math.sign(faltaX);
        else dy = Math.sign(faltaY);
        if (dy < 0) setDireccion("up");
        if (dy > 0) setDireccion("down");
        if (dx < 0) setDireccion("left");
        if (dx > 0) setDireccion("right");
      }
      setCaminando(dx !== 0 || dy !== 0);
      if (dx || dy) {
        if (dx && dy) { dx *= 0.707; dy *= 0.707; }
        const anterior = posicionRef.current;
        const x = Math.max(5, Math.min(95, anterior.x + dx * 0.3 * paso));
        const y = Math.max(28, Math.min(90, anterior.y + dy * 0.27 * paso));
        const siguienteX = chocaConEdificio(x, anterior.y) ? anterior.x : x;
        const siguienteY = chocaConEdificio(siguienteX, y) ? anterior.y : y;
        if (siguienteX !== anterior.x || siguienteY !== anterior.y) {
          const siguiente = { x: siguienteX, y: siguienteY };
          posicionRef.current = siguiente;
          setPosicion(siguiente);
        }
      }
      frame = requestAnimationFrame(mover);
    };
    const presionar = (evento: KeyboardEvent) => {
      const tecla = evento.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(tecla)) {
        evento.preventDefault();
        recorrido.current = [];
        teclas.current.add(tecla);
        if (tecla === "w" || tecla === "arrowup") setDireccion("up");
        if (tecla === "a" || tecla === "arrowleft") setDireccion("left");
        if (tecla === "s" || tecla === "arrowdown") setDireccion("down");
        if (tecla === "d" || tecla === "arrowright") setDireccion("right");
      }
      if (tecla === "e" && !evento.repeat) entrar(lugarCercano(posicionRef.current));
    };
    const soltar = (evento: KeyboardEvent) => teclas.current.delete(evento.key.toLowerCase());
    const pausar = () => teclas.current.clear();
    frame = requestAnimationFrame(mover);
    window.addEventListener("keydown", presionar);
    window.addEventListener("keyup", soltar);
    window.addEventListener("blur", pausar);
    return () => {
      cancelAnimationFrame(frame);
      teclasEnVista.clear();
      window.removeEventListener("keydown", presionar);
      window.removeEventListener("keyup", soltar);
      window.removeEventListener("blur", pausar);
    };
  }, [vista]);

  useEffect(() => {
    if (vista !== "atlas" || mostrarFicha) return;
    const teclasEnVista = teclas.current;
    let frame = 0;
    let tiempoAnterior = performance.now();
    const mover = (ahora: number) => {
      const paso = Math.min((ahora - tiempoAnterior) / 16.67, 2);
      tiempoAnterior = ahora;
      let dx = Number(teclas.current.has("d") || teclas.current.has("arrowright")) - Number(teclas.current.has("a") || teclas.current.has("arrowleft"));
      let dy = Number(teclas.current.has("s") || teclas.current.has("arrowdown")) - Number(teclas.current.has("w") || teclas.current.has("arrowup"));
      setCaminandoMapa(dx !== 0 || dy !== 0);
      if (dx || dy) {
        if (dx && dy) { dx *= .707; dy *= .707; }
        const anterior = posicionMapaRef.current;
        const candidato = { x: Math.max(25, Math.min(735, anterior.x + dx * 1.35 * paso)), y: Math.max(25, Math.min(445, anterior.y + dy * 1.35 * paso)) };
        const siguiente = puedeCaminarEnMapa(candidato) ? candidato
          : puedeCaminarEnMapa({ x: candidato.x, y: anterior.y }) ? { x: candidato.x, y: anterior.y }
          : puedeCaminarEnMapa({ x: anterior.x, y: candidato.y }) ? { x: anterior.x, y: candidato.y }
          : anterior;
        if (siguiente !== anterior) {
          posicionMapaRef.current = siguiente;
          setPosicionMapa(siguiente);
          const llegada = regiones.find((item) => Math.hypot(siguiente.x - item.x, siguiente.y - item.y) < 23);
          if (llegada) setRegion((actual) => actual === llegada.nombre ? actual : llegada.nombre);
        }
      }
      frame = requestAnimationFrame(mover);
    };
    const presionar = (evento: KeyboardEvent) => {
      if (evento.target instanceof HTMLElement && (evento.target.closest("input, textarea, [contenteditable='true']"))) return;
      const tecla = evento.key.toLowerCase();
      if (!["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(tecla)) return;
      evento.preventDefault();
      teclas.current.add(tecla);
      if (tecla === "w" || tecla === "arrowup") setDireccion("up");
      if (tecla === "a" || tecla === "arrowleft") setDireccion("left");
      if (tecla === "s" || tecla === "arrowdown") setDireccion("down");
      if (tecla === "d" || tecla === "arrowright") setDireccion("right");
    };
    const soltar = (evento: KeyboardEvent) => teclas.current.delete(evento.key.toLowerCase());
    const pausar = () => teclas.current.clear();
    frame = requestAnimationFrame(mover);
    window.addEventListener("keydown", presionar);
    window.addEventListener("keyup", soltar);
    window.addEventListener("blur", pausar);
    return () => { cancelAnimationFrame(frame); teclasEnVista.clear(); window.removeEventListener("keydown", presionar); window.removeEventListener("keyup", soltar); window.removeEventListener("blur", pausar); };
  }, [vista, mostrarFicha]);

  useEffect(() => {
    if (vista !== "atlas") return;
    const cached = cacheCatalogo.current.get(region);
    if (cached) { setCatalogo(cached); setErrorCatalogo(""); setCargandoCatalogo(false); return; }
    const controlador = new AbortController();
    setCatalogo([]);
    setCargandoCatalogo(true);
    setErrorCatalogo("");
    async function cargarCatalogo() {
      try {
        const respuesta = await fetch(`https://pokeapi.co/api/v2/generation/${generacionesPorRegion[region]}/`, { signal: controlador.signal });
        if (!respuesta.ok) throw new Error("No se pudo cargar la generación de la región");
        const datos: Generacion = await respuesta.json();
        const lista = datos.pokemon_species.map((especie) => ({ id: Number(especie.url.match(/\/(\d+)\/$/)?.[1]), nombre: especie.name })).filter((entrada) => entrada.id > 0).sort((a, b) => a.id - b.id);
        if (!controlador.signal.aborted) { cacheCatalogo.current.set(region, lista); setCatalogo(lista); }
      } catch (problema) {
        if (!controlador.signal.aborted) setErrorCatalogo(problema instanceof Error ? problema.message : "Error al cargar la región");
      } finally { if (!controlador.signal.aborted) setCargandoCatalogo(false); }
    }
    void cargarCatalogo();
    return () => controlador.abort();
  }, [region, vista, intentoCatalogo]);

  useEffect(() => {
    if (vista === "atlas" && enfocarBusqueda.current) {
      buscarRef.current?.focus();
      enfocarBusqueda.current = false;
    }
  }, [vista]);

  useEffect(() => {
    if (vista === "pueblo") return;
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key !== "Escape") return;
      if (mostrarFicha) { limpiarAnimaciones(); setMostrarFicha(false); setRevelando(false); }
      else volverAlPueblo();
    };
    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [vista, mostrarFicha]);

  useEffect(() => {
    if (!consulta || vista !== "atlas") return;
    const controlador = new AbortController();
    async function cargarPokemon() {
      limpiarAnimaciones();
      setRevelando(false);
      setFaseDex("datos");
      setCargando(true);
      setError("");
      setPokemon(null);
      setEspecie(null);
      try {
        let respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(consulta)}`, { signal: controlador.signal });
        let especiePrevia: Especie | null = null;
        if (respuesta.status === 404) {
          const respuestaPorEspecie = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${encodeURIComponent(consulta)}/`, { signal: controlador.signal });
          if (respuestaPorEspecie.ok) {
            especiePrevia = await respuestaPorEspecie.json() as Especie;
            const forma = especiePrevia?.varieties.find((item) => item.is_default)?.pokemon ?? especiePrevia?.varieties[0]?.pokemon;
            if (forma) respuesta = await fetch(forma.url, { signal: controlador.signal });
          }
        }
        if (!respuesta.ok) throw new Error(respuesta.status === 404 ? "NO SE ENCONTRÓ ESE POKÉMON" : "POKÉAPI NO RESPONDE. INTÉNTALO DE NUEVO");
        const datos: Pokemon = await respuesta.json();
        let datosEspecie = especiePrevia;
        if (!datosEspecie) {
          const respuestaEspecie = await fetch(datos.species.url, { signal: controlador.signal });
          if (!respuestaEspecie.ok) throw new Error("NO SE PUDO CARGAR LA ESPECIE");
          datosEspecie = await respuestaEspecie.json() as Especie;
        }
        if (!controlador.signal.aborted) {
          setPokemon(datos);
          setEspecie(datosEspecie);
          setRevelando(true);
          const grito = datos.cries?.latest ?? datos.cries?.legacy;
          if (grito) {
            const audio = new Audio(grito);
            audio.preload = "auto";
            audio.volume = .65;
            sonidoPokemon.current = audio;
            temporizadoresDex.current.push(window.setTimeout(() => {
              void audio.play().catch(() => { /* El navegador puede bloquear la reproducción automática. */ });
            }, 1150));
          }
          temporizadorRevelacion.current = window.setTimeout(() => {
            setRevelando(false);
            setFaseDex("foto");
            temporizadoresDex.current.push(
              window.setTimeout(() => setFaseDex("abrir"), 1650),
              window.setTimeout(() => setFaseDex("datos"), 2600),
            );
          }, 1900);
        }
      } catch (problema) {
        if (!controlador.signal.aborted) setError(problema instanceof TypeError ? "SIN CONEXIÓN CON POKÉAPI" : problema instanceof Error ? problema.message : "ERROR DE BÚSQUEDA");
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }
    void cargarPokemon();
    return () => controlador.abort();
  }, [consulta, intento, vista]);

  useEffect(() => () => {
    limpiarAnimaciones();
  }, []);

  const consultarPokemon = useCallback((nombre: string) => {
    setBusqueda(nombre);
    setConsulta(nombre);
    setIntento((actual) => actual + 1);
    setMostrarFicha(true);
    setFaseDex("datos");
  }, []);

  const tarjetasCatalogo = useMemo(() => catalogo.map((entrada) => <button className="roster-card" type="button" key={entrada.id} onClick={() => consultarPokemon(entrada.nombre)} aria-label={`Consultar ${entrada.nombre}`}><img loading="lazy" src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entrada.id}.png`} alt="" /><span>{entrada.nombre.replaceAll("-", " ").toUpperCase()}</span></button>), [catalogo, consultarPokemon]);

  function buscarPokemon(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const termino = busqueda.trim().toLowerCase();
    setMostrarFicha(true);
    if (!termino) { setPokemon(null); setError("ESCRIBE UN NOMBRE O NÚMERO"); return; }
    setConsulta(termino);
    setIntento((actual) => actual + 1);
  }

  function consultarEquipo(nombre: string) {
    consultarPokemon(nombre.toLowerCase());
    setVista("atlas");
  }

  function iniciarControl(evento: PointerEvent<HTMLButtonElement>, tecla: string, nuevaDireccion: Direccion) {
    evento.currentTarget.setPointerCapture(evento.pointerId);
    teclas.current.add(tecla);
    setDireccion(nuevaDireccion);
  }

  const imagen = pokemon?.sprites.other["official-artwork"].front_default || pokemon?.sprites.front_default;

  return (
    <main className="game-shell" aria-label="Pokéaventura">
      <div className="game-screen">
        {vista === "pueblo" && (
          <section className="village-view" aria-label="Pueblo Paleta">
            <div className="ground-tiles" aria-hidden="true" />
            <div className="grass-patch grass-left" aria-hidden="true" /><div className="grass-patch grass-right" aria-hidden="true" />
            <div className="plaza-path" aria-hidden="true" /><div className="flower-pixels flowers-left" aria-hidden="true" /><div className="flower-pixels flowers-right" aria-hidden="true" />
            <div className="world-tree tree-one" aria-hidden="true"><i /></div><div className="world-tree tree-two" aria-hidden="true"><i /></div><div className="world-tree tree-three" aria-hidden="true"><i /></div>
            <div className="village-hud"><span>◆ PUEBLO PALETA</span><span>☀ DÍA 01</span></div>

            <button className="pixel-building building-lab" type="button" onClick={() => pulsarEdificio("laboratorio")} aria-label="Laboratorio: abre el atlas al acercarte">
              <span className="building-roof" /><span className="building-body"><span className="building-window" /><b>MAPA</b><span className="building-window" /><span className="building-door" /></span>
            </button>
            <button className="pixel-building building-team" type="button" onClick={() => pulsarEdificio("casa")} aria-label="Casa del equipo: abre el equipo al acercarte">
              <span className="building-roof" /><span className="building-body"><span className="building-window" /><b>EQUIPO</b><span className="building-door" /></span>
            </button>
            <button className="pixel-building building-dex" type="button" onClick={() => pulsarEdificio("terminal")} aria-label="Terminal Pokédex: busca Pokémon al acercarte">
              <span className="building-roof" /><span className="building-body"><span className="building-window" /><b>DEX</b><span className="building-door" /></span>
            </button>

            <div className="trainer-shadow" style={{ left: `${posicion.x}%`, top: `calc(${posicion.y}% + var(--trainer-shadow-offset, 27px))` }} />
            <div className={`trainer-sprite facing-${direccion} ${caminando ? "walking" : ""}`} role="img" aria-label="Entrenador" style={{ left: `${posicion.x}%`, top: `${posicion.y}%` }} />

            {cercano && (
              <div className="interaction-menu" role="region" aria-label="Acción disponible">
                <span className="dialog-caret">▶</span>
                <div><span className="menu-kicker">¡HAS LLEGADO!</span><strong>{cercano === "laboratorio" ? "LABORATORIO" : cercano === "casa" ? "CASA DEL EQUIPO" : "TERMINAL POKÉDEX"}</strong><small>{cercano === "laboratorio" ? "Consulta las regiones del mundo." : cercano === "casa" ? "Mira a tus compañeros." : "Busca cualquier Pokémon."}</small></div>
                <button type="button" onClick={() => entrar(cercano)}>{cercano === "laboratorio" ? "ABRIR MAPA" : cercano === "casa" ? "VER EQUIPO" : "BUSCAR"} <span>↵</span></button>
                <span className="menu-key">E</span>
              </div>
            )}
            <div className="game-help">WASD / FLECHAS · CAMINAR &nbsp; E · INTERACTUAR</div>
            <div className="touch-controls" aria-label="Controles táctiles">
              {([ ["w", "up", "▲", "Arriba"], ["a", "left", "◀", "Izquierda"], ["s", "down", "▼", "Abajo"], ["d", "right", "▶", "Derecha"] ] as const).map(([tecla, dir, signo, nombre]) => (
                <button key={tecla} type="button" aria-label={`Caminar ${nombre}`} onPointerDown={(evento) => iniciarControl(evento, tecla, dir)} onPointerUp={() => teclas.current.delete(tecla)} onPointerCancel={() => teclas.current.delete(tecla)}>{signo}</button>
              ))}
            </div>
          </section>
        )}

        {vista === "atlas" && (
          <section className="atlas-view" aria-label="Atlas Pokémon">
            <header className="screen-bar"><button type="button" onClick={volverAlPueblo}>◀ PUEBLO</button><strong>ATLAS POKÉMON</strong><span>● CONECTADO</span></header>
            <form className="pixel-search" onSubmit={buscarPokemon}>
              <label htmlFor="pokemon-search">BUSCAR POKÉMON</label>
              <input ref={buscarRef} id="pokemon-search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Nombre o número..." autoComplete="off" />
              <button type="submit" disabled={cargando}>{cargando ? "..." : "BUSCAR ▶"}</button>
            </form>
            <div className="atlas-scroll">
            <div className="map-display" tabIndex={0} aria-label="Mapa caminable; usa WASD o las flechas" onPointerDown={(evento) => evento.currentTarget.focus()}>
              <svg viewBox="0 0 768 470" className="pixel-map" role="group" aria-label="Mapa transitable de nueve regiones" shapeRendering="crispEdges">
                <defs>
                  <pattern id="sea-pixels" width="32" height="32" patternUnits="userSpaceOnUse"><rect x="3" y="6" width="9" height="3" fill="#72bbca" opacity=".45" /><rect x="22" y="23" width="6" height="3" fill="#72bbca" opacity=".38" /></pattern>
                  <pattern id="land-pixels" width="26" height="26" patternUnits="userSpaceOnUse"><rect x="1" y="3" width="9" height="8" fill="#f6eaa2" opacity=".38" /><rect x="16" y="18" width="7" height="5" fill="#528d56" opacity=".38" /></pattern>
                  {regiones.map((item) => <clipPath id={`clip-${item.nombre}`} key={item.nombre}><path d={item.camino} /></clipPath>)}
                </defs>
                <rect width="768" height="470" fill="#3489a7" /><rect width="768" height="470" fill="url(#sea-pixels)" />
                <path className="map-routes" d={caminosSvg} />
                {regiones.map((item) => (
                  <g key={item.nombre} className={`map-region ${region === item.nombre ? "selected" : ""}`} aria-label={item.nombre}>
                    <path d={item.camino} fill={item.color} /><path d={item.camino} fill="url(#land-pixels)" stroke="none" />
                    <g clipPath={`url(#clip-${item.nombre})`} className="map-terrain" aria-hidden="true">
                      <rect x={item.x - 28} y={item.y - 42} width="9" height="13" fill="#337552" /><rect x={item.x - 18} y={item.y - 37} width="9" height="10" fill="#337552" />
                      <rect x={item.x + 24} y={item.y + 18} width="10" height="11" fill="#4a8952" /><rect x={item.x + 35} y={item.y + 25} width="8" height="8" fill="#4a8952" />
                      <rect x={item.x - 4} y={item.y - 24} width="12" height="8" fill="#e9d2a0" /><rect x={item.x} y={item.y - 28} width="4" height="4" fill="#fff0c5" />
                    </g>
                    <rect className="map-town" x={item.x - 4} y={item.y + 12} width="9" height="9" /><text x={item.x} y={item.y + 3}>{item.nombre.toUpperCase()}</text>
                  </g>
                ))}
                <foreignObject x={posicionMapa.x - 22} y={posicionMapa.y - 42} width="44" height="52" className="map-player" aria-label={`Entrenador caminando por ${region}`}>
                  <div className={`map-trainer facing-${direccion} ${caminandoMapa ? "walking" : ""}`} />
                </foreignObject>
                <text className="sea-label" x="606" y="75">MAR AZUL</text><text className="sea-label" x="29" y="460">RUTAS DEL MUNDO</text>
              </svg>
              <div className="map-walk-help">WASD / FLECHAS · CAMINA POR LAS RUTAS</div>
              <div className="map-touch-controls touch-controls" aria-label="Caminar por el mapa">
                {([ ["w", "up", "▲", "Arriba"], ["a", "left", "◀", "Izquierda"], ["s", "down", "▼", "Abajo"], ["d", "right", "▶", "Derecha"] ] as const).map(([tecla, dir, signo, nombre]) => (
                  <button key={tecla} type="button" aria-label={`Caminar ${nombre} en el mapa`} onPointerDown={(evento) => iniciarControl(evento, tecla, dir)} onPointerUp={() => teclas.current.delete(tecla)} onPointerCancel={() => teclas.current.delete(tecla)}>{signo}</button>
                ))}
              </div>
            </div>
            <div className="map-dialog" aria-live="polite"><div><span className="menu-kicker">REGIÓN ALCANZADA</span><h2>{regionActual.nombre.toUpperCase()}</h2><p>{regionActual.lugares}</p></div><span className="map-dialog-help">CAMINA HASTA OTRA REGIÓN PARA EXPLORARLA ▶</span></div>
            <section className="region-roster" aria-label={`Pokémon de ${region}`}>
              <div className="roster-heading"><div><span>◆ ESPECIES ORIGINARIAS</span><h2>POKÉMON DE {region.toUpperCase()}</h2></div><strong>{cargandoCatalogo ? "CARGANDO..." : `${catalogo.length} ESPECIES`}</strong></div>
              <p>Especies introducidas en {region}. Selecciona una para registrarla en la Pokédex.</p>
              {errorCatalogo && <div className="roster-error" role="alert">{errorCatalogo} <button type="button" onClick={() => setIntentoCatalogo((actual) => actual + 1)}>REINTENTAR</button></div>}
              {cargandoCatalogo && <div className="roster-loading">CONSULTANDO POKÉAPI...</div>}
              <div className="roster-grid">{tarjetasCatalogo}</div>
            </section>
            </div>

            {mostrarFicha && (
              <section className="dex-overlay" role="dialog" aria-label="Ficha Pokédex">
                <div className="dex-heading"><span>◆ POKÉDEX / REGISTRO</span><button type="button" onClick={() => { limpiarAnimaciones(); setMostrarFicha(false); setRevelando(false); }} aria-label="Cerrar ficha">×</button></div>
                {cargando && <div className="dex-message">BUSCANDO EN POKÉAPI<span className="loading-dots">...</span></div>}
                {error && !cargando && <div className="dex-message error" role="alert">{error}</div>}
                {pokemon && especie && !cargando && !error && !revelando && <Pokedex key={pokemon.id} pokemon={pokemon} especie={especie} fase={faseDex} />}
                {revelando && pokemon && imagen && (
                  <div className="reveal-scene" aria-label={`Aparece ${pokemon.name}`}>
                    <div className="reveal-trainer" aria-hidden="true" />
                    <div className="reveal-ball" aria-hidden="true"><i /></div>
                    <div className="reveal-burst" aria-hidden="true">✦</div>
                    <img src={imagen} alt="" className="reveal-pokemon" />
                    <strong>¡{pokemon.name.toUpperCase()}!</strong>
                  </div>
                )}
              </section>
            )}
          </section>
        )}

        {vista === "equipo" && (
          <section className="team-view" aria-label="Equipo Pokémon">
            <header className="screen-bar"><button type="button" onClick={volverAlPueblo}>◀ PUEBLO</button><strong>TU EQUIPO</strong><span>04 / 06</span></header>
            <div className="team-panel"><div className="team-heading"><span>◆ COMPAÑEROS</span><h1>EL EQUIPO</h1><p>Selecciona uno para abrir su ficha en la Pokédex.</p></div><div className="team-grid">{equipo.map((item) => <button type="button" className="team-card" key={item.id} onClick={() => consultarEquipo(item.nombre)}><img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`} alt="" /><span><small>NO. {String(item.id).padStart(3, "0")}</small><strong>{item.nombre.toUpperCase()}</strong><em>{item.tipo.toUpperCase()}</em></span><b>▶</b></button>)}</div><div className="team-bottom">● ● ● ● ○ ○ <span>4 DE 6 ESPACIOS</span></div></div>
          </section>
        )}
      </div>
      <div className="game-frame-footer" aria-hidden="true"><span>POKÉAVENTURA</span><span>■ ■ ▬ ▬</span></div>
    </main>
  );
}

export default App;
