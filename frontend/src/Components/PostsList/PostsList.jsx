import { useState, useEffect } from "react";
import axios from "axios";
import CreatePost from "../CreatePost/CreatePost";
import "./PostsList.css";
import Post from "../Post/Post";

const PostsList = ({ userId, isMainPage = false }) => {
  const [posts, setPosts] = useState([]);
  const token = localStorage.getItem("token");
  const myUserId = localStorage.getItem("userId");

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        isMainPage
          ? `${BASE_URL}/api/posts/friends/${myUserId}`
          : `${BASE_URL}/api/posts/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPosts(response.data.reverse());
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="posts-list">
      <h2>Публікації</h2>

      {posts.length === 0 && <h3>Немає жодної публікації</h3>}

      {myUserId === userId && <CreatePost fetchPosts={fetchPosts} />}
      {posts.map((post) => (
        <Post key={post._id} post={post} fetchPosts={fetchPosts} />
      ))}
    </div>
  );
};

export default PostsList;
