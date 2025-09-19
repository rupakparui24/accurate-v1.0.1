interface PageHeaderProps {
  title: string;
  tagline?: string;
}

export function PageHeader({ title, tagline }: PageHeaderProps) {
  return (
    <header style={{ marginBottom: "36px" }}>
      <h1 style={{ fontSize: "2.4rem", marginBottom: "12px" }}>{title}</h1>
      {tagline ? <p className="tagline">{tagline}</p> : null}
    </header>
  );
}
