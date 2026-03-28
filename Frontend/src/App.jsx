import { useState, useEffect, useRef } from "react";

const styles = `
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes popIn { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
  @keyframes slideIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes typingDot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
  .robot-float { animation: float 3s ease-in-out infinite; cursor: pointer; }
  .robot-float:hover { transform: scale(1.05); }
  .chat-msg { animation: slideIn 0.2s ease; }
  .chat-open { animation: popIn 0.28s cubic-bezier(0.34,1.56,0.64,1); }
  .typing-dot { width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.8);animation:typingDot 1.1s infinite;display:inline-block;margin:0 2px; }
  .typing-dot:nth-child(2){animation-delay:.18s;}
  .typing-dot:nth-child(3){animation-delay:.36s;}
  .chat-input::placeholder { color: rgba(255,255,255,0.4); }
  .messages-area::-webkit-scrollbar { width: 3px; }
  .messages-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
`;

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { sender: "AI", text: "Hey there! How can I help you today? 👋" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const stopRef = useRef(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView();
  }, [chat]);

  const sendMessage = async () => {
    if (!message) return;
    stopRef.current = false;
    setIsTyping(true);
    const userMsg = { sender: "You", text: message };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");

    let botIndex;
    setChat((prev) => {
      botIndex = prev.length;
      return [...prev, { sender: "AI", text: "..." }];
    });

    try {
      const res = await fetch("https://myai-izkb.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (res.status === 429) {
        setChat((prev) => {
          const u = [...prev];
          u[botIndex] = { sender: "AI", text: "⚠️ Too many requests. Wait a moment!" };
          return u;
        });
        setIsTyping(false);
        return;
      }
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      let botText = "";
      for (let char of data.reply) {
        if (stopRef.current) break;
        botText += char;
        await new Promise((r) => setTimeout(r, 15));
        setChat((prev) => {
          const u = [...prev];
          u[botIndex] = { sender: "AI", text: botText };
          return u;
        });
      }
    } catch {
      setChat((prev) => {
        const u = [...prev];
        u[botIndex] = { sender: "AI", text: "❌ Something went wrong. Try again!" };
        return u;
      });
    }
    setIsTyping(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>

        {/* Chat Window */}
        {isOpen && (
          <div
            className="chat-open"
            style={{
              position: "absolute",
              bottom: 115,
              right: 0,
              width: 320,
              height: 460,
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 20,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "rgba(83, 74, 183, 0.5)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                🤖
              </div>
              <div>
                <p style={{ color: "white", fontSize: 13, fontWeight: 600, margin: 0 }}>
                  AI Assistant
                </p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: 0 }}>
                  Online
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div
              className="messages-area"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 9,
              }}
            >
              {chat.map((msg, i) => (
                <div
                  key={i}
                  className="chat-msg"
                  style={{
                    alignSelf: msg.sender === "You" ? "flex-end" : "flex-start",
                    background:
                      msg.sender === "You"
                        ? "rgba(127, 119, 221, 0.75)"
                        : "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: 16,
                    maxWidth: "80%",
                    fontSize: 13,
                    lineHeight: 1.5,
                    borderBottomRightRadius: msg.sender === "You" ? 4 : 16,
                    borderBottomLeftRadius: msg.sender === "You" ? 16 : 4,
                  }}
                >
                  {msg.text === "..." ? (
                    <span>
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </span>
                  ) : (
                    msg.text
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: "10px 12px",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                gap: 8,
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <input
                className="chat-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: "8px 13px",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              {!isTyping ? (
                <button
                  onClick={sendMessage}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "rgba(127, 119, 221, 0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    cursor: "pointer",
                    color: "white",
                    fontSize: 16,
                  }}
                >
                  ➤
                </button>
              ) : (
                <button
                  onClick={() => {
                    stopRef.current = true;
                    setIsTyping(false);
                  }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "rgba(226, 75, 74, 0.8)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    cursor: "pointer",
                    color: "white",
                    fontSize: 16,
                  }}
                >
                  ■
                </button>
              )}
            </div>
          </div>
        )}

       

        {/* Robot Button */}
        <div
          className="robot-float"
          onClick={() => setIsOpen(!isOpen)}
          style={{ cursor: "pointer" }}
        >
          <img
            src="/robot.png"
            width={100}
            height={100}
            style={{ borderRadius: "50%" }}
          />
        </div>
      </div>
    </>
  );
}