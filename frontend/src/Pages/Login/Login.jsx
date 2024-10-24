import React, { useState } from "react";
import "./Login.css";
import { Link } from "react-router-dom";
import NAHeader from "../../Components/NAHeader/NAHeader";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(BASE_URL);
    try {
      const response = await axios.post(BASE_URL + "/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      if (response.data.isAdmin) localStorage.setItem("isAdmin", true);
      window.location.href = "/";
    } catch (error) {
      setMessage(error.response.data.message);
      console.error(error.response.data.message);
    }
  };

  return (
    <div className="auth">
      <NAHeader />
      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          placeholder="E-mail"
          className="auth-input"
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email webauthn"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          className="auth-input"
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password webauthn"
          required
        />
        {message && <h3 className="server-message">{message}</h3>}
        <input type="submit" value="Вхід" className="button_primary" />
      </form>
      <div className="auth_links">
        <Link to="/register">Зареєструватись</Link>
      </div>
    </div>
  );
};

export default Login;
