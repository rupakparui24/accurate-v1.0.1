interface StatusPillProps {
  tone?: "default" | "success" | "warning" | "danger";
  children: string;
}

export function StatusPill({ tone = "default", children }: StatusPillProps) {
  const toneClass = tone === "default" ? "" : tone;
  return <span className={`badge ${toneClass}`.trim()}>{children}</span>;
}
