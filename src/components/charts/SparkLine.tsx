'use client';

interface SparkLineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    strokeWidth?: number;
    filled?: boolean;
}

export function SparkLine({
                              data,
                              width = 80,
                              height = 32,
                              color = 'var(--accent)',
                              strokeWidth = 1.5,
                              filled = false,
                          }: SparkLineProps) {
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = strokeWidth;

    const points = data.map((v, i) => ({
        x: pad + (i / (data.length - 1)) * (width - pad * 2),
        y: pad + ((max - v) / range) * (height - pad * 2),
    }));

    const pathD = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
        .join(' ');

    const fillD = filled
        ? `${pathD} L${points[points.length - 1].x.toFixed(2)},${height} L${points[0].x.toFixed(2)},${height} Z`
        : '';

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            {filled && (
                <path d={fillD} fill={color} opacity="0.15" />
            )}
            <path d={pathD} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}