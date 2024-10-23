import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Header from "./Components/Header/Header";
import Sidebar from "./Components/Sidebar/Sidebar";
import Home from "./Pages/Home";
import Friends from "./Pages/Friends";
import Messages from "./Pages/Messages";
import Profile from "./Pages/Profile";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import VerifyEmail from "./Pages/VerifyEmail/VerifyEmail";
import Settings from "./Pages/Settings";
import UserProfile from "./Pages/UserProfile";
import ChatRoom from "./Pages/ChatRoom";
import NotFound from "./Pages/NotFound";
import Footer from "./Components/Footer/Footer";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <div className="App">
      <div className="App-wrapper">
        {isAuthenticated ? <Header /> : ""}
        <div className={isAuthenticated ? "container" : ""}>
          {isAuthenticated ? <Sidebar /> : ""}
          <main className={isAuthenticated ? "content" : ""}>
            <Routes>
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/friends"
                element={
                  isAuthenticated ? <Friends /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/messages"
                element={
                  isAuthenticated ? <Messages /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/profile"
                element={
                  isAuthenticated ? <Profile /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/"
                element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
              />
              <Route
                path="/profile/:userId"
                element={
                  isAuthenticated ? <UserProfile /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/chat/:userId"
                element={
                  isAuthenticated ? <ChatRoom /> : <Navigate to="/login" />
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
      {isAuthenticated ? <Footer /> : ""}
    </div>
  );
}

export default App;
