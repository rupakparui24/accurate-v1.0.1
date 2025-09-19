import { TrendPoint } from "@/lib/types";

interface TrendSparklineProps {
  points: TrendPoint[];
  color?: string;
  height?: number;
}

export function TrendSparkline({ points, color = "var(--primary)", height = 48 }: TrendSparklineProps) {
  if (!points.length) {
    return null;
  }

  const max = Math.max(...points.map((point) => point.value));
  const min = Math.min(...points.map((point) => point.value));
  const range = max - min || 1;
  const stepX = 100 / Math.max(points.length - 1, 1);

  const path = points
    .map((point, index) => {
      const x = index * stepX;
      const y = 100 - ((point.value - min) / range) * 100;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height }}>
      <path d={path} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => {
        const x = index * stepX;
        const y = 100 - ((point.value - min) / range) * 100;
        return <circle key={point.period} cx={x} cy={y} r={2.5} fill={color} />;
      })}
    </svg>
  );
}
