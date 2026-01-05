"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
const jsonwebtoken_1 = require("jsonwebtoken");
const errorHandler = (err, req, res, next) => {
    // Default error
    let statusCode = 500;
    let message = 'Internal server error';
    let errors = undefined;
    // AppError instances (custom errors)
    if (err instanceof errors_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Mongoose Validation Errors
    else if (err instanceof mongoose_1.Error.ValidationError) {
        statusCode = 400;
        message = 'Validation error';
        errors = Object.values(err.errors).map((error) => ({
            field: error.path,
            message: error.message
        }));
    }
    // Mongoose Duplicate Key Error
    else if (err.name === 'MongoServerError' && err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyPattern)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
    // Mongoose Cast Error (invalid ObjectId)
    else if (err instanceof mongoose_1.Error.CastError) {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }
    // JWT Errors
    else if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        statusCode = 401;
        message = 'Token expired';
    }
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', {
            name: err.name,
            message: err.message,
            stack: err.stack,
            statusCode
        });
    }
    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map