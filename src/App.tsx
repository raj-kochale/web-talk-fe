import { useEffect, useState } from "react";

let typingTimeout: NodeJS.Timeout;

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setSocket(ws);

    ws.onmessage = (ev) => {
      if (ev.data.startsWith("users:")) {
        const userList = JSON.parse(ev.data.replace("users:", ""));
        setUsers(userList);
      } else if (ev.data.startsWith("typing:")) {
        const typer = ev.data.replace("typing:", "");
        setTyping(typer);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => setTyping(null), 1500);
      } else {
        setMessages((prev) => [...prev, ev.data]);
      }
    };

    return () => ws.close();
  }, []);

  function joinRoom() {
    if (!socket || !username || !room) return;
    socket.send(`join:${username}:${room}`);
  }

  function sendMessage() {
    if (!socket || message.trim() === "") return;
    socket.send(message);
    setMessage("");
  }

  function handleTyping() {
    socket?.send("typing");
  }

  return (
    <div>
      <h1>🔥 Group Chat App with Rooms</h1>

      <input
        type="text"
        placeholder="Username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Room Name..."
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>

      <div>
        <h2>Users in Room: {room}</h2>
        {users.map((user) => (
          <div key={user}>{user}</div>
        ))}
        {typing && <h4 style={{ color: "green" }}>{typing} is typing...</h4>}
      </div>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>

      <input
        type="text"
        placeholder="Message..."
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
