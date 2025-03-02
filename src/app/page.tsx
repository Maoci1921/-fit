'use client';

import { useState } from 'react';
import WorkoutSchedule from '../components/WorkoutSchedule';
import { defaultUsers } from '../data/defaultUsers';
import { User } from '../types/workout';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User>(defaultUsers[0]);
  const [users, setUsers] = useState<User[]>(defaultUsers);

  const handleUserSwitch = (user: User) => {
    setCurrentUser(user);
  };

  const handleUserNameUpdate = (userId: string, newName: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, name: newName } : user
    ));
    if (currentUser.id === userId) {
      setCurrentUser({ ...currentUser, name: newName });
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <WorkoutSchedule
          workoutPlan={currentUser.workoutPlan}
          onUpdateUserName={(newName) => handleUserNameUpdate(currentUser.id, newName)}
        />
      </div>
    </main>
  );
}
