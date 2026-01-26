import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

function MusicDnaRadarChart({ data }) {
  return (
    <div style={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid opacity={0.35} />
          <PolarAngleAxis dataKey="metric" tick={{ opacity: 0.85 }} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(20, 24, 32, 0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
            }}
          />
          <Radar
            dataKey="value"
            stroke="rgba(29, 185, 84, 0.95)"
            fill="rgba(29, 185, 84, 0.35)"
            strokeWidth={2.5}
            fillOpacity={1}
            dot={{ r: 3 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MusicDnaRadarChart;
