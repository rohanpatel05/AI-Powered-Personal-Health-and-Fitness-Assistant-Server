import mongoose from "mongoose";

const { Schema } = mongoose;

const FoodSchema = new Schema(
  {
    foodItem: { type: String, required: true },
    calories: { type: Number, min: 0, required: true },
    protein: { type: Number, min: 0, required: true },
    carbs: { type: Number, min: 0, required: true },
    fat: { type: Number, min: 0, required: true },
  },
  { _id: false }
);

const MealSchema = new Schema(
  {
    mealType: { type: String, required: true },
    foods: [FoodSchema],
  },
  { _id: false }
);

const NutritionPlanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  planName: { type: String, required: true, trim: true },
  goal: { type: String, trim: true },
  calories: { type: Number, min: 0, required: true },
  macros: {
    protein: { type: Number, min: 0, required: true },
    carbs: { type: Number, min: 0, required: true },
    fat: { type: Number, min: 0, required: true },
  },
  meals: [MealSchema],
  createdDate: { type: Date, default: Date.now },
});

export default mongoose.model("NutritionPlan", NutritionPlanSchema);
