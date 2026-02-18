import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function ListeningOverTimeChart({ data }) {
  return (
    <div style={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="4 6" opacity={0.2} />
          <XAxis dataKey="day" tickMargin={10} opacity={0.7} />
          <YAxis tickMargin={10} opacity={0.7} />
          <Tooltip
            contentStyle={{
              background: "rgba(20, 24, 32, 0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
            }}
            labelStyle={{ opacity: 0.8 }}
          />
          <Line
            type="monotone"
            dataKey="minutes"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ListeningOverTimeChart;