import React, { useEffect, useState } from "react";
import "./FriendRequests.css";
import axios from "axios";
import { Link } from "react-router-dom";

const FriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/users/friends/requests/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFriendRequests(response.data);
      } catch (error) {
        console.error("Помилка при отриманні запитів на дружбу:", error);
      }
    };
    fetchFriendRequests();
  }, [token]);

  const acceptRequest = async (requestId) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/users/accept/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Запит на дружбу прийнято");
      setFriendRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== requestId)
      );
    } catch (error) {
      console.error("Помилка при прийнятті запиту:", error);
    }
  };

  const declineRequest = async (requestId) => {
    try {
      await axios.delete(`${BASE_URL}/api/users/decline/${requestId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Запит на дружбу відхилено");
      setFriendRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== requestId)
      );
    } catch (error) {
      console.error("Помилка при відхиленні запиту:", error);
    }
  };

  return (
    <div className="friends-requests">
      <h2>Запити на дружбу</h2>
      <ul>
        {friendRequests.length == 0 && <h3>Запитів на дружбу не знайдено</h3>}
        {friendRequests.map((request) => (
          <li key={request._id}>
            <div className="request">
              <Link to={`/profile/${request._id}`} className="left-part">
                <div className="avatar">
                  <img src={BASE_URL + request.avatar} alt={request.userName} />
                </div>
                <span>{request.userName}</span>
              </Link>

              <div className="right-part">
                <button
                  className="button_primary"
                  onClick={() => acceptRequest(request._id)}
                >
                  Прийняти
                </button>
                <button
                  className="button_primary"
                  onClick={() => declineRequest(request._id)}
                >
                  Відхилити
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendRequests;
