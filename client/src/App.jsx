import { useState } from "react";
import { useSocket } from "./context/SocketProvider";
import "./App.css"

function App() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");

  return (
    <div>
      <div>
        <input
         onChange={(e) => setMessage(e.target.value)}
          //className={classes["chat-input"]}
          className = "chat-input"
          placeholder="Message..."
        />
        <button
         onClick={(e) => sendMessage(message)}
          // className={classes["button"]}
          className = "button"
        >
          Send
        </button>
      </div>
      <div>
        {messages.map((e) => (
          <li>{e}</li>
        ))}
      </div>
    </div>
  );
}

export default App
