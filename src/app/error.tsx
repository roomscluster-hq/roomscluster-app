"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827" }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "8px", maxWidth: "360px" }}>
            RoomsCluster ran into an unexpected error. Try refreshing the page.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "24px",
              background: "#2563EB",
              color: "white",
              padding: "10px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}