import User from "../models/User.js";

// GET /api/user/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// PUT /api/user/profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.currency = req.body.currency || user.currency;
    user.language = req.body.language || user.language;
    user.timezone = req.body.timezone || user.timezone;
    user.weekStart = req.body.weekStart || user.weekStart;
    user.avatarColor = req.body.avatarColor || user.avatarColor;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};