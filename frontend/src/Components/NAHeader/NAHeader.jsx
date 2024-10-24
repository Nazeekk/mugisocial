import React from "react";
import "./NAHeader.css";
import logo from "../../images/logo.png";

const NAHeader = () => {
  return (
    <header id="na_header">
      <img src={logo} alt="" className="header_logo" />
      <h1>
        <span>Mugi</span>Social
      </h1>
    </header>
  );
};

export default NAHeader;
