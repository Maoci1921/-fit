import { User } from '../types/workout';
import { defaultWorkoutPlan } from './defaultWorkoutPlan';

export const defaultUsers: User[] = [
  {
    id: 'user-1',
    name: '用户1',
    workoutPlan: {
      ...defaultWorkoutPlan,
      id: 'plan-1',
      name: '初级训练计划'
    }
  },
  {
    id: 'user-2',
    name: '用户2',
    workoutPlan: {
      ...defaultWorkoutPlan,
      id: 'plan-2',
      name: '中级训练计划'
    }
  },
  {
    id: 'user-3',
    name: '用户3',
    workoutPlan: {
      ...defaultWorkoutPlan,
      id: 'plan-3',
      name: '高级训练计划'
    }
  },
  {
    id: 'user-4',
    name: '用户4',
    workoutPlan: {
      ...defaultWorkoutPlan,
      id: 'plan-4',
      name: '自定义训练计划'
    }
  }
]; 