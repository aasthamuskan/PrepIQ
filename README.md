# PrepIQ — AI-Powered Interview Intelligence Platform

> **Analyze your resume. Match it to the job. Walk in prepared.**
> PrepIQ uses large language models to generate personalized interview strategies, predict skill gaps, and build a 7-day preparation plan — all in under 30 seconds.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Resume PDF Upload** | Upload your resume as PDF — parsed and analyzed automatically |
| 🤖 **AI Interview Strategy** | LLM generates technical + behavioral questions tailored to the JD |
| 📊 **Match Score** | Percentage match between your profile and the job description |
| 🔍 **Skill Gap Analysis** | Identifies missing skills with severity levels (low / medium / high) |
| 📅 **7-Day Prep Plan** | Custom day-by-day preparation schedule |
| 🧾 **AI Resume Generator** | Generates an ATS-optimized resume PDF based on your profile + JD |
| 🔐 **Authentication** | JWT-based auth with cookie sessions and token blacklisting |
| 📂 **Report History** | View and revisit all your past interview plans |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| SCSS | Styling with variables and nesting |
| Context API | Global state management |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | Server + REST API |
| MongoDB + Mongoose | Database + ODM |
| Groq SDK (LLaMA 3.3-70B) | AI/LLM for report generation |
| Multer | Multipart file upload handling |
| pdf-parse | PDF text extraction |
| Puppeteer | Server-side PDF generation |
| Zod | AI response schema validation |
| JWT + bcryptjs | Authentication + password hashing |

---

## 📁 Project Structure

```
AI-Resume-Interview-Platform/
├── Frontend/
│   └── src/
│       ├── features/
│       │   ├── auth/          # Login, Register, Auth context & hooks
│       │   └── interview/     # Home, Interview pages, hooks, services
│       ├── App.jsx
│       └── app.routes.jsx
│
├── Backend/
│   └── src/
│       ├── controllers/       # auth.controller.js, interview.controller.js
│       ├── middlewares/       # auth.middleware.js, file.middleware.js
│       ├── models/            # User, InterviewReport, Blacklist models
│       ├── routes/            # auth.routes.js, interview.routes.js
│       ├── services/          # ai.service.js (Groq + Puppeteer)
│       ├── config/            # database.js
│       └── app.js
│
├── server.js                  # Entry point
└── Backend/.env               # Environment variables
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js >= 20
- MongoDB Atlas account (or local MongoDB)
- [Groq API key](https://console.groq.com/) (free tier available)

### 1. Clone the repository

```bash
git clone https://github.com/aasthamuskan/AI-Powered-Resume-Analysis-Mock-Interview-Intelligence-Platform.git
cd AI-Powered-Resume-Analysis-Mock-Interview-Intelligence-Platform
```

### 2. Install dependencies

```bash
# Root / backend dependencies
npm install

# Frontend dependencies
cd Frontend && npm install
```

### 3. Configure environment variables

Create `Backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
```

### 4. Run the project

**Backend** (from root):
```bash
nodemon server.js
# Server runs on http://localhost:3000
```

**Frontend** (from `/Frontend`):
```bash
npm run dev
# App runs on http://localhost:5173
```

---

## 🔌 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/register` | Register a new user | ❌ |
| `POST` | `/login` | Login and receive JWT cookie | ❌ |
| `POST` | `/logout` | Logout and blacklist token | ✅ |

### Interview Routes — `/api/interview`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/` | Generate interview report (+ optional PDF upload) | ✅ |
| `GET` | `/` | Get all reports for logged-in user | ✅ |
| `GET` | `/report/:interviewId` | Get single report by ID | ✅ |
| `POST` | `/resume/pdf/:reportId` | Generate ATS-optimized resume PDF | ✅ |

---

## 🤖 How the AI Works

```
User Input (Resume PDF + Job Description)
         │
         ▼
    pdf-parse extracts text from PDF
         │
         ▼
    Groq LLaMA 3.3-70B receives structured prompt
         │
         ▼
    Returns JSON with:
    ├── Job title + match score (0–100)
    ├── 5+ technical interview questions + model answers
    ├── 4+ behavioral interview questions + model answers
    ├── Skill gaps with severity (low / medium / high)
    └── 7-day personalized preparation plan
         │
         ▼
    Zod validates the AI response schema
         │
         ▼
    Saved to MongoDB + returned to frontend
```

---

## 🔐 Authentication Flow

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- JWT stored in **httpOnly cookies** (XSS-safe, not accessible via JS)
- **Token blacklisting** on logout via MongoDB
- Auth middleware validates JWT + checks blacklist on every protected route

---

## 🌐 Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing (use a long random string) |
| `GROQ_API_KEY` | API key from [console.groq.com](https://console.groq.com) |

---

## 🧠 AI Model

This project uses **LLaMA 3.3-70B Versatile** via the [Groq API](https://groq.com/) — one of the fastest inference APIs available, with a generous free tier.

- Response format: Structured JSON (`response_format: { type: "json_object" }`)
- Schema validation: Zod ensures type-safe, predictable AI output
- Temperature: `0.7` for interview reports · `0.6` for resume generation

---

## 🔮 Future Improvements

- [ ] Real-time mock interview mode (AI evaluates your spoken/typed answers)
- [ ] LinkedIn profile URL as input (instead of PDF upload)
- [ ] Email report delivery
- [ ] Rate limiting on AI endpoints
- [ ] Drag-and-drop file upload with progress bar

---

## 👩‍💻 Author

**Aastha Muskan** — Final Year CS Student | Full Stack Developer
[GitHub](https://github.com/aasthamuskan) · [LinkedIn](https://linkedin.com/in/aasthamuskan)

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
