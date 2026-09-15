import React, { useEffect, useState } from "react";

import StatCard from "../components/cards/StatCard";

import CollectionValueChart from "../components/charts/CollectionValueChart";
import CollectionGenresChart from "../components/charts/CollectionGenresChart";
import CollectionFormatsChart from "../components/charts/CollectionFormatsChart";
import TopRecords from "../components/discogs/TopRecords";
import Wantlist from "../components/discogs/Wantlist";

import "./DiscogsDashboard.scss";

const discogsStats = [
  { title: "Total Records", value: null },
  { title: "Collection Value", value: "€4,820" },
  { title: "Wantlist", value: null },
  { title: "Most Valuable Record", value: "€320" },
];

function DiscogsDashboard() {
  const [totalRecords, setTotalRecords] =
    useState(null);

  const [totalWantlist, setTotalWantlist] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const fetchDiscogsStats = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          "http://localhost:3000/api/discogs/stats"
        );

        if (!response.ok) {
          throw new Error(
            "Could not load Discogs stats."
          );
        }

        const data = await response.json();

        console.log("Discogs Stats:", data);

        setTotalRecords(data.totalRecords);
        setTotalWantlist(data.totalWantlist);
      } catch (error) {
        console.error(
          "Discogs stats error:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscogsStats();
  }, []);

  const updatedDiscogsStats =
    discogsStats.map((stat) => {
      if (stat.title === "Total Records") {
        return {
          ...stat,
          value: isLoading ? (
            <span className="discogs-loader" />
          ) : (
            totalRecords
          ),
        };
      }

      if (stat.title === "Wantlist") {
        return {
          ...stat,
          value: isLoading ? (
            <span className="discogs-loader" />
          ) : (
            totalWantlist
          ),
        };
      }

      return stat;
    });

  return (
    <section className="discogs-dashboard">
      <div className="container-fluid p-0">
        <div className="row g-3">
          {updatedDiscogsStats.map((stat) => (
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

      <div className="container-fluid p-0">
        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="chart-card stat-card h-100">
              <div className="chart-card__title">
                Collection Value
                <span> (Last 12 Months)</span>
              </div>

              <CollectionValueChart />
            </div>
          </div>

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

      <div className="container-fluid p-0">
        <div className="row g-4">
          <div className="col-12 col-xl-6">
            <div className="chart-card stat-card h-100">
              <div className="chart-card__title">
                Collection Formats
              </div>

              <CollectionFormatsChart />
            </div>
          </div>

          <div className="col-12 col-xl-6">
            <div className="chart-card stat-card h-100">
              <TopRecords />
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid p-0">
        <div className="stat-card">
          <Wantlist />
        </div>
      </div>
    </section>
  );
}

export default DiscogsDashboard;