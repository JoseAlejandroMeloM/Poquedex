import { useState } from "react";
import type { Especie, Pokemon } from "./types";
import { WeaknessTree } from "./WeaknessTree";
import "./Pokedex.css";

const regionesOrigen: Record<string, string> = {
  "generation-i": "Kanto", "generation-ii": "Johto", "generation-iii": "Hoenn",
  "generation-iv": "Sinnoh", "generation-v": "Teselia", "generation-vi": "Kalos",
  "generation-vii": "Alola", "generation-viii": "Galar", "generation-ix": "Paldea",
};

const nombresTipo: Record<string, string> = {
  normal: "Normal", fire: "Fuego", water: "Agua", electric: "Eléctrico", grass: "Planta",
  ice: "Hielo", fighting: "Lucha", poison: "Veneno", ground: "Tierra", flying: "Volador",
  psychic: "Psíquico", bug: "Bicho", rock: "Roca", ghost: "Fantasma", dragon: "Dragón",
  dark: "Siniestro", steel: "Acero", fairy: "Hada",
};
const nombresEstadistica: Record<string, string> = {
  hp: "PS", attack: "ATAQUE", defense: "DEFENSA", "special-attack": "AT. ESP.",
  "special-defense": "DEF. ESP.", speed: "VELOCIDAD",
};
const legible = (valor: string) => valor.replaceAll("-", " ");
const vacio = "No disponible en PokéAPI";
type Pestana = "perfil" | "combate" | "biologia" | "archivo";

export function Pokedex({ pokemon, especie, fase }: { pokemon: Pokemon; especie: Especie; fase: "foto" | "abrir" | "datos" }) {
  const [pestana, setPestana] = useState<Pestana>("perfil");
  const formaRegional = pokemon.name.match(/-(alola|galar|paldea|hisui)(?:$|-)/)?.[1];
  const regionOrigen = formaRegional
    ? ({ alola: "Alola", galar: "Galar", paldea: "Paldea", hisui: "Sinnoh" } as Record<string, string>)[formaRegional]
    : regionesOrigen[especie.generation.name] ?? "Kanto";
  const imagen = pokemon.sprites.front_default || pokemon.sprites.other?.["official-artwork"]?.front_default;
  const descripcion = especie.flavor_text_entries.find((item) => item.language.name === "es")?.flavor_text.replace(/[\n\f\r]/g, " ")
    ?? especie.flavor_text_entries.find((item) => item.language.name === "en")?.flavor_text.replace(/[\n\f\r]/g, " ") ?? vacio;
  const nombre = especie.names.find((item) => item.language.name === "es")?.name ?? pokemon.name;
  const categoria = especie.genera.find((item) => item.language.name === "es")?.genus ?? especie.genera.find((item) => item.language.name === "en")?.genus ?? vacio;
  const formas = especie.varieties.map((item) => item.pokemon.name);

  return (
    <div className={`pokedex-stage region-${regionOrigen.toLowerCase()} phase-${fase}`}>
      {fase === "foto" ? (
        <div className="photo-scene" aria-live="polite">
          <div className="photo-trainer" aria-hidden="true" />
          <div className="photo-dex" aria-hidden="true"><span>●</span><i /></div>
          {imagen && <img className="photo-target" src={imagen} alt="" />}
          <div className="photo-viewfinder" aria-hidden="true"><span>REC ●</span><b>+</b><small>NO. {String(pokemon.id).padStart(3, "0")}</small></div>
          <div className="photo-flash" aria-hidden="true" />
          <p>ASH REGISTRA A {pokemon.name.toUpperCase()} EN LA POKÉDEX...</p>
        </div>
      ) : (
        <div className="device-wrap">
          <div className="device-title">◆ POKÉDEX {regionOrigen.toUpperCase()} <span>GEN. {especie.generation.name.split("-").at(-1)?.toUpperCase()}</span></div>
          <div className="dex-device">
            <div className="device-lid" aria-hidden="true"><span className="device-lens" /><div className="device-lid-screen">{fase === "datos" ? `REGISTRO #${String(pokemon.id).padStart(4, "0")}` : "INICIANDO..."}</div><span className="device-light" /></div>
            <div className="device-hinge" aria-hidden="true" />
            <div className="device-base">
              <div className="device-screen">
                {fase === "abrir" ? <div className="device-boot">CARGANDO FICHA<span>▮ ▮ ▮</span></div> : (
                  <>
                    <div className="device-screen-head"><span>NO. {String(pokemon.id).padStart(4, "0")}</span><strong>{nombre.toUpperCase()}</strong><span>{regionOrigen.toUpperCase()}</span></div>
                    <div className="device-tabs" role="tablist" aria-label="Secciones de la Pokédex">
                      {([ ["perfil", "PERFIL"], ["combate", "COMBATE"], ["biologia", "BIOLOGÍA"], ["archivo", "ARCHIVO" ] ] as const).map(([id, texto]) => <button key={id} type="button" role="tab" aria-selected={pestana === id} onClick={() => setPestana(id)}>{texto}</button>)}
                    </div>
                    <div className="device-page" role="tabpanel">
                      {pestana === "perfil" && <>
                        <div className="profile-top"><div className="profile-sprite">{imagen && <img src={imagen} alt={nombre} />}</div><div className="profile-intro"><b>{categoria}</b><p>{descripcion}</p><div className="type-chips">{pokemon.types.map((item) => <span key={item.type.name}>{nombresTipo[item.type.name] ?? item.type.name}</span>)}</div></div></div>
                        <div className="info-tiles"><span>ALTURA <b>{(pokemon.height / 10).toFixed(1)} m</b></span><span>PESO <b>{(pokemon.weight / 10).toFixed(1)} kg</b></span><span>EXP. BASE <b>{pokemon.base_experience ?? "—"}</b></span><span>ORDEN <b>{pokemon.order}</b></span></div>
                        <h3>HABILIDADES</h3><div className="chip-list">{pokemon.abilities.map((item) => <span key={item.ability.name}>{legible(item.ability.name)}{item.is_hidden ? " ★ OCULTA" : ""}</span>)}</div>
                        <h3>ÍNDICES DE POKÉDEX</h3><div className="dex-indices">{especie.pokedex_numbers.map((item) => <span key={item.pokedex.name}>{legible(item.pokedex.name)} #{item.entry_number}</span>)}</div>
                      </>}
                      {pestana === "combate" && <>
                        <WeaknessTree pokemon={pokemon} />
                        <h3>ESTADÍSTICAS BASE <small>TOTAL {pokemon.stats.reduce((total, item) => total + item.base_stat, 0)}</small></h3>
                        <div className="stats-list">{pokemon.stats.map((item) => <div className="stat-row" key={item.stat.name}><span>{nombresEstadistica[item.stat.name] ?? legible(item.stat.name)}</span><div className="stat-track"><i style={{ width: `${Math.min(100, Math.round(item.base_stat / 255 * 100))}%` }} /></div><b>{item.base_stat}</b><small>EV {item.effort}</small></div>)}</div>
                        <h3>MOVIMIENTOS <small>{pokemon.moves.length} REGISTRADOS</small></h3><div className="move-list">{pokemon.moves.map((item) => <div key={item.move.name}><b>{legible(item.move.name)}</b><span>{item.version_group_details.length} métodos/versiones</span></div>)}</div>
                      </>}
                      {pestana === "biologia" && <>
                        <div className="info-tiles"><span>HÁBITAT <b>{especie.habitat ? legible(especie.habitat.name) : "—"}</b></span><span>FORMA <b>{especie.shape ? legible(especie.shape.name) : "—"}</b></span><span>COLOR <b>{legible(especie.color.name)}</b></span><span>CRECIMIENTO <b>{legible(especie.growth_rate.name)}</b></span><span>CAPTURA <b>{especie.capture_rate} / 255</b></span><span>AMISTAD <b>{especie.base_happiness ?? "—"}</b></span><span>ECLOSIÓN <b>{especie.hatch_counter ?? "—"} CICLOS</b></span><span>SEXO <b>{especie.gender_rate < 0 ? "SIN SEXO" : `${Math.round(especie.gender_rate / 8 * 100)}% ♀`}</b></span></div>
                        <h3>GRUPOS HUEVO</h3><div className="chip-list">{especie.egg_groups.map((item) => <span key={item.name}>{legible(item.name)}</span>)}</div>
                        <h3>CLASIFICACIÓN</h3><div className="chip-list"><span>{especie.is_baby ? "BEBÉ" : "NO BEBÉ"}</span><span>{especie.is_legendary ? "LEGENDARIO" : "NO LEGENDARIO"}</span><span>{especie.is_mythical ? "MÍTICO" : "NO MÍTICO"}</span></div>
                        <h3>EVOLUCIÓN Y VARIANTES</h3><p>Evoluciona de: {especie.evolves_from_species ? legible(especie.evolves_from_species.name) : "—"}</p><p>Cadena: {especie.evolution_chain?.url ?? "—"}</p><div className="chip-list">{formas.map((forma) => <span key={forma}>{legible(forma)}</span>)}</div>
                      </>}
                      {pestana === "archivo" && <>
                        <h3>OBJETOS QUE PUEDE LLEVAR</h3>{pokemon.held_items.length ? <div className="chip-list">{pokemon.held_items.map((item) => <span key={item.item.name}>{legible(item.item.name)} · {item.version_details.map((version) => `${legible(version.version.name)} ${version.rarity}%`).join(", ")}</span>)}</div> : <p>Sin objetos registrados.</p>}
                        <h3>FORMAS</h3><div className="chip-list">{pokemon.forms.map((item) => <span key={item.name}>{legible(item.name)}</span>)}</div>
                        <h3>ÍNDICES DE JUEGO</h3><div className="dex-indices">{pokemon.game_indices.map((item) => <span key={item.version.name}>{legible(item.version.name)} #{item.game_index}</span>)}</div>
                        <h3>SONIDOS</h3><div className="cry-buttons">{pokemon.cries?.latest && <audio controls src={pokemon.cries.latest}>Grito actual</audio>}{pokemon.cries?.legacy && <audio controls src={pokemon.cries.legacy}>Grito clásico</audio>}</div>
                        <h3>SPRITES</h3><div className="sprite-gallery">{([ ["Frente", pokemon.sprites.front_default], ["Shiny", pokemon.sprites.front_shiny], ["Espalda", pokemon.sprites.back_default], ["Espalda shiny", pokemon.sprites.back_shiny] ] as const).filter((item) => item[1]).map(([label, url]) => <figure key={label}><img src={url!} alt={label} /><figcaption>{label}</figcaption></figure>)}</div>
                        <details className="raw-data"><summary>DATOS COMPLETOS DE POKÉAPI (JSON)</summary><p>Pokémon, movimientos con métodos/versiones y datos de especie originales, sin omitir campos.</p><pre>{JSON.stringify({ pokemon, especie }, null, 2)}</pre></details>
                      </>}
                    </div>
                  </>
                )}
              </div>
              <div className="device-controls" aria-hidden="true"><span className="control-cross">✚</span><span className="control-buttons">● ●</span><span className="control-slot">▰ ▰ ▰</span></div>
            </div>
          </div>
          <p className="device-caption">{fase === "abrir" ? "ABRIENDO POKÉDEX..." : `FICHA CAPTURADA · MODELO ${regionOrigen.toUpperCase()}`}</p>
        </div>
      )}
    </div>
  );
}
