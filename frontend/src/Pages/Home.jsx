import React from "react";
import UsersList from "../Components/UsersList/UsersList";
import PostsList from "../Components/PostsList/PostsList";

const Home = () => {
  const userId = localStorage.getItem("userId");

  return (
    <div>
      <h1>Головна</h1>
      <div className="posts">
        <UsersList />
        <PostsList userId={userId} isMainPage="true" />
      </div>
    </div>
  );
};

export default Home;
