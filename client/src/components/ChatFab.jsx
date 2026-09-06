import { Link, useLocation } from "react-router-dom";

export default function ChatFab() {
  const location = useLocation();

  // Don't show the button while already on the Chat page itself.
  if (location.pathname === "/chat") return null;

  return (
    <Link
      to="/chat"
      aria-label="Open chat"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "#1f2937",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
        textDecoration: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        zIndex: 999,
      }}
    >
      💬
    </Link>
  );
}