import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "./server/utils/config";
import User from "./server/models/User";

async function seed() {
  await mongoose.connect(config.mongoUri);
  const password = await bcrypt.hash("admin123", 10);
  const UserModel = mongoose.models.User || (User as any).default || User;

  await UserModel.deleteMany({});
  
  await UserModel.create({
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Admin User",
    username: "admin",
    email: "admin@example.com",
    password: "admin123", // the model hooks will hash it
    role: "admin",
    isActive: true,
    isEmailVerified: true
  });
  console.log("Admin seeded");

  await UserModel.create({
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Sarah Chen",
    username: "sarah",
    email: "client@example.com",
    password: "client123", // the model hooks will hash it
    role: "client",
    title: "Engineering & PM Director",
    isActive: true,
    isEmailVerified: true
  });
  console.log("Client seeded");

  await UserModel.create({
    _id: new mongoose.Types.ObjectId().toString(),
    name: "Dev Team",
    username: "devteam",
    email: "team@example.com",
    password: "team1234", // the model hooks will hash it
    role: "team_member",
    title: "Software Engineer",
    isActive: true,
    isEmailVerified: true
  });
  console.log("Team Member seeded");

  process.exit(0);
}

seed().catch(console.error);
