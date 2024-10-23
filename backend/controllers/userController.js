const User = require("../models/User");

// Отримати профіль користувача
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

// Оновити профіль користувача
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    const { userName, bio, location, phone, avatar } = req.body;

    // Оновити інформацію профілю
    user.userName = userName || user.userName;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.phone = phone || user.phone;
    user.avatar = avatar || user.avatar;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
};

module.exports = { getUserProfile, updateUserProfile };
