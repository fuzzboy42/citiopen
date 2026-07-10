import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page" style={{ padding: 24, fontFamily: "Inter, sans-serif" }}>
          <h2 style={{ color: "#0d1b3e", marginTop: 0 }}>Something went wrong</h2>
          <p style={{ color: "#64748b", lineHeight: 1.5 }}>
            This page hit an error while rendering. Try refreshing, or go back to{" "}
            <a href="/list">List by Name</a>.
          </p>
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              background: "#f8fafc",
              borderRadius: 8,
              fontSize: 12,
              overflow: "auto",
            }}
          >
            {String(this.state.error?.message ?? this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
