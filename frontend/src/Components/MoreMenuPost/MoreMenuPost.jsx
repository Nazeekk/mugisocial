import { useEffect, useRef } from "react";
import "./MoreMenuPost.css";

const MoreMenuPost = ({ onDelete, onClose, onEdit }) => {
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
    <div className="more-menu-post" ref={menuRef}>
      <button onClick={onEdit}>Редагувати</button>
      <button onClick={onDelete}>Видалити</button>
    </div>
  );
};

export default MoreMenuPost;
