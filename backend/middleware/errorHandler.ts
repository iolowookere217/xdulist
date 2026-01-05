import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { Error as MongooseError } from "mongoose";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: any = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = "Validation error";
    errors = Object.values(err.errors).map((error: any) => ({
      field: error.path,
      message: error.message,
    }));
  } else if (err.name === "MongoServerError" && (err as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as any).keyPattern)[0];
    message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } already exists`;
  } else if (err instanceof MongooseError.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token";
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Token expired";
  }

  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  }

  res
    .status(statusCode)
    .json({
      success: false,
      message,
      ...(errors && { errors }),
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
