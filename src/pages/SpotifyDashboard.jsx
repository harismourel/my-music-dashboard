import React from "react";
import StatCard from "../components/cards/StatCard";
import ListeningOverTimeChart from "../components/charts/ListeningOverTimeChart";
import MusicDnaRadarChart from "../components/charts/MusicDnaRadarChart";
import GenreDistributionPieChart from "../components/charts/GenreDistributionPieChart";
import Toptracks from "../components/top-tracks/Toptracks";
import "./SpotifyDashboard.scss";

const GENRE_COLORS = [
  "rgba(29, 185, 84, 0.95)",
  "rgba(80, 150, 255, 0.95)",
  "rgba(180, 120, 255, 0.95)",
  "rgba(255, 170, 70, 0.95)",
  "rgba(255, 90, 120, 0.95)",
  "rgba(90, 220, 255, 0.95)",
];

const listeningMock = [
  { day: "Mon", minutes: 34 },
  { day: "Tue", minutes: 52 },
  { day: "Wed", minutes: 12 },
  { day: "Thu", minutes: 75 },
  { day: "Fri", minutes: 40 },
  { day: "Sat", minutes: 95 },
  { day: "Sun", minutes: 60 },
];

const artistsMock = [
  { metric: "Energy", value: 72 },
  { metric: "Valence", value: 58 },
  { metric: "Tempo", value: 64 },
  { metric: "Acoustic", value: 32 },
  { metric: "Danceability", value: 76 },
];

const genreMock = [
  { genre: "Melodic House", value: 32 },
  { genre: "Techno", value: 22 },
  { genre: "Electronica", value: 18 },
  { genre: "House", value: 14 },
  { genre: "Ambient", value: 8 },
  { genre: "Other", value: 6 },
];



function SpotifyDashboard() {
  return (
    <section className="spotify-dashboard">
      {/* Top stats */}
      {/* Top stats */}{" "}
      <div className="container-fluid p-0">
        {" "}
        <div className="row g-3">
          {" "}
          <div className="col-12 col-md-6 col-xl-3">
            {" "}
            <StatCard title="Top Track" value="RÜFÜS DU SOL- Innerbloom" />{" "}
          </div>{" "}
          <div className="col-12 col-md-6 col-xl-3">
            {" "}
            <StatCard title="Top Artist" value="Paul Kalkbrenner" />{" "}
          </div>{" "}
          <div className="col-12 col-md-6 col-xl-3">
            {" "}
            <StatCard title="Minutes Played" value="1,284" />{" "}
          </div>{" "}
          <div className="col-12 col-md-6 col-xl-3">
            {" "}
            <StatCard title="Top Genre" value="Melodic House" />{" "}
          </div>{" "}
        </div>{" "}
      </div>
      {/* Charts row 1 */}
      <div className="container-fluid p-0 mt-4">
        <div className="row g-4">
          {/* Listening Activity */}
          <div className="col-12 col-xl-8">
            <div className="chart-card stat-card h-100">
              <div className="chart-card__title">
                Listening Activity <span>(Last 30 Days)</span>
              </div>
              <ListeningOverTimeChart data={listeningMock} />
            </div>
          </div>

          {/* Music DNA */}
          <div className="col-12 col-xl-4">
            <div className="chart-card stat-card chart-card--center h-100">
              <div className="chart-card__title chart-title--center">
                Your Music DNA
              </div>
              <MusicDnaRadarChart data={artistsMock} />
            </div>
          </div>
        </div>
      </div>
      {/* Charts row 2: Genre Distribution (pie + legend in same card) */}
      <div className="container-fluid p-0 mt-4">
        <div className="row g-4 align-items-stretch">
          <div className="col-12 col-md-6 d-flex">
            <div className=" stat-card h-100 w-100">
              <div className="chart-card__title">Genre Distribution</div>

              <div className="row g-2 align-items-center">
                <div className="col-7">
                  <GenreDistributionPieChart data={genreMock} />
                </div>

                <div className="col-5">
                  <ul className="genre-list">
                    {genreMock.map((g, i) => (
                      <li key={g.genre}>
                        <span
                          className="genre-dot"
                          style={{
                            backgroundColor:
                              GENRE_COLORS[i % GENRE_COLORS.length],
                          }}
                        />
                        <span className="genre-name">{g.genre}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-xl-6 d-flex">
            <div className="chart-card stat-card h-100 w-100">
              <Toptracks />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SpotifyDashboard;
