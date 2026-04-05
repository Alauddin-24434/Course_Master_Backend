import { ICourse } from "./course.interface";

export interface ICategory {
  id: string;
  name: string;
  courses?: ICourse[];
  createdAt: Date;
  updatedAt: Date;
}