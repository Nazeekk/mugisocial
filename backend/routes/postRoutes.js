const express = require("express");
const Post = require("../models/Post");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.patch("/:postId", auth, async (req, res) => {
  const userId = req.user.userId; // ID користувача з токена
  const { content } = req.body;

  try {
    const post = await Post.findById(req.params.postId);

    // Перевіряємо, чи є поточний користувач автором поста
    if (post.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Ви не можете редагувати цей пост" });
    }

    // Оновлюємо вміст поста
    post.content = content;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Помилка при редагуванні поста" });
  }
});

router.patch("/:postId/like", auth, async (req, res) => {
  const userId = req.user.userId;
  try {
    const post = await Post.findById(req.params.postId);

    // Якщо користувач вже лайкнув пост
    if (post.likedBy.includes(userId)) {
      post.likes -= 1;
      post.likedBy = post.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes += 1;
      post.likedBy.push(userId);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Не вдалося лайкнути пост" });
  }
});

router.patch("/:postId/comments", auth, async (req, res) => {
  const { content } = req.body;
  const userId = req.user.userId;

  try {
    const post = await Post.findById(req.params.postId);
    post.comments.push({
      userId,
      content,
      timestamp: new Date(),
    });

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Не вдалося додати коментар" });
  }
});

// Додати коментар до поста
router.post("/:postId/comments", auth, async (req, res) => {
  const { content } = req.body; // Звичайно, з клієнта надходять дані коментаря
  const userId = req.user.userId;

  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Пост не знайдено" });
    }

    // Додаємо новий коментар до масиву коментарів поста
    post.comments.push({
      userId,
      content,
      timestamp: new Date(),
    });

    await post.save(); // Зберігаємо зміни в базі даних

    res.status(201).json(post.comments); // Повертаємо оновлений масив коментарів
  } catch (error) {
    res.status(500).json({ message: "Щось пішло не так", error });
  }
});

// Видалення коментаря
router.delete("/:postId/comment/:commentId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== req.params.commentId
    );
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Не вдалося видалити коментар" });
  }
});

// Отримати коментарі з посту за ID поста
router.get("/:postId/comments", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate(
      "comments.userId",
      "userName avatar"
    ); // Популяція коментарів

    if (!post) {
      return res.status(404).json({ message: "Пост не знайдено" });
    }

    // Форматування коментарів з додаванням userName та avatar
    const commentsWithUserInfo = post.comments.map((comment) => ({
      userId: comment.userId,
      content: comment.content,
      timestamp: comment.timestamp,
      userName: comment.userId.userName, // Ім'я користувача
      avatar: comment.userId.avatar, // Аватар користувача
    }));

    res.status(200).json(commentsWithUserInfo);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "Щось пішло не так", error });
  }
});

// Отримання всіх постів
router.get("/user/:userId", auth, async (req, res) => {
  const { userId } = req.params;

  try {
    const posts = await Post.find({ userId }).populate(
      "userId",
      "userName avatar"
    );
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:postId", auth, async (req, res) => {
  try {
    const postId = req.params.postId;

    // Знаходимо пост за ID та отримуємо всі коментарі
    const post = await Post.findById(postId).populate({
      path: "comments.userId",
      select: "userName avatar", // Отримання імені користувача та аватара для кожного коментаря
    });

    // Перевіряємо, чи існує пост
    if (!post) {
      return res.status(404).json({ message: "Пост не знайдено" });
    }

    res.status(200).json(post); // Відправляємо пост разом з коментарями
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

router.delete("/:postId", auth, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.userId; // Отримання ID користувача з токена

    // Пошук поста за ID
    const post = await Post.findById(postId);

    // Перевірка, чи існує пост
    if (!post) {
      return res.status(404).json({ message: "Пост не знайдено" });
    }

    // Перевірка, чи користувач є автором поста
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "Ви не є автором цього поста" });
    }

    // Видалення поста
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Пост успішно видалено" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

// Додавання нового поста
router.post("/", auth, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Потрібен вміст" });
  }

  try {
    const newPost = new Post({
      userId: req.user.userId, // ID користувача з токену
      content: content,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера", error });
  }
});

router.get("/friends/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId); // Знайти поточного користувача
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    // Отримати масив ID друзів
    const friendsIds = user.friends;

    // Знайти пости користувача і його друзів
    const posts = await Post.find({
      userId: { $in: [user._id, ...friendsIds] },
    })
      .sort({ timestamp: 1 })
      .populate("userId", "userName avatar");

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Помилка сервера" });
  }
});

module.exports = router;
