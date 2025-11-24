import { useState } from "react"
import { useNavigate } from 'react-router-dom'

// Simple auth service (calls backend)
async function loginRequest(identifier, password) {
  const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // important so httpOnly cookie from server is stored
    body: JSON.stringify({ identifier, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Login failed')
  return data
}

export default function Login() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await loginRequest(identifier, password)

      // Backend returns token in response body and also sets httpOnly cookie (if configured)
      // store token for socket auth (localStorage used here)
      if (data.token) localStorage.setItem('token', data.token)

      // optionally store user info
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user))

      // redirect to chat
      navigate('/chat')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">Login</h1>

        {error && <div className="text-sm text-red-400 p-2 bg-red-900/20 rounded">{error}</div>}

        <input
          placeholder="Email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-700 focus:outline-none"
          required
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-700 focus:outline-none"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl text-lg"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="text-sm text-center text-gray-400">
          Don't have an account? <a href="#" className="text-blue-400">Sign up</a>
        </div>
      </form>
    </div>
  )
}