import React from "react";

export default function StyleSavvyLogo({ scale = 1, className = "" }) {
  return (
    <div className={`logo-container ${className}`} style={{ ...styles.container, transform: `scale(${scale})`, transformOrigin: "left center" }}>
      {/* Inline styles for custom animations */}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
          @keyframes pulse-star {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(0.6); opacity: 0.5; }
          }
          .animate-shimmer-text {
            background: linear-gradient(
              110deg,
              #ffffff 30%,
              #c084fc 45%, /* Purple shimmer */
              #7dd3fc 55%, /* Blue shimmer */
              #ffffff 70%
            );
            background-size: 200% auto;
            color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
            animation: shimmer 5s linear infinite;
          }
          .star-1 { animation: pulse-star 2s ease-in-out infinite; transform-origin: 14px 15px; }
          .star-2 { animation: pulse-star 2.5s ease-in-out infinite 0.5s; transform-origin: 32px 30px; }
          .star-3 { animation: pulse-star 3s ease-in-out infinite 1s; transform-origin: 15px 33px; }
        `}
      </style>

      {/* App Icon */}
      <div style={styles.iconWrapper}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" /> {/* Deep Purple */}
              <stop offset="40%" stopColor="#8B5CF6" /> {/* Violet */}
              <stop offset="100%" stopColor="#0EA5E9" /> {/* Sky Blue */}
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Squircle */}
          <rect width="48" height="48" rx="14" fill="url(#icon-grad)" />

          {/* Magic Wand Stick */}
          <g transform="translate(24, 24) rotate(45) translate(-24, -24)">
            <rect
              x="20"
              y="11"
              width="8"
              height="26"
              rx="4"
              stroke="white"
              strokeWidth="2.5"
              fill="none"
            />
            <line
              x1="20"
              y1="19"
              x2="28"
              y2="19"
              stroke="white"
              strokeWidth="2.5"
            />
          </g>

          {/* Magic Sparkles (Stars) */}
          <path
            className="star-1"
            d="M14 9C14 12.3137 11.3137 15 8 15C11.3137 15 14 17.6863 14 21C14 17.6863 16.6863 15 20 15C16.6863 15 14 12.3137 14 9Z"
            fill="white"
          />
          <path
            className="star-2"
            d="M32 26C32 28.2091 30.2091 30 28 30C30.2091 30 32 31.7909 32 34C32 31.7909 33.7909 30 36 30C33.7909 30 32 28.2091 32 26Z"
            fill="white"
          />
          <path
            className="star-3"
            d="M15 30C15 31.6569 13.6569 33 12 33C13.6569 33 15 34.3431 15 36C15 34.3431 16.3431 33 18 33C16.3431 33 15 31.6569 15 30Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Animated Text */}
      <span className="animate-shimmer-text" style={styles.text}>
        StyleSavvy
      </span>
    </div>
  );
}

// Styling configuration
const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    backgroundColor: "transparent", // Changed from #000000 so it can blend in anywhere
    padding: "0", // Removed padding to make it drop-in replacement
    borderRadius: "0",
    width: "max-content",
    userSelect: "none",
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // Subtle outer glow matching the icon's gradient
    boxShadow: "0 4px 20px -2px rgba(139, 92, 246, 0.4)", 
    borderRadius: "14px",
  },
  text: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: "32px",
    fontWeight: "700",
    letterSpacing: "-0.03em",
    lineHeight: "1",
    margin: "0",
  },
};
