import React from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";

const COLORS = [
  "rgba(29, 185, 84, 0.95)",
  "rgba(80, 150, 255, 0.95)",
  "rgba(180, 120, 255, 0.95)",
  "rgba(255, 170, 70, 0.95)",
  "rgba(255, 90, 120, 0.95)",
  "rgba(90, 220, 255, 0.95)",
];


const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, fill } = payload[0];

    return (
      <div
        style={{
          background: "rgba(20, 24, 32, 0.92)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 10,
          padding: "8px 12px",
          color: fill, 
          fontWeight: 600,
          boxShadow: `0 0 12px ${fill}55`,
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.9 }}>{name}</div>
        <div style={{ fontSize: 16 }}>{value}%</div>
      </div>
    );
  }

  return null;
};

function GenreDistributionPieChart({ data }) {
  return (
    <div style={{ height: 210, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="genre"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={2}
            cx="50%"
            cy="50%"
            stroke="rgba(255,255,255,0.08)"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GenreDistributionPieChart;
export { COLORS as GENRE_COLORS };