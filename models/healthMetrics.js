import mongoose from "mongoose";

const { Schema } = mongoose;

const FoodLogSchema = new Schema(
  {
    mealType: { type: String, required: true },
    foodItem: { type: String, required: true },
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbs: { type: Number, min: 0 },
    fat: { type: Number, min: 0 },
  },
  { _id: false }
);

const WorkoutLogSchema = new Schema(
  {
    workoutType: { type: String, required: true },
    duration: { type: Number, min: 0 },
    intensity: { type: String, enum: ["low", "medium", "high"] },
  },
  { _id: false }
);

const HealthMetricsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  date: { type: Date, default: Date.now },
  weight: { type: Number, min: 0 },
  height: { type: Number, min: 0 },
  activityLevel: {
    type: String,
    enum: ["sedentary", "light", "moderate", "active", "very active"],
  },
  dailySteps: { type: Number, min: 0, default: 0 },
  sleepHours: { type: Number, min: 0, default: 0 },
  waterIntake: { type: Number, min: 0, default: 0 },
  foodLog: [FoodLogSchema],
  workoutLog: [WorkoutLogSchema],
});

export default mongoose.model("HealthMetrics", HealthMetricsSchema);
