// src/utils/catchAsyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from "express";

export const catchAsyncHandler = <T>(fn: (req: Request, res: Response, next: NextFunction) => Promise<T>): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // errors forwarded to globalErrorHandler
  };
};
