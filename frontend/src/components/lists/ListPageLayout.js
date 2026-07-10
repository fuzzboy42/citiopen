import React from "react";

import { Banners, HelpIcon, LayoutButtons } from "../Utils";
import "./ballkid-list.css";

export function ListPageShell({ children }) {
  return (
    <div className="page list-by-name-shell">
      <Banners />
      <div className="list-by-name-page">{children}</div>
    </div>
  );
}

export function ListPageHeader({
  title,
  count,
  helpPage,
  helpMessage,
  layout,
  setLayout,
  showLayout = true,
  trailing,
}) {
  return (
    <header className="list-by-name-header">
      <div className="list-by-name-title-row">
        <h1 className="list-by-name-title">{title}</h1>
        {count !== undefined && count !== null ? (
          <span className="list-by-name-count">{count}</span>
        ) : null}
        {helpPage ? (
          <HelpIcon page={helpPage} message={helpMessage} />
        ) : null}
      </div>
      {showLayout && layout !== undefined && setLayout ? (
        <LayoutButtons layout={layout} setLayout={setLayout} />
      ) : (
        trailing ?? null
      )}
    </header>
  );
}

export function ListToolbarCard({ children }) {
  return <div className="list-by-name-toolbar-card">{children}</div>;
}

export function ListSection({ title, count, actions, children }) {
  return (
    <section className="list-by-name-section">
      <div className="list-by-name-section-header">
        <div className="list-by-name-section-title-row">
          <h2 className="list-by-name-section-title">{title}</h2>
          {count !== undefined && count !== null ? (
            <span className="list-by-name-section-count">{count}</span>
          ) : null}
        </div>
        {actions ?? null}
      </div>
      {children}
    </section>
  );
}

export function ListCards({ layout, children }) {
  return (
    <div className={`list-by-name-cards layout-${layout}`}>{children}</div>
  );
}

export function ListEmpty({ children }) {
  return <p className="list-by-name-empty">{children}</p>;
}
