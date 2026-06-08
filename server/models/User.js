import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    // Osnovni podatki
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // nikoli se ne vrne v API responsu
    },

    currency: {
      type: String,
      enum: ['EUR', 'USD', 'GBP', 'CHF'],
      default: 'EUR',
    },
    language: {
      type: String,
      enum: ['English', 'Slovenščina'],
      default: 'English',
    },
    timezone: {
      type: String,
      default: 'Europe/Ljubljana',
    },
    weekStart: {
      type: String,
      enum: ['Monday', 'Sunday'],
      default: 'Monday',
    },

    avatarColor: {
      type: String,
      enum: ['orange', 'purple', 'green', 'pink'],
      default: 'orange',
    },

    plan: {
      type: String,
      default: 'Beta · Free',
    },

    // Onboarding
    onboardingDone: {
      type: Boolean,
      default: false,
    },
    persona: {
      type: String,
      enum: ['student', 'employee', 'family', 'freelance'],
      default: null,
    },
    goals: {
      type: [String],
      default: [],
    },
    monthlyBudget: {
      type: Number,
      default: null,
    },

    sessions: [
      {
        device:     { type: String },
        browser:    { type: String },
        location:   { type: String },
        lastActive: { type: Date, default: Date.now },
        token:      { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Hash password pred shranjevanjem
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

// Metoda za primerjavo gesla
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('User', userSchema)
