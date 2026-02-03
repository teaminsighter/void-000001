// ══════════════════════════════════════
// VOID — Tasks State Hook
// ══════════════════════════════════════

import { useState, useCallback } from 'react';
import type { Task, TaskTag, TaskPriority } from '@/lib/types';

// Mock initial tasks
const INITIAL_TASKS: Task[] = [
  { id: '1', text: 'Review Q1 marketing strategy doc', tag: 'Office', done: false, priority: 'high', createdAt: new Date() },
  { id: '2', text: 'Push Void dashboard to GitHub', tag: 'Project', done: false, priority: 'high', createdAt: new Date() },
  { id: '3', text: "Reply to Farhan's partnership email", tag: 'Office', done: false, priority: 'med', createdAt: new Date() },
  { id: '4', text: 'Read Chapter 4 — Embeddings & Vectors', tag: 'Learning', done: true, priority: 'med', createdAt: new Date() },
  { id: '5', text: 'Schedule dentist appointment', tag: 'Personal', done: false, priority: 'low', createdAt: new Date() },
  { id: '6', text: 'Update CRM pipeline for Nexus deal', tag: 'Office', done: false, priority: 'med', createdAt: new Date() },
];

interface UseTasksReturn {
  tasks: Task[];
  filteredTasks: Task[];
  filter: TaskTag | 'All';
  setFilter: (filter: TaskTag | 'All') => void;
  toggleTask: (id: string) => void;
  addTask: (text: string, tag: TaskTag, priority: TaskPriority) => void;
  deleteTask: (id: string) => void;
  completedCount: number;
  totalCount: number;
}

/**
 * Hook for managing task state
 */
export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<TaskTag | 'All'>('All');

  const toggleTask = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }, []);

  const addTask = useCallback((text: string, tag: TaskTag, priority: TaskPriority) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      text,
      tag,
      priority,
      done: false,
      createdAt: new Date(),
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const filteredTasks = filter === 'All'
    ? tasks
    : tasks.filter(task => task.tag === filter);

  const completedCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;

  return {
    tasks,
    filteredTasks,
    filter,
    setFilter,
    toggleTask,
    addTask,
    deleteTask,
    completedCount,
    totalCount,
  };
}

export default useTasks;
