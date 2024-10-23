import React, { useState } from "react";
import FriendRequests from "../Components/FriendRequests/FriendRequests";
import FriendsList from "../Components/FriendsList/FriendsList";

const Friends = () => {
  const [activeTab, setActiveTab] = useState("friends"); // Тримаємо активну вкладку в стані

  const handleTabClick = (tab) => {
    setActiveTab(tab); // Зміна вкладки при кліку
  };

  return (
    <div id="friends">
      <h2>Друзі</h2>
      <div className="tabs">
        <button
          className={
            activeTab === "friends"
              ? "button_secondary active"
              : "button_primary"
          }
          onClick={() => handleTabClick("friends")}
        >
          Мої друзі
        </button>
        <button
          className={
            activeTab === "requests"
              ? "button_secondary active"
              : "button_primary"
          }
          onClick={() => handleTabClick("requests")}
        >
          Запити на дружбу
        </button>
      </div>

      {/* Відображаємо активну вкладку */}
      <div className="tab-content">
        {activeTab === "friends" && <FriendsList />}
        {activeTab === "requests" && <FriendRequests />}
      </div>
    </div>
  );
};

export default Friends;
