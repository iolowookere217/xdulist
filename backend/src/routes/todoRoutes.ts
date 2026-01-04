import { Router } from 'express';
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  parseVoiceTranscript,
  getTodoSummary
} from '../controllers/todoController';
import { authenticate } from '../middleware/auth';
import { validate, CreateTodoSchema, UpdateTodoSchema, VoiceTranscriptSchema } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Summary route (must come before /:id to avoid conflict)
router.get('/summary', getTodoSummary);

router.get('/', getTodos);
router.get('/:id', getTodoById);
router.post('/', validate(CreateTodoSchema), createTodo);
router.put('/:id', validate(UpdateTodoSchema), updateTodo);
router.delete('/:id', deleteTodo);

// Voice parsing
router.post('/parse-voice', validate(VoiceTranscriptSchema), parseVoiceTranscript);

export default router;
