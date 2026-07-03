# AI-Powered Resume Analysis & Mock Interview Intelligence Platform

> A full-stack AI-driven web application that analyzes a candidate's resume against a job description and generates a personalized mock interview intelligence report — powered by the Google Gemini API, built with Node.js, Express.js, MongoDB, and React.js.

---

## Live Demo

> Coming soon — currently running in a local development environment.

---

## Project Overview

This platform is designed to help job seekers prepare more effectively by bridging the gap between their current profile and what a role actually demands.

- Parses an uploaded resume PDF and compares it against a provided job description
- Uses Google Gemini to generate structured, role-specific interview intelligence
- Produces a match score, skill gap analysis, and curated technical and behavioral questions
- Builds a day-wise preparation plan tailored to the candidate's profile
- Auto-generates an ATS-optimized resume PDF for the target role

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express.js** | RESTful API server, routing, middleware |
| **MongoDB + Mongoose** | NoSQL database, schema design and queries |
| **JWT (jsonwebtoken)** | Stateless authentication and authorization |
| **bcryptjs** | Password hashing and security |
| **Multer** | Multipart file upload handling for resume PDFs |
| **pdf-parse** | Extracts text content from uploaded PDF resumes |
| **Puppeteer** | Headless browser used to generate PDFs from AI-produced HTML |
| **Zod + zod-to-json-schema** | Schema validation and structured AI response enforcement |
| **Google Gemini API** | Core AI model for report and resume generation |
| **dotenv** | Environment variable management |
| **cookie-parser** | Cookie-based token handling |

### Frontend

| Technology | Purpose |
|---|---|
| **React 19 + Vite** | Fast, modern UI framework |
| **React Router v7** | Client-side routing and navigation |
| **Axios** | HTTP client for API communication |
| **SCSS** | Modular, maintainable styling |

---

## Architecture

```
AI-Resume-Interview-Platform/
├── Backend/
│   └── src/
│       ├── controllers/        # Route handler logic (auth, interview)
│       ├── services/           # AI service (Gemini API calls, PDF generation)
│       ├── models/             # Mongoose schemas (User, InterviewReport, Blacklist)
│       ├── routes/             # Express RESTful route definitions
│       ├── middlewares/        # Auth middleware, file upload middleware
│       └── config/             # DB connection and app config
│
└── Frontend/
    └── src/
        ├── features/           # Feature-based component structure (auth, interview)
        ├── style/              # SCSS stylesheets
        └── app.routes.jsx      # React Router configuration
```

---

## API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/register` | Register a new user | Public |
| `POST` | `/login` | Login with email and password | Public |
| `GET` | `/logout` | Logout and blacklist the current token | Public |
| `GET` | `/get-me` | Get the currently authenticated user | Private |

### Interview Routes — `/api/interview`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/` | Upload resume and job description to generate an AI interview report | Private |
| `GET` | `/` | Retrieve all interview reports for the logged-in user | Private |
| `GET` | `/report/:interviewId` | Retrieve a specific report by ID | Private |
| `POST` | `/resume/pdf/:interviewReportId` | Generate an ATS-friendly resume PDF | Private |

---

## AI Integration — Google Gemini API

The AI service uses Zod schemas to enforce structured JSON output from the Gemini model, ensuring the response is always predictable and well-typed:

```js
const interviewReportSchema = z.object({
    matchScore: z.number(),                  // 0–100 job match score
    technicalQuestions: z.array(...),        // question + intention + how to answer
    behavioralQuestions: z.array(...),       // question + intention + how to answer
    skillGaps: z.array(...),                 // skill + severity (low/medium/high)
    preparationPlan: z.array(...),           // day-wise study plan
    title: z.string()                        // job title
})
```

The resume content is also AI-generated as HTML, which Puppeteer then renders and exports as a real downloadable PDF.

---

## Authentication Flow

1. User registers — password is hashed using bcryptjs before storage
2. A JWT token is issued and stored in an HTTP-only cookie
3. Protected routes are guarded by an auth middleware that validates the token
4. On logout, the token is added to a MongoDB blacklist to prevent further use

---

## MongoDB Schema Design

### User Model
```
username | email | password (hashed) | createdAt
```

### InterviewReport Model
```
user (ref) | resume | selfDescription | jobDescription |
matchScore | technicalQuestions[] | behavioralQuestions[] |
skillGaps[] | preparationPlan[] | title | createdAt
```

### TokenBlacklist Model
```
token | createdAt (TTL index for auto-expiry)
```

---

## Setup and Installation

### Prerequisites
- Node.js v18 or higher
- MongoDB (local instance or Atlas)
- A valid Google Gemini API key

### Backend Setup
```bash
cd Backend
npm install
# Create a .env file with the following variables:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# GOOGLE_GENAI_API_KEY=your_gemini_api_key
npm run dev
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

---

## Key Features — Mapped to Backend Engineering Requirements

| Requirement | Implementation |
|---|---|
| Develop and maintain backend APIs | RESTful APIs with Express.js covering auth and interview modules |
| Work with NoSQL databases | MongoDB with Mongoose — schema design, queries, and field projections |
| RESTful services | Complete REST API using proper HTTP methods and status codes |
| Authentication | JWT, bcrypt, and a token blacklist for secure, stateless auth |
| Clean, modular code | MVC pattern with controllers, services, models, and routes cleanly separated |
| AI-driven systems | Google Gemini API integrated with structured output enforced via Zod |
| Experience with Express.js | Express v5 with middleware, routing, and error handling |
| MongoDB | Mongoose schemas, full CRUD operations, and field projection |
| File handling | Multer for uploads, pdf-parse for text extraction, Puppeteer for PDF generation |

---

## Developer

**Aastha Muskan**  
B.Tech — Computer Science and Engineering  
aasthamuskan9430@gmail.com

---

## License

This project is open-source and available under the [MIT License](LICENSE).
