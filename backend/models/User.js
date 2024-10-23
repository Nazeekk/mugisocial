const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Додаємо email
    password: { type: String, required: true }, // Зберігайте хеш пароля
    bio: { type: String },
    location: { type: String },
    phone: { type: String },
    avatar: { type: String, default: "/images/default-avatar.png" }, // Додаємо поле для аватара
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Масив ID друзів
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    gallery: { type: [String], default: [] }, // URL фото та відео
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }, // Стан підтвердження
    verificationToken: { type: String }, // Токен підтвердження
    verificationTokenExpires: { type: Date }, // Час закінчення токена
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
