import React from "react";
import "./SpotifyBottomPlayer.scss";

function SpotifyBottomPlayer({ track, onClose }) {
  if (!track?.id) return null;

  return (
    <div
      className="spotify-bottom-player"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ❌ ΜΟΝΟ X – ΟΧΙ τίτλοι, ΟΧΙ meta */}
      <button
        className="spotify-bottom-player__close"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        type="button"
      >
        ✕
      </button>

      <iframe
        key={track.id} // ✅ force reload, no bugs
        src={`https://open.spotify.com/embed/track/${track.id}?theme=0`}
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen"
        loading="lazy"
      />
    </div>
  );
}

export default SpotifyBottomPlayer;
