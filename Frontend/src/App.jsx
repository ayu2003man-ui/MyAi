import { useState, useEffect, useRef } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([{ sender: "AI", text: "Hey there! How can I help you today? 👋" }]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const stopRef = useRef(false);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!message) return;
    stopRef.current = false;
    setIsTyping(true);

    const userMsg = { sender: "You", text: message };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");

    let botIndex;
    setChat((prev) => { botIndex = prev.length; return [...prev, { sender: "AI", text: "..." }]; });

    try {
      const res = await fetch("https://myai-izkb.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (res.status === 429) {
        setChat((prev) => { const u = [...prev]; u[botIndex] = { sender: "AI", text: "⚠️ Too many requests. Please wait and try again." }; return u; });
        setIsTyping(false); return;
      }

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      let botText = "";

      for (let char of data.reply) {
        if (stopRef.current) break;
        botText += char;
        await new Promise((r) => setTimeout(r, 15));
        setChat((prev) => { const u = [...prev]; u[botIndex] = { sender: "AI", text: botText }; return u; });
      }
    } catch (e) {
      setChat((prev) => { const u = [...prev]; u[botIndex] = { sender: "AI", text: "❌ Something went wrong. Please try again." }; return u; });
    }
    setIsTyping(false);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView(); }, [chat]);

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000 }}>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "absolute", bottom: "70px", right: "0",
          width: "340px", height: "480px",
          background: "white", borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "popIn 0.25s ease"
        }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #7F77DD, #534AB7)", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "white", fontWeight: 600, fontSize: 14, margin: 0 }}>AI Assistant</p>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: 0 }}>Online</p>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {chat.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.sender === "You" ? "flex-end" : "flex-start",
                background: msg.sender === "You" ? "#7F77DD" : "#f0f0f0",
                color: msg.sender === "You" ? "white" : "black",
                padding: "9px 13px", borderRadius: "16px",
                borderBottomRightRadius: msg.sender === "You" ? "4px" : "16px",
                borderBottomLeftRadius: msg.sender === "You" ? "16px" : "4px",
                maxWidth: "78%", fontSize: "13.5px", lineHeight: 1.5
              }}>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px", borderTop: "1px solid #eee", display: "flex", gap: "8px" }}>
            <input
              style={{ flex: 1, padding: "9px 13px", borderRadius: "20px", border: "1px solid #ddd", fontSize: 13, outline: "none" }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
            />
            {!isTyping ? (
              <button onClick={sendMessage} style={{ width: 36, height: 36, borderRadius: "50%", background: "#7F77DD", border: "none", cursor: "pointer", color: "white", fontSize: 16 }}>➤</button>
            ) : (
              <button onClick={() => { stopRef.current = true; setIsTyping(false); }} style={{ width: 36, height: 36, borderRadius: "50%", background: "red", border: "none", cursor: "pointer", color: "white", fontSize: 16 }}>■</button>
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button onClick={() => setIsOpen(!isOpen)} style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg, #7F77DD, #534AB7)",
        border: "none", cursor: "pointer", fontSize: 26,
        boxShadow: "0 4px 16px rgba(83,74,183,0.4)",
        transition: "transform 0.2s"
      }}>
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}

export default App;