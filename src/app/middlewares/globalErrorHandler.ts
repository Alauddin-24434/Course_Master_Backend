import { NextFunction, Request, Response } from "express";
import { CustomAppError } from "../errors/customError";
import { ZodError } from "zod";

const globalErrorHandler = (
  err: Error | CustomAppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong!";

  let errorSources: { path: string; message: string }[] = [
    {
      path: null,
      message: err.message,
    },
  ];

  // --------------------
  // Custom App Error
  // --------------------
  if (err instanceof CustomAppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  }

  // --------------------
  // Zod Validation Error
  // --------------------
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";

    errorSources = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  }

  // --------------------
  // Other Errors
  // --------------------
  else {
    message = err.message || message;
    errorSources = [
      {
        path: "",
        message,
      },
    ];
  }

  // --------------------
  // Final Response
  // --------------------
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
  });
};

export default globalErrorHandler;
