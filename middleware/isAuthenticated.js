const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const receivedToken = req.headers.authorization.replace("Bearer ", "");
      const owner = await User.findOne({ token: receivedToken }).select(
        "account"
      );
      // console.log("receivedToken ==>", receivedToken);
      // console.log("owner ==>", owner);

      if (owner) {
        // console.log(Object.keys(req));
        req.user = owner;
        return next();
      } else {
        return res.status(401).json("Unauthorized");
      }
    } else {
      return res.status(401).json("Unauthorized");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = isAuthenticated;
