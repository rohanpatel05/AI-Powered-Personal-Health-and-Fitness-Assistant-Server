// Name: Allows only alphabets and spaces
// Valid format: Alphabets and spaces
// Valid example: "John Doe"
export const nameRegex = /^[a-zA-Z\s]+$/;

// Email: Validates a standard email format
// Valid format: Standard email format
// Valid example: "johndoe@example.com"
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password: Minimum eight characters, at least one letter, one number, and one special character
// Valid format: Minimum eight characters, at least one letter, one number, and one special character
// Valid example: "Password1@"
export const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,16}$/;

// Age: Allows only digits (positive integers)
// Valid format: Digits only
// Valid example: "30"
export const ageRegex = /^\d+$/;

// Gender: Allows only the values 'male', 'female', or 'other'
// Valid format: "male", "female", or "other"
// Valid example: "male"
export const genderRegex = /^(male|female|other)$/;

// Height: Allows positive integers and decimals
// Valid format: Positive integers or decimals
// Valid example: "175.5"
export const heightRegex = /^\d+(\.\d+)?$/;

// Weight: Allows positive integers and decimals
// Valid format: Positive integers or decimals
// Valid example: "70.5"
export const weightRegex = /^\d+(\.\d+)?$/;

// Activity Level: Allows specific activity levels
// Valid format: "sedentary", "light", "moderate", "active", or "very active"
// Valid example: "moderate"
export const activityLevelRegex =
  /^(sedentary|light|moderate|active|very active)$/;

// Goals: Allows only alphabets and spaces
// Valid format: Alphabets and spaces
// Valid example: "weight loss"
export const goalsRegex = /^[a-zA-Z\s]+$/;

// Meal Type: Allows only alphabets and spaces
// Valid format: Alphabets and spaces
// Valid example: "breakfast"
export const mealTypeRegex = /^[a-zA-Z\s]+$/;

// Food Item: Allows only alphabets and spaces
// Valid format: Alphabets and spaces
// Valid example: "oatmeal"
export const foodItemRegex = /^[a-zA-Z\s]+$/;

// Workout Type: Allows only alphabets and spaces
// Valid format: Alphabets and spaces
// Valid example: "running"
export const workoutTypeRegex = /^[a-zA-Z\s]+$/;

// Duration: Allows only digits (positive integers)
// Valid format: Digits only
// Valid example: "30"
export const durationRegex = /^\d+$/;

// Intensity: Allows only the values 'low', 'medium', or 'high'
// Valid format: "low", "medium", or "high"
// Valid example: "high"
export const intensityRegex = /^(low|medium|high)$/;

// Plan Name: Allows only alphabets and spaces
// Valid format: Alphabets and spaces
// Valid example: "Beginner Weight Loss"
export const planNameRegex = /^[a-zA-Z\s]+$/;

// Day: Allows only alphabets
// Valid format: Alphabets only
// Valid example: "Monday"
export const dayRegex = /^[a-zA-Z]+$/;

// Exercise Name: Allows only alphabets and spaces
// Valid format: Alphabets and spaces
// Valid example: "Jumping Jacks"
export const exerciseNameRegex = /^[a-zA-Z\s]+$/;

// Sets and Reps: Allows only digits (positive integers)
// Valid format: Digits only
// Valid example: "3"
export const setsRepsRegex = /^\d+$/;

// Rest: Allows only digits (positive integers)
// Valid format: Digits only
// Valid example: "60"
export const restRegex = /^\d+$/;

// Macronutrients (protein, carbs, fat): Allows positive integers and decimals
// Valid format: Positive integers or decimals
// Valid example: "50.5"
export const macrosRegex = /^\d+(\.\d+)?$/;

// Role: Allows only the values 'admin' or 'superadmin'
// Valid format: "admin" or "superadmin"
// Valid example: "admin"
export const roleRegex = /^(admin|superadmin)$/;

// Daily Steps: Allows only digits (positive integers)
// Valid format: Digits only
// Valid example: "10000"
export const dailyStepsRegex = /^\d+$/;

// Sleep Hours: Allows positive integers and decimals
// Valid format: Positive integers or decimals
// Valid example: "8"
export const sleepHoursRegex = /^\d+(\.\d+)?$/;

// Water Intake: Allows positive integers and decimals
// Valid format: Positive integers or decimals
// Valid example: "2.5"
export const waterIntakeRegex = /^\d+(\.\d+)?$/;
