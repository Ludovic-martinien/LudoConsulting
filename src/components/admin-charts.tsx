"use client";

import { useId, useState } from "react";

export const CHART_COLORS = ["#1c6b45", "#2f6fb2", "#d9a441", "#b33737", "#6b7f76", "#7fb069"];

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x},${p2.y}`;
  }
  return d;
}

export function AreaChart({ labels, series, height = 220 }: { labels: string[]; series: { name: string; color: string; values: number[] }[]; height?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = height;
  const padL = 34;
  const padB = 26;
  const padT = 10;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const stepX = labels.length > 1 ? (W - padL - 10) / (labels.length - 1) : 0;
  const yOf = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const xOf = (i: number) => padL + i * stepX;
  const every = Math.max(1, Math.ceil(labels.length / 8));
  const gridValues = [0, 0.5, 1].map((f) => Math.round(max * f));

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round((px - padL) / (stepX || 1));
    setHover(i >= 0 && i < labels.length ? i : null);
  }

  return (
    <div className="chart-box">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-label="Courbe d'évolution" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.name} id={`${id}-g${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>
        {gridValues.map((v, i) => (
          <g key={i}>
            <line x1={padL} x2={W - 10} y1={yOf(v)} y2={yOf(v)} className="chart-grid" />
            <text x={padL - 7} y={yOf(v) + 4} textAnchor="end" className="chart-axis">{v}</text>
          </g>
        ))}
        {labels.map((label, i) =>
          i % every === 0 ? (
            <text key={i} x={xOf(i)} y={H - 8} textAnchor="middle" className="chart-axis">{label}</text>
          ) : null,
        )}
        {series.map((s, i) => {
          const pts = s.values.map((v, j) => ({ x: xOf(j), y: yOf(v) }));
          const line = smoothPath(pts);
          if (!line) return null;
          return (
            <g key={s.name}>
              <path d={`${line} L ${xOf(s.values.length - 1)},${H - padB} L ${padL},${H - padB} Z`} fill={`url(#${id}-g${i})`} className="chart-area" />
              <path d={line} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinecap="round" className="chart-line" />
            </g>
          );
        })}
        {hover !== null && (
          <g>
            <line x1={xOf(hover)} x2={xOf(hover)} y1={padT} y2={H - padB} className="chart-hover-line" />
            {series.map((s) => (
              <circle key={s.name} cx={xOf(hover)} cy={yOf(s.values[hover] ?? 0)} r="4" fill={s.color} stroke="#fff" strokeWidth="1.6" />
            ))}
          </g>
        )}
      </svg>
      <div className="chart-legend">
        {series.map((s) => (
          <span key={s.name}><i style={{ background: s.color }} />{s.name} · <strong>{s.values.reduce((a, b) => a + b, 0)}</strong></span>
        ))}
      </div>
      {hover !== null && (
        <p className="chart-tip" role="status">
          <strong>{labels[hover]}</strong>
          {series.map((s) => (
            <span key={s.name}> · {s.name} : <strong>{s.values[hover]}</strong></span>
          ))}
        </p>
      )}
    </div>
  );
}

export function DonutChart({ data, size = 180 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const [active, setActive] = useState<string | null>(null);
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const R = 70;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="chart-donut-wrap">
      <svg viewBox="0 0 180 180" width={size} height={size} className="chart-svg" role="img" aria-label="Répartition">
        <circle cx="90" cy="90" r={R} fill="none" stroke="#edf1e9" strokeWidth="26" />
        {data.map((d) => {
          const frac = d.value / total;
          const el = (
            <circle
              key={d.label}
              cx="90" cy="90" r={R} fill="none" stroke={d.color} strokeWidth="26"
              strokeDasharray={`${(frac * C).toFixed(1)} ${C.toFixed(1)}`}
              strokeDashoffset={(-acc * C).toFixed(1)}
              transform="rotate(-90 90 90)"
              opacity={active === null || active === d.label ? 1 : 0.35}
              className="chart-donut-seg"
            >
              <title>{`${d.label} : ${d.value}`}</title>
            </circle>
          );
          acc += frac;
          return el;
        })}
        <text x="90" y="86" textAnchor="middle" className="chart-donut-total">{total}</text>
        <text x="90" y="104" textAnchor="middle" className="chart-donut-sub">total</text>
      </svg>
      <div className="chart-legend col">
        {data.map((d) => (
          <span key={d.label} onMouseEnter={() => setActive(d.label)} onMouseLeave={() => setActive(null)}><i style={{ background: d.color }} />{d.label} · <strong>{d.value}</strong></span>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ labels, series, height = 200 }: { labels: string[]; series: { name: string; color: string; values: number[] }[]; height?: number }) {
  const W = 600;
  const H = height;
  const padL = 34;
  const padB = 26;
  const padT = 10;
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const groupW = (W - padL - 10) / Math.max(1, labels.length);
  const barW = Math.min(26, (groupW / series.length) * 0.62);
  const every = Math.max(1, Math.ceil(labels.length / 8));
  return (
    <div className="chart-box">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-label="Barres de comparaison">
        {[0, 0.5, 1].map((f, i) => {
          const v = Math.round(max * f);
          const y = padT + (H - padT - padB) * (1 - f);
          return (
            <g key={i}>
              <line x1={padL} x2={W - 10} y1={y} y2={y} className="chart-grid" />
              <text x={padL - 7} y={y + 4} textAnchor="end" className="chart-axis">{v}</text>
            </g>
          );
        })}
        {labels.map((label, i) => (
          <g key={i}>
            {series.map((s, j) => {
              const h = ((H - padT - padB) * s.values[i]) / max;
              const x = padL + i * groupW + (groupW - barW * series.length) / 2 + j * barW;
              return (
                <rect key={s.name} x={x} y={H - padB - h} width={barW} height={Math.max(h, 2)} rx="3" fill={s.color} className="chart-bar">
                  <title>{`${label} · ${s.name} : ${s.values[i]}`}</title>
                </rect>
              );
            })}
            {i % every === 0 ? <text x={padL + i * groupW + groupW / 2} y={H - 8} textAnchor="middle" className="chart-axis">{label}</text> : null}
          </g>
        ))}
      </svg>
      <div className="chart-legend">
        {series.map((s) => (
          <span key={s.name}><i style={{ background: s.color }} />{s.name}</span>
        ))}
      </div>
    </div>
  );
}
