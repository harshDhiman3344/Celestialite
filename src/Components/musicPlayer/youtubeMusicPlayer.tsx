import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const youtubeMusicPlayer = () => {
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("yt-player", {
        videoId: "bwOMu-HjoSA", // Your space music video ID
        playerVars: {
          autoplay: 0,
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          loop: 1,
        },
        events: {
          onReady: () => setReady(true),
        },
      });
    };
  }, []);

  const toggleMusic = () => {
    if (!ready || !playerRef.current) return;

    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }

    setPlaying(!playing);
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 10,
          background: "#111",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "14px",
          cursor: "pointer",
          opacity: 0.8,
        }}
        onClick={toggleMusic}
      >
        {playing ? "⏸ Pause Music" : "▶ Play Music"}
      </div>

      {/* Hidden YouTube player */}
      <div
        id="yt-player"
        style={{
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: "none",
        }}
      ></div>
    </>
  );
};

export default youtubeMusicPlayer;
