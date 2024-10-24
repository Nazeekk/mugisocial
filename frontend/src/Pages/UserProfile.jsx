import React, { useEffect, useState } from "react";
import axios from "axios";
import Gallery from "../Components/Gallery/Gallery";
import PostsList from "../Components/PostsList/PostsList";
import { useParams } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const token = localStorage.getItem("token");
  const amIAdmin = localStorage.getItem("isAdmin");

  const { userId } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Помилка при отриманні користувача: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, userId, BASE_URL]);

  const handleDeleteAvatar = async (e) => {
    e.preventDefault();
    if (
      window.confirm(
        "Ви впевнені, що хочете видалити аватар цього користувача?"
      )
    ) {
      try {
        await axios.delete(`${BASE_URL}/api/admin/delete-avatar/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Помилка видалення аватару користувача: ", error);
      }
    }
  };

  if (loading) return <div>Завантаження...</div>;
  if (!user) return <div>Користувача не знайдено</div>;

  return (
    <div id="profile">
      <div className="profile_info">
        <div className="profile_picture">
          <img src={user.avatar} alt={user.userName} />
          {amIAdmin && (
            <button
              onClick={handleDeleteAvatar}
              style={{ color: "red", padding: "5px" }}
            >
              Видалити аватар
            </button>
          )}
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
        </div>
      </div>
      <Gallery userId={userId} />
      <PostsList userId={userId} />
    </div>
  );
};

export default UserProfile;
