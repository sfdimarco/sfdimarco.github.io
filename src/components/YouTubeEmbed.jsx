import { useState } from "react";

export default function YouTubeEmbed({ videoId, title = "Mook and Mush cartoon", eager = false }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="video-player">
      {playing ? <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
      /> : <button className="video-poster" onClick={() => setPlaying(true)} aria-label={`Play ${title}`}>
        <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" loading={eager ? "eager" : "lazy"} />
        <span className="play-button" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M12 7 L26 16 L12 25 Z" /></svg></span>
        <span className="play-caption">Watch the cartoon</span>
      </button>}
    </div>
  );
}
