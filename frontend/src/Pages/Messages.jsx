import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Messages = () => {
  const token = localStorage.getItem("token");
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(BASE_URL + "/api/chats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setChats(response.data);
      } catch (error) {
        console.error("Помилка при отриманні списку друзів:", error);
      }
    };
    fetchChats();
  }, [token, BASE_URL]);

  return (
    <div>
      <h2>Повідомлення</h2>

      {chats.map((chat) => (
        <Link to={`/chat/${chat._id}`} key={chat._id} className="chat-card">
          <h3>{chat.userName}</h3>
          <div className="chat-card_avatar">
            <img src={chat.avatar} alt={chat.userName} />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Messages;
