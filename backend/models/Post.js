const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ID автора поста
  timestamp: { type: Date, default: Date.now },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Автор коментаря
      content: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
