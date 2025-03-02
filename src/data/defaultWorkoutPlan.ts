import { WorkoutPlan } from '../types/workout';

export const defaultWorkoutPlan: WorkoutPlan = {
  id: 'default-plan',
  name: '标准训练计划',
  days: [
    {
      day: '周一',
      exercises: [
        { id: '1', name: '俯卧撑', sets: 3, reps: 12 },
        { id: '2', name: '深蹲', sets: 4, reps: 15 },
        { id: '3', name: '平板支撑', sets: 3, reps: 60 },
      ],
    },
    {
      day: '周二',
      exercises: [
        { id: '4', name: '引体向上', sets: 3, reps: 8 },
        { id: '5', name: '卷腹', sets: 3, reps: 20 },
        { id: '6', name: '弓步蹲', sets: 3, reps: 12 },
      ],
    },
    {
      day: '周三',
      exercises: [
        { id: '7', name: '哑铃划船', sets: 4, reps: 12 },
        { id: '8', name: '三头下压', sets: 3, reps: 15 },
        { id: '9', name: '侧平板支撑', sets: 2, reps: 45 },
      ],
    },
    {
      day: '周四',
      exercises: [
        { id: '10', name: '开合跳', sets: 4, reps: 20 },
        { id: '11', name: '山climbers', sets: 3, reps: 30 },
        { id: '12', name: '波比跳', sets: 3, reps: 10 },
      ],
    },
    {
      day: '周五',
      exercises: [
        { id: '13', name: '杠铃卧推', sets: 4, reps: 10 },
        { id: '14', name: '肱二头弯举', sets: 3, reps: 12 },
        { id: '15', name: '反向卷腹', sets: 3, reps: 15 },
      ],
    },
    {
      day: '周六',
      exercises: [
        { id: '16', name: '硬拉', sets: 4, reps: 8 },
        { id: '17', name: '腿举', sets: 3, reps: 15 },
        { id: '18', name: '小腿提升', sets: 3, reps: 20 },
      ],
    },
    {
      day: '周日',
      exercises: [
        { id: '19', name: '有氧运动', sets: 1, reps: 30 },
        { id: '20', name: '拉伸', sets: 1, reps: 15 },
        { id: '21', name: '瑜伽', sets: 1, reps: 20 },
      ],
    },
  ],
}; 