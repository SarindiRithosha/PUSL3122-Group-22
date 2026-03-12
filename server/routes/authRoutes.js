const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  loginAdmin,
  getCurrentAdmin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const {
  signUpCustomer,
  loginCustomer,
  forgotCustomerPassword,
  resetCustomerPassword,
  getCurrentCustomer,
  updateCustomerProfile,
  changeCustomerPassword,
  deleteCustomerAccount,
} = require("../controllers/customerAuthController");
const {
  authenticateAdmin,
  authenticateCustomer,
} = require("../middleware/authMiddleware");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

router.post("/login", authLimiter, loginAdmin);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);
router.get("/me", authenticateAdmin, getCurrentAdmin);

router.post("/customer/signup", authLimiter, signUpCustomer);
router.post("/customer/login", authLimiter, loginCustomer);
router.post("/customer/forgot-password", authLimiter, forgotCustomerPassword);
router.post("/customer/reset-password/:token", authLimiter, resetCustomerPassword);
router.get("/customer/me", authenticateCustomer, getCurrentCustomer);
router.get("/customer/profile", authenticateCustomer, getCurrentCustomer);
router.put("/customer/profile", authenticateCustomer, updateCustomerProfile);
router.post("/customer/change-password", authLimiter, authenticateCustomer, changeCustomerPassword);
router.delete("/customer/account", authLimiter, authenticateCustomer, deleteCustomerAccount);

module.exports = router;
