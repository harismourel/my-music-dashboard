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


const collectionValueData = [
  {
    month: "Oct",
    value: 3420,
  },
  {
    month: "Nov",
    value: 3510,
  },
  {
    month: "Dec",
    value: 3650,
  },
  {
    month: "Jan",
    value: 3780,
  },
  {
    month: "Feb",
    value: 3920,
  },
  {
    month: "Mar",
    value: 4010,
  },
  {
    month: "Apr",
    value: 4140,
  },
  {
    month: "May",
    value: 4280,
  },
  {
    month: "Jun",
    value: 4410,
  },
  {
    month: "Jul",
    value: 4560,
  },
  {
    month: "Aug",
    value: 4690,
  },
  {
    month: "Sep",
    value: 4820,
  },
];


function CollectionValueChart() {
  return (
    <div className="chart-wrapper">

      <ResponsiveContainer
        width="100%"
        height={280}
      >

        <LineChart
          data={collectionValueData}
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
            dataKey="month"
          />

          <YAxis />

          <Tooltip
            formatter={(value) => [
              `€${value.toLocaleString()}`,
              "Collection Value",
            ]}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#1db954"
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 5,
            }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default CollectionValueChart;