import { useEffect, useState } from 'react'
import useSocket from '../hooks/useSocket'
import ChatWindow from '../components/ChatWindow'
import Sidebar from '../components/Sidebar'

export default function Chat() {
  const token = localStorage.getItem('token')
  const socket = useSocket(token)

  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!socket) return

    socket.on('message:new', (msg) => {
      setMessages((prev) => [...prev, msg])
    })
  }, [socket])

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <ChatWindow messages={messages} socket={socket} />
    </div>
  )
}