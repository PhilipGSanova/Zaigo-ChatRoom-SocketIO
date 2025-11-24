import { useState } from "react"
import MessageBubble from "./MessageBubble"

export default function ChatWindow({ messages, socket }) {
  const [text, setText] = useState("")

  const sendMessage = () => {
    if (!text.trim()) return
    socket.emit("message:send", text)
    setText("")
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900">
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
      </div>

      <div className="p-4 bg-gray-800 flex gap-2">
        <input
          className="flex-1 p-3 bg-gray-700 rounded-xl focus:outline-none"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
          onClick={sendMessage}
        >Send</button>
      </div>
    </div>
  )
}