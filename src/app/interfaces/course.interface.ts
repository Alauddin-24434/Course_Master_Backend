// interfaces/course.interface.ts

export interface ICategory {

  name: string;    
 
}


export interface ICourse {
  title: string;
  description?: string;
  thumbnail: string;
  previewVideo: string;
  price: number;
  category: string;
  tags?: string[];
  instructor: string;
  courseIncludes?: string[];
  isPublished?: boolean;
}
// ==============================
// GET all courses with advanced features
// ==============================
export interface GetAllCoursesQuery {
  page?: number;
  limit?: number;
  search?: string;          // search by title or instructor
  category?: string;        // filter by category ID
  sort?: string;            // e.g., 'price:asc' or 'price:desc'
}