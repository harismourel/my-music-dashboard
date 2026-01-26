import React from "react";

function ChartPlaceholder({ title }) {
  return (
    <div className="chart-placeholder p-3">
      <h5 className="mb-2">{title}</h5>
      <div style={{ height: 280, border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 12 }} />
    </div>
  );
}

export default ChartPlaceholder;
