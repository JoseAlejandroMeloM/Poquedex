import type { Estadistica } from "./types";

const ejes = [
  { nombre: "speed", etiqueta: "VELOCIDAD" },
  { nombre: "special-defense", etiqueta: "DEF. ESPECIAL" },
  { nombre: "special-attack", etiqueta: "AT. ESPECIAL" },
  { nombre: "defense", etiqueta: "DEFENSA" },
  { nombre: "attack", etiqueta: "ATAQUE" },
  { nombre: "hp", etiqueta: "VIDA (HP)" },
];

// Un punto por estadística, separado 60 grados del siguiente.
function punto(indice: number, radio: number) {
  const angulo = ((indice * 60 - 90) * Math.PI) / 180;
  return {
    x: 220 + Math.cos(angulo) * radio,
    y: 190 + Math.sin(angulo) * radio,
  };
}

export default function Radar({ stats }: { stats: Estadistica[] }) {
  const valores = ejes.map(
    (eje) =>
      stats.find((item) => item.stat.name === eje.nombre)?.base_stat || 0,
  );
  const poligono = (radios: number[]) =>
    radios
      .map((radio, indice) => {
        const { x, y } = punto(indice, radio);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <svg
      className="radar"
      viewBox="0 0 440 380"
      role="img"
      aria-label={
        stats.length
          ? ejes
              .map((eje, indice) => `${eje.etiqueta}: ${valores[indice]}`)
              .join(", ")
          : "Estadísticas pendientes de consulta"
      }
    >
      {[1, 2, 3, 4, 5].map((nivel) => (
        <polygon
          key={nivel}
          points={poligono(ejes.map(() => nivel * 25))}
          className="radar-grid"
        />
      ))}
      {ejes.map((eje, indice) => {
        const extremo = punto(indice, 125);
        return (
          <line
            key={eje.nombre}
            x1="220"
            y1="190"
            x2={extremo.x}
            y2={extremo.y}
            className="radar-grid"
          />
        );
      })}
      <polygon
        points={poligono(valores.map((valor) => (valor / 255) * 125))}
        className="radar-area"
      />
      {ejes.map((eje, indice) => {
        const posicion = punto(indice, 168);
        const dato = punto(indice, (valores[indice] / 255) * 125);
        return (
          <g key={eje.nombre}>
            <circle cx={dato.x} cy={dato.y} r="4" className="radar-dot" />
            <text x={posicion.x} y={posicion.y - 3} className="radar-label">
              {eje.etiqueta}
            </text>
            <text x={posicion.x} y={posicion.y + 20} className="radar-value">
              {stats.length ? valores[indice] : "–"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
