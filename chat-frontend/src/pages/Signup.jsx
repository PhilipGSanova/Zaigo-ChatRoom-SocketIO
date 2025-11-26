import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast, { Toaster } from "react-hot-toast"
import "./Signup.css"

async function signupRequest(fullName, email, username, password) {
  const res = await fetch((import.meta.env.VITE_API_URL || "https://zaigo-chatroom-socketio.onrender.com") + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ fullName, email, username, password }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Signup failed")
  return data
}

export default function Signup() {
  const navigate = useNavigate()

  const [fullName, setName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Validation function
  const validateForm = () => {
    if (!fullName.trim()) return "Name is required"
    if (!email.includes("@")) return "Invalid email format"
    if (username.length < 3) return "Username must be at least 3 characters"
    if (password.length < 6) return "Password must be at least 6 characters"
    if (password !== confirmPassword) return "Passwords do not match"
    return null
  }

  const handleSignup = async (e) => {
    e.preventDefault()

    const error = validateForm()
    if (error) {
      toast.error(error)
      return
    }

    setLoading(true)

    try {
      const data = await signupRequest(fullName, email, username, password)

      toast.success("Account created successfully!")

      // Save token
      if (data.token) localStorage.setItem("token", data.token)
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user))

      setTimeout(() => navigate("/chat"), 800)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-wrapper">
      <Toaster position="top-center" />

      {/* Background Particles */}
      <div className="particles"></div>

      <form className="signup-card" onSubmit={handleSignup}>
        <h1 className="signup-title">Create an Account</h1>

        <input
          className="signup-input"
          placeholder="Full name"
          required
          value={fullName}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="signup-input"
          placeholder="Email address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="signup-input"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password with toggle */}
        <div className="password-container">
          <input
            className="signup-input"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Confirm Password */}
        <input
          className="signup-input"
          placeholder="Confirm password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="signup-button" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <div className="signup-footer">
          Already have an account?{" "}
          <a href="/login" className="signup-link">
            Log in
          </a>
        </div>
      </form>
    </div>
  )
}
