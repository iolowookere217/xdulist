import { Response, NextFunction } from 'express';
import { Todo } from '../models/Todo';
import { AuthRequest } from '../types';
import { NotFoundError } from '../utils/errors';

/**
 * Get all todos for current user
 * GET /api/todos?sort=startTime&limit=100
 */
export const getTodos = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { sort = 'startTime', limit = '100' } = req.query;

    const todos = await Todo.find({ userId })
      .sort(sort as string)
      .limit(parseInt(limit as string));

    res.status(200).json({
      success: true,
      data: { todos }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single todo
 * GET /api/todos/:id
 */
export const getTodoById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const todo = await Todo.findOne({ _id: id, userId });
    if (!todo) {
      throw new NotFoundError('Todo not found');
    }

    res.status(200).json({
      success: true,
      data: { todo }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create todo
 * POST /api/todos
 */
export const createTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const todoData = {
      ...req.body,
      userId
    };

    const todo = await Todo.create(todoData);

    res.status(201).json({
      success: true,
      message: 'Todo created successfully',
      data: { todo }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update todo
 * PUT /api/todos/:id
 */
export const updateTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const todo = await Todo.findOne({ _id: id, userId });
    if (!todo) {
      throw new NotFoundError('Todo not found');
    }

    Object.assign(todo, req.body);
    await todo.save();

    res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      data: { todo }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete todo
 * DELETE /api/todos/:id
 */
export const deleteTodo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const todo = await Todo.findOneAndDelete({ _id: id, userId });
    if (!todo) {
      throw new NotFoundError('Todo not found');
    }

    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Parse voice transcript for todo
 * POST /api/todos/parse-voice
 */
export const parseVoiceTranscript = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { transcript } = req.body;

    const GeminiAIService = require('../services/GeminiAIService').default;
    const parsedData = await GeminiAIService.parseTodoVoiceTranscript(transcript);

    res.status(200).json({
      success: true,
      data: parsedData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get todo summary statistics
 * GET /api/todos/summary?period=day|week|month
 */
export const getTodoSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { period = 'day' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        // Start of today
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        break;
      case 'week':
        // Start of this week (Monday)
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust if Sunday
        startDate = new Date(now);
        startDate.setDate(now.getDate() - diff);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        // Start of this month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    }

    // Get all todos in the period
    const todos = await Todo.find({
      userId,
      createdAt: { $gte: startDate }
    });

    // Calculate statistics
    const total = todos.length;
    const completed = todos.filter(t => t.isCompleted).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Group by date for trends
    const todosByDate: Record<string, { completed: number; pending: number }> = {};
    todos.forEach(todo => {
      const dateKey = todo.createdAt.toISOString().split('T')[0];
      if (!todosByDate[dateKey]) {
        todosByDate[dateKey] = { completed: 0, pending: 0 };
      }
      if (todo.isCompleted) {
        todosByDate[dateKey].completed++;
      } else {
        todosByDate[dateKey].pending++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        period,
        startDate,
        endDate: now,
        summary: {
          total,
          completed,
          pending,
          completionRate
        },
        trends: todosByDate
      }
    });
  } catch (error) {
    next(error);
  }
};
