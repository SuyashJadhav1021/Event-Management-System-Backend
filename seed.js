/**
 * Run this ONCE to create your first admin user:
 *   node seed.js
 *
 * After running, log in with:
 *   email: admin@events.com
 *   password: Admin@123
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB...");

  // Remove existing admin
  await User.deleteOne({ email: "admin@events.com" });

  // Create admin
  const admin = await User.create({
    name: "Admin",
    email: "admin@events.com",
    password: "Admin@123",
    role: "admin",
  });

  console.log("Admin user created:");
  console.log(`Email: ${admin.email}`);
  console.log(`Role:  ${admin.role}`);
  console.log("Password: Admin@123");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
