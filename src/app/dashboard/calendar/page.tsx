'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button, Badge } from '@/components/ui';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { motion } from 'framer-motion';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task =>
      task.due_date && isSameDay(new Date(task.due_date), date)
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'amber';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-crimson font-bold text-4xl text-ink mb-2">
              Editorial Calendar
            </h1>
            <p className="text-ink/60 font-dm">
              Track deadlines and plan your stories
            </p>
          </div>
          <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
            New Task
          </Button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-sm shadow-sm border border-ink/10 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-crimson font-bold text-2xl text-ink">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<ChevronRight className="w-4 h-4" />}
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              />
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center font-dm font-semibold text-sm text-ink/60 py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map((day, i) => {
              const dayTasks = getTasksForDate(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    min-h-[100px] p-2 rounded-sm border-2 transition-all text-left
                    ${isToday ? 'border-highlight-amber bg-highlight-amber/5' : 'border-ink/10'}
                    ${isSelected ? 'ring-2 ring-highlight-amber' : ''}
                    ${!isSameMonth(day, currentDate) ? 'opacity-30' : ''}
                    hover:border-highlight-amber/50
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`
                      font-dm font-semibold text-sm
                      ${isToday ? 'text-highlight-amber' : 'text-ink'}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {dayTasks.length > 0 && (
                      <Badge variant="amber" size="sm">
                        {dayTasks.length}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className="text-xs font-dm px-2 py-1 bg-newsprint rounded truncate"
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs font-dm text-ink/50 px-2">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Tasks */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-sm shadow-sm border border-ink/10 p-6"
          >
            <h3 className="font-crimson font-bold text-xl text-ink mb-4">
              Tasks for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>

            {getTasksForDate(selectedDate).length === 0 ? (
              <p className="text-ink/60 font-dm text-center py-8">
                No tasks scheduled for this date
              </p>
            ) : (
              <div className="space-y-3">
                {getTasksForDate(selectedDate).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 bg-newsprint rounded-sm"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      className="w-5 h-5 rounded border-ink/20"
                      readOnly
                    />
                    <div className="flex-1">
                      <h4 className="font-dm font-semibold text-ink">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-ink/60 font-dm mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={getPriorityColor(task.priority)} size="sm">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
