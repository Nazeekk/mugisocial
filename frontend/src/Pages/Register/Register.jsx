import React, { useState } from "react";
import NA_Header from "../../Components/NA_Header/NA_Header";
import { Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState("");
  
	const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(BASE_URL + "/api/auth/register", {
        userName,
        email,
        password,
        location,
        phone,
        repeatPassword,
      });

      window.location.href = "/login";
    } catch (error) {
      setMessage(error.response.data.message);
      console.error(error.response.data.message);
    }
  };

  return (
    <div className="auth">
      <NA_Header />
      <form onSubmit={handleRegister} className="auth-form">
        <input
          type="text"
          placeholder="Ім'я"
          className="auth-input"
          onChange={(e) => setUserName(e.target.value)}
          autoComplete="name"
          maxLength="30"
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="on"
          required
        />
        <input
          type="text"
          placeholder="Адреса"
          className="auth-input"
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="tel"
          placeholder="Номер телефону"
          className="auth-input"
          onChange={(e) => setPhone(e.target.value)}
          pattern="[0-9]{10}"
        />
        <input
          type="password"
          placeholder="Придумайте пароль"
          className="auth-input"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Повторіть пароль"
          className="auth-input"
          onChange={(e) => setRepeatPassword(e.target.value)}
          required
        />
        {message && <h3 className="server-message">{message}</h3>}
        <input type="submit" value="Реєстрація" className="button_primary" />
      </form>

      <div className="auth_links">
        <Link to="/login">Я вже зареєстрований</Link>
      </div>
    </div>
  );
};

export default Register;
