import React from "react";
import "./LikeIcon.css";
import icon from "../../../images/icons/heart_icon.png";
import icon_liked from "../../../images/icons/heart_icon_liked.png";

const LikeIcon = ({ isLiked }) => {
  return isLiked ? (
    <img src={icon_liked} alt="" className="heart-icon" />
  ) : (
    <img src={icon} alt="" className="heart-icon" />
  );
};

export default LikeIcon;
