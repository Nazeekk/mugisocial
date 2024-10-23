import React, { useState } from "react";
import "./MessageItem.css";
import MessageContextMenu from "../MessageContextMenu/MessageContextMenu";

const MessageItem = ({ message, onDelete }) => {
  const userId = localStorage.getItem("userId");
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [showMenu, setShowMenu] = useState(false);

  const formatMessageContent = (content) => {
    return content.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  const handleContextMenu = (event) => {
    if (userId != message.senderId._id) return;
    event.preventDefault(); // Запобігаємо стандартному контекстному меню
    setShowMenu(true);
  };

  const handleDelete = () => {
    onDelete(message._id); // Викликаємо функцію для видалення повідомлення
    setShowMenu(false); // Закриваємо меню після видалення
  };

  const dateTimeOptions = {
    timeZone: "Europe/Kiev", // Вкажіть бажаний часовий пояс
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };

  return (
    <div
      className={
        userId == message.senderId._id
          ? "message my-message"
          : "message other-message"
      }
      onContextMenu={handleContextMenu}
    >
      {userId != message.senderId._id && (
        <div className="message-content">
          <div className="message-info">
            <div className="message-avatar">
              <img src={BASE_URL + message.senderId.avatar} alt="" />
            </div>
          </div>
        </div>
      )}
      <div className="message-text">
        <p>{formatMessageContent(message.content)}</p>
        <span className="message-time">
          {new Date(message.timestamp).toLocaleString("uk-UA", dateTimeOptions)}
        </span>
      </div>
      {showMenu && <MessageContextMenu onDelete={handleDelete} />}
    </div>
  );
};

export default MessageItem;
