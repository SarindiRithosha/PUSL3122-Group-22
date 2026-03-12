const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const CustomerUser = require("../models/CustomerUser");

const getBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return "";
  }

  return authorizationHeader.slice("Bearer ".length).trim();
};

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization || "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const decoded = jwt.verify(token, jwtSecret, {
      issuer: "furniplan-server",
      audience: "furniplan-admin-client",
    });
    const adminUser = await AdminUser.findById(decoded.sub);

    if (!adminUser || !adminUser.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session.",
      });
    }

    req.adminUser = adminUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session.",
    });
  }
};

const authenticateCustomer = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization || "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const decoded = jwt.verify(token, jwtSecret, {
      issuer: "furniplan-server",
      audience: "furniplan-customer-client",
    });
    const customerUser = await CustomerUser.findById(decoded.sub);

    if (!customerUser || !customerUser.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session.",
      });
    }

    req.customerUser = customerUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session.",
    });
  }
};

module.exports = {
  authenticateAdmin,
  authenticateCustomer,
};
