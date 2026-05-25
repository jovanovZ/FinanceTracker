import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import conn from '../utils/conn.js'
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
      select: true, // nikoli se ne vrne v API responsu
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

    onboardingDone: {
      type: Boolean,
      default: false,
    },

    sessions: [
      {
        device:     { type: String },
        browser:    { type: String },
        location:   { type: String },
        lastActive: { type: Date, default: Date.now },
        token:      { type: String }, // JWT token za to sejo
      },
    ],
  },
  {
    timestamps: true, 
  }
)

// Hash password pred shranjevanjem
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12)
  console.log("in presave", this.password)
})

// Metoda za primerjavo gesla
userSchema.methods.matchPassword = async function (enteredPassword,) {
  console.log(this.password);
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('User', userSchema)