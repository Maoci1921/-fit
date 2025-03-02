export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  videoUrl?: string;
}

export interface DayPlan {
  day: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  days: DayPlan[];
}

export interface User {
  id: string;
  name: string;
  workoutPlan: WorkoutPlan;
}

export interface WorkoutActions {
  updateExerciseName: (dayIndex: number, exerciseIndex: number, name: string) => void;
  updateDayName: (dayIndex: number, name: string) => void;
  addExercise: (dayIndex: number) => void;
  removeExercise: (dayIndex: number, exerciseIndex: number) => void;
  updatePlanName: (name: string) => void;
  updateUserName: (name: string) => void;
  switchUser: (userId: string) => void;
} 