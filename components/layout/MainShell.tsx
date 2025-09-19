import { ReactNode } from "react";

interface MainShellProps {
  children: ReactNode;
  navigation: ReactNode;
  isNavOpen: boolean;
  onToggleNav: () => void;
}

export function MainShell({ children, navigation, isNavOpen, onToggleNav }: MainShellProps) {
  return (
    <div className={`main-shell ${isNavOpen ? "nav-open" : ""}`.trim()}>
      <aside
        id="dashboard-navigation"
        className="nav-panel"
        aria-hidden={!isNavOpen}
        aria-label="Sections"
      >
        {navigation}
      </aside>

      <div className="content-stack">
        <button
          type="button"
          className="nav-toggle"
          onClick={onToggleNav}
          aria-controls="dashboard-navigation"
          aria-expanded={isNavOpen}
        >
          <span className="nav-toggle-icon" aria-hidden="true" />
          {isNavOpen ? "Hide" : "Menu"}
        </button>

        <button
          type="button"
          className={`nav-overlay ${isNavOpen ? "visible" : ""}`.trim()}
          aria-hidden={!isNavOpen}
          tabIndex={-1}
          onClick={onToggleNav}
        />

        <main>{children}</main>
      </div>
    </div>
  );
}
