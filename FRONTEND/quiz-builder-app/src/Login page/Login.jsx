import React, { useState } from "react";
import axios from "axios";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://quiz-app-mern-0bj4.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );
      console.log("Login Response:", response.data); // Ensure the token is included
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem("auth-token", token); // Store token
        localStorage.setItem("user", JSON.stringify(user)); // Store user data
        console.log("Token Stored:", localStorage.getItem("auth-token")); // Verify storage
        navigate("/dashboard"); // Redirect to dashboard
      } else {
        setError("Login failed. Please try again.");
      }

      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="container">
      <div className="header-login">
        <h1 className="header-quizze">QUIZZIE</h1>
      </div>
      <div className="btn">
        <Link to="/signup">
          <button className="btn-signup">Sign up</button>
        </Link>
        <button className="btn-login">Log In</button>
      </div>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="email">
          <label className="label-email">Email</label>
          <input
            type="email"
            className="input-email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div className="password">
          <label className="label-password">Password</label>
          <input
            type="password"
            className="input-password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <div className="submit">
          <button type="submit" className="submit-btn">
            Log In
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
