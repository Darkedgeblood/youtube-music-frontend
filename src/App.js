import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MIN_YEAR = 2005;
const MAX_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i);

/** 123456789 -> "123.4M" */
function formatViews(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

/** ISO date -> "Jan 1, 2020" */
function formatDate(iso) {
  if (!iso) return 'Unknown date';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown date';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function App() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [total, setTotal] = useState(0);

  const dropdownRef = useRef(null);

  // Close the year dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchVideos = useCallback(async (year) => {
    setLoading(true);
    setError('');
    setVideos([]);
    try {
      const res = await axios.get(`${API_URL}/top-music-videos`, {
        params: { year },
        timeout: 60000, // server can take a while on a cold year
      });
      const list = res.data?.videos ?? [];
      if (list.length === 0) {
        setError(`No music videos found for ${year}.`);
      } else {
        setVideos(list);
        setTotal(res.data?.total ?? list.length);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Could not reach the server. Is the backend running?'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setDropdownOpen(false);
    fetchVideos(year);
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <span className="hero-badge">REWIND CHARTS</span>
          <h1>
            The Most-Viewed Music Videos
            <span className="hero-sub"> of any year on YouTube</span>
          </h1>
          <p className="hero-text">
            Pick a year, get the definitive top 50. Ranked by real view counts.
          </p>

          <div className="picker" ref={dropdownRef}>
            <button
              className={`picker-btn ${dropdownOpen ? 'open' : ''}`}
              onClick={() => setDropdownOpen(o => !o)}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
            >
              <span className="picker-label">
                {selectedYear ? `Year: ${selectedYear}` : 'Select a year'}
              </span>
              <svg
                className={`chevron ${dropdownOpen ? 'up' : ''}`}
                width="16" height="16" viewBox="0 0 24 24" fill="none"
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {dropdownOpen && (
              <div className="picker-panel" role="listbox">
                {YEARS.map(y => (
                  <button
                    key={y}
                    role="option"
                    aria-selected={y === selectedYear}
                    className={`year-option ${y === selectedYear ? 'active' : ''}`}
                    onClick={() => handleYearSelect(y)}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="content">
        {selectedYear && (loading || videos.length > 0) && (
          <div className="results-head">
            <h2>
              Top {total > 0 ? total : ''} of {selectedYear}
            </h2>
            {loading && <span className="hint">Fetching from YouTube… this can take a few seconds</span>}
          </div>
        )}

        {error && (
          <div className="notice error-notice">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <ol className="chart">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="row skeleton-row">
                <div className="rank skeleton-box" />
                <div className="thumb skeleton-box" />
                <div className="meta">
                  <div className="skeleton-line w70" />
                  <div className="skeleton-line w40" />
                </div>
                <div className="views skeleton-box" />
              </li>
            ))}
          </ol>
        )}

        {!loading && videos.length > 0 && (
          <ol className="chart">
            {videos.map(v => (
              <li key={v.videoId} className="row">
                <span className={`rank ${v.rank <= 3 ? `top-${v.rank}` : ''}`}>
                  {v.rank}
                </span>
                <a
                  className="thumb"
                  href={`https://www.youtube.com/watch?v=${v.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`}
                    alt={v.title}
                    loading="lazy"
                  />
                </a>
                <div className="meta">
                  <a
                    className="title"
                    href={`https://www.youtube.com/watch?v=${v.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {v.title}
                  </a>
                  <span className="channel">{v.channel}</span>
                  <span className="date">{formatDate(v.publishedAt)}</span>
                </div>
                <div className="views">
                  <span className="views-num">{formatViews(v.viewCount)}</span>
                  <span className="views-label">views</span>
                </div>
              </li>
            ))}
          </ol>
        )}

        {!selectedYear && !loading && !error && (
          <div className="notice empty-notice">
            <span className="empty-icon">🎧</span>
            <p>Choose a year above to reveal its most-watched songs.</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Results are fetched live from the YouTube Data API · top 50 per year</p>
      </footer>
    </div>
  );
}
