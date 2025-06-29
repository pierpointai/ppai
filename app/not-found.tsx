export default function NotFound() {
  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>404 - Page Not Found</h1>
          <p>The page you are looking for does not exist.</p>
          <a
            href="/"
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#0070f3",
              color: "white",
              borderRadius: "0.25rem",
              textDecoration: "none",
            }}
          >
            Return Home
          </a>
        </div>
      </body>
    </html>
  )
}
