import React from "react";
import "./MessageContextMenu.css";

const MessageContextMenu = ({ onDelete }) => {
  return (
    <div
      className="context-menu"
      style={{
        top: "0px",
        left: "0px",
        position: "absolute",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
      }}
    >
      <button
        onClick={onDelete}
        style={{ padding: "5px 10px", cursor: "pointer" }}
      >
        Видалити повідомлення
      </button>
    </div>
  );
};

export default MessageContextMenu;
