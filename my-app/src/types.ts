export type Recurso = { name: string; url: string };
export type Estadistica = { base_stat: number; stat: { name: string } };

export type Pokemon = {
  id: number;
  name: string;
  order: number;
  height: number;
  weight: number;
  base_experience: number | null;
  is_default: boolean;
  species: Recurso;
  types: { slot: number; type: Recurso }[];
  stats: { base_stat: number; effort: number; stat: Recurso }[];
  abilities: { ability: Recurso; is_hidden: boolean; slot: number }[];
  moves: { move: Recurso; version_group_details: { level_learned_at: number; move_learn_method: Recurso; version_group: Recurso }[] }[];
  forms: Recurso[];
  held_items: { item: Recurso; version_details: { rarity: number; version: Recurso }[] }[];
  game_indices: { game_index: number; version: Recurso }[];
  location_area_encounters: string;
  cries: { latest: string | null; legacy: string | null };
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    back_default: string | null;
    back_shiny: string | null;
    other: { "official-artwork": { front_default: string | null } };
  };
};

export type Especie = {
  id: number;
  name: string;
  generation: Recurso;
  genera: { genus: string; language: Recurso }[];
  names: { name: string; language: Recurso }[];
  flavor_text_entries: { flavor_text: string; language: Recurso; version: Recurso }[];
  habitat: Recurso | null;
  shape: Recurso | null;
  color: Recurso;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number | null;
  hatch_counter: number | null;
  growth_rate: Recurso;
  egg_groups: Recurso[];
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  evolves_from_species: Recurso | null;
  evolution_chain: { url: string } | null;
  pokedex_numbers: { entry_number: number; pokedex: Recurso }[];
  varieties: { is_default: boolean; pokemon: Recurso }[];
};
