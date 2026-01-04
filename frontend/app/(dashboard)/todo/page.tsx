"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { todosApi } from "@/lib/api/todos";
import {
  ListTodo,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatTime } from "@/lib/utils";
import { Todo, CreateTodoData } from "@/types";
import VoiceInputButton from "@/components/expenses/VoiceInputButton";
import TodoSummary from "@/components/todo/TodoSummary";

export default function TodoPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const queryClient = useQueryClient();

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // Fetch todos
  const { data: todosData, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: () => todosApi.getTodos({ sort: "startTime" }),
  });

  const todos = todosData?.data?.todos || [];
  const pendingTodos = todos.filter((t) => !t.isCompleted);
  const completedTodos = todos.filter((t) => t.isCompleted);

  // Check for reminders every minute
  useEffect(() => {
    if (notificationPermission !== "granted") return;

    const checkReminders = () => {
      const now = new Date();
      pendingTodos.forEach((todo) => {
        if (!todo.reminderSent && todo.reminderDate) {
          const reminderTime = new Date(todo.reminderDate);
          if (reminderTime <= now) {
            new Notification("Todo Reminder", {
              body: `${todo.description} starts in 30 minutes!`,
              icon: "/icon.png",
            });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [pendingTodos, notificationPermission]);

  // Toggle completion
  const toggleMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      todosApi.updateTodo(id, { isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => todosApi.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Todo deleted");
    },
  });

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setShowAddModal(true);
  };

  const handleDelete = (todo: Todo) => {
    if (confirm(`Delete "${todo.description}"?`)) {
      deleteMutation.mutate(todo._id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 pt-8 pb-6 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <ListTodo className="w-6 h-6 text-white" />
            <h1 className="text-2xl font-bold text-white">Your Tasks</h1>
          </div>
          <p className="text-blue-100 text-sm">Stay organized with reminders</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-8 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <Clock className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-gray-900">
              {pendingTodos.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-xs text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-900">
              {completedTodos.length}
            </p>
          </div>
        </div>

        {/* Task Summary */}
        <TodoSummary />

        {/* Pending Tasks */}
        {pendingTodos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Pending Tasks
            </h3>
            <div className="space-y-2">
              {pendingTodos.map((todo) => (
                <TodoItem
                  key={todo._id}
                  todo={todo}
                  onToggle={() =>
                    toggleMutation.mutate({
                      id: todo._id,
                      isCompleted: !todo.isCompleted,
                    })
                  }
                  onEdit={() => handleEdit(todo)}
                  onDelete={() => handleDelete(todo)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTodos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Completed Tasks
            </h3>
            <div className="space-y-2">
              {completedTodos.map((todo) => (
                <TodoItem
                  key={todo._id}
                  todo={todo}
                  onToggle={() =>
                    toggleMutation.mutate({
                      id: todo._id,
                      isCompleted: !todo.isCompleted,
                    })
                  }
                  onEdit={() => handleEdit(todo)}
                  onDelete={() => handleDelete(todo)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todos.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tasks yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Tap the + button to add your first task
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Add Button */}
      <button
        onClick={() => {
          setEditingTodo(null);
          setShowAddModal(true);
        }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40">
        <Plus className="w-6 h-6" />
      </button>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddTodoModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingTodo(null);
          }}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ["todos"] })
          }
          editingTodo={editingTodo}
        />
      )}
    </div>
  );
}

// Todo Item Component
function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
}: {
  todo: Todo;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const now = new Date();
  const [hours, minutes] = todo.startTime.split(":").map(Number);
  const todoTime = new Date();
  todoTime.setHours(hours, minutes, 0, 0);
  const isOverdue = !todo.isCompleted && todoTime < now;

  return (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm ${
        isOverdue ? "border-2 border-red-200 bg-red-50" : ""
      }`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={`flex-shrink-0 ${
            todo.isCompleted ? "text-green-600" : "text-gray-400"
          }`}>
          {todo.isCompleted ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`font-medium ${
              todo.isCompleted ? "line-through text-gray-500" : "text-gray-900"
            }`}>
            {todo.description}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Clock
              className={`w-3 h-3 ${
                isOverdue ? "text-red-600" : "text-gray-500"
              }`}
            />
            <span
              className={`text-xs ${
                isOverdue ? "text-red-600 font-medium" : "text-gray-500"
              }`}>
              {formatTime(todo.startTime)}
            </span>
            {isOverdue && (
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                Overdue
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Add/Edit Todo Modal
function AddTodoModal({
  isOpen,
  onClose,
  onSuccess,
  editingTodo,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTodo: Todo | null;
}) {
  const [description, setDescription] = useState(
    editingTodo?.description || ""
  );
  const [startTime, setStartTime] = useState(editingTodo?.startTime || "");
  const [reminderTime, setReminderTime] = useState(
    editingTodo?.reminderTime || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsingVoice, setIsParsingVoice] = useState(false);

  const handleVoiceInput = async (transcript: string) => {
    setIsParsingVoice(true);
    try {
      const response = await todosApi.parseVoice(transcript);
      if (response.success && response.data) {
        setDescription(response.data.description);
        if (response.data.startTime) {
          setStartTime(response.data.startTime);
        }
        if (response.data.reminderTime) {
          setReminderTime(response.data.reminderTime);
        }
        toast.success("Voice input processed");
      }
    } catch (error: any) {
      toast.error("Failed to process voice input");
      // Fallback: use raw transcript as description
      setDescription(transcript);
    } finally {
      setIsParsingVoice(false);
    }
  };

  const handleTimeVoiceInput = async (transcript: string) => {
    setIsParsingVoice(true);
    try {
      const response = await todosApi.parseVoice(transcript);
      if (response.success && response.data?.startTime) {
        setStartTime(response.data.startTime);
        toast.success("Time captured");
      } else {
        toast.info(
          "Could not extract time from voice input. Please enter manually."
        );
      }
    } catch (error: any) {
      toast.error("Failed to process voice input");
    } finally {
      setIsParsingVoice(false);
    }
  };

  const handleReminderVoiceInput = async (transcript: string) => {
    setIsParsingVoice(true);
    try {
      const response = await todosApi.parseVoice(transcript);
      if (response.success && response.data?.reminderTime) {
        setReminderTime(response.data.reminderTime);
        toast.success("Reminder time captured");
      } else if (response.success && response.data?.startTime) {
        // Fallback: use startTime as reminderTime
        setReminderTime(response.data.startTime);
        toast.success("Reminder time captured");
      } else {
        toast.info(
          "Could not extract time from voice input. Please enter manually."
        );
      }
    } catch (error: any) {
      toast.error("Failed to process voice input");
    } finally {
      setIsParsingVoice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data: CreateTodoData = {
        description,
        startTime,
        ...(reminderTime && { reminderTime }), // Include reminderTime only if provided
      };

      if (editingTodo) {
        await todosApi.updateTodo(editingTodo._id, data);
        toast.success("Todo updated");
      } else {
        await todosApi.createTodo(data);
        toast.success("Todo added");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save todo");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingTodo ? "Edit Todo" : "Add Todo"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are your plans for today?"
                className="w-full h-12 rounded-xl border border-gray-200 px-4 pr-14 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-600"
                required
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceInputButton
                  onTranscript={handleVoiceInput}
                  disabled={isParsingVoice || isSubmitting}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use voice: say activity, time, and reminder (e.g., "go to church
              by 11am remind me 10 mins before")
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <div className="relative">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-12 rounded-xl border border-gray-200 px-4 pr-14 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-600"
                required
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceInputButton
                  onTranscript={handleTimeVoiceInput}
                  disabled={isParsingVoice || isSubmitting}
                  size="sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">When the task starts</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Time (Optional)
            </label>
            <div className="relative">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                placeholder="HH:MM"
                className="w-full h-12 rounded-xl border border-gray-200 px-4 pr-14 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-600"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceInputButton
                  onTranscript={handleReminderVoiceInput}
                  disabled={isParsingVoice || isSubmitting}
                  size="sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use voice or enter manually. Leave blank for automatic 30 minutes
              before start time.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {editingTodo ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>{editingTodo ? "Update Todo" : "Add Todo"}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
