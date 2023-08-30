const express = require("express"); // Import d'express
const User = require("../models/User"); // Import du modèle User

// Import des packages nécéssaires au hash du MDP
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

// creation du router afin de pouvoir exporter notre route et ne pas avoir à recréer un server (comme app dans index.js)
const router = express.Router();

// Signup page
router.post("/user/signup", async (req, res) => {
  try {
    console.log("/user/signup route");
    const { username, email, password, newsletter } = req.body;
    const existingUser = await User.findOne({ email });

    // Check if the mail is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    //  Check if the mail already exist
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email already exists. Please login." });
    }

    // Password & token creation
    const salt = uid2(24);
    const hashedPassword = SHA256(password + salt).toString(encBase64);
    const token = uid2(48);

    const newUser = new User({
      email: email,
      account: {
        username: username,
      },
      newsletter: newsletter,
      token: token,
      hash: hashedPassword,
      salt: salt,
    });

    newUser.save();
    res.status(201).json({
      status: "User Created",
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Ooops, we've got an error 🫢", message: error.message });
  }
});

// Login page
router.post("/user/login", async (req, res) => {
  try {
    console.log("=====> /user/login route <=====");
    const { email, password } = req.body;

    // recherche de l'usitilisateur en fonction de son mail.
    const userFound = await User.findOne({ email: email });
    // vérification du MDP
    const comparedPassword = password + userFound.salt;
    const comparedHash = SHA256(comparedPassword.toString(encBase64));

    if (comparedHash.toString(encBase64) === userFound.hash) {
      res.status(200).json({ message: "Succesfull login" });
    } else {
      res
        .status(200)
        .json({ message: "Error during login. Please try again 🙏" });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Ooops, we've got an error 🫢", message: error.message });
  }
});

module.exports = router;
