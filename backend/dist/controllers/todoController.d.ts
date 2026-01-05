import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
/**
 * Get all todos for current user
 * GET /api/todos?sort=startTime&limit=100
 */
export declare const getTodos: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get single todo
 * GET /api/todos/:id
 */
export declare const getTodoById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Create todo
 * POST /api/todos
 */
export declare const createTodo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update todo
 * PUT /api/todos/:id
 */
export declare const updateTodo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Delete todo
 * DELETE /api/todos/:id
 */
export declare const deleteTodo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Parse voice transcript for todo
 * POST /api/todos/parse-voice
 */
export declare const parseVoiceTranscript: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get todo summary statistics
 * GET /api/todos/summary?period=day|week|month
 */
export declare const getTodoSummary: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=todoController.d.ts.map