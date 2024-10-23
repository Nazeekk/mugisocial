import React, { useEffect, useState } from "react";
import axios from "axios";
import UserCard from "../UserCard/UserCard";

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/users/friends/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFriends(response.data);
      } catch (error) {
        console.error(
          "Помилка при отриманні списку друзів:",
          error.response.data.message
        );
      }
    };
    fetchFriends();
  });

  return (
    <div className="friends-list">
      <h2>Мої друзі</h2>
      <ul>
        {friends.map((friend) => (
					<UserCard user={friend}/>
        ))}
      </ul>
    </div>
  );
};

export default FriendsList;
