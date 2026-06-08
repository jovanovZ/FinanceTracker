import User from "../models/User.js";

// GET /user/profile
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

// PUT /user/profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

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

    if (req.body.newPassword && req.body.password) {
      const isMatch = await user.matchPassword(req.body.password);
      if (!isMatch) {
        return res.status(403).json({
          message: "Wrong password",
        });
      }
      // if (/^(?!.*(.)\1{3,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/.test(req.body.newPassword)) {
      //   return res.status(401).json({
      //     message: "Weak password",
      //   });
      // }
      user.password = req.body.newPassword;
    }

    const updatedUser = await user.save();

    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const updatePass = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!req.body.password || !req.body.newPassword) {
      return res.status(400).json({
        message: "Invalid body",
      });
    }
    const oldPass = req.body.password;
    const newPass = req.body.newPassword;

    const isMatch = await user.matchPassword(oldPass);
    if (!isMatch) {
      return res.status(403).json({
        message: "Wrong password",
      });
    }
    user.password = newPass;

    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};