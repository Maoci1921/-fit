import React, { useState } from 'react';
import { Exercise, WorkoutPlan, WorkoutActions } from '../types/workout';
import { VideoPlayer } from './VideoPlayer';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/20/solid';

interface WorkoutScheduleProps {
  workoutPlan: WorkoutPlan;
  userName: string;
  actions: WorkoutActions;
}

export const WorkoutSchedule: React.FC<WorkoutScheduleProps> = ({ workoutPlan, userName, actions }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);

  const handleVideoUpload = (exerciseId: string, videoUrl: string) => {
    setSelectedExercise(prev => 
      prev?.id === exerciseId ? { ...prev, videoUrl } : prev
    );
  };

  const handleNameEdit = (currentName: string, onSave: (name: string) => void) => {
    setEditingName(currentName);
    const newName = window.prompt('输入新名称:', currentName);
    if (newName && newName !== currentName) {
      onSave(newName);
    }
    setEditingName(null);
  };

  const handleDelete = (dayIndex: number, exerciseIndex: number, exerciseName: string) => {
    const confirmed = window.confirm(`确定要删除"${exerciseName}"吗？`);
    if (confirmed) {
      actions.removeExercise(dayIndex, exerciseIndex);
      if (selectedExercise?.id === workoutPlan.days[dayIndex].exercises[exerciseIndex].id) {
        setSelectedExercise(null);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {workoutPlan.days.map((day, dayIndex) => (
            <div key={day.day} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{day.day}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNameEdit(day.day, (name) => actions.updateDayName(dayIndex, name))}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <PencilIcon className="w-5 h-5 opacity-20 hover:opacity-60" />
                  </button>
                  <button
                    onClick={() => actions.addExercise(dayIndex)}
                    className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 opacity-20 hover:opacity-60" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {day.exercises.map((exercise, exerciseIndex) => (
                  <div
                    key={exercise.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedExercise?.id === exercise.id
                        ? 'bg-blue-100'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex-grow"
                        onClick={() => setSelectedExercise(exercise)}
                      >
                        <h3 className="font-medium">{exercise.name}</h3>
                        <p className="text-gray-600">
                          {exercise.sets} 组 × {exercise.reps} {exercise.reps > 30 ? '秒' : '次'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleNameEdit(
                            exercise.name,
                            (name) => actions.updateExerciseName(dayIndex, exerciseIndex, name)
                          )}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <PencilIcon className="w-5 h-5 opacity-20 hover:opacity-60" />
                        </button>
                        <button
                          onClick={() => handleDelete(dayIndex, exerciseIndex, exercise.name)}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5 opacity-20 hover:opacity-60" />
                        </button>
                      </div>
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
              {selectedExercise && (
                <button
                  onClick={() => {
                    const dayIndex = workoutPlan.days.findIndex(day =>
                      day.exercises.some(e => e.id === selectedExercise.id)
                    );
                    const exerciseIndex = workoutPlan.days[dayIndex].exercises.findIndex(
                      e => e.id === selectedExercise.id
                    );
                    handleNameEdit(
                      selectedExercise.name,
                      (name) => actions.updateExerciseName(dayIndex, exerciseIndex, name)
                    );
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <PencilIcon className="w-5 h-5 opacity-20 hover:opacity-60" />
                </button>
              )}
            </div>
            <VideoPlayer
              videoUrl={selectedExercise?.videoUrl}
              onVideoUpload={(url) => selectedExercise && handleVideoUpload(selectedExercise.id, url)}
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
}; 