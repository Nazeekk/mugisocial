import React, { useState, useEffect } from "react";
import axios from "axios";
import UserCard from "../UserCard/UserCard";
import "./UsersList.css";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Додаємо стан для пошуку

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(BASE_URL + "/api/users/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allUsers = response.data;

        const filteredUsers = allUsers.filter((user) => user._id !== userId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value); // Оновлюємо термін пошуку при введенні
  };

  // Фільтруємо користувачів на основі пошукового терміну
  const filteredUsers = users.filter((user) =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="users-list">
      {/* Поле для пошуку */}
      <input
        type="text"
        placeholder="Пошук за іменем"
        value={searchTerm}
        onChange={handleSearch}
        className="search-form"
      />
      <ul>
        {/* Відображаємо лише відфільтрованих користувачів */}
        {filteredUsers.map((user) => (
          <UserCard key={user._id} user={user} />
        ))}
      </ul>
    </div>
  );
};

export default UsersList;
