import React, { useState } from 'react';
import { Exercise, WorkoutPlan } from '../types/workout';
import { VideoPlayer } from './VideoPlayer';
import { PencilIcon } from '@heroicons/react/24/outline';

interface WorkoutScheduleProps {
  workoutPlan: WorkoutPlan;
}

export default function WorkoutSchedule({ workoutPlan }: WorkoutScheduleProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  const handleNameEdit = (dayIndex: number, exerciseIndex: number) => {
    if (!isLocalhost) return;
    const exercise = workoutPlan.days[dayIndex].exercises[exerciseIndex];
    const newName = window.prompt('输入新的练习名称:', exercise.name);
    if (newName && newName !== exercise.name) {
      console.log('更新练习名称:', newName);
    }
  };

  const handleVideoUpload = (exerciseId: string, videoUrl: string) => {
    if (!isLocalhost) return;
    setSelectedExercise(prev => 
      prev?.id === exerciseId ? { ...prev, videoUrl } : prev
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {workoutPlan.days.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">{day.day}</h3>
              <div className="space-y-4">
                {day.exercises.map((exercise, exerciseIndex) => (
                  <div
                    key={exerciseIndex}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{exercise.name}</span>
                      {isLocalhost && (
                        <button
                          onClick={() => handleNameEdit(dayIndex, exerciseIndex)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <PencilIcon className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    </div>
                    {selectedExercise?.id === exercise.id && (
                      <VideoPlayer 
                        videoUrl={exercise.videoUrl} 
                        onVideoUpload={isLocalhost ? () => {} : undefined} 
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedExercise(exercise)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        查看视频
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="sticky top-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {selectedExercise ? selectedExercise.name : '选择动作查看视频'}
              </h2>
              {isLocalhost && selectedExercise && (
                <button
                  onClick={() => {
                    const dayIndex = workoutPlan.days.findIndex(day =>
                      day.exercises.some(e => e.id === selectedExercise.id)
                    );
                    const exerciseIndex = workoutPlan.days[dayIndex].exercises.findIndex(
                      e => e.id === selectedExercise.id
                    );
                    handleNameEdit(dayIndex, exerciseIndex);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <PencilIcon className="w-5 h-5 opacity-20 hover:opacity-60" />
                </button>
              )}
            </div>
            <VideoPlayer
              videoUrl={selectedExercise?.videoUrl}
              onVideoUpload={isLocalhost && selectedExercise ? (url) => handleVideoUpload(selectedExercise.id, url) : undefined}
            />
            {selectedExercise && (
              <div className="mt-4">
                <p className="text-gray-600">
                  训练要求：{selectedExercise.sets} 组，每组 {selectedExercise.reps} {selectedExercise.reps > 30 ? '秒' : '次'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 