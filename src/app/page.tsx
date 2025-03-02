'use client';

import { useState } from 'react';
import WorkoutSchedule from '../components/WorkoutSchedule';
import { defaultUsers } from '../data/defaultUsers';
import { User } from '../types/workout';

export default function Home() {
  const [currentUser] = useState<User>(defaultUsers[0]);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <WorkoutSchedule workoutPlan={currentUser.workoutPlan} />
      </div>
    </main>
  );
}
