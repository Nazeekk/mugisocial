import axios from "axios";
import React, { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Gallery from "../Components/Gallery/Gallery";
import PostsList from "../Components/PostsList/PostsList";
import { Navigate } from "react-router-dom";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState({
    userName: "",
    bio: "",
    location: "",
    phone: "",
    avatar: "",
  });
  let formData = null;
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(BASE_URL + "/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        console.error(
          "Error fetching user data:",
          error.response ? error.response.data : error.message
        );
        return <Navigate to="/register" />;
      }
    };

    fetchUser();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Вибір файлу
  };

  const handleSave = async () => {
    try {
      // Якщо користувач вибрав новий аватар
      if (selectedFile) {
        formData = new FormData();
        formData.append("avatar", selectedFile); // Додаємо файл до форми

        // Надсилаємо аватар на сервер
        const avatarResponse = await axios.patch(
          BASE_URL + "/api/users/upload-avatar",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        user.avatar = avatarResponse.data.avatarUrl; // Оновлюємо аватар
      }

      // Оновлення профілю без аватара
      await axios.put(BASE_URL + "/api/users/me", user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Profile updated successfully");
      setIsEditing(false); // Після збереження вихід з режиму редагування
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div id="profile">
      {!isEditing ? (
        <div className="profile_info">
          <div className="profile_picture">
            <img src={user.avatar} alt={user.userName} />
          </div>
          <div className="profile_info-content">
            <h3 className="profile_username">{user.userName}</h3>
            <div className="profile_personal">
              <h4 className="profile_location personal">{user.location}</h4>
              <a className="profile_phone personal" href={`tel:${user.phone}`}>
                {user.phone}
              </a>
            </div>
            <p className="profile_bio">{user.bio}</p>
            <button
              className="button_primary profile_edit-button"
              onClick={() => setIsEditing(true)}
            >
              Редагувати профіль
            </button>
          </div>
        </div>
      ) : (
        <div className="profile_info">
          <div className="profile_picture-editing">
            <img
              src={user.avatar}
              alt={user.userName}
              className="profile_picture"
            />
            <input
              type="file"
              className="profile_picture_edit-button"
              accept="image/jpeg, image/png, image/gif"
              onChange={handleFileChange}
            />
          </div>

          <div className="profile_info-content">
            <div>
              <label>Ім'я: </label>
              <input
                type="text"
                name="userName"
                className="profile_username editing"
                value={user.userName}
                onChange={handleInputChange}
              />
            </div>
            <div className="profile_personal">
              <div>
                <label>Адреса: </label>
                <input
                  type="text"
                  name="location"
                  className="profile_location personal editing"
                  value={user.location}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label>Телефон: </label>
                <input
                  type="phone"
                  name="phone"
                  className="profile_phone personal editing"
                  value={user.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="profile_bio_container">
              <label>Біографія: </label>
              <textarea
                className="profile_bio editing"
                name="bio"
                value={user.bio}
                onChange={handleInputChange}
              />
            </div>
            <div className="profile_buttons-container">
              <button
                className="button_primary profile_edit-button"
                onClick={handleSave}
              >
                Зберегти
              </button>
              <button
                className="button_primary profile_edit-button"
                onClick={() => setIsEditing(false)}
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
      <Gallery userId={userId} />
      <PostsList userId={userId} />
    </div>
  );
};

export default Profile;
