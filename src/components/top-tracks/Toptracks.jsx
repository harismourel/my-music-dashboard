import React, { useMemo, useState } from "react";
import SpotifyBottomPlayer from "./SpotifyBottomPlayer";
import "./TopTracks.scss";

// ✅ ΜΟΝΙΜΟ mock (φαίνεται πάντα)
const mockTopTracks = [
  { id: "77kMHM0D2MgGTjoL2308Lm", name: "Innerbloom", artist: "RÜFÜS DU SOL" },
  { id: "3ZSqMer9RLSglvi18bWXYV", name: "Sky & Sand", artist: "Paul Kalkbrenner" },
  { id: "2aJDlirz6v2a4HREki98cP", name: "Glue", artist: "Bicep" },
  { id: "7ouMYWpwJ422jRcDASZB7P", name: "Opus", artist: "Eric Prydz" },
  { id: "1AhDOtG9vPSOmsWgNW0BEY", name: "Move", artist: "Adam Port" },
  { id: "4VqPOruhp5EdPBeR92t6lQ", name: "Atlas", artist: "Lane 8" },
  { id: "2takcwOaAZWiXQijPHIx7B", name: "No End", artist: "Monolink" },
  { id: "6habFhsOp2NvshLv26DqMb", name: "Home", artist: "Adriatique" },
  { id: "0VjIjW4GlUZAMYd2vXMi3b", name: "Water", artist: "Keinemusik" },
  { id: "6rqhFgbbKwnb9MLmUQDhG6", name: "Phantom", artist: "Stephan Bodzin" },
];

function TopTracks({ tracks = mockTopTracks }) {
  const safeTracks = useMemo(() => tracks.slice(0, 10), [tracks]);

  // ✅ ΜΟΝΑΔΙΚΟ state
  const [activeTrack, setActiveTrack] = useState(null);

  return (
    <>
      <div className="toptracks">
        <div className="toptracks__title">Top 10 Most Played Tracks</div>

        <div className="toptracks__list">
          {safeTracks.map((track, idx) => (
            <button
              key={track.id}
              type="button"
              className={`toptracks__row ${
                activeTrack?.id === track.id ? "is-active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTrack(track); // ✅ ΕΔΩ και μόνο
              }}
            >
              <span className="toptracks__rank">#{idx + 1}</span>

              <span className="toptracks__meta">
                <span className="toptracks__name">{track.name}</span>
                <span className="toptracks__artist">{track.artist}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Player ανοίγει ΜΟΝΟ αν υπάρχει activeTrack */}
      {activeTrack && (
        <SpotifyBottomPlayer
          track={activeTrack}
          onClose={() => setActiveTrack(null)}
        />
      )}
    </>
  );
}

export default TopTracks;
