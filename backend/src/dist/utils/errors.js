"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.TooManyRequestsError = exports.ConflictError = exports.ValidationError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429);
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500);
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=errors.js.map