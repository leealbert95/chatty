import "./LoginPage.scss";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { InvalidCredentialsCase } from "../../../shared/user/login";
import { useAuth } from "./AuthContext";
import { UserAlreadyExistsError, InvalidCredentialsError } from "./userApi";

type Mode = "login" | "register";

const USER_ALREADY_EXISTS_MSG =
  "An account with this email already exists. Please use a different one.";
const USER_NOT_FOUND_MSG = "Could not find an account with this email.";
const UNKOWN_INVALIDATION_ERROR_MSG = "An unknown invalidation error occurred.";
const INCORRECT_PASSWORD_MSG = "Incorrect password. Please try again.";
const UNEXPECTED_ERROR_MSG = "An unexpected error occurred. Please try again.";

const getInvalidCredentialsMessage = (reason: InvalidCredentialsCase) => {
  switch (reason) {
    case InvalidCredentialsCase.USER_NOT_FOUND:
      return USER_NOT_FOUND_MSG;
    case InvalidCredentialsCase.WRONG_PASSWORD:
      return INCORRECT_PASSWORD_MSG;
    default:
      return UNKOWN_INVALIDATION_ERROR_MSG;
  }
};

/**
 * Renders the login and sign-up form, handling both authentication flows.
 */
const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/");
    } catch (e) {
      if (e instanceof InvalidCredentialsError) {
        return setError(getInvalidCredentialsMessage(e.reason));
      }
      if (e instanceof UserAlreadyExistsError) {
        return setError(USER_ALREADY_EXISTS_MSG);
      }
      setError(UNEXPECTED_ERROR_MSG);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Chatty</h1>
        <div className="mode-toggle">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
            type="button"
          >
            Log In
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
            type="button"
          >
            Sign Up
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error !== null && <p className="error">{error}</p>}
          <button type="submit" className="submit-btn">
            {mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
