import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const AdminSchema = new Schema({
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
  role: { type: String, default: "admin", enum: ["admin", "superadmin"] },
  date: { type: Date, default: Date.now },
});

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Admin", AdminSchema);
