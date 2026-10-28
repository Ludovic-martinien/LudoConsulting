"use client";

export type SeriesPoint = { key: string; label: string; count: number };

function niceMax(value: number) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

/** Courbe d'évolution avec aire, points et info-bulles natives. */
export function LineChart({ data, color = "#0b483e", height = 190 }: { data: SeriesPoint[]; color?: string; height?: number }) {
  const width = 640;
  const padding = { top: 14, right: 12, bottom: 30, left: 34 };
  const max = niceMax(Math.max(...data.map((point) => point.count), 0));
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0;
  const y = (value: number) => padding.top + innerHeight - (value / max) * innerHeight;
  const points = data.map((point, index) => `${(padding.left + index * stepX).toFixed(1)},${y(point.count).toFixed(1)}`);
  const area = `M ${padding.left},${(padding.top + innerHeight).toFixed(1)} L ${points.join(" L ")} L ${(padding.left + innerWidth).toFixed(1)},${(padding.top + innerHeight).toFixed(1)} Z`;
  const ticks = [0, max / 2, max].map((value) => Math.round(value * 10) / 10);
  const showEvery = Math.max(1, Math.ceil(data.length / 8));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Courbe d'évolution">
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={padding.left} x2={width - padding.right} y1={y(tick)} y2={y(tick)} className="chart-grid" />
          <text x={padding.left - 6} y={y(tick) + 4} textAnchor="end" className="chart-tick">{tick}</text>
        </g>
      ))}
      <path d={area} fill={color} opacity={0.12} />
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" className="chart-line" />
      {data.map((point, index) => (
        <g key={point.key}>
          <circle cx={padding.left + index * stepX} cy={y(point.count)} r={3.4} fill="#fff" stroke={color} strokeWidth={2.5}>
            <title>{`${point.label} : ${point.count}`}</title>
          </circle>
          {index % showEvery === 0 && (
            <text x={padding.left + index * stepX} y={height - 8} textAnchor="middle" className="chart-tick">{point.label}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

/** Anneau de répartition avec légende. */
export function DonutChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 160 160" className="chart-donut" role="img" aria-label="Répartition">
        <circle cx={80} cy={80} r={radius} fill="none" stroke="#edf2ec" strokeWidth={22} />
        {data.map((item) => {
          const fraction = total === 0 ? 0 : item.count / total;
          const dash = `${(fraction * circumference).toFixed(1)} ${(circumference - fraction * circumference).toFixed(1)}`;
          const element = (
            <circle key={item.label} cx={80} cy={80} r={radius} fill="none" stroke={item.color} strokeWidth={22}
              strokeDasharray={dash} strokeDashoffset={(-offset).toFixed(1)} transform="rotate(-90 80 80)" strokeLinecap="butt">
              <title>{`${item.label} : ${item.count}`}</title>
            </circle>
          );
          offset += fraction * circumference;
          return element;
        })}
        <text x={80} y={76} textAnchor="middle" className="donut-total">{total}</text>
        <text x={80} y={94} textAnchor="middle" className="donut-caption">total</text>
      </svg>
      <ul className="donut-legend">
        {data.map((item) => (
          <li key={item.label}><i style={{ background: item.color }} />{item.label}<strong>{item.count}</strong></li>
        ))}
      </ul>
    </div>
  );
}

/** Barres verticales avec valeurs et info-bulles. */
export function BarChart({ data, color = "#2f7d4f", height = 190 }: { data: { label: string; count: number }[]; color?: string; height?: number }) {
  const width = 640;
  const padding = { top: 14, right: 12, bottom: 30, left: 34 };
  const max = niceMax(Math.max(...data.map((item) => item.count), 0));
  const innerHeight = height - padding.top - padding.bottom;
  const slot = (width - padding.left - padding.right) / Math.max(1, data.length);
  const barWidth = Math.min(46, slot * 0.52);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img" aria-label="Répartition par catégorie">
      {[0, max].map((tick) => (
        <g key={tick}>
          <line x1={padding.left} x2={width - padding.right} y1={padding.top + innerHeight - (tick / max) * innerHeight} y2={padding.top + innerHeight - (tick / max) * innerHeight} className="chart-grid" />
          <text x={padding.left - 6} y={padding.top + innerHeight - (tick / max) * innerHeight + 4} textAnchor="end" className="chart-tick">{tick}</text>
        </g>
      ))}
      {data.map((item, index) => {
        const barHeight = max === 0 ? 0 : (item.count / max) * innerHeight;
        const x = padding.left + slot * index + (slot - barWidth) / 2;
        const yPos = padding.top + innerHeight - barHeight;
        return (
          <g key={item.label}>
            <rect x={x} y={yPos} width={barWidth} height={Math.max(barHeight, 2)} rx={5} fill={color} opacity={0.88} className="chart-bar">
              <title>{`${item.label} : ${item.count}`}</title>
            </rect>
            <text x={x + barWidth / 2} y={yPos - 6} textAnchor="middle" className="chart-value">{item.count}</text>
            <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" className="chart-tick chart-label">{item.label.length > 14 ? `${item.label.slice(0, 13)}…` : item.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Comparaison de deux périodes, côte à côte. */
export function ComparisonBars({ current, previous, labels }: { current: number[]; previous: number[]; labels: string[] }) {
  const max = niceMax(Math.max(...current, ...previous, 0));
  return (
    <div className="comparison-list">
      {labels.map((label, index) => {
        const cur = current[index] ?? 0;
        const prev = previous[index] ?? 0;
        return (
          <div className="comparison-row" key={label}>
            <span className="comparison-label">{label}</span>
            <div className="comparison-bars">
              <div className="comparison-track"><div className="comparison-fill is-current" style={{ width: `${max === 0 ? 0 : (cur / max) * 100}%` }} /><span>{cur}</span></div>
              <div className="comparison-track"><div className="comparison-fill is-previous" style={{ width: `${max === 0 ? 0 : (prev / max) * 100}%` }} /><span>{prev}</span></div>
            </div>
          </div>
        );
      })}
      <p className="comparison-legend"><i className="is-current" /> Période actuelle <i className="is-previous" /> Période précédente</p>
    </div>
  );
}
