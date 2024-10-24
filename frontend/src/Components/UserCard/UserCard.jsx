import React, { useRef, useState } from "react";
import "./UserCard.css";
import MoreMenuUser from "../MoreMenuUser/MoreMenuUser";
import axios from "axios";
import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  // const [message, setMessage] = useState("");
  const moreMenuRef = useRef(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const amIAdmin = localStorage.getItem("isAdmin");

  const handleAdd = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/request/${user._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
    } catch (error) {
      alert(error.response.data.message);
      console.error("Помилка при надсиланні запиту на дружбу:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/users/friends/delete/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
    } catch (error) {
      alert(error.response.data.message);
      console.error("Помилка при видаленні з друзів:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm("Ви дійсно хочете видалити цього користувача?")) {
      try {
        const response = await axios.delete(
          `${BASE_URL}/api/admin/user/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert(response.data.message);
      } catch (error) {
        alert(error.response.data.message);
        console.error("Помилка видалення користувача:", error);
      }
    }
  };

  return (
    <li key={user._id} className="user-card">
      <Link to={`/profile/${user._id}`}>
        <div className="user-info">
          <div className="user-info-avatar">
            <img src={user.avatar} alt={user.userName} />
          </div>
          <span>{user.userName}</span>
        </div>
      </Link>
      <div className="user_actions">
        {user.friends.includes(userId) && (
          <Link to={`/chat/${user._id}`}>
            <button className="button_primary message_button">Написати</button>
          </Link>
        )}
        <button
          className="user_more-button"
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          ref={moreMenuRef}
        >
          &#8226;&#8226;&#8226;
        </button>

        {showMoreMenu && (
          <MoreMenuUser
            ref={moreMenuRef}
            onDelete={handleDelete}
            onAdd={handleAdd}
            onClose={() => setShowMoreMenu(false)}
            onDeleteUser={handleDeleteUser}
            isFriend={user.friends.includes(userId)}
            amIAdmin={amIAdmin}
          />
        )}
      </div>
    </li>
  );
};

export default UserCard;
