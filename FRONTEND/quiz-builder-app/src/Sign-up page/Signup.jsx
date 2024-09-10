import React, { useState } from "react";
import "./signup.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isValidName, setIsValidName] = useState(true);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [isMatchingPassword, setIsMatchingPassword] = useState(true);

  const validateName = (name) => /^[A-Za-z\s]{2,}$/.test(name);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleNameChange = (e) => {
    const inputName = e.target.value;
    setName(inputName);
    setIsValidName(validateName(inputName));
  };

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    setIsValidEmail(validateEmail(inputEmail));
  };

  const handlePasswordChange = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    setIsValidPassword(validatePassword(inputPassword));
    setIsMatchingPassword(inputPassword === confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const inputConfirmPassword = e.target.value;
    setConfirmPassword(inputConfirmPassword);
    setIsMatchingPassword(inputConfirmPassword === password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission from refreshing the page

    if (!name || !email || !password || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (
      !isValidName ||
      !isValidEmail ||
      !isValidPassword ||
      !isMatchingPassword
    ) {
      alert("Please fix the errors in the form");
      return;
    }

    try {
      const response = await axios.post(
        "${REACT_APP_API_BASE_URL}/api/auth/register",
        {
          name,
          email,
          password,
          confirmPassword,
        }
      );

      if (response.status === 200) {
        alert("User registered successfully");
        navigate("/"); // Redirect to login page after successful registration
      }
    } catch (error) {
      console.error("There was an error registering the user!", error);
      alert("Failed to register user");
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
        <Link to="/">
          <button className="btn-login">Log In</button>
        </Link>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="name">
          <label className="label-name">Name</label>
          <input
            type="text"
            className={`input-name ${!isValidName ? "invalid" : ""}`}
            value={name}
            onChange={handleNameChange}
            placeholder={!isValidName ? "Invalid Name" : ""}
            required
          />
        </div>
        <div className="email">
          <label className="label-email">Email</label>
          <input
            type="email"
            className={`input-email ${!isValidEmail ? "invalid" : ""}`}
            value={email}
            onChange={handleEmailChange}
            placeholder={!isValidEmail ? "Invalid Email" : ""}
            required
          />
        </div>
        <div className="password">
          <label className="label-password">Password</label>
          <input
            type="password"
            className={`input-password ${!isValidPassword ? "invalid" : ""}`}
            value={password}
            onChange={handlePasswordChange}
            placeholder={!isValidPassword ? "Weak Password" : ""}
            required
          />
        </div>
        <div className="confirm-password">
          <label className="label-confirm-password">Confirm Password</label>
          <input
            type="password"
            className={`input-confirm-password ${
              !isMatchingPassword ? "invalid" : ""
            }`}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder={!isMatchingPassword ? "Passwords don't match" : ""}
            required
          />
        </div>
        <div className="submit">
          <button type="submit" className="submit-btn">
            Sign-Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
