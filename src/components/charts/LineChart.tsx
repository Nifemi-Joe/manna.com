'use client';

interface LineChartSeries {
    label: string;
    data: number[];
    color?: string;
}

interface LineChartProps {
    series: LineChartSeries[];
    labels: string[];
    width?: number;
    height?: number;
    formatValue?: (v: number) => string;
    className?: string;
}

const COLORS = ['var(--accent)', 'var(--accent-2)', 'var(--warning)', 'var(--danger)'];

export function LineChart({
                              series,
                              labels,
                              width = 400,
                              height = 200,
                              formatValue = (v) => String(v),
                              className,
                          }: LineChartProps) {
    const allValues = series.flatMap((s) => s.data);
    const max = Math.max(...allValues, 1);
    const min = Math.min(...allValues, 0);
    const range = max - min || 1;

    const padLeft = 48;
    const padBottom = 32;
    const padTop = 16;
    const padRight = 16;
    const chartW = width - padLeft - padRight;
    const chartH = height - padBottom - padTop;

    const toX = (i: number) =>
        padLeft + (i / (labels.length - 1 || 1)) * chartW;
    const toY = (v: number) =>
        padTop + ((max - v) / range) * chartH;

    const gridLines = [0, 0.25, 0.5, 0.75, 1];

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            role="img"
            aria-label="Line chart"
        >
            {/* Gridlines */}
            {gridLines.map((t) => {
                const y = padTop + (1 - t) * chartH;
                const val = min + t * range;
                return (
                    <g key={t}>
                        <line
                            x1={padLeft}
                            y1={y}
                            x2={padLeft + chartW}
                            y2={y}
                            stroke="var(--line)"
                            strokeWidth={1}
                        />
                        <text
                            x={padLeft - 6}
                            y={y + 4}
                            textAnchor="end"
                            fontSize={10}
                            fill="var(--muted)"
                            fontFamily="var(--font-manrope)"
                        >
                            {formatValue(Math.round(val))}
                        </text>
                    </g>
                );
            })}

            {/* X axis labels */}
            {labels.map((label, i) => (
                <text
                    key={i}
                    x={toX(i)}
                    y={padTop + chartH + 16}
                    textAnchor="middle"
                    fontSize={10}
                    fill="var(--muted)"
                    fontFamily="var(--font-manrope)"
                >
                    {label}
                </text>
            ))}

            {/* Series lines */}
            {series.map((s, si) => {
                const color = s.color ?? COLORS[si % COLORS.length];
                const points = s.data.map((v, i) => ({ x: toX(i), y: toY(v) }));
                const pathD = points
                    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
                    .join(' ');

                return (
                    <g key={si}>
                        <path
                            d={pathD}
                            stroke={color}
                            strokeWidth={2}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {points.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
                        ))}
                    </g>
                );
            })}

            {/* Legend */}
            {series.length > 1 && (
                <g>
                    {series.map((s, si) => {
                        const color = s.color ?? COLORS[si % COLORS.length];
                        return (
                            <g key={si} transform={`translate(${padLeft + si * 100}, ${height - 8})`}>
                                <rect x={0} y={-6} width={10} height={3} rx={1} fill={color} />
                                <text x={14} y={0} fontSize={10} fill="var(--muted)" fontFamily="var(--font-manrope)">
                                    {s.label}
                                </text>
                            </g>
                        );
                    })}
                </g>
            )}
        </svg>
    );
}