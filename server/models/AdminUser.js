const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordTokenHash: {
      type: String,
      default: "",
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

adminUserSchema.methods.setPassword = async function setPassword(plainPassword) {
  const password = String(plainPassword || "");
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }
  this.passwordHash = await bcrypt.hash(password, 12);
};

adminUserSchema.methods.verifyPassword = async function verifyPassword(plainPassword) {
  return bcrypt.compare(String(plainPassword || ""), this.passwordHash);
};

adminUserSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("AdminUser", adminUserSchema);
