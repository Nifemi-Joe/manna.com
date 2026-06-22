'use client';

interface BarChartProps {
    data: { label: string; value: number; color?: string }[];
    width?: number;
    height?: number;
    horizontal?: boolean;
    formatValue?: (v: number) => string;
    className?: string;
}

export function BarChart({
                             data,
                             width = 400,
                             height = 200,
                             horizontal = false,
                             formatValue = (v) => String(v),
                             className,
                         }: BarChartProps) {
    const max = Math.max(...data.map((d) => d.value), 1);
    const padLeft = horizontal ? 96 : 40;
    const padBottom = horizontal ? 24 : 40;
    const padTop = 12;
    const padRight = 12;
    const chartW = width - padLeft - padRight;
    const chartH = height - padBottom - padTop;

    const barColor = 'var(--accent)';

    if (horizontal) {
        const barH = Math.min(20, (chartH / data.length) * 0.6);
        const gap = (chartH / data.length) - barH;

        return (
            <svg
                width="100%"
                viewBox={`0 0 ${width} ${height}`}
                className={className}
                role="img"
                aria-label="Bar chart"
            >
                {data.map((d, i) => {
                    const barW = (d.value / max) * chartW;
                    const y = padTop + i * (barH + gap) + gap / 2;
                    return (
                        <g key={i}>
                            <text
                                x={padLeft - 8}
                                y={y + barH / 2 + 4}
                                textAnchor="end"
                                fontSize={11}
                                fill="var(--muted)"
                                fontFamily="var(--font-manrope)"
                            >
                                {d.label}
                            </text>
                            <rect
                                x={padLeft}
                                y={y}
                                width={barW}
                                height={barH}
                                rx={3}
                                fill={d.color ?? barColor}
                                opacity={0.9}
                            />
                            <text
                                x={padLeft + barW + 6}
                                y={y + barH / 2 + 4}
                                fontSize={11}
                                fill="var(--muted)"
                                fontFamily="var(--font-manrope)"
                            >
                                {formatValue(d.value)}
                            </text>
                        </g>
                    );
                })}
            </svg>
        );
    }

    const barW = Math.min(40, (chartW / data.length) * 0.6);
    const gap = (chartW / data.length) - barW;

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            role="img"
            aria-label="Bar chart"
        >
            {/* Y axis gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = padTop + (1 - t) * chartH;
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
                            {formatValue(Math.round(max * t))}
                        </text>
                    </g>
                );
            })}

            {data.map((d, i) => {
                const barH = (d.value / max) * chartH;
                const x = padLeft + i * (barW + gap) + gap / 2;
                const y = padTop + chartH - barH;
                return (
                    <g key={i}>
                        <rect
                            x={x}
                            y={y}
                            width={barW}
                            height={barH}
                            rx={3}
                            fill={d.color ?? barColor}
                            opacity={0.9}
                        />
                        <text
                            x={x + barW / 2}
                            y={padTop + chartH + 14}
                            textAnchor="middle"
                            fontSize={10}
                            fill="var(--muted)"
                            fontFamily="var(--font-manrope)"
                        >
                            {d.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}