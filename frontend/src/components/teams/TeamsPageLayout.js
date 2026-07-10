import React from "react";

import { Banners } from "../Utils";
import "./teams-pages.css";

export function TeamsPageShell({ children, wide }) {
  return (
    <div className="page teams-shell">
      <Banners />
      <div className={wide ? "teams-page teams-page--wide" : "teams-page"}>
        {children}
      </div>
    </div>
  );
}
