import mongoose from 'mongoose';

const WorkoutItemSchema = new mongoose.Schema({
  id: String,
  name: String,
});

const WorkoutDaySchema = new mongoose.Schema({
  id: String,
  name: String,
  items: [WorkoutItemSchema],
});

const UserSchema = new mongoose.Schema({
  id: String,
  name: String,
  workoutDays: [WorkoutDaySchema],
});

const MediaSchema = new mongoose.Schema({
  id: String,
  userId: String,
  itemId: String,
  type: String,
  url: String,
  thumbnail: String,
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Media = mongoose.models.Media || mongoose.model('Media', MediaSchema); 