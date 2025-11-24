export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 p-6 border-r border-gray-700 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Chats</h2>

      <div className="space-y-2">
        <div className="p-3 bg-gray-700 rounded-xl cursor-pointer">General Chat</div>
        <div className="p-3 bg-gray-700 rounded-xl cursor-pointer">Developers</div>
        <div className="p-3 bg-gray-700 rounded-xl cursor-pointer">Friends</div>
      </div>
    </div>
  )
}