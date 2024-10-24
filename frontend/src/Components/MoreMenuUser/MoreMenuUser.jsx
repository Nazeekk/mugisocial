import React, { useEffect, useRef } from "react";
import "./MoreMenuUser.css";

const MoreMenuUser = ({ onClose, onDelete, onAdd, onDeleteUser, isFriend, amIAdmin }) => {
  const menuRef = useRef(null);
  useEffect(() => {
    // Закрити меню при кліку за межі
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="more-menu-user" ref={menuRef}>
      {isFriend ? (
        <button onClick={onDelete} className="button-delete">
          Видалити з друзів
        </button>
      ) : (
        <button onClick={onAdd} className="button-add">
          Додати друга
        </button>
      )}
      {amIAdmin && (
        <button onClick={onDeleteUser} className="button-delete">
          Видалити користувача
        </button>
      )}
    </div>
  );
};

export default MoreMenuUser;
