import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [year, setYear] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchVideos = async () => {
    if (!year) {
      setError("Please enter a year!");
      return;
    }

    setLoading(true);
    setVideos([]);
    setError("");

    try {
      const response = await axios.get("https://youtube-music-analyzer.onrender.com/top-music-videos", {
        params: { year },
      });
      if (response.data.length === 0) {
        setError("No music videos found for this year.");
      } else {
        setVideos(response.data);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Failed to fetch videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎵 Top Music Videos of {year || "____"}</h1>
      <div className="input-container">
        <input
          type="number"
          placeholder="Enter Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <button onClick={fetchVideos} disabled={loading}>
          {loading ? "Loading..." : "Fetch Videos"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {loading && <p className="loading">Fetching videos... ⏳</p>}

      {videos.length > 0 && (
        <div className="videos-list">
          {videos.map((video, index) => (
            <div key={index} className="video-card">
              <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">
                <img src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`} alt={video.title} />
              </a>
              <div className="video-info">
                <p className="video-title">{video.title}</p>
                <p className="video-details">🎬 {video.channel}</p>
                <p className="video-details">📅 Released: {video.publishedAt}</p>
                <p className="video-details">👁 {video.viewCount.toLocaleString()} views</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
