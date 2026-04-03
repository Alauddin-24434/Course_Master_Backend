import { IUser } from "../interfaces/user.interface";

declare global {
  namespace Express {
    /**
     * Extend Express Request interface to include the authenticated user object.
     * This allows all route controllers to easily access current user data.
     */
    interface Request {
      user?: IUser; 
    }
  }
}
