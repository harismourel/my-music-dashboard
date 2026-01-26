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

          <Tooltip
            contentStyle={{
              background: "rgba(20, 24, 32, 0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GenreDistributionPieChart;
export { COLORS as GENRE_COLORS };
