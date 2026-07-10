import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import HomePage from "./HomePage";
import ErrorBoundary from "./ErrorBoundary";

export default function App(props) {
  return (
    <ErrorBoundary>
      <DndProvider backend={HTML5Backend}>
        <HomePage />
      </DndProvider>
    </ErrorBoundary>
  );
}
