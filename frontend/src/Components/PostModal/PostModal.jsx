import { useState, useEffect } from "react";
import axios from "axios";
import "./PostModal.css";

const PostModal = ({ post, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/posts/${post._id}/comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [post._id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${BASE_URL}/api/posts/${post._id}/comments`,
        {
          content: newComment,
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewComment("");
      const updatedComments = await axios.get(
        `${BASE_URL}/api/posts/${post._id}/comments`,
        {
          content: newComment,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments(updatedComments.data);
    } catch (error) {
      console.error("Error posting comment:", error);
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
    <div className="modal">
      <div className="modal-content">
        <div className="post">
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
          <div className="post_info">
            <div className="post_profile-icon">
              <img src={post.userId.avatar} alt="avatar" />
            </div>
            <h4 className="post_username">{post.userId.userName}</h4>
          </div>
          <p className="post_text">{post.content}</p>
          <h2>Коментарі</h2>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Залиште коментар..."
            />
            <button type="submit" className="button_primary">
              Коментувати
            </button>
          </form>
          <div className="comments-section">
            {comments.map((comment) => (
              <div key={comment._id} className="comment">
                <div className="comment_user-info">
                  <div className="comment_profile-icon">
                    <img src={comment.userId.avatar} alt="avatar" />
                  </div>
                  <div className="comment_user-info_content">
                    <h4>{comment.userId.userName}</h4>
                    <time dateTime={comment.timestamp}>
                      {new Date(post.timestamp).toLocaleString(
                        "uk-UA",
                        dateTimeOptions
                      )}
                    </time>
                  </div>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
