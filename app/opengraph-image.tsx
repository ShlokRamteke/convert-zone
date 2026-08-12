import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ConvertZone - In-Browser Local Media Converter";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 40%)",
          padding: "60px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxSizing: "border-box",
        }}
      >
        {/* Left Column: Typography & Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            maxWidth: "640px",
            zIndex: 10,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              color: "#059669",
              padding: "6px 16px",
              borderRadius: "9999px",
              fontSize: "18px",
              fontWeight: "700",
              letterSpacing: "-0.01em",
              marginBottom: "24px",
            }}
          >
            🔒 100% Local &amp; Private Processing
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "52px",
              fontWeight: "800",
              lineHeight: "1.15",
              color: "#0f172a",
              letterSpacing: "-0.03em",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>ConvertZone – In-</span>
            <span>Browser Local Media</span>
            <span
              style={{
                background: "linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Converter
            </span>
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "22px",
              lineHeight: "1.45",
              color: "#64748b",
              marginBottom: "32px",
            }}
          >
            Convert videos, images, and audio directly in your browser. 100% private, 0 bytes uploaded to servers.
          </div>

          {/* Action CTA Button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "14px 32px",
              borderRadius: "12px",
              fontSize: "20px",
              fontWeight: "700",
              boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)",
            }}
          >
            Start Free →
          </div>
        </div>

        {/* Right Column: Visual Brand Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Background Decorative Rings */}
          <div
            style={{
              position: "absolute",
              width: "440px",
              height: "440px",
              borderRadius: "50%",
              backgroundColor: "rgba(37, 99, 235, 0.08)",
              filter: "blur(20px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "360px",
              height: "360px",
              borderRadius: "50%",
              backgroundColor: "rgba(16, 185, 129, 0.08)",
              transform: "translate(-30px, -30px)",
            }}
          />

          {/* Main App Icon Container */}
          <div
            style={{
              width: "320px",
              height: "320px",
              borderRadius: "72px",
              background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 25px 50px -12px rgba(37, 99, 235, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2) inset",
            }}
          >
            {/* SVG Logo Mark inside Icon */}
            <svg
              width="210"
              height="210"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 28 13 C 34 13 37 18 37 24 C 37 29 33 34 27 35"
                stroke="#ffffff"
                strokeWidth="3.8"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M 23 35 L 28 32 L 28 38 Z" fill="#ffffff" />
              <path
                d="M 20 35 C 14 35 11 30 11 24 C 11 19 15 14 21 13"
                stroke="#ffffff"
                strokeWidth="3.8"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M 25 13 L 20 16 L 20 10 Z" fill="#ffffff" />
              <circle cx="24" cy="24" r="3.5" fill="#ffffff" />
            </svg>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
