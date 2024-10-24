const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const router = express.Router();
require("dotenv").config();

router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    // Шукаємо користувача з токеном
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }, // Токен ще дійсний
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Неправильний або прострочений токен" });
    }

    // Підтверджуємо користувача
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.json({ message: "Електронну пошту підтверджено успішно!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Реєстрація користувача
router.post("/register", async (req, res) => {
  const { userName, email, password, location, phone, repeatPassword } =
    req.body;

  try {
    // Перевірка, чи існує вже користувач
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Користувач з такою поштою вже зареєстрований" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Довжина паролю має бути не менше 8 символів" });
    }

    if (password !== repeatPassword) {
      return res
        .status(400)
        .json({ message: "Поля 'Пароль' і 'Повторіть пароль' не співпадають" });
    }

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створення нового користувача
    const user = new User({
      userName,
      email,
      password: hashedPassword,
      location,
      phone,
      isVerified: false,
      verificationToken: crypto.randomBytes(32).toString("hex"),
      verificationTokenExpires: Date.now() + 3600000, // 1 година
    });
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const verificationUrl = `https://mugisocial.onrender.com/verify-email?token=${user.verificationToken}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Підтвердження електронної пошти",
      text: `Будь ласка, підтвердіть свою електронну пошту, перейшовши за цим посиланням: ${verificationUrl}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Користувач успішно зареєстрований" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Перевірка наявності користувача
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Користувача з таким email не існує" });
    }

    // Перевірка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Неправильний пароль" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Будь ласка, підтвердіть свою електронну пошту" });
    }

    // Генерація токена
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({ token, userId: user._id, isAdmin: user.isAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
