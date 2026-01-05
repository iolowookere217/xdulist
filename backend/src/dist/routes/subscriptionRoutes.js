"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriptionController_1 = require("../controllers/subscriptionController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
router.get('/', subscriptionController_1.getSubscription);
router.put('/', (0, validation_1.validate)(validation_1.UpdateSubscriptionSchema), subscriptionController_1.updateSubscription);
router.post('/upgrade', subscriptionController_1.upgradeToPremium);
router.post('/downgrade', subscriptionController_1.downgradeToFree);
exports.default = router;
//# sourceMappingURL=subscriptionRoutes.js.map