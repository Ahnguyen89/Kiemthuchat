'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskListNodeData, TaskItem } from '@canvas-llm/shared';

export default function TaskListNode({ id, data, selected }: NodeProps<TaskListNodeData>) {
  const [title, setTitle] = useState(data.title || 'Task List');
  const [tasks, setTasks] = useState<TaskItem[]>(data.tasks || []);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Update local state when data changes externally (from collaboration)
  useEffect(() => {
    if (!isEditingTitle && data.title !== title) {
      setTitle(data.title || 'Task List');
    }
  }, [data.title, isEditingTitle, title]);

  useEffect(() => {
    // Update tasks if they changed externally
    const dataTasksStr = JSON.stringify(data.tasks || []);
    const currentTasksStr = JSON.stringify(tasks);
    if (dataTasksStr !== currentTasksStr) {
      setTasks(data.tasks || []);
    }
  }, [data.tasks, tasks]);

  const handleTitleBlur = useCallback(() => {
    data.title = title;
    setIsEditingTitle(false);
  }, [title, data]);

  const handleToggleTask = useCallback((taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    data.tasks = updatedTasks;
  }, [tasks, data]);

  const handleAddTask = useCallback(() => {
    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      text: '',
      completed: false,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    data.tasks = updatedTasks;
  }, [tasks, data]);

  const handleRemoveTask = useCallback((taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    data.tasks = updatedTasks;
  }, [tasks, data]);

  const handleTaskTextChange = useCallback((taskId: string, text: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, text } : task
    );
    setTasks(updatedTasks);
    data.tasks = updatedTasks;
  }, [tasks, data]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <Card
      className={cn(
        'min-w-[280px] max-w-[400px] transition-all duration-200',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <CardHeader className="pb-3">
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="font-semibold"
            autoFocus
          />
        ) : (
          <div className="flex items-center justify-between">
            <h3
              onClick={() => setIsEditingTitle(true)}
              className="font-semibold text-lg cursor-text"
            >
              {title}
            </h3>
            <span className="text-xs text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2 group">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => handleToggleTask(task.id)}
            />
            <Input
              value={task.text}
              onChange={(e) => handleTaskTextChange(task.id, e.target.value)}
              placeholder="Task description..."
              className={cn(
                'flex-1 h-8 text-sm',
                task.completed && 'line-through text-muted-foreground'
              )}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleRemoveTask(task.id)}
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button
          onClick={handleAddTask}
          variant="ghost"
          size="sm"
          className="w-full mt-2 h-8 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Task
        </Button>
      </CardContent>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary border-2 border-background"
      />
    </Card>
  );
}

