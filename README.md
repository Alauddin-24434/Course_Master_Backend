# CourseMaster Backend 🚀

CourseMaster is a professional-grade Learning Management System (LMS) backend designed for scalability and performance. Built with a modern tech stack, it provides a comprehensive set of features for managing online courses, student progress, and interactive learning materials.

## ✨ Key Features

- **Robust Authentication**: Secure JWT-based authentication system with role-based access control (RBAC) for Admins and Students.
- **Comprehensive Course Management**: Create, update, and organize courses with categories, batches, and rich metadata.
- **Hierarchical Content Structure**: Logical grouping of content into Courses → Modules → Lessons.
- **Interactive Quizzes & Assignments**: Support for multiple-choice quizzes and text/link-based assignments.
- **Progress Tracking**: Real-time tracking of lesson completion and user activity.
- **Unified Dashboard**: Aggregated statistics and insights for both students and administrators.
- **Enterprise-Grade Security**: Implementation of Helmet, CORS, Rate Limiting, and input validation via Zod.

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Validation**: [Zod](https://zod.dev/)
- **Auth**: [JWT](https://jwt.io/) & [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Security**: Helmet, Express-rate-limit, CORS

## 📁 Project Structure

```text
src/
├── app/
│   ├── config/         # App configurations (Prisma, Cloudinary, etc.)
│   ├── controllers/    # Request handlers
│   ├── interfaces/     # TypeScript interfaces/types
│   ├── middlewares/    # Custom Express middlewares (Auth, Error handling)
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic layer
│   ├── utils/          # Helper functions
│   └── validations/    # Zod validation schemas
├── server.ts           # Server entry point
└── index.ts            # App initialization
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database instance
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd coursemaster-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add the following variables:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/coursemaster"
   PORT=5000
   NODE_ENV="development"
   JWT_SECRET="your_jwt_secret"
   JWT_EXPIRES_IN="1d"
   ```

4. **Prisma Setup**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the application**:
   ```bash
   # Development mode
   npm run dev

   # Production build
   npm run build
   npm start
   ```

## 📡 API Endpoints

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Auth** | `POST /api/v1/auth/signup` | Register a new user |
| | `POST /api/v1/auth/login` | Authenticate user & get token |
| **Courses** | `GET /api/v1/courses` | Fetch all courses |
| | `GET /api/v1/courses/:id` | Get course details |
| **Modules** | `GET /api/v1/modules` | Manage course modules |
| **Dashboard**| `GET /api/v1/dashboard` | Get analytics and overview |
| **Category** | `GET /api/v1/categories` | Manage course categories |

*(Detailed API documentation can be found in the `/docs` or by inspecting the route files)*

## 🛡️ Security

The application includes several security layers:
- **Rate Limiting**: Prevents brute-force attacks.
- **Helmet**: Sets various HTTP headers for security.
- **CORS**: Configured for secure cross-origin requests.
- **Zod**: Strict type-safe input validation.

## 📄 License

This project is licensed under the [ISC License](LICENSE).
