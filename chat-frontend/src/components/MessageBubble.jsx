export default function MessageBubble({ msg }) {
  return (
    <div className="p-3 bg-gray-700 rounded-xl w-max max-w-xl">
      {msg}
    </div>
  )
}