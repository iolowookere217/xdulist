"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validation_1.validate)(validation_1.RegisterSchema), authController_1.register);
router.post('/login', (0, validation_1.validate)(validation_1.LoginSchema), authController_1.login);
router.post('/google', authController_1.googleAuth);
router.post('/refresh', authController_1.refresh);
router.get('/verify-email/:token', authController_1.verifyEmail);
router.post('/resend-verification', authController_1.resendVerification);
// Protected routes
router.post('/logout', auth_1.authenticate, authController_1.logout);
router.get('/me', auth_1.authenticate, authController_1.getCurrentUser);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map