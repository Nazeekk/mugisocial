import React from "react";
import "./NA_Header.css";
import logo from "../../images/logo.png";

const NA_Header = () => {
  return (
    <header id="na_header">
      <img src={logo} alt="" className="header_logo" />
      <h1>
        <span>Mugi</span>Social
      </h1>
    </header>
  );
};

export default NA_Header;
