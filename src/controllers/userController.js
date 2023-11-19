const router = require("express").Router();
const { validateToken } = require("../middlewares/validateToken");
const User = require("../models/user");

router.get("/", validateToken, async (req, res) => {
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("deleting password", user);

    res.json({
      user: {
        name: user.name,
        phone: user.phone,
        _id: user._id,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve user" });
  }
});

module.exports = router;
