import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Budget from '../models/Budget.js'

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' })
    }

    const user = await User.create({ fullName, email, password })

    return res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        onboardingDone: user.onboardingDone,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }

    return res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        currency: user.currency,
        persona: user.persona,
        goals: user.goals,
        monthlyBudget: user.monthlyBudget,
        onboardingDone: user.onboardingDone,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully' })
}

export const getMe = async (req, res) => {
  return res.status(200).json({ success: true, user: req.user })
}

// ---------------------------------------------------------------------------
// Persona → default budget categories to seed
// ---------------------------------------------------------------------------
const PERSONA_CATEGORIES = {
  student: [
    { category: 'Food & Groceries', limit: 150 },
    { category: 'Transport', limit: 60 },
    { category: 'Education', limit: 80 },
    { category: 'Entertainment', limit: 50 },
    { category: 'Health', limit: 30 },
  ],
  employee: [
    { category: 'Housing', limit: 600 },
    { category: 'Food & Groceries', limit: 300 },
    { category: 'Transport', limit: 120 },
    { category: 'Savings', limit: 200 },
    { category: 'Entertainment', limit: 100 },
    { category: 'Health', limit: 50 },
  ],
  family: [
    { category: 'Housing', limit: 900 },
    { category: 'Food & Groceries', limit: 500 },
    { category: 'Transport', limit: 200 },
    { category: 'Education', limit: 150 },
    { category: 'Health', limit: 100 },
    { category: 'Entertainment', limit: 150 },
    { category: 'Clothing', limit: 100 },
  ],
  freelance: [
    { category: 'Housing', limit: 700 },
    { category: 'Food & Groceries', limit: 300 },
    { category: 'Software & Tools', limit: 100 },
    { category: 'Transport', limit: 100 },
    { category: 'Marketing', limit: 80 },
    { category: 'Health', limit: 60 },
    { category: 'Taxes & Fees', limit: 200 },
  ],
}

// PATCH /auth/onboarding  (protected)
export const completeOnboarding = async (req, res) => {
  try {
    const { persona, goals, currency, monthlyBudget } = req.body

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Persist whatever the wizard collected
    if (persona)      user.persona      = persona
    if (goals)        user.goals        = goals
    if (currency)     user.currency     = currency
    if (monthlyBudget !== undefined && monthlyBudget !== '')
                      user.monthlyBudget = Number(monthlyBudget) || null

    user.onboardingDone = true
    await user.save()

    // --- Seed persona-appropriate budget categories ---
    const now = new Date()
    const budgetMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const defaultCategories = PERSONA_CATEGORIES[user.persona] ?? []

    // Scale limits proportionally to monthlyBudget if one was provided
    let scaleFactor = 1
    if (user.monthlyBudget && defaultCategories.length > 0) {
      const defaultTotal = defaultCategories.reduce((s, c) => s + c.limit, 0)
      scaleFactor = user.monthlyBudget / defaultTotal
    }

    const budgetDocs = defaultCategories.map(({ category, limit }) => ({
      updateOne: {
        filter: { user: user._id, month: budgetMonth, category },
        update: {
          $setOnInsert: {
            user: user._id,
            month: budgetMonth,
            category,
            limit: Math.round(limit * scaleFactor),
          },
        },
        upsert: true,
      },
    }))

    if (budgetDocs.length > 0) {
      await Budget.bulkWrite(budgetDocs)
    }

    // --- Auto-create an "Overall" budget if monthlyBudget was set ---
    if (user.monthlyBudget) {
      await Budget.updateOne(
        { user: user._id, month: budgetMonth, category: 'Overall' },
        {
          $setOnInsert: {
            user: user._id,
            month: budgetMonth,
            category: 'Overall',
            limit: user.monthlyBudget,
          },
        },
        { upsert: true }
      )
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        currency: user.currency,
        persona: user.persona,
        goals: user.goals,
        monthlyBudget: user.monthlyBudget,
        onboardingDone: user.onboardingDone,
      },
    })
  } catch (error) {
    console.error('Onboarding error:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}