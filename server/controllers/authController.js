import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
// Mock auth controller za testiranje
// TODO: Povezati z pravo bazo in User modelom

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      console.log(user);
      let is = await user.matchPassword(password);
      if (is) {
        user.password = undefined
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );
        return res.status(200).json({
          success: true,
          token: token,
          user: user,
        });
       return res.render("secret");
      } else {
        return res.status(400).json({ error: "password doesn't match" });
      }
    } else {
      return res.status(400).json({ error: "User doesn't exist" });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const register = async (req, res) => {
  try {
    console.log("in register")
    //TODO verifikiacija podatkov
    const { name, email, password } = req.body;
    const user = await User.create({
      fullName: name,
      email: email,
      password: password
    });
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    return res.status(201).json({
      success: true,
      token: token,
      user: user,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const logout = async (req, res) => {
  // Frontend logout (odstrani token iz localStorage)
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
