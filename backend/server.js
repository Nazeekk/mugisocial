const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const messageRoutes = require("./routes/messageRoutes");
const chatRoomRoutes = require("./routes/chatRoomRoutes");
const authRoutes = require("./routes/authRoutes");
const https = require("https");
const socketIo = require("socket.io");
const crypto = require("crypto");
const Message = require("./models/Message");

require("dotenv").config();
const app = express();
const server = https.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://mugisocial.onrender.com", // Дозволяє підключення з вашого фронтенду
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "https://mugisocial.onrender.com", // Дозволяє запити з вашого фронтенду
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // Дозволяє відправляти кукі і токени
  })
);

app.use(bodyParser.json());

// Підключення до MongoDB
connectDB();

app.use("/images", express.static("public/images"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Маршрути
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatRoomRoutes);
app.use("/api/auth", authRoutes);

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

io.on("connection", (socket) => {
  // Приєднання до кімнати
  socket.on("joinRoom", async ({ senderId, receiverId }) => {
    const roomId = [senderId, receiverId].sort().join("_"); // Унікальний ID кімнати
    socket.join(roomId);

    // Отримуємо історію повідомлень для кімнати
    try {
      let messages = await Message.find({
        $or: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      }).populate("senderId", "userName avatar");

      // Розшифрування кожного повідомлення перед відправкою
      messages = messages.map((message) => {
        message.content = decrypt(message.content);
        return message;
      });

      // Відправка історії повідомлень клієнту
      socket.emit("loadMessages", messages);
    } catch (error) {
      console.error("Помилка при завантаженні повідомлень: ", error.message);
    }
  });

  // Обробка надходження нових повідомлень
  socket.on("sendMessage", async (message) => {
    const encryptedContent = encrypt(message.content);
    const roomId = [message.senderId, message.receiverId].sort().join("_");

    // Збереження повідомлення в БД
    const newMessage = new Message({
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: encryptedContent,
    });

    await newMessage.save();

    // Отримуємо інформацію про відправника (ім'я та аватар)
    const populatedMessage = await newMessage.populate(
      "senderId",
      "userName avatar"
    );

    // Відправка повідомлення всім в кімнаті разом з інформацією про користувача
    io.to(roomId).emit("receiveMessage", {
      _id: populatedMessage._id,
      senderId: {
        _id: populatedMessage.senderId._id,
        userName: populatedMessage.senderId.userName,
        avatar: populatedMessage.senderId.avatar,
      },
      receiverId: message.receiverId,
      content: message.content,
      timestamp: populatedMessage.timestamp,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// Запуск сервера
server.listen(PORT, "mugisocial.onrender.com", () => {
  console.log(`Server is running on ${process.env.SERVER}:${PORT}`);
});
