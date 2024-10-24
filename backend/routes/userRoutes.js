const express = require("express");
const User = require("../models/User");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");

require("dotenv").config();

router.get("/users", auth, async (req, res) => {
  const { search = "" } = req.query; // Пошуковий параметр із запиту

  try {
    // Знайти користувачів, чиє ім'я містить пошуковий запит (незалежно від регістру)
    const users = await User.find({
      userName: { $regex: search, $options: "i" }, // Регістронезалежний пошук
    })
      .sort({ createdAt: -1 }) // Сортування за датою реєстрації (в порядку спадання)
      .select("userName avatar createdAt friends isVerified"); // Повертаємо лише необхідні поля
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Помилка при отриманні користувачів" });
  }
});

router.get("/me", auth, getUserProfile);

router.put("/me", auth, updateUserProfile);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars", // Папка на Cloudinary
    format: async (req, file) => "png", // Вказати формат файлу
  },
});

const mediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "media", // Папка на Cloudinary
    format: async (req, file) => "png",
  },
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadMedia = multer({ storage: mediaStorage });

// Маршрут для завантаження аватара
router.patch(
  "/upload-avatar",
  auth,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    try {
      const userId = req.user.userId; // Отримуємо ID користувача з токена

      const currentAvatar = (await User.findById(req.user.userId)).avatar;

      const publicId = currentAvatar.split("/").pop().split(".")[0]; // Отримуємо public_id для файлу
      cloudinary.uploader.destroy(`avatars/${publicId}`, (err, result) => {
        if (err) {
          console.error(err);
        }
      });

      const avatarUrl = req.file.path;

      // Оновлюємо поле аватара в профілі користувача
      await User.findByIdAndUpdate(
        userId,
        { avatar: avatarUrl },
        { new: true }
      );

      res.status(200).json({ avatarUrl });
    } catch (error) {
      res.status(500).json({ message: "Помилка завантаження аватару" });
    }
  }
);

router.get("/media/:userId", auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("gallery");

    if (!user) {
      return res.status(404).send("Користувача не знайдено");
    }

    // Перевірте, чи масив gallery порожній
    if (user.gallery.length === 0) {
      return res.status(204).send(); // Відправити статус 204 No Content
    }

    // Надсилаємо тільки одну відповідь
    return res.status(200).send(user.gallery);
  } catch (error) {
    // Надсилаємо статус 500 тільки якщо є помилка
    return res.status(500).send("Помилка отримання галереї користувача");
  }
});

router.patch(
  "/upload-media",
  auth,
  uploadMedia.array("media", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Файлів не завантажено" });
      }

      const userId = req.user.userId;

      const fileUrls = req.files.map((result) => result.path);

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { gallery: { $each: fileUrls } } },
        { new: true }
      );

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Помилка завантаження медіа" });
    }
  }
);

// routes/userRoutes.js
router.delete("/delete-media", auth, async (req, res) => {
  try {
    const { image } = req.body; // Ім'я файлу, яке ми отримали з фронтенду
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    const mediaIndex = user.gallery.indexOf(image);
    if (mediaIndex === -1) {
      return res.status(404).json({ message: "Медіа не знайдено в галереї" });
    }

    user.gallery.splice(mediaIndex, 1);
    // Видаляємо файл з масиву gallery
    await user.save();

    // Видалення з Cloudinary
    const publicId = image.split("/").pop().split(".")[0]; // Отримуємо public_id для файлу
    cloudinary.uploader.destroy(`media/${publicId}`, (err, result) => {
      if (err) {
        console.error(err);
      }
    });

    res.status(200).json({ message: "Медіа успішно видалено" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// // Отримання всіх користувачів
// router.get("/", async (req, res) => {
//   try {
//     const users = await User.find();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.get("/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password"); // Не показувати пароль
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Оновлення профілю користувача
router.put("/:userId", auth, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Додавання нового користувача
router.post("/", async (req, res) => {
  const user = new User(req.body);
  try {
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/request/:userId", auth, async (req, res) => {
  const userId = req.user.userId; // ID поточного користувача
  const targetUserId = req.params.userId; // ID користувача, якому надсилаємо запит

  try {
    const targetUser = await User.findById(targetUserId);
    const user = await User.findById(userId);

    // Перевіряємо, чи не є користувач вже другом або чи не було вже надіслано запит
    if (targetUser.friends.includes(userId)) {
      return res.status(400).json({ message: "Ви вже друзі" });
    }
    if (targetUser.friendRequests.includes(userId)) {
      return res.status(400).json({ message: "Запит на дружбу вже надіслано" });
    }

    if (user.friendRequests.includes(targetUserId)) {
      user.friends.push(targetUserId);
      targetUser.friends.push(userId);

      // Видаляємо запит із списку запитів
      user.friendRequests = user.friendRequests.filter(
        (id) => id.toString() !== targetUserId
      );

      await user.save();
      await targetUser.save();
      return res.status(200).json({ message: "Запит на дружбу прийнято" });
    }

    // Додаємо ID поточного користувача до списку запитів у друзі
    targetUser.friendRequests.push(userId);
    await targetUser.save();

    res.status(200).json({ message: "Запит на дружбу надіслано" });
  } catch (error) {
    res.status(500).json({ message: "Помилка при надсиланні запиту" });
  }
});

router.patch("/accept/:requestId", auth, async (req, res) => {
  const userId = req.user.userId; // ID поточного користувача
  const requestId = req.params.requestId; // ID користувача, який надіслав запит

  try {
    const user = await User.findById(userId);
    const requestUser = await User.findById(requestId);

    // Перевіряємо, чи є запит у списку
    if (!user.friendRequests.includes(requestId)) {
      return res.status(400).json({ message: "Запиту на дружбу не знайдено" });
    }

    // Додаємо один одного до списку друзів
    user.friends.push(requestId);
    requestUser.friends.push(userId);

    // Видаляємо запит із списку запитів
    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== requestId
    );
    await user.save();
    await requestUser.save();

    res.status(200).json({ message: "Запит на дружбу прийнято" });
  } catch (error) {
    res.status(500).json({ message: "Помилка при прийнятті запиту" });
  }
});

// Відхилити запит на дружбу
router.delete("/decline/:requestId", auth, async (req, res) => {
  const userId = req.user.userId;
  const requestId = req.params.requestId;

  try {
    const user = await User.findById(userId);

    // Перевіряємо, чи є запит у списку
    if (!user.friendRequests.includes(requestId)) {
      return res.status(400).json({ message: "Запиту на дружбу не знайдено" });
    }

    // Видаляємо запит із списку запитів
    user.friendRequests = user.friendRequests.filter(
      (id) => id.toString() !== requestId
    );
    await user.save();

    res.status(200).json({ message: "Запит на дружбу відхилено" });
  } catch (error) {
    res.status(500).json({ message: "Помилка при відхиленні запиту" });
  }
});

router.get("/friends/:userId", auth, async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).populate(
      "friends",
      "userName avatar friends createdAt"
    );
    res.status(200).json(user.friends);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Помилка при отриманні списку друзів" });
  }
});

router.get("/friends/requests/:userId", auth, async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).populate(
      "friendRequests",
      "userName avatar"
    );
    res.status(200).json(user.friendRequests);
  } catch (error) {
    res.status(500).json({ message: "Помилка при отриманні списку друзів" });
  }
});

router.delete("/friends/delete/:friendId", auth, async (req, res) => {
  const userId = req.user.userId;
  const friendId = req.params.friendId;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    // Перевіряємо, чи є запит у списку
    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Ви не є друзями" });
    }

    // Видаляємо запит із списку запитів
    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    friend.friends = friend.friends.filter((id) => id.toString() !== userId);
    await user.save();
    await friend.save();

    res.status(200).json({ message: "Користувача видалено з друзів" });
  } catch (error) {
    res.status(500).json({ message: "Помилка при видаленні з друзів" });
  }
});

router.patch("/change-password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.userId);

  if (!user) {
    return res.status(404).json({ message: "Користувача не знайдено" });
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Неправильний теперішній пароль" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Пароль успішно змінено" });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    // Генеруємо токен для скидання пароля
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Хешуємо токен перед збереженням у базу
    const hashedToken = await bcrypt.hash(resetToken, 10);
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Токен дійсний 1 годину
    await user.save();

    // Відправляємо email з посиланням для скидання
    const resetUrl = `https://mugisocial.onrender.com/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Скинути пароль | MugiSocial",
      text: `Перейдіть за посиланням щоб скинути пароль: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Повідомлення для скидання паролю надіслано" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Недійсний або прострочений токен" });
    }

    const isValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isValid) {
      return res.status(400).json({ message: "Недійсний токен" });
    }

    // Скидаємо пароль
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Пароль успішно скинуто" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
