import mongoose from "mongoose";

const { Schema } = mongoose;

const ExerciseSchema = new Schema(
  {
    name: { type: String, required: true },
    sets: { type: Number, min: 1, required: true },
    reps: { type: Number, min: 1, required: true },
    duration: { type: Number, min: 0, default: 0 },
    rest: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const WorkoutDaySchema = new Schema(
  {
    day: { type: String, required: true },
    exercises: [ExerciseSchema],
  },
  { _id: false }
);

const WorkoutSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  planName: { type: String, required: true, trim: true },
  goal: { type: String, trim: true },
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  workouts: [WorkoutDaySchema],
  createdDate: { type: Date, default: Date.now },
});

export default mongoose.model("Workout", WorkoutSchema);
