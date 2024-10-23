import { useState } from "react";
import axios from "axios";
import "./CreatePost.css";

const CreatePost = ({ fetchPosts }) => {
  const [content, setContent] = useState("");

  const token = localStorage.getItem("token");
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim()) {
      try {
        await axios.post(
          BASE_URL + "/api/posts",
          { content },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        fetchPosts(); // Перезавантажуємо список постів
        setContent(""); // Очищуємо поле
      } catch (error) {
        console.error("Error creating post:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="post_create">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Напишіть що-небудь"
      />
      <button type="submit" className="button_primary">
        Публікувати
      </button>
    </form>
  );
};

export default CreatePost;
