"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
router.get('/profile', userController_1.getProfile);
router.put('/profile', (0, validation_1.validate)(validation_1.UpdateProfileSchema), userController_1.updateProfile);
router.put('/password', (0, validation_1.validate)(validation_1.ChangePasswordSchema), userController_1.changePassword);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map