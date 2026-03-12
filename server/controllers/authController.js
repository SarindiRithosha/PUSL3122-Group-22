const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const AdminUser = require("../models/AdminUser");

const DEFAULT_RESET_TOKEN_MINUTES = 20;

const getJwtSecret = () => process.env.JWT_SECRET || "";
const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || "12h";

const signAdminToken = (adminUser) => {
  return jwt.sign(
    {
      sub: adminUser._id.toString(),
      role: adminUser.role,
      email: adminUser.email,
    },
    getJwtSecret(),
    {
      expiresIn: getJwtExpiresIn(),
      issuer: "furniplan-server",
      audience: "furniplan-admin-client",
    }
  );
};

const createResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
};

const buildResetLink = (rawToken) => {
  const configuredBase =
    process.env.RESET_PASSWORD_URL ||
    `${process.env.CLIENT_URL || "http://localhost:5173"}/admin/reset-password?token=`;

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
    auth: {
      user,
      pass,
    },
  });
};

const sendResetPasswordEmail = async ({ toEmail, resetLink, adminName }) => {
  const transporter = createMailer();
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `FurniPlan Admin <${fromAddress}>`,
    to: toEmail,
    subject: "Reset your FurniPlan admin password",
    text: `Hello ${adminName || "Admin"},\n\nUse this link to reset your password:\n${resetLink}\n\nThis link expires in ${DEFAULT_RESET_TOKEN_MINUTES} minutes.\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 8px;">Reset your FurniPlan admin password</h2>
        <p>Hello ${adminName || "Admin"},</p>
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

const loginAdmin = async (req, res, next) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
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

    const adminUser = await AdminUser.findOne({ email });
    if (!adminUser || !adminUser.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await adminUser.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    adminUser.lastLoginAt = new Date();
    await adminUser.save();

    const token = signAdminToken(adminUser);

    return res.json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: adminUser.toPublicJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentAdmin = async (req, res) => {
  return res.json({
    success: true,
    data: {
      user: req.adminUser.toPublicJSON(),
    },
  });
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

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

    const adminUser = await AdminUser.findOne({ email });
    if (!adminUser || !adminUser.isActive) {
      return res.json(genericResponse);
    }

    const { rawToken, tokenHash } = createResetToken();
    const expiresAt = new Date(
      Date.now() + DEFAULT_RESET_TOKEN_MINUTES * 60 * 1000
    );

    adminUser.resetPasswordTokenHash = tokenHash;
    adminUser.resetPasswordExpiresAt = expiresAt;
    await adminUser.save();

    const resetLink = buildResetLink(rawToken);
    await sendResetPasswordEmail({
      toEmail: adminUser.email,
      resetLink,
      adminName: adminUser.name,
    });

    return res.json(genericResponse);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
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
    const adminUser = await AdminUser.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
      isActive: true,
    });

    if (!adminUser) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or expired.",
      });
    }

    await adminUser.setPassword(password);
    adminUser.resetPasswordTokenHash = "";
    adminUser.resetPasswordExpiresAt = null;
    await adminUser.save();

    return res.json({
      success: true,
      message: "Password reset successful. You can now sign in.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginAdmin,
  getCurrentAdmin,
  forgotPassword,
  resetPassword,
};
