import { useEffect, useRef, useState } from "react";
import { getMessages } from "../services/messageService";
import { getSocket, disconnectSocket } from "../services/socket";
import "./Chat.css";

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    let isMounted = true;

    // Load history first, then connect the socket for live updates.
    getMessages()
      .then((data) => {
        if (isMounted) setMessages(data);
      })
      .catch(() => {
        if (isMounted) setError("Couldn't load message history.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const socket = getSocket();

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleConnectError = () => {
      setConnected(false);
      setError("Couldn't connect to chat. Try refreshing the page.");
    };
    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("newMessage", handleNewMessage);

    return () => {
      isMounted = false;
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("newMessage", handleNewMessage);
      // Not disconnecting the socket itself here, since the user
      // might navigate away and back within the dashboard. It's
      // torn down on logout instead (see DashboardLayout/App).
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const socket = getSocket();
    socket.emit("sendMessage", { text }, (ack) => {
      if (!ack?.ok) {
        setError("Message failed to send. Please try again.");
      }
    });

    setDraft("");
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div>
          <h1>Community Chat</h1>
          <p className="chat-subtitle">A shared room for all residents.</p>
        </div>
        <span className={`connection-badge ${connected ? "online" : "offline"}`}>
          {connected ? "Connected" : "Connecting..."}
        </span>
      </div>

      {error && <div className="chat-error">{error}</div>}

      <div className="chat-window">
        {loading ? (
          <p className="chat-loading">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="chat-empty">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.user === currentUserId || msg.user?._id === currentUserId;
            return (
              <div key={msg._id} className={`chat-bubble-row ${isMine ? "mine" : ""}`}>
                <div className={`chat-bubble ${isMine ? "mine" : ""}`}>
                  {!isMine && <div className="chat-username">{msg.username}</div>}
                  <div className="chat-text">{msg.text}</div>
                  <div className="chat-time">{formatTime(msg.createdAt)}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
        />
        <button type="submit" disabled={!draft.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
