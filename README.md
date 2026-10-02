# HealTrip AI Patient Decision Assistant

> An AI-powered medical triage and patient navigation prototype that helps patients understand their symptoms, assess urgency, and find appropriate doctors/hospitals from the HealTrip network.

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐   │
│  │ ChatInput│ │MessageBub│ │DoctorCard│ │LanguageToggle │   │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  useChat Hook ─── API Client ─── i18n (AR/EN)       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬─────────────────────────────────────┘
                         │ POST /api/chat
┌────────────────────────▼─────────────────────────────────────┐
│                    Backend (Express.js + TypeScript)          │
│  ┌─────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────┐   │
│  │ Helmet  │ │  CORS    │ │Rate Limiter│ │ Zod Validate │   │
│  └─────────┘ └──────────┘ └────────────┘ └──────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              AI Agent Controller                      │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │System Prompt│  │Tool Executor │  │  Gemini API │  │   │
│  │  │ (Guardrails)│  │(DB Queries)  │  │  3.8-flash  │  │   │
│  │  └────────────┘  └──────┬───────┘  └─────────────┘  │   │
│  └──────────────────────────│────────────────────────────┘   │
│                             │                                 │
│  ┌──────────────────────────▼────────────────────────────┐   │
│  │         Tools: searchDoctors | searchHospitals        │   │
│  │              triageAssessment | getSpecialtyInfo       │   │
│  └──────────────────────────┬────────────────────────────┘   │
└─────────────────────────────┼────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────┐
│                   Database (SQLite/Prisma)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐   │
│  │Specialties│ │ Doctors  │ │Hospitals │ │DoctorHospital │   │
│  │   (6)    │ │  (12)    │ │   (4)    │ │    (15)       │   │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## 🧠 Technical Decisions

| Decision                    | Rationale                                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Google Gemini 3.8-flash** | Excellent function-calling support; multilingual (Arabic/English); free API tier available; automatic fallback to `gemini-3.5-flash-lite` on overload |
| **SQLite over PostgreSQL**  | Zero-config setup for prototype; Prisma makes migration trivial                                                                                       |
| **Express over NestJS**     | Faster iteration; less boilerplate for a prototype                                                                                                    |
| **Tool-calling over RAG**   | Structured DB queries are more deterministic than RAG for this use case                                                                               |
| **Rule-based triage**       | Deterministic urgency classification for safety (not AI-generated)                                                                                    |
| **Session-based context**   | No persistent conversation storage for privacy                                                                                                        |
| **Zod validation**          | Runtime type safety with descriptive error messages                                                                                                   |

## 🤖 AI Agent Design

### Tool-Calling Architecture

The AI agent uses Google Gemini's **function calling** to interact with the database. The agent NEVER fabricates data — every recommendation comes from a verified database query.

**Agentic Loop Flow:**

1. User sends message → Gemini analyzes with system prompt + tools
2. If Gemini requests function calls → execute tools → feed results back
3. Repeat until Gemini provides a final text response (max 5 iterations)
4. Model auto-fallback: `gemini-3.8-flash` → `gemini-3.5-flash-lite` on 503/429 errors

### Tools Available

| Tool               | Purpose                               | Parameters                              |
| ------------------ | ------------------------------------- | --------------------------------------- |
| `searchDoctors`    | Find doctors by specialty/filters     | specialty, language, minRating, city    |
| `searchHospitals`  | Find hospitals by location            | city, country, specialty, accreditation |
| `triageAssessment` | Classify symptom urgency (rule-based) | symptoms[], duration, severity, age     |
| `getSpecialtyInfo` | Get specialty details                 | specialtyName                           |

### Hallucination Prevention

1. **System prompt** strictly forbids fabricating data
2. **Tool-gated responses** — must call tools before recommending providers
3. **Low temperature** (0.3) reduces creative/random output
4. **Database-grounded** — tool results are real DB queries
5. **"Not found" handling** — empty results get honest "no providers available" message
6. **Medical disclaimer** on every response
7. **Emergency protocol** — immediate ER advice for critical symptoms

### Data Flow

```
Patient: "I have chest pain"
  → Backend validates request (Zod schema)
  → AI Agent receives message + system prompt
  → Agent asks clarifying questions (2-3 rounds)
  → Agent calls triageAssessment({symptoms: ["chest pain"], severity: 7})
  → Triage returns: URGENT, Cardiology recommended
  → Agent calls searchDoctors({specialty: "Cardiology"})
  → DB returns: [Dr. Ahmed Hassan, Dr. Fatima Al-Rashidi]
  → Agent formats grounded response with doctor details
  → Response sent with tool results for card display
```

## 🔐 Security Measures

| Layer                | Implementation                                                          |
| -------------------- | ----------------------------------------------------------------------- |
| **Input Validation** | Zod schemas; max 2000 chars per message; max 50 messages per request    |
| **Rate Limiting**    | General: 100 req/15min; Chat: 30 req/15min per IP                       |
| **CORS**             | Restricted to frontend origin in production; permissive in dev          |
| **Security Headers** | Helmet.js (CSP, XSS protection, content-type sniffing prevention, etc.) |
| **Payload Size**     | JSON body limited to 10KB                                               |
| **Error Handling**   | Internal errors never exposed to client; structured error responses     |
| **API Key**          | Server-side only; never sent to frontend; validated on startup          |
| **Prompt Injection** | System prompt server-side only; input length limited; role restricted   |

## 📊 Database Schema

```
Specialty (6)          Doctor (12)              Hospital (4)
├── id (PK)           ├── id (PK)              ├── id (PK)
├── name              ├── name / nameAr        ├── name / nameAr
├── nameAr            ├── specialtyId (FK)     ├── city / cityAr
└── description       ├── yearsExp             ├── country / countryAr
                      ├── languages (JSON)     ├── rating
                      ├── rating               ├── accreditation
                      ├── bio / bioAr          └── specialties (JSON)
                      ├── consultationFee
                      └── availability (JSON)
                              ↕
                     DoctorHospital (15) — Many-to-Many
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Google Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd healtrip-ai-assistant

# 2. Backend setup
cd backend
npm install
cp ../.env.example .env     # Edit with your GEMINI_API_KEY
npm run db:setup             # Create DB + seed mock data

# 3. Start backend
npm run dev                  # → http://localhost:3001

# 4. Frontend setup (new terminal)
cd frontend
npm install
npm run dev                  # → http://localhost:3000
```

### Environment Variables

| Variable         | Description                                            | Required |
| ---------------- | ------------------------------------------------------ | -------- |
| `GEMINI_API_KEY` | Google Gemini API key                                  | ✅       |
| `PORT`           | Backend port (default: 3001)                           | ❌       |
| `DATABASE_URL`   | SQLite path (default: file:./dev.db)                   | ❌       |
| `FRONTEND_URL`   | Frontend URL for CORS (default: http://localhost:3000) | ❌       |
| `NODE_ENV`       | Environment mode (development/production)              | ❌       |

## 🌐 API Endpoints

| Method | Path             | Description           |
| ------ | ---------------- | --------------------- |
| `POST` | `/api/chat`      | Chat with AI agent    |
| `GET`  | `/api/doctors`   | List/filter doctors   |
| `GET`  | `/api/hospitals` | List/filter hospitals |
| `GET`  | `/api/health`    | Health check          |

### Chat Request Example

```json
POST /api/chat
{
  "messages": [
    { "role": "user", "content": "I have chest pain" }
  ],
  "lang": "en"
}
```

### Chat Response Example

```json
{
  "reply": "I understand you're experiencing chest pain...",
  "toolResults": [
    {
      "type": "triage",
      "data": {
        "urgencyLevel": "URGENT",
        "recommendedSpecialty": "Cardiology",
        "shouldVisitER": false,
        "reasoning": "Symptoms reported: chest pain. Assessment: URGENT"
      }
    },
    {
      "type": "doctors",
      "data": {
        "found": true,
        "count": 2,
        "doctors": [...]
      }
    }
  ],
  "conversationId": "uuid-xxx"
}
```

## 🌍 Bilingual Support (Arabic/English)

- Frontend toggles between AR/EN with automatic RTL/LTR layout switching
- AI agent responds in the same language the patient uses
- All database records include both Arabic and English fields
- UI translations stored in `frontend/src/i18n/`
- Arabic font (Noto Sans Arabic) and English font (Inter) loaded dynamically

## 📁 Project Structure

```
healtrip-ai-assistant/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # DB schema (4 models)
│   │   └── seed.ts            # Mock data (12 doctors, 4 hospitals, 6 specialties)
│   ├── src/
│   │   ├── index.ts           # Express entry point + middleware stack
│   │   ├── config/
│   │   │   └── env.ts         # Environment config + validation
│   │   ├── agent/
│   │   │   ├── agent.ts       # AI Agent controller (Gemini + agentic loop)
│   │   │   ├── systemPrompt.ts# Behavioral guardrails + rules
│   │   │   ├── tools.ts       # Gemini function declarations
│   │   │   └── toolExecutor.ts# Tool execution + rule-based triage engine
│   │   ├── middleware/
│   │   │   ├── security.ts    # Helmet + CORS
│   │   │   ├── rateLimiter.ts # Rate limiting (general + chat)
│   │   │   ├── validation.ts  # Zod request validation
│   │   │   └── errorHandler.ts# Global error handler
│   │   ├── routes/
│   │   │   ├── chat.ts        # POST /api/chat
│   │   │   ├── doctors.ts     # GET /api/doctors
│   │   │   └── hospitals.ts   # GET /api/hospitals
│   │   ├── services/
│   │   │   ├── doctorService.ts   # Doctor DB queries
│   │   │   └── hospitalService.ts # Hospital DB queries
│   │   └── types/
│   │       └── index.ts       # TypeScript interfaces + AppError class
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx     # Root layout (fonts, metadata)
│       │   ├── page.tsx       # Main chat page
│       │   └── globals.css    # Design system (dark theme, RTL support)
│       ├── components/
│       │   ├── ChatContainer.tsx  # Main chat orchestrator
│       │   ├── ChatInput.tsx      # Message input + send
│       │   ├── MessageBubble.tsx  # Message rendering + tool cards
│       │   ├── DoctorCard.tsx     # Doctor recommendation card
│       │   ├── HospitalCard.tsx   # Hospital recommendation card
│       │   ├── TriageCard.tsx     # Urgency assessment card
│       │   ├── LanguageToggle.tsx # AR/EN switcher
│       │   ├── TypingIndicator.tsx# Loading animation
│       │   └── Disclaimer.tsx     # Medical disclaimer
│       ├── hooks/
│       │   ├── useChat.ts     # Chat state management
│       │   └── useLanguage.tsx# Language context + i18n
│       ├── lib/
│       │   ├── api.ts         # API client (typed fetch)
│       │   └── types.ts       # Frontend TypeScript interfaces
│       └── i18n/
│           ├── ar.json        # Arabic translations (28 keys)
│           └── en.json        # English translations (28 keys)
├── .env.example               # Environment template
├── .gitignore
└── README.md
```

## 🔮 Future Improvements (Production Roadmap)

- **PostgreSQL** migration for production scale
- **RAG** integration for medical literature search
- **WebSocket** for real-time streaming responses
- **User authentication** and appointment booking
- **Conversation persistence** with encryption
- **Multi-agent** system (triage agent, booking agent, follow-up agent)
- **Vector embeddings** for semantic symptom matching
- **Comprehensive test suite** (unit, integration, e2e)
- **Docker** containerization for deployment

## 📝 Key Assumptions

1. This is a **prototype** — not production-ready for healthcare
2. The AI provides **triage guidance**, not medical diagnoses
3. All doctor/hospital data is **mock data** for demonstration
4. Conversations are **ephemeral** (not stored) for privacy
5. The triage engine uses **rule-based logic**, not AI, for safety
6. The system uses Google Gemini API with automatic model fallback for reliability
