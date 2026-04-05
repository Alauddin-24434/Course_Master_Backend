<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v20+-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Stripe-22.x-635BFF?style=for-the-badge&logo=stripe&logoColor=white" />
</p>

# 🚀 CourseMaster — Backend API

> A production-ready, modular REST API for a full-featured online learning platform — built with **Express 5**, **Prisma 7**, **PostgreSQL**, and **Stripe**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure signup, login, refresh token flow with HTTP-only cookies |
| 👥 **Role-Based Access** | `student`, `instructor`, `admin` roles with route-level guards |
| 📚 **Course Management** | Full CRUD with categories, modules, lessons, search & pagination |
| 🎬 **Video Lessons** | YouTube / direct URL support with ordered lesson progression |
| 📝 **Assignments** | Module-scoped assignments with text/link submission support |
| 🧠 **Quizzes** | Multi-question quizzes with auto-grading engine |
| 💳 **Stripe Payments** | Checkout sessions, webhook handling for success/fail/refund |
| 📊 **Student Progress** | Lesson completion tracking with linear unlock progression |
| 🎓 **Enrollment System** | Free + paid enrollment flows with enrollment verification |
| 📈 **Admin Dashboard** | Analytics: revenue, user counts, course stats |
| ⭐ **Reviews** | Student testimonials/review system |
| 🛡️ **Rate Limiting** | Express rate-limiter to prevent abuse |

---

## 📁 Project Structure

```
courseMaster-backend/
├── prisma/
│   └── schema.prisma            # Database schema (15+ models)
├── src/
│   ├── index.ts                 # Express app setup, middleware, routes
│   ├── server.ts                # Server bootstrap
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   └── stripe.ts            # Stripe client instance
│   └── app/
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── course.controller.ts
│       │   ├── enroll.controller.ts
│       │   ├── assignment.controller.ts
│       │   ├── quiz.controller.ts
│       │   ├── studentSubmission.controller.ts
│       │   └── webhook.controller.ts
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── course.service.ts
│       │   ├── enroll.service.ts
│       │   ├── assignment.service.ts
│       │   ├── quiz.service.ts
│       │   ├── lesson.service.ts
│       │   ├── module.service.ts
│       │   ├── category.service.ts
│       │   ├── dashboard.service.ts
│       │   ├── review.service.ts
│       │   └── user.service.ts
│       ├── routes/
│       │   ├── baseRouter.ts              # Central route registry
│       │   ├── auth.route.ts
│       │   ├── course.route.ts
│       │   ├── enroll.route.ts
│       │   ├── assignment.routes.ts
│       │   ├── quiz.routes.ts
│       │   ├── studentSubmission.route.ts  # Student submit endpoints
│       │   ├── webhook.route.ts           # Stripe webhook
│       │   ├── lesson.route.ts
│       │   ├── module.routes.ts
│       │   ├── category.route.ts
│       │   ├── dashboard.route.ts
│       │   ├── review.route.ts
│       │   └── user.route.ts
│       ├── middlewares/
│       │   ├── auth.middleware.ts          # JWT protect + role authorize
│       │   └── globalErrorHandler.ts
│       ├── validations/                   # Zod validation schemas
│       ├── interfaces/                    # TypeScript type definitions
│       ├── errors/
│       │   └── customError.ts             # Custom error class
│       └── utils/
│           ├── catchAsyncHandler.ts
│           └── sendResponse.ts
├── .env                                   # Environment variables
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    User ||--o{ Enrollment : enrolls
    User ||--o{ Course : teaches
    User ||--o{ Payment : pays
    User ||--o{ Review : writes
    User ||--o{ CompletedLesson : completes
    User ||--o{ AssignmentSubmission : submits
    User ||--o{ QuizSubmission : attempts

    Course ||--o{ Module : contains
    Course ||--o{ Enrollment : has
    Course ||--o{ Payment : receives
    Course }o--|| Category : belongs_to

    Module ||--o{ Lesson : contains
    Module ||--o| Assignment : has
    Module ||--o| Quiz : has

    Quiz ||--o{ QuizQuestion : has
    Quiz ||--o{ QuizSubmission : receives

    Assignment ||--o{ AssignmentSubmission : receives

    Lesson ||--o{ CompletedLesson : tracked_by
```

---

## 🔌 API Endpoints

### 🔐 Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/signup` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login + get JWT tokens |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |

### 📚 Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/courses` | List courses (search, filter, paginate) |
| `GET` | `/api/v1/courses/:id` | Get course details |
| `POST` | `/api/v1/courses` | Create course (instructor) |
| `PATCH`| `/api/v1/courses/:id` | Update course |
| `DELETE`| `/api/v1/courses/:id` | Delete course |
| `POST` | `/api/v1/courses/complete-lesson` | Mark lesson completed |
| `GET` | `/api/v1/courses/my-courses` | Get enrolled courses with progress |

### 🎓 Enrollments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/enrollments` | Enroll (free) or start Stripe checkout (paid) |
| `GET` | `/api/v1/enrollments/me` | Get user enrollments |
| `GET` | `/api/v1/enrollments/courses/:courseId` | Get enrolled course curriculum |

### 📝 Student Submissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/submissions/assignments/submit` | Submit an assignment |
| `POST` | `/api/v1/submissions/quizs/submit` | Submit quiz answers (auto-graded) |

### 💳 Payments & Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/webhook` | Stripe webhook (success, expired, refund) |

### 📦 Other Resources
| Resource | Endpoints |
|----------|-----------|
| Categories | CRUD at `/api/v1/categories` |
| Modules | CRUD at `/api/v1/modules` |
| Lessons | CRUD at `/api/v1/lessons` |
| Assignments | CRUD at `/api/v1/assignments` |
| Quizzes | CRUD at `/api/v1/quizs` |
| Reviews | CRUD at `/api/v1/reviews` |
| Dashboard | Stats at `/api/v1/dashboard` |
| Users | Manage at `/api/v1/users` |

---

## ⚡ Quick Start

### Prerequisites
- Node.js v20+
- PostgreSQL database
- Stripe account (for payments)

### 1. Clone & Install
```bash
git clone <repo-url>
cd courseMaster-backend
npm install
```

### 2. Environment Variables
Create a `.env` file:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:3000"
PORT=5000
```

### 3. Database Setup
```bash
npx prisma db push      # Push schema to database
npx prisma generate      # Generate Prisma Client
```

### 4. Run Development Server
```bash
npm run dev
```
Server starts at `http://localhost:5000`

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🔒 Security
- **JWT** access + refresh tokens stored in HTTP-only cookies
- **Bcrypt** password hashing
- **Zod** request validation on all endpoints
- **CORS** configured for specific frontend origins
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **Stripe Webhook Signature** verification for payment security

---

## 🧪 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Express 5 | HTTP framework |
| TypeScript 5.9 | Type safety |
| Prisma 7 | ORM + migrations |
| PostgreSQL | Relational database |
| Stripe | Payment processing |
| Zod | Runtime validation |
| JWT | Authentication |
| Bcrypt | Password hashing |

---

<p align="center">
  <b>Built with ❤️ for CourseMaster</b>
</p>
