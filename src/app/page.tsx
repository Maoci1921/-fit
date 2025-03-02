'use client';

import { useState } from 'react';
import { WorkoutSchedule } from '../components/WorkoutSchedule';
import { defaultUsers } from '../data/defaultUsers';
import { User, WorkoutPlan } from '../types/workout';

export default function Home() {
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [currentUserId, setCurrentUserId] = useState<string>(users[0].id);

  const currentUser = users.find(user => user.id === currentUserId)!;

  const updateExerciseName = (dayIndex: number, exerciseIndex: number, name: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === currentUserId) {
        const newPlan = { ...user.workoutPlan };
        newPlan.days[dayIndex].exercises[exerciseIndex].name = name;
        return { ...user, workoutPlan: newPlan };
      }
      return user;
    }));
  };

  const updateDayName = (dayIndex: number, name: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === currentUserId) {
        const newPlan = { ...user.workoutPlan };
        newPlan.days[dayIndex].day = name;
        return { ...user, workoutPlan: newPlan };
      }
      return user;
    }));
  };

  const addExercise = (dayIndex: number) => {
    setUsers(prev => prev.map(user => {
      if (user.id === currentUserId) {
        const newPlan = { ...user.workoutPlan };
        const newId = `${Date.now()}`;
        newPlan.days[dayIndex].exercises.push({
          id: newId,
          name: '新训练项目',
          sets: 3,
          reps: 12
        });
        return { ...user, workoutPlan: newPlan };
      }
      return user;
    }));
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    setUsers(prev => prev.map(user => {
      if (user.id === currentUserId) {
        const newPlan = { ...user.workoutPlan };
        newPlan.days[dayIndex].exercises.splice(exerciseIndex, 1);
        return { ...user, workoutPlan: newPlan };
      }
      return user;
    }));
  };

  const updatePlanName = (name: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === currentUserId) {
        return { ...user, workoutPlan: { ...user.workoutPlan, name } };
      }
      return user;
    }));
  };

  const updateUserName = (name: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === currentUserId) {
        return { ...user, name };
      }
      return user;
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-center gap-4">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => setCurrentUserId(user.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                const newName = window.prompt('输入新名称:', user.name);
                if (newName && newName !== user.name) {
                  if (user.id === currentUserId) {
                    updateUserName(newName);
                  } else {
                    setUsers(prev => prev.map(u => 
                      u.id === user.id ? { ...u, name: newName } : u
                    ));
                  }
                }
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                user.id === currentUserId
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {user.name}
            </button>
          ))}
        </div>
      </div>
      <WorkoutSchedule
        workoutPlan={currentUser.workoutPlan}
        userName={currentUser.name}
        actions={{
          updateExerciseName,
          updateDayName,
          addExercise,
          removeExercise,
          updatePlanName,
          updateUserName,
          switchUser: setCurrentUserId
        }}
      />
    </main>
  );
}
