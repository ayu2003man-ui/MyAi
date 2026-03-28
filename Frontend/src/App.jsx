import { useState, useEffect, useRef } from "react";

const RobotIcon = ({ size = 80 }) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 80 100">
    <ellipse cx="40" cy="97" rx="22" ry="5" fill="#534AB7" opacity="0.18"/>
    <rect x="28" y="72" width="10" height="14" rx="3" fill="#7F77DD"/>
    <rect x="42" y="72" width="10" height="14" rx="3" fill="#7F77DD"/>
    <rect x="10" y="40" width="8" height="18" rx="4" fill="#AFA9EC"/>
    <rect x="62" y="40" width="8" height="18" rx="4" fill="#AFA9EC"/>
    <rect x="18" y="38" width="44" height="38" rx="8" fill="#7F77DD"/>
    <rect x="14" y="14" width="52" height="36" rx="10" fill="#534AB7"/>
    <rect x="24" y="22" width="14" height="10" rx="5" fill="white" opacity="0.95"/>
    <rect x="42" y="22" width="14" height="10" rx="5" fill="white" opacity="0.95"/>
    <circle cx="31" cy="27" r="3.5" fill="#3C3489"/>
    <circle cx="49" cy="27" r="3.5" fill="#3C3489"/>
    <circle cx="32" cy="26" r="1.2" fill="white"/>
    <circle cx="50" cy="26" r="1.2" fill="white"/>
    <path d="M30 38 Q40 44 50 38" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
    <rect x="36" y="8" width="8" height="7" rx="2" fill="#AFA9EC"/>
    <circle cx="40" cy="6" r="3" fill="#EF9F27"/>
    <circle cx="40" cy="6" r="1.5" fill="#FAC775"/>
  </svg>
);

const styles = `
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes blink { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.05)} }
  @keyframes popIn { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
  @keyframes slideIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes typingDot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
  .robot-float { animation: float 3s ease-in-out infinite; cursor: pointer; }
  .robot-float:hover { transform: scale(1.05); }
  .chat-msg { animation: slideIn 0.2s ease; }
  .chat-open { animation: popIn 0.28s cubic-bezier(0.34,1.56,0.64,1); }
  .typing-dot { width:7px;height:7px;border-radius:50%;background:#7F77DD;animation:typingDot 1.1s infinite;display:inline-block;margin:0 2px; }
  .typing-dot:nth-child(2){animation-delay:.18s;}
  .typing-dot:nth-child(3){animation-delay:.36s;}
`;

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([{ sender: "AI", text: "Hey there! How can I help you today? 👋" }]);
  const [isTyping, setIsTyping] = useState(false);
  const stopRef = useRef(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView(); }, [chat]);

  const sendMessage = async () => {
    if (!message) return;
    stopRef.current = false;
    setIsTyping(true);
    const userMsg = { sender: "You", text: message };
    setChat(prev => [...prev, userMsg]);
    setMessage("");

    let botIndex;
    setChat(prev => { botIndex = prev.length; return [...prev, { sender: "AI", text: "..." }]; });

    try {
      const res = await fetch("https://myai-izkb.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (res.status === 429) {
        setChat(prev => { const u=[...prev]; u[botIndex]={sender:"AI",text:"⚠️ Too many requests. Wait a moment!"}; return u; });
        setIsTyping(false); return;
      }
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      let botText = "";
      for (let char of data.reply) {
        if (stopRef.current) break;
        botText += char;
        await new Promise(r => setTimeout(r, 15));
        setChat(prev => { const u=[...prev]; u[botIndex]={sender:"AI",text:botText}; return u; });
      }
    } catch {
      setChat(prev => { const u=[...prev]; u[botIndex]={sender:"AI",text:"❌ Something went wrong. Try again!"}; return u; });
    }
    setIsTyping(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>

        {/* Chat Window */}
        {isOpen && (
          <div className="chat-open" style={{
            position: "absolute", bottom: 115, right: 0,
            width: 320, height: 460,
            background: "white", borderRadius: 20,
            boxShadow: "0 8px 32px rgba(83,74,183,0.2)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{ background: "#534AB7", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <RobotIcon size={32} />
              <div>
                <p style={{ color: "white", fontSize: 13, fontWeight: 600, margin: 0 }}>AI Assistant</p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: 0 }}>Online</p>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 9 }}>
              {chat.map((msg, i) => (
                <div key={i} className="chat-msg" style={{
                  alignSelf: msg.sender === "You" ? "flex-end" : "flex-start",
                  background: msg.sender === "You" ? "#7F77DD" : "#f0f0f5",
                  color: msg.sender === "You" ? "white" : "#222",
                  padding: "8px 12px", borderRadius: 16, maxWidth: "80%", fontSize: 13, lineHeight: 1.5,
                  borderBottomRightRadius: msg.sender === "You" ? 4 : 16,
                  borderBottomLeftRadius: msg.sender === "You" ? 16 : 4,
                }}>
                  {msg.text === "..." ? (
                    <span>
                      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                    </span>
                  ) : msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid #eee", display: "flex", gap: 8 }}>
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                style={{ flex: 1, padding: "8px 13px", borderRadius: 20, border: "1px solid #ddd", fontSize: 13, outline: "none" }}
              />
              {!isTyping ? (
                <button onClick={sendMessage} style={{ width: 34, height: 34, borderRadius: "50%", background: "#7F77DD", border: "none", cursor: "pointer", color: "white", fontSize: 16 }}>➤</button>
              ) : (
                <button onClick={() => { stopRef.current = true; setIsTyping(false); }} style={{ width: 34, height: 34, borderRadius: "50%", background: "#E24B4A", border: "none", cursor: "pointer", color: "white", fontSize: 16 }}>■</button>
              )}
            </div>
          </div>
        )}

        {/* Floating label */}
        {!isOpen && (
          <div style={{ position: "absolute", bottom: 112, right: 0, background: "white", border: "1px solid #ddd", borderRadius: 12, padding: "5px 11px", fontSize: 12, fontWeight: 500, color: "#534AB7", whiteSpace: "nowrap", pointerEvents: "none" }}>
            Chat with me!
          </div>
        )}

        {/* Robot Button */}
        <div className="robot-float" onClick={() => setIsOpen(!isOpen)}>
          <RobotIcon size={72} />
        </div>
      </div>
    </>
  );
}