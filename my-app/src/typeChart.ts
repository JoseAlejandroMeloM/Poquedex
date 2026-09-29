import type { Recurso } from "./types";

export type Relaciones = {
  no_damage_from: Recurso[];
  half_damage_from: Recurso[];
  double_damage_from: Recurso[];
};

export type Multiplicador = 0 | .25 | .5 | 1 | 2 | 4;

export const tiposAtaque = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];

export function calcularMultiplicadores(relaciones: Relaciones[]): Record<string, Multiplicador> {
  return Object.fromEntries(tiposAtaque.map((ataque) => {
    const factor = relaciones.reduce((producto, relacion) => {
      if (relacion.no_damage_from.some((tipo) => tipo.name === ataque)) return 0;
      if (relacion.double_damage_from.some((tipo) => tipo.name === ataque)) return producto * 2;
      if (relacion.half_damage_from.some((tipo) => tipo.name === ataque)) return producto * .5;
      return producto;
    }, 1);
    return [ataque, factor];
  })) as Record<string, Multiplicador>;
}
