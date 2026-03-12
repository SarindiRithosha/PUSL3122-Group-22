const dotenv = require("dotenv");
const connectDB = require("../config/db");
const AdminUser = require("../models/AdminUser");

dotenv.config();

const DEFAULT_ADMIN_EMAIL = "manidumaneeshaww@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "22122005";
const DEFAULT_ADMIN_NAME = "Manidu Admin";

const run = async () => {
  await connectDB();

  const email = (process.env.ADMIN_SEED_EMAIL || DEFAULT_ADMIN_EMAIL)
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const name = process.env.ADMIN_SEED_NAME || DEFAULT_ADMIN_NAME;

  if (!email || !password) {
    throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required.");
  }

  let adminUser = await AdminUser.findOne({ email });
  const creating = !adminUser;

  if (!adminUser) {
    adminUser = new AdminUser({
      name,
      email,
      role: "admin",
      isActive: true,
    });
  }

  adminUser.name = name;
  adminUser.isActive = true;
  await adminUser.setPassword(password);
  adminUser.resetPasswordTokenHash = "";
  adminUser.resetPasswordExpiresAt = null;
  await adminUser.save();

  console.log(
    `${creating ? "Created" : "Updated"} admin user: ${email} (role: ${adminUser.role})`
  );
  process.exit(0);
};

run().catch((error) => {
  console.error("Failed to seed admin user:", error.message);
  process.exit(1);
});
