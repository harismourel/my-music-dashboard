import React from "react";


const topRecords = [
  {
    id: 1,
    title: "Daft Punk - Discovery",
    artist: "Daft Punk",
    value: "€180",
  },
  {
    id: 2,
    title: "Selected Ambient Works 85-92",
    artist: "Aphex Twin",
    value: "€165",
  },
  {
    id: 3,
    title: "Dig Your Own Hole",
    artist: "The Chemical Brothers",
    value: "€145",
  },
  {
    id: 4,
    title: "Mezzanine",
    artist: "Massive Attack",
    value: "€130",
  },
  {
    id: 5,
    title: "Unreasonable Behaviour",
    artist: "Laurent Garnier",
    value: "€118",
  },
];


function TopRecords() {
  return (
    <div className="discogs-list">

      <div className="chart-card__title">
        Most Valuable Records
      </div>


      <div className="discogs-list__items">

        {topRecords.map((record, index) => (

          <div
            className="discogs-list__item"
            key={record.id}
          >

            <span className="discogs-list__rank">
              {index + 1}
            </span>


            <div className="discogs-list__info">

              <span className="discogs-list__title">
                {record.title}
              </span>

              <span className="discogs-list__artist">
                {record.artist}
              </span>

            </div>


            <span className="discogs-list__value">
              {record.value}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}

export default TopRecords;