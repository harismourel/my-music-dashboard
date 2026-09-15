import React from "react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";


const genreData = [
  {
    genre: "House",
    value: 32,
  },
  {
    genre: "Techno",
    value: 24,
  },
  {
    genre: "Disco",
    value: 18,
  },
  {
    genre: "Electronic",
    value: 14,
  },
  {
    genre: "Hip-Hop",
    value: 7,
  },
  {
    genre: "Other",
    value: 5,
  },
];


const GENRE_COLORS = [
  "#1db954",
  "#5096ff",
  "#b478ff",
  "#ffaa46",
  "#ff5a78",
  "#5adcff",
];


function CollectionGenresChart() {
  return (
    <div className="chart-wrapper">

      <ResponsiveContainer
        width="100%"
        height={280}
      >

        <PieChart>

          <Pie
            data={genreData}
            dataKey="value"
            nameKey="genre"
            cx="50%"
            cy="50%"
            outerRadius={95}
            innerRadius={55}
            paddingAngle={2}
          >

            {genreData.map((entry, index) => (
              <Cell
                key={entry.genre}
                fill={
                  GENRE_COLORS[
                    index % GENRE_COLORS.length
                  ]
                }
              />
            ))}

          </Pie>

          <Tooltip />

        </PieChart>

      </ResponsiveContainer>

    </div>
  );
}

export default CollectionGenresChart;