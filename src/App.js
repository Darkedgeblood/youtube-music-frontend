import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [year, setYear] = useState("");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVideos = async () => {
    if (!year) return alert("Please enter a year!");
    setLoading(true);
    setVideos([]);

    try {
      const response = await axios.get("http://localhost:5000/top-music-videos", {
        params: { year },
      });
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      alert("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Top 20 Most Viewed Music Videos</h1>
      <input
        type="number"
        placeholder="Enter Year (e.g., 2024)"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        style={{ padding: "10px", marginRight: "10px" }}
      />
      <button onClick={fetchVideos} style={{ padding: "10px" }}>
        {loading ? "Loading..." : "Fetch Videos"}
      </button>
      <div style={{ marginTop: "20px" }}>
        {videos.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {videos.map((video, index) => (
              <li key={video.videoId} style={{ marginBottom: "15px" }}>
                <strong>
                  {index + 1}. {video.title}
                </strong>{" "}
                by {video.channel} - {video.viewCount.toLocaleString()} views
                <br />
                <a
                  href={`https://youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "blue" }}
                >
                  Watch on YouTube
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;