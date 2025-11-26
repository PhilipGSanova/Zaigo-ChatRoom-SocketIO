import React, { useState } from "react"
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import "./Login.css"
import "./Signup.css"

async function loginRequest(identifier, password) {
  const res = await fetch((import.meta.env.VITE_API_URL || 'https://zaigo-chatroom-socketio.onrender.com') + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
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
      if (data.token) localStorage.setItem('token', data.token)
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/chat')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="particles"></div>
      <form onSubmit={handleLogin} className="login-card">
        <h1 className="login-title">Welcome Back</h1>

        {error && <div className="login-error">{error}</div>}

        <input
          placeholder="Email or Username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="login-input"
          required
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          required
        />

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="login-footer">
          Don’t have an account? <Link to="/signup" className="login-link">Sign up</Link>
        </div>
      </form>
    </div>
  )
}
