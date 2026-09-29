import { useEffect, useState } from "react";
import type { Pokemon } from "./types";
import { calcularMultiplicadores, tiposAtaque } from "./typeChart";
import type { Relaciones } from "./typeChart";
import "./WeaknessTree.css";

type TipoApi = { damage_relations: Relaciones };
const nombres: Record<string, string> = { normal: "Normal", fire: "Fuego", water: "Agua", electric: "Eléctrico", grass: "Planta", ice: "Hielo", fighting: "Lucha", poison: "Veneno", ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho", rock: "Roca", ghost: "Fantasma", dragon: "Dragón", dark: "Siniestro", steel: "Acero", fairy: "Hada" };
const cache = new Map<string, Relaciones>();

const grupos = [
  { factor: 4, titulo: "MUY DÉBIL", clase: "danger-high" },
  { factor: 2, titulo: "DÉBIL", clase: "danger" },
  { factor: 1, titulo: "DAÑO NORMAL", clase: "neutral" },
  { factor: .5, titulo: "RESISTE", clase: "resist" },
  { factor: .25, titulo: "RESISTE MUCHO", clase: "resist-high" },
  { factor: 0, titulo: "INMUNE", clase: "immune" },
] as const;

export function WeaknessTree({ pokemon }: { pokemon: Pokemon }) {
  const nombresTipos = pokemon.types.map((item) => item.type.name).join(",");
  const [estado, setEstado] = useState<{ tipos: string; relaciones: Relaciones[] | null; error: boolean }>({ tipos: nombresTipos, relaciones: null, error: false });
  const relaciones = estado.tipos === nombresTipos ? estado.relaciones : null;
  const error = estado.tipos === nombresTipos && estado.error;

  useEffect(() => {
    const controlador = new AbortController();
    async function cargar() {
      try {
        const datos = await Promise.all(pokemon.types.map(async ({ type }) => {
          const guardado = cache.get(type.name);
          if (guardado) return guardado;
          const respuesta = await fetch(type.url, { signal: controlador.signal });
          if (!respuesta.ok) throw new Error("No se pudo cargar la tabla de tipos");
          const tipo: TipoApi = await respuesta.json();
          cache.set(type.name, tipo.damage_relations);
          return tipo.damage_relations;
        }));
        if (!controlador.signal.aborted) setEstado({ tipos: nombresTipos, relaciones: datos, error: false });
      } catch {
        if (!controlador.signal.aborted) setEstado({ tipos: nombresTipos, relaciones: null, error: true });
      }
    }
    void cargar();
    return () => controlador.abort();
  }, [pokemon, nombresTipos]);

  const multiplicadores = relaciones ? calcularMultiplicadores(relaciones) : null;
  return <section className="weakness-tree" aria-label={`Árbol de debilidades de ${pokemon.name}`}>
    <div className="weakness-root"><span>◆ PERFIL DEFENSIVO</span><strong>{pokemon.name.replaceAll("-", " ").toUpperCase()}</strong><small>{pokemon.types.map((item) => nombres[item.type.name] ?? item.type.name).join(" / ")}</small></div>
    <p>Daño que recibe según el tipo del ataque. Los tipos dobles se multiplican; no incluye habilidades.</p>
    {!multiplicadores && <div className="weakness-loading">{error ? "NO SE PUDO CARGAR LA TABLA DE TIPOS" : "CALCULANDO DEBILIDADES..."}</div>}
    {multiplicadores && <div className="weakness-branches">{grupos.map((grupo) => {
      const tipos = tiposAtaque.filter((tipo) => multiplicadores[tipo] === grupo.factor);
      return <div className={`weakness-branch ${grupo.clase}`} key={grupo.factor}><div className="branch-label"><b>×{grupo.factor === .25 ? "¼" : grupo.factor === .5 ? "½" : grupo.factor}</b><span>{grupo.titulo}</span></div><div className="branch-types">{tipos.length ? tipos.map((tipo) => <span key={tipo}>{nombres[tipo]}</span>) : <em>NINGUNO</em>}</div></div>;
    })}</div>}
  </section>;
}
