import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  password: { type: String, required: true },
  age: { type: Number, min: 0 },
  gender: { type: String, enum: ["male", "female", "other"] },
  height: { type: Number, min: 0 },
  weight: { type: Number, min: 0 },
  activityLevel: {
    type: String,
    enum: ["sedentary", "light", "moderate", "active", "very active"],
  },
  goals: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  role: { type: String, default: "user", enum: ["user"] },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("User", UserSchema);
