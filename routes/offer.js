const express = require("express"); // Import d'express
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middleware/isAuthenticated");

const Offer = require("../models/Offer"); // Import du modèle User

// exporter notre route et ne pas avoir à recréer un server (comme app dans index.js)
const router = express.Router();

router.post("/offers", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    console.log("POST : /Offer page");
    const { title, description, price, brand, size, color, condition, city } =
      req.body;

    // convertis le fichier d'image en base64
    const convertToBase64 = (file) => {
      return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
    };
    const convertedFile = convertToBase64(req.files.picture);

    // Création de la nouvelle offre
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
    });

    // upload le fichier et récupère la réponse de cloudinary
    const uploadResponse = await cloudinary.uploader.upload(convertedFile, {
      folder: `/vinted/offers/${newOffer._id}`,
    });

    newOffer.owner = req.user;
    newOffer.productImage = uploadResponse;

    await newOffer.save();

    console.log("newOffer saved");

    res.status(201).json({ status: "Offer created. 👗", newOffer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;
    console.log("req.query ===>", req.query);

    const filters = {};

    if (title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (priceMin && priceMax) {
      filters.product_price = { $gte: priceMin, $lte: priceMax };
    } else if (priceMin && !priceMax) {
      filters.product_price = { $gte: priceMin };
    } else if (!priceMin && priceMax) {
      filters.product_price = { $lte: priceMax };
    }

    const sorting = "";
    if (sort === "price-asc") {
      sorting = "asc";
    }
    if (sort === "price-desc") {
      sorting = "desc";
    }

    const foundOffers = await Offer.find(filters)
      .select("product_name product_price -_id")
      .sort({ product_price: sorting });

    res.status(200).json({
      message: "Product list",
      foundOffers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
