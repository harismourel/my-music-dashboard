import React from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";


const formatData = [
  {
    format: "LP",
    records: 142,
  },
  {
    format: '12"',
    records: 61,
  },
  {
    format: '7"',
    records: 28,
  },
  {
    format: "CD",
    records: 12,
  },
  {
    format: "Cassette",
    records: 5,
  },
];


function CollectionFormatsChart() {
  return (
    <div className="chart-wrapper">

      <ResponsiveContainer
        width="100%"
        height={280}
      >

        <BarChart
          data={formatData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 10,
          }}
        >

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="format"
          />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="records"
            name="Records"
            fill="#1db954"
            radius={[
              4,
              4,
              0,
              0,
            ]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}

export default CollectionFormatsChart;