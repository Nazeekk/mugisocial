import React from "react";
import "./Footer.css";
import logo from "../../images/logo.png";

const Footer = () => {
  return (
    <footer id="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img src={logo} alt="лого" />
          <h2>
            Mugi<span>Social</span>
          </h2>
        </div>
        <ul>
          <li>Інформація</li>
          <li>Розробники</li>
          <li>Політика конфіденційності</li>
          <li>Умови</li>
        </ul>
      </div>
      <p className="copyright">MugiSocial&copy;2024</p>
    </footer>
  );
};

export default Footer;
