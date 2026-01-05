"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const todoController_1 = require("../controllers/todoController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Summary route (must come before /:id to avoid conflict)
router.get('/summary', todoController_1.getTodoSummary);
router.get('/', todoController_1.getTodos);
router.get('/:id', todoController_1.getTodoById);
router.post('/', (0, validation_1.validate)(validation_1.CreateTodoSchema), todoController_1.createTodo);
router.put('/:id', (0, validation_1.validate)(validation_1.UpdateTodoSchema), todoController_1.updateTodo);
router.delete('/:id', todoController_1.deleteTodo);
// Voice parsing
router.post('/parse-voice', (0, validation_1.validate)(validation_1.VoiceTranscriptSchema), todoController_1.parseVoiceTranscript);
exports.default = router;
//# sourceMappingURL=todoRoutes.js.map