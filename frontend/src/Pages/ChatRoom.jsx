import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import MessageItem from "../Components/MessageItem/MessageItem";
import io from "socket.io-client";
import backIcon from "../images/icons/back_icon.png";
import sendIcon from "../images/icons/send_icon.png";
import { Link, useParams } from "react-router-dom";

const socket = io(process.env.REACT_APP_BASE_URL);

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatInfo, setChatInfo] = useState({});
  const { userId } = useParams();

  const endOfMessagesRef = useRef(null);

  const token = localStorage.getItem("token");
  const myUserId = localStorage.getItem("userId");

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const scrollToBottom = () => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchChatInfo = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/chats/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChatInfo(response.data);
    } catch (error) {
      console.error("Помилка при отриманні даних чату:", error);
    }
  }, [BASE_URL, userId, token]);

  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      const messageData = {
        senderId: myUserId,
        receiverId: userId,
        content: newMessage,
      };
      socket.emit("sendMessage", messageData);
      setNewMessage(""); // Очищення поля вводу
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${BASE_URL}/api/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Оновіть стан, щоб видалити повідомлення з UI
      setMessages(messages.filter((message) => message._id !== messageId));
    } catch (error) {
      console.error("Помилка при видаленні повідомлення:", error);
    }
  };

  useEffect(() => {
    fetchChatInfo();
    socket.emit("joinRoom", { senderId: myUserId, receiverId: userId });

    // fetchMessages(); // Завантажуємо повідомлення при монтуванні компонента

    socket.on("loadMessages", (loadedMessages) => {
      setMessages(loadedMessages);
      scrollToBottom();
    });

    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => {
        scrollToBottom();
        return [...prevMessages, message];
      });
    });

    return () => {
      socket.off("loadMessages");
      socket.off("receiveMessage");
    };
  }, [myUserId, userId, BASE_URL, fetchChatInfo]);

  return (
    <div className="chat-room">
      <div className="chat-room-header">
        <div className="left-part">
          <Link to="/messages" className="back-to-messages_button">
            <img src={backIcon} alt="" />
          </Link>
          <Link to={`/profile/${userId}`}>{chatInfo.userName}</Link>
        </div>
        <Link to={`/profile/${userId}`} className="right-part">
          <img src={chatInfo.avatar} alt={chatInfo.userName} />
        </Link>
      </div>
      <hr />
      <div className="messages">
        {messages.map((message, index) => (
          <MessageItem
            message={message}
            key={index}
            onDelete={handleDeleteMessage}
          />
        ))}
      </div>

      <div className="send-message">
        <textarea
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          maxLength="4096"
        />
        <button onClick={sendMessage}>
          <img src={sendIcon} alt="" />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
