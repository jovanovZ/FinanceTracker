import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock auth controller za testiranje
// TODO: Povezati z pravo bazo in User modelom

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Mock validacija - za testiranje
    // V produkciji bi preveril v bazi
    if (email === 'lara@example.com' && password === 'mypassword123') {
      // Generiraj JWT token
      const token = jwt.sign(
        { 
          id: '123', 
          email: email 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Mock user objekt
      const user = {
        id: '123',
        name: 'Lara Kovač',
        email: email,
      };

      return res.status(200).json({
        success: true,
        token: token,
        user: user,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
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
    const { name, email, password } = req.body;

    // Mock registracija
    const token = jwt.sign(
      { 
        id: '456', 
        email: email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const user = {
      id: '456',
      name: name,
      email: email,
    };

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
