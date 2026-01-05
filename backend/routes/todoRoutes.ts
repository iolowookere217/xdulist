import { Router } from "express";
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  parseVoiceTranscript,
  getTodoSummary,
} from "../controllers/todoController";
import { authenticate } from "../middleware/auth";
import {
  validate,
  CreateTodoSchema,
  UpdateTodoSchema,
  VoiceTranscriptSchema,
} from "../middleware/validation";

const router = Router();

router.use(authenticate);

router.get("/summary", getTodoSummary);
router.get("/", getTodos);
router.get("/:id", getTodoById);
router.post("/", validate(CreateTodoSchema), createTodo);
router.put("/:id", validate(UpdateTodoSchema), updateTodo);
router.delete("/:id", deleteTodo);
router.post(
  "/parse-voice",
  validate(VoiceTranscriptSchema),
  parseVoiceTranscript
);

export default router;
