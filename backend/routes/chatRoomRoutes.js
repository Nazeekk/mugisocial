const express = require("express");
const Message = require("../models/Message"); // Ваша модель Message
const User = require("../models/User"); // Ваша модель User
const auth = require("../middleware/auth"); // Ваш middleware для авторизації
const router = express.Router();
const {
  Types: { ObjectId },
} = require("mongoose");

// Отримання чат-румів для конкретного користувача, де є повідомлення
router.get("/", auth, async (req, res) => {
  const userId = new ObjectId(req.user.userId);

  try {
    // Знайти всі унікальні ID користувачів, з якими є повідомлення
    const uniqueUsers = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$senderId", userId] },
              then: "$receiverId",
              else: "$senderId",
            },
          },
        },
      },
    ]);

    // Витягнути ID з результатів
    const userIds = uniqueUsers.map((user) => user._id);

    // Знайти інформацію про користувачів за цими ID
    const users = await User.find({ _id: { $in: userIds } }).select(
      "userName avatar"
    );

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "userName avatar"
    );

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
