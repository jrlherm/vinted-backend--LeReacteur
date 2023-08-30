const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const app = express();
const port = 3000;

app.use(express.json());
mongoose.connect("mongodb://localhost:27017/vinted");

// MODELS
const User = require("./models/User");
const Offer = require("./models/Offer");

cloudinary.config({
  cloud_name: "jr230891",
  api_key: "375228429742114",
  api_secret: "k5PXeacl5KgMUhHYdFFDzaBDz3A",
});

// Route /
app.get("/", (req, res) => {
  try {
    console.log("/ route");
    res.status(200).json({ message: "Welcome to my vinted copycat" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route /OFFER
const offerRoutes = require("./routes/offer"); // Import des routes USER
app.use(offerRoutes); // Utilisation des routes importées.

// Route /USER
const userRoutes = require("./routes/user"); // Import des routes USER
app.use(userRoutes); // Utilisation des routes importées.

// All routes
app.all("*", (req, res) => {
  try {
    res.status(200).json({ message: "Seems like you've been lost 🥴" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log("Vinted Server started 🚀🚀🚀");
});
