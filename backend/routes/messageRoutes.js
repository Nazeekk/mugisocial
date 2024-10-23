const express = require("express");
const Message = require("../models/Message");
const router = express.Router();
const crypto = require("crypto");
const auth = require("../middleware/auth");
require("dotenv").config();

const encryptionKey = process.env.ENCRYPTION_KEY; // 32 байти для AES-256
const iv = crypto.randomBytes(16); // 16 байтів для IV

function encrypt(text) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Додавання нового повідомлення
router.post("/", auth, async (req, res) => {
  const encryptedContent = encrypt(req.body.content);

  const message = new Message({
    senderId: req.user.userId,
    receiverId: req.body.receiverId,
    content: encryptedContent,
  });
  try {
    const savedMessage = await message.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Отримання всіх повідомлень для конкретного користувача
router.get("/:userId", auth, async (req, res) => {
  try {
    let messages = await Message.find({
      $or: [
        { senderId: req.user.userId, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user.userId },
      ],
    }).populate("senderId", "userName avatar");

    // Розшифрування кожного повідомлення перед відправкою
    messages = messages.map((message) => {
      message.content = decrypt(message.content);
      return message;
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Видалення повідомлення
router.delete("/:messageId", auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: "Повідомлення не знайдено" });
    }
    if (req.user.userId != message.senderId) {
      return res.status(403).json({
        message: "Ви не можете видалити не своє повідомлення",
      });
    }
    await Message.findByIdAndDelete(req.params.messageId);
    res.status(200).json({ message: "Повідомлення видалено" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
