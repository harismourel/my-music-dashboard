import React from "react";

import StatCard from "../components/cards/StatCard";

import CollectionValueChart from "../components/charts/CollectionValueChart";
import CollectionGenresChart from "../components/charts/CollectionGenresChart";
import CollectionFormatsChart from "../components/charts/CollectionFormatsChart";

import TopRecords from "../components/discogs/TopRecords";
import Wantlist from "../components/discogs/Wantlist";

import "./DiscogsDashboard.scss";

const discogsStats = [
  {
    title: "Total Records",
    value: "248",
  },
  {
    title: "Collection Value",
    value: "€4,820",
  },
  {
    title: "Wantlist",
    value: "73",
  },
  {
    title: "Most Valuable Record",
    value: "€320",
  },
];

function DiscogsDashboard() {
  return (
    <section className="discogs-dashboard">

      {/* =========================
          TOP STATS
      ========================== */}

      <div className="container-fluid p-0">
        <div className="row g-3">

          {discogsStats.map((stat) => (
            <div
              className="col-12 col-md-6 col-xl-3"
              key={stat.title}
            >
              <StatCard
                title={stat.title}
                value={stat.value}
              />
            </div>
          ))}

        </div>
      </div>


      {/* =========================
          COLLECTION OVERVIEW
      ========================== */}

      <div className="container-fluid p-0">
        <div className="row g-4">

          {/* Collection Value */}

          <div className="col-12 col-xl-8">
            <div className="chart-card stat-card h-100">

              <div className="chart-card__title">
                Collection Value
                <span> (Last 12 Months)</span>
              </div>

              <CollectionValueChart />

            </div>
          </div>


          {/* Genres */}

          <div className="col-12 col-xl-4">
            <div className="chart-card stat-card h-100">

              <div className="chart-card__title">
                Genres
              </div>

              <CollectionGenresChart />

            </div>
          </div>

        </div>
      </div>


      {/* =========================
          COLLECTION INSIGHTS
      ========================== */}

      <div className="container-fluid p-0">
        <div className="row g-4">

          {/* Formats */}

          <div className="col-12 col-xl-6">
            <div className="chart-card stat-card h-100">

              <div className="chart-card__title">
                Collection Formats
              </div>

              <CollectionFormatsChart />

            </div>
          </div>


          {/* Valuable Records */}

          <div className="col-12 col-xl-6">
            <div className="chart-card stat-card h-100">

              <TopRecords />

            </div>
          </div>

        </div>
      </div>


      {/* =========================
          WANTLIST
      ========================== */}

      <div className="container-fluid p-0">

        <div className="stat-card">

          <Wantlist />

        </div>

      </div>

    </section>
  );
}

export default DiscogsDashboard;