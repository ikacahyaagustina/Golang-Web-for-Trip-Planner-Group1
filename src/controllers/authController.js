const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail } = require('../models/userModel');
const AppError = require('../utils/appError');
const { generateAccessToken } = require('../utils/jwt');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new AppError(400, 'name, email, and password are required');
    }

    if (!isValidEmail(email)) {
      throw new AppError(400, 'Invalid email format');
    }

    if (String(password).length < 6) {
      throw new AppError(400, 'Password must be at least 6 characters');
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      throw new AppError(400, 'Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    const token = generateAccessToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: 'Register successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'email and password are required');
    }

    const user = await findUserByEmail(email);

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = generateAccessToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
};
