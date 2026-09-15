import React from "react";


const wantlist = [
  {
    id: 1,
    title: "Innerbloom",
    artist: "RÜFÜS DU SOL",
    format: '12"',
    year: "2016",
    price: "€42",
  },
  {
    id: 2,
    title: "Music Sounds Better With You",
    artist: "Stardust",
    format: '12"',
    year: "1998",
    price: "€55",
  },
  {
    id: 3,
    title: "Your Love",
    artist: "Frankie Knuckles",
    format: '12"',
    year: "1987",
    price: "€68",
  },
  {
    id: 4,
    title: "Strings of Life",
    artist: "Rhythim Is Rhythim",
    format: '12"',
    year: "1987",
    price: "€75",
  },
];


function Wantlist() {
  return (
    <div className="discogs-wantlist">

      <div className="chart-card__title">
        Wantlist
      </div>


      <div className="table-responsive">

        <table className="table discogs-table">

          <thead>

            <tr>
              <th>Release</th>
              <th>Artist</th>
              <th>Format</th>
              <th>Year</th>
              <th>Price</th>
            </tr>

          </thead>


          <tbody>

            {wantlist.map((record) => (

              <tr key={record.id}>

                <td>
                  {record.title}
                </td>

                <td>
                  {record.artist}
                </td>

                <td>
                  {record.format}
                </td>

                <td>
                  {record.year}
                </td>

                <td>
                  {record.price}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Wantlist;