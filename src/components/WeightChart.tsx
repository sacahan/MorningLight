import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { WeightRecord } from '../hooks/useWeights';

interface WeightChartProps {
  data: WeightRecord[];
  targetWeight: number;
  view: '7d' | '30d' | 'all';
}

export const WeightChart: React.FC<WeightChartProps> = ({ data, targetWeight, view }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      setContainerWidth(rect?.width || 600);
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

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

  // Responsive dimensions
  const isMobile = containerWidth < 480;
  const width = isMobile ? 400 : 1000;
  const height = isMobile ? 250 : 400;
  const padding = isMobile ? 30 : 40;
  const labelSize = isMobile ? 8 : 10;
  const strokeWidth = isMobile ? 2.5 : 4;
  const circleRadius = isMobile ? 4 : 6;

  // Scales
  const weights = chartData.map((d) => d.weight);
  if (targetWeight) weights.push(targetWeight);

  const maxW = Math.max(...weights) + 2;
  const minW = Math.min(...weights) - 2;
  const rangeW = maxW - minW;

  const getX = (index: number) =>
    padding + (index * (width - 2 * padding)) / (chartData.length - 1 || 1);
  const getY = (w: number) => height - padding - ((w - minW) * (height - 2 * padding)) / rangeW;

  const points = chartData.map((d, i) => `${getX(i)},${getY(d.weight)}`).join(' ');

  return (
    <div ref={containerRef} className="w-full overflow-x-auto pb-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto"
        style={{ minWidth: `${Math.min(containerWidth, width)}px` }}
      >
        {/* Grid Lines */}
        {[0, 1, 2, 3, 4].map((i) => {
          const w = minW + (rangeW * i) / 4;
          const y = getY(w);
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={y + 5}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-bold"
                fontSize={labelSize}
              >
                {Math.round(w)}
              </text>
            </g>
          );
        })}

        {/* Target Line */}
        {targetWeight && (
          <line
            x1={padding}
            y1={getY(targetWeight)}
            x2={width - padding}
            y2={getY(targetWeight)}
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
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {chartData.map((d, i) => (
          <circle
            key={d.id}
            cx={getX(i)}
            cy={getY(d.weight)}
            r={circleRadius}
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
            className="fill-rose-600 font-bold"
            fontSize={labelSize}
          >
            {d.weight}
          </text>
        ))}
      </svg>
    </div>
  );
};
