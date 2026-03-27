import { useState, useEffect, useRef } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

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
    setChat((prev) => {
      botIndex = prev.length;
      return [...prev, { sender: "AI", text: "..." }];
    });

    const res = await fetch("https://your-render-url.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    let botText = "";

    for (let char of data.reply) {
      if (stopRef.current) break;

      botText += char;

      await new Promise((r) => setTimeout(r, 15));

      setChat((prev) => {
        const updated = [...prev];
        updated[botIndex] = { sender: "AI", text: botText };
        return updated;
      });
    }

    setIsTyping(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView();
  }, [chat]);

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>🤖 AI Chatbot</h2>

      <div
        style={{
          height: "400px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {chat.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.sender === "You" ? "flex-end" : "flex-start",
              background: msg.sender === "You" ? "#007bff" : "#eee",
              color: msg.sender === "You" ? "white" : "black",
              padding: "10px",
              borderRadius: "10px",
              maxWidth: "70%",
            }}
          >
            {msg.text}
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      <div style={{ marginTop: "10px", display: "flex" }}>
        <input
          style={{ flex: 1, padding: "10px" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type message..."
        />

        {!isTyping ? (
          <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
            Send
          </button>
        ) : (
          <button
            onClick={() => {
              stopRef.current = true;
              setIsTyping(false);
            }}
            style={{ marginLeft: "10px", background: "red", color: "white" }}
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}

export default App;