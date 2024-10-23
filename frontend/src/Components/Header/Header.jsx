import React from "react";
import "./Header.css";
import { NavLink } from "react-router-dom";

function Header() {
  return (
    <div id="header">
      <ul>
        {/* <li>
          <NavLink
            to="/settings"
            className="header_button header_button-settings"
          ></NavLink>
        </li> */}
        <li>
          <NavLink
            to="/profile"
            className="header_button header_button-profile"
          ></NavLink>
        </li>
      </ul>
      <h2>
        <span>Mugi</span>Social
      </h2>
    </div>
  );
}

export default Header;
