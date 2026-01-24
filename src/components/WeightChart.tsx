import React, { useMemo } from 'react';
import type { WeightRecord } from '../hooks/useWeights';

interface WeightChartProps {
  data: WeightRecord[];
  targetWeight: number;
  view: '7d' | '30d' | 'all';
}

export const WeightChart: React.FC<WeightChartProps> = ({ data, targetWeight, view }) => {
  const chartData = useMemo(() => {
    let filtered = [...data].reverse();
    if (view === '7d') filtered = filtered.slice(-7);
    if (view === '30d') filtered = filtered.slice(-30);
    return filtered;
  }, [data, view]);

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 font-medium">
        尚無數據，快去紀錄一筆吧！
      </div>
    );
  }

  // Chart dimensions
  const width = 1000;
  const height = 400;
  const padding = 40;

  // Scales
  const weights = chartData.map(d => d.weight);
  if (targetWeight) weights.push(targetWeight);
  
  const maxW = Math.max(...weights) + 2;
  const minW = Math.min(...weights) - 2;
  const rangeW = maxW - minW;

  const getX = (index: number) => padding + (index * (width - 2 * padding)) / (chartData.length - 1 || 1);
  const getY = (w: number) => height - padding - ((w - minW) * (height - 2 * padding)) / rangeW;

  const points = chartData.map((d, i) => `${getX(i)},${getY(d.weight)}`).join(' ');

  return (
    <div className="w-full overflow-x-auto pb-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px] h-auto">
        {/* Grid Lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const w = minW + (rangeW * i) / 4;
          const y = getY(w);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#F1F5F9" strokeWidth="1" />
              <text x={padding - 10} y={y + 5} textAnchor="end" className="text-xs fill-slate-400 font-bold">{Math.round(w)}</text>
            </g>
          );
        })}

        {/* Target Line */}
        {targetWeight && (
          <line
            x1={padding} y1={getY(targetWeight)}
            x2={width - padding} y2={getY(targetWeight)}
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="8,4"
            className="opacity-50"
          />
        )}

        {/* Data Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#F43F5E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {chartData.map((d, i) => (
          <circle
            key={d.id}
            cx={getX(i)}
            cy={getY(d.weight)}
            r="6"
            fill="#F43F5E"
            className="drop-shadow-sm"
          />
        ))}

        {/* Labels */}
        {chartData.length < 15 && chartData.map((d, i) => (
          <text
            key={`lbl-${d.id}`}
            x={getX(i)}
            y={getY(d.weight) - 15}
            textAnchor="middle"
            className="text-[10px] fill-rose-600 font-bold"
          >
            {d.weight}
          </text>
        ))}
      </svg>
    </div>
  );
};
