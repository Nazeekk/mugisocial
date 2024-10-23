import React from "react";
import logo from "../../images/logo.png";
import "./Siderbar.css";
import { useNavigate, NavLink } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div>
      <aside id="sidebar">
        <img src={logo} alt="" className="sidebar_logo" />
        <nav>
          <ul>
            <li>
              <NavLink to="/" end className="nav_button button_primary">
                Головна
              </NavLink>
            </li>
            <li>
              <NavLink to="messages" className="nav_button button_primary">
                Повідомлення
              </NavLink>
            </li>
            <li>
              <NavLink to="/friends" className="nav_button button_primary">
                Друзі
              </NavLink>
            </li>
            <li>
              <a className="exit_button button_primary" onClick={handleLogout}>
                Вихід
              </a>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
}

export default Sidebar;
