const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SRI_LANKA_PROVINCES = [
  "Central",
  "Eastern",
  "Northern",
  "North Central",
  "North Western",
  "Sabaragamuwa",
  "Southern",
  "Uva",
  "Western",
];

const customerUserSchema = new mongoose.Schema(
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
      enum: ["customer"],
      default: "customer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 30,
    },
    address: {
      street: {
        type: String,
        trim: true,
        default: "",
        maxlength: 120,
      },
      city: {
        type: String,
        trim: true,
        default: "",
        maxlength: 80,
      },
      province: {
        type: String,
        trim: true,
        enum: [...SRI_LANKA_PROVINCES, ""],
        default: "",
      },
      postalCode: {
        type: String,
        trim: true,
        default: "",
        maxlength: 20,
      },
      country: {
        type: String,
        trim: true,
        default: "Sri Lanka",
      },
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

customerUserSchema.methods.setPassword = async function setPassword(plainPassword) {
  const password = String(plainPassword || "");
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }
  this.passwordHash = await bcrypt.hash(password, 12);
};

customerUserSchema.methods.verifyPassword = async function verifyPassword(plainPassword) {
  return bcrypt.compare(String(plainPassword || ""), this.passwordHash);
};

customerUserSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    phone: this.phone || "",
    address: {
      street: this.address?.street || "",
      city: this.address?.city || "",
      province: this.address?.province || "",
      postalCode: this.address?.postalCode || "",
      country: this.address?.country || "Sri Lanka",
    },
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("CustomerUser", customerUserSchema);
