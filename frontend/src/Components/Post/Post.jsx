import { useState, useRef } from "react";
import axios from "axios";
import LikeIcon from "../Icons/LikeIcon/LikeIcon";
import CommentsIcon from "../Icons/CommentsIcon/CommentsIcon";
import MoreMenuPost from "../MoreMenuPost/MoreMenuPost";
import PostModal from "../PostModal/PostModal";
import "./Post.css";

const Post = ({ post, fetchPosts }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [selectedPost, setSelectedPost] = useState(null);

  const token = localStorage.getItem("token");
  const myUserId = localStorage.getItem("userId");
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const toggleLike = async () => {
    try {
      await axios.patch(
        `${BASE_URL}/api/posts/${post._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchPosts(); // Оновлюємо пости після лайку
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Ви дійсно хочете видалити цей пост?")) {
      try {
        await axios.delete(`${BASE_URL}/api/posts/${post._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchPosts(); // Оновлюємо пости після видалення
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(post.content);
  };

  const handleSave = async () => {
    try {
      await axios.patch(
        `${BASE_URL}/api/posts/${post._id}`,
        { content: editedContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchPosts(); // Оновлюємо пости після редагування
      setIsEditing(false); // Закриваємо режим редагування
    } catch (error) {
      console.error("Error updating post:", error);
    }
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
    <div className="post">
      <div className="post_header">
        <div className="post_info">
          <div className="post_profile-icon">
            <img src={post.userId.avatar} />
          </div>
          <div>
            <h3 className="post_username">{post.userId.userName}</h3>
            <time
              dateTime={new Date(post.timestamp).toLocaleString(
                "uk-UA",
                dateTimeOptions
              )}
              className="post_time"
            >
              {new Date(post.timestamp).toLocaleString(
                "uk-UA",
                dateTimeOptions
              )}
            </time>
          </div>
        </div>
        {myUserId == post.userId._id && (
          <button
            className="post_more-button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            ref={moreMenuRef}
          >
            &#8226;&#8226;&#8226;
          </button>
        )}

        {showMoreMenu && (
          <MoreMenuPost
            ref={moreMenuRef}
            postId={post._id}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onClose={() => setShowMoreMenu(false)}
          />
        )}
      </div>
      {!isEditing ? (
        <p className="post_text">{post.content}</p>
      ) : (
        <div className="post_text-editing">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="post_editing-buttons">
            <button
              onClick={handleSave}
              className="post_editing-button button_primary"
            >
              Зберегти
            </button>
            <button
              onClick={handleCancel}
              className="post_editing-button button_primary"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}
      <div className="post_interact">
        <button
          onClick={toggleLike}
          className="post_like-button post_interact-button"
        >
          <LikeIcon isLiked={post.likedBy.includes(myUserId)} />
        </button>

        <button
          className="post_comment-button post_interact-button"
          onClick={() => setSelectedPost(post)}
        >
          <CommentsIcon />
        </button>
      </div>
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};

export default Post;
