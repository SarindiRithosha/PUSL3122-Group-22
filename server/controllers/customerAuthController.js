const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const CustomerUser = require("../models/CustomerUser");

const DEFAULT_RESET_TOKEN_MINUTES = 20;
const CUSTOMER_AUDIENCE = "furniplan-customer-client";
const ACCOUNT_DELETE_CONFIRMATION_TEXT = "DELETE MY ACCOUNT";
const SRI_LANKA_PROVINCES = new Set([
  "Central",
  "Eastern",
  "Northern",
  "North Central",
  "North Western",
  "Sabaragamuwa",
  "Southern",
  "Uva",
  "Western",
]);

const getJwtSecret = () => process.env.JWT_SECRET || "";
const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || "12h";

const normalizeEmail = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const signCustomerToken = (customerUser) =>
  jwt.sign(
    {
      sub: customerUser._id.toString(),
      role: customerUser.role,
      email: customerUser.email,
    },
    getJwtSecret(),
    {
      expiresIn: getJwtExpiresIn(),
      issuer: "furniplan-server",
      audience: CUSTOMER_AUDIENCE,
    }
  );

const createResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
};

const buildCustomerResetLink = (rawToken) => {
  const configuredBase =
    process.env.CUSTOMER_RESET_PASSWORD_URL ||
    `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=`;

  if (configuredBase.includes("{token}")) {
    return configuredBase.replace("{token}", rawToken);
  }

  return configuredBase.includes("token=")
    ? `${configuredBase}${rawToken}`
    : `${configuredBase}${configuredBase.includes("?") ? "&" : "?"}token=${rawToken}`;
};

const createMailer = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("SMTP credentials are missing. Set SMTP_USER and SMTP_PASS.");
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure,
    auth: { user, pass },
  });
};

const sendCustomerResetPasswordEmail = async ({ toEmail, resetLink, customerName }) => {
  const transporter = createMailer();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `FurniPlan <${fromAddress}>`,
    to: toEmail,
    subject: "Reset your FurniPlan password",
    text: `Hello ${customerName || "Customer"},\n\nUse this link to reset your password:\n${resetLink}\n\nThis link expires in ${DEFAULT_RESET_TOKEN_MINUTES} minutes.\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 8px;">Reset your FurniPlan password</h2>
        <p>Hello ${customerName || "Customer"},</p>
        <p>Click the button below to reset your password. This link expires in ${DEFAULT_RESET_TOKEN_MINUTES} minutes.</p>
        <p style="margin: 24px 0;">
          <a href="${resetLink}" style="background:#DE8B47;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;">Reset Password</a>
        </p>
        <p>If the button does not work, copy this URL into your browser:</p>
        <p>${resetLink}</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};

const signUpCustomer = async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    const confirmPassword = String(req.body?.confirmPassword || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password confirmation does not match.",
      });
    }

    if (!getJwtSecret()) {
      return res.status(500).json({
        success: false,
        message: "JWT secret is missing. Configure JWT_SECRET in server/.env.",
      });
    }

    const existingCustomer = await CustomerUser.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const customerUser = new CustomerUser({ name, email, isActive: true });
    await customerUser.setPassword(password);
    await customerUser.save();

    const token = signCustomerToken(customerUser);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        token,
        user: customerUser.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginCustomer = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!getJwtSecret()) {
      return res.status(500).json({
        success: false,
        message: "JWT secret is missing. Configure JWT_SECRET in server/.env.",
      });
    }

    const customerUser = await CustomerUser.findOne({ email });
    if (!customerUser || !customerUser.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await customerUser.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    customerUser.lastLoginAt = new Date();
    await customerUser.save();

    const token = signCustomerToken(customerUser);
    return res.json({
      success: true,
      message: "Sign in successful.",
      data: {
        token,
        user: customerUser.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentCustomer = async (req, res) => {
  return res.json({
    success: true,
    data: {
      user: req.customerUser.toPublicJSON(),
    },
  });
};

const updateCustomerProfile = async (req, res, next) => {
  try {
    const firstName = String(req.body?.firstName || "").trim();
    const lastName = String(req.body?.lastName || "").trim();
    const phone = String(req.body?.phone || "").trim();
    const street = String(req.body?.address?.street || "").trim();
    const city = String(req.body?.address?.city || "").trim();
    const province = String(req.body?.address?.province || "").trim();
    const postalCode = String(req.body?.address?.postalCode || "").trim();

    const combinedName = `${firstName} ${lastName}`.trim();
    if (!combinedName) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required.",
      });
    }

    if (province && !SRI_LANKA_PROVINCES.has(province)) {
      return res.status(400).json({
        success: false,
        message: "Invalid province selected.",
      });
    }

    req.customerUser.name = combinedName;
    req.customerUser.phone = phone;
    req.customerUser.address = {
      street,
      city,
      province,
      postalCode,
      country: "Sri Lanka",
    };

    await req.customerUser.save();

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        user: req.customerUser.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const changeCustomerPassword = async (req, res, next) => {
  try {
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");
    const confirmPassword = String(req.body?.confirmPassword || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password, new password, and confirmation are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password confirmation does not match.",
      });
    }

    const isCurrentPasswordValid = await req.customerUser.verifyPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    await req.customerUser.setPassword(newPassword);
    req.customerUser.resetPasswordTokenHash = "";
    req.customerUser.resetPasswordExpiresAt = null;
    await req.customerUser.save();

    return res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const deleteCustomerAccount = async (req, res, next) => {
  try {
    const password = String(req.body?.password || "");
    const confirmationText = String(req.body?.confirmationText || "").trim().toUpperCase();

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete your account.",
      });
    }

    if (confirmationText !== ACCOUNT_DELETE_CONFIRMATION_TEXT) {
      return res.status(400).json({
        success: false,
        message: `Confirmation text must be exactly: ${ACCOUNT_DELETE_CONFIRMATION_TEXT}`,
      });
    }

    const isPasswordValid = await req.customerUser.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    req.customerUser.isActive = false;
    req.customerUser.resetPasswordTokenHash = "";
    req.customerUser.resetPasswordExpiresAt = null;
    await req.customerUser.save();

    return res.json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const forgotCustomerPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const genericResponse = {
      success: true,
      message:
        "If the account exists, a reset link has been sent to the email address.",
    };

    const customerUser = await CustomerUser.findOne({ email });
    if (!customerUser || !customerUser.isActive) {
      return res.json(genericResponse);
    }

    const { rawToken, tokenHash } = createResetToken();
    const expiresAt = new Date(
      Date.now() + DEFAULT_RESET_TOKEN_MINUTES * 60 * 1000
    );

    customerUser.resetPasswordTokenHash = tokenHash;
    customerUser.resetPasswordExpiresAt = expiresAt;
    await customerUser.save();

    const resetLink = buildCustomerResetLink(rawToken);
    await sendCustomerResetPasswordEmail({
      toEmail: customerUser.email,
      resetLink,
      customerName: customerUser.name,
    });

    return res.json(genericResponse);
  } catch (error) {
    next(error);
  }
};

const resetCustomerPassword = async (req, res, next) => {
  try {
    const rawToken = String(req.params?.token || "").trim();
    const password = String(req.body?.password || "");
    const confirmPassword = String(req.body?.confirmPassword || "");

    if (!rawToken) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required.",
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password confirmation does not match.",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const customerUser = await CustomerUser.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
      isActive: true,
    });

    if (!customerUser) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or expired.",
      });
    }

    await customerUser.setPassword(password);
    customerUser.resetPasswordTokenHash = "";
    customerUser.resetPasswordExpiresAt = null;
    await customerUser.save();

    return res.json({
      success: true,
      message: "Password reset successful. You can now sign in.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signUpCustomer,
  loginCustomer,
  forgotCustomerPassword,
  resetCustomerPassword,
  getCurrentCustomer,
  updateCustomerProfile,
  changeCustomerPassword,
  deleteCustomerAccount,
};
