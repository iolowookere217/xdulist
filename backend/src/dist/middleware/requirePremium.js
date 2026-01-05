"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePremium = void 0;
const errors_1 = require("../utils/errors");
const requirePremium = (req, res, next) => {
    if (!req.user) {
        throw new errors_1.ForbiddenError('Authentication required');
    }
    if (req.user.tier !== 'premium') {
        throw new errors_1.ForbiddenError('This feature requires a premium subscription. Upgrade to unlock!');
    }
    next();
};
exports.requirePremium = requirePremium;
//# sourceMappingURL=requirePremium.js.map