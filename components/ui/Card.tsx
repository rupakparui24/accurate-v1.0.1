import { ReactNode } from "react";

interface CardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Card({ title, action, children }: CardProps) {
  return (
    <section className="card">
      {title ? (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", gap: "12px" }}>
          <h2 style={{ fontSize: "1.2rem" }}>{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
