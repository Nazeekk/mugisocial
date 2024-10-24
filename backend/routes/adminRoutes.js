const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const router = express.Router();
const auth = require("../middleware/auth");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

const isAdmin = async (req) => {
  return (await User.findById(req.user.userId).select("isAdmin")).isAdmin;
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.delete("/delete-media/:userId", auth, async (req, res) => {
  try {
    const { image } = req.body; // Ім'я файлу, яке ми отримали з фронтенду
    const user = await User.findById(req.params.userId);

    if (!isAdmin(req)) {
      return res
        .status(403)
        .json({ message: "Недостатньо прав для видалення медіа користувача" });
    }

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

router.delete("/delete-avatar/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!isAdmin(req)) {
      return res
        .status(403)
        .json({ message: "Недостатньо прав для видалення аватару" });
    }

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    const image = user.avatar;

    if (
      image ===
      "https://res.cloudinary.com/dczz5rz9n/image/upload/v1729715722/public/images/default-avatar.png"
    ) {
      return res
        .status(404)
        .json({ message: "Аватар користувача не знайдено" });
    }

    // Видалення з Cloudinary
    const publicId = image.split("/").pop().split(".")[0]; // Отримуємо public_id для файлу
    cloudinary.uploader.destroy(`avatars/${publicId}`, (err, result) => {
      if (err) {
        console.error(err);
      }
    });

    user.avatar =
      "https://res.cloudinary.com/dczz5rz9n/image/upload/v1729715722/public/images/default-avatar.png";
    await user.save();

    res.status(200).json({ message: "Аватар успішно видалено" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

router.delete("/user/:userId", auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    // Перевіряємо, чи користувач має права адміністратора
    if (req.user.userId.toString() !== user._id.toString() && !isAdmin(req)) {
      return res
        .status(403)
        .json({ message: "Недостатньо прав для видалення цього користувача" });
    }

    // Видаляємо аватар користувача з Cloudinary
    if (
      user.avatar &&
      user.avatar !==
        "https://res.cloudinary.com/dczz5rz9n/image/upload/v1729715722/public/images/default-avatar.png"
    ) {
      const publicId = "avatars/" + user.avatar.split("/").pop().split(".")[0]; // Отримуємо public_id з URL аватара
      await cloudinary.uploader.destroy(publicId);
    }

    console.log("avatar deleted");

    // Видаляємо медіа з галереї користувача з Cloudinary
    if (user.gallery && user.gallery.length > 0) {
      const deletePromises = user.gallery.map((mediaUrl) => {
        const publicId = "media/" + mediaUrl.split("/").pop().split(".")[0]; // Отримуємо public_id з URL медіа
        return cloudinary.uploader.destroy(publicId);
      });
      await Promise.all(deletePromises); // Чекаємо, поки всі файли будуть видалені
    }

    console.log("media deleted");

    console.log(user._id);

    // Видаляємо всі пости користувача
    await Post.deleteMany({ userId: user._id.toString() });

    console.log("posts deleted");

    // Видаляємо самого користувача з бази даних
    await user.deleteOne();

    res.json({ message: "Користувача та його дані успішно видалено" });
  } catch (error) {
    res.status(500).json({ message: `Помилка сервера: ${error}` });
  }
});

router.delete("/posts/:postId", auth, async (req, res) => {
  try {
    const postId = req.params.postId;

    // Пошук поста за ID
    const post = await Post.findById(postId);

    if (!isAdmin(req)) {
      return res
        .status(403)
        .json({ message: "Недостатньо прав для видалення цього поста" });
    }

    // Перевірка, чи існує пост
    if (!post) {
      return res.status(404).json({ message: "Пост не знайдено" });
    }

    // Видалення поста
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Пост успішно видалено" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

module.exports = router;
