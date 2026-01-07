# xtodolist - Expense Tracker Application

A full-stack expense tracking application with AI-powered features, receipt OCR, voice input, and freemium subscription model.

## Project Status

### ✅ BACKEND - 100% COMPLETE

The backend API is fully functional and ready to use.

**Completed Components:**

- ✅ Express server with middleware (CORS, helmet, rate limiting, body parser)
- ✅ MongoDB models (User, Expense, Todo, RefreshToken, UserSubscription)
- ✅ Authentication system (JWT with refresh tokens, Google OAuth ready)
- ✅ All controllers (Auth, Expense, Todo, User, Subscription)
- ✅ All routes with validation
- ✅ GeminiAIService (receipt OCR, AI insights, voice parsing)
- ✅ CloudinaryService (file uploads)
- ✅ EmailService (transactional emails)
- ✅ AnalyticsService (spending calculations)
- ✅ Error handling and validation

**API Endpoints:**

```
Auth:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
POST   /api/auth/google

Expenses:
GET    /api/expenses
GET    /api/expenses/:id
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
POST   /api/expenses/upload-receipt
POST   /api/expenses/parse-voice
GET    /api/expenses/analytics/summary
GET    /api/expenses/ai-insights (Premium)

Todos:
GET    /api/todos
GET    /api/todos/:id
POST   /api/todos
PUT    /api/todos/:id
DELETE /api/todos/:id

Users:
GET    /api/users/profile
PUT    /api/users/profile
PUT    /api/users/password

Subscription:
GET    /api/subscription
PUT    /api/subscription
POST   /api/subscription/upgrade
POST   /api/subscription/downgrade
```

### 🔄 FRONTEND - 40% COMPLETE

**Completed:**

- ✅ Next.js 15 project setup
- ✅ TypeScript types for all entities
- ✅ API client with auto-token refresh
- ✅ All API service layers (auth, expenses, todos, subscription)
- ✅ Utility functions (formatCurrency, formatDate, etc.)

**Remaining (To Be Built):**

- ⏳ Auth context provider
- ⏳ React Query provider setup
- ⏳ Login & Register pages
- ⏳ Dashboard layout with bottom navigation
- ⏳ Home page (spending cards, charts, AI insights)
- ⏳ Expenses page (list, modals, voice input, receipt upload)
- ⏳ Reports page (analytics, charts)
- ⏳ Todo page (task management, notifications)
- ⏳ Settings page (profile, subscription, upgrade modal)
- ⏳ All UI components (20+ components)

---

## Setup Instructions

### Backend Setup

1. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add:

   ```env
   NODE_ENV=development
   PORT=5000

   # MongoDB (get from MongoDB Atlas or use local)
   MONGODB_URI=mongodb://localhost:27017/xtodolist

   # JWT Secrets (generate random strings)
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
   JWT_ACCESS_EXPIRATION=15m
   JWT_REFRESH_EXPIRATION=7d

   # Google Gemini AI (get from https://makersuite.google.com/app/apikey)
   GEMINI_API_KEY=your-gemini-api-key

   # Cloudinary (get from https://cloudinary.com)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Email (SendGrid or SMTP)
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   EMAIL_FROM=noreply@xtodolist.com

   # Frontend URL
   FRONTEND_URL=http://localhost:3000

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Start MongoDB:**

   - Option A: Local MongoDB

     ```bash
     mongod
     ```

   - Option B: MongoDB Atlas (recommended)
     - Create free cluster at https://www.mongodb.com/cloud/atlas
     - Get connection string and add to `MONGODB_URI`

4. **Run the backend:**

   ```bash
   npm run dev
   ```

   Backend will run on http://localhost:5000

5. **Test the API:**

   ```bash
   curl http://localhost:5000/health
   ```

   Expected response:

   ```json
   {
     "success": true,
     "message": "xtodolist API is running",
     "timestamp": "2026-01-02T..."
   }
   ```

### Frontend Setup (Current Progress)

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
   ```

3. **Run the frontend:**

   ```bash
   npm run dev
   ```

   Frontend will run on http://localhost:3000

---

## Testing the Backend

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Copy the `accessToken` from the response.

### 3. Create an Expense

```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "description": "Groceries from Walmart",
    "amount": 45.99,
    "category": "groceries",
    "currency": "USD"
  }'
```

### 4. Get Expenses

```bash
curl -X GET http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 5. Get Analytics

```bash
curl -X GET http://localhost:5000/api/expenses/analytics/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## Next Steps for Frontend Development

The backend is fully complete and tested. To finish the frontend, you need to build:

### Priority 1: Core Authentication & Layout

1. **Auth Context Provider** (`lib/hooks/useAuth.tsx`)
2. **React Query Provider** (`app/providers.tsx`)
3. **Login Page** (`app/(auth)/login/page.tsx`)
4. **Register Page** (`app/(auth)/register/page.tsx`)
5. **Dashboard Layout** (`app/(dashboard)/layout.tsx`) with bottom navigation

### Priority 2: Main Pages

6. **Home Page** (`app/(dashboard)/page.tsx`)

   - Spending cards (Today, Week, Month)
   - Spending chart component
   - Category breakdown component
   - AI insights component (premium)
   - Recent expenses list

7. **Expenses Page** (`app/(dashboard)/expenses/page.tsx`)

   - Expense list with filters
   - Add expense modal (with voice & receipt upload)
   - Expense detail modal
   - Category badges

8. **Settings Page** (`app/(dashboard)/settings/page.tsx`)
   - User profile section
   - Subscription status
   - Upgrade modal
   - Notification settings toggles

### Priority 3: Additional Features

9. **Reports Page** (`app/(dashboard)/reports/page.tsx`)
10. **Todo Page** (`app/(dashboard)/todo/page.tsx`)

### Reference Implementation

Use the `.txt` files in `Pages/` and `Components/` folders as reference:

- They show the UI structure and logic
- Replace `base44` API calls with the custom API services you created
- Convert React Router to Next.js App Router patterns

Example conversion:

```jsx
// OLD (from .txt files):
const { data } = await base44.entities.Expense.list("-date", 100);

// NEW (use your API services):
import { expensesApi } from "@/lib/api/expenses";
const { data } = await expensesApi.getExpenses({ sort: "-date", limit: 100 });
```

---

## Features

### Free Tier

- ✅ Expense tracking (unlimited)
- ✅ Voice input for expenses
- ✅ Receipt scanning (5/month)
- ✅ Basic analytics (spending totals, category breakdown)
- ✅ Todo list with reminders
- ✅ Multi-currency support

### Premium Tier ($4.99/month)

- ✅ Unlimited receipt scanning
- ✅ AI-powered insights (spending patterns, recommendations, alerts)
- ✅ Budget planning & forecasts
- ✅ Custom categories
- ✅ Weekly email summaries
- ✅ Advanced reports

---

## Tech Stack

**Backend:**

- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Google Gemini AI (receipt OCR, insights)
- Cloudinary (file storage)
- Nodemailer (emails)

**Frontend:**

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- TanStack React Query
- Framer Motion (animations)
- Recharts (data visualization)
- Radix UI (components)

---

## Project Structure

```
xtodolist/
├── backend/                    # Express API
│   ├── src/
│   │   ├── config/            # Database config
│   │   ├── controllers/       # Request handlers (5 files) ✅
│   │   ├── middleware/        # Auth, validation, upload (5 files) ✅
│   │   ├── models/            # Mongoose models (5 files) ✅
│   │   ├── routes/            # API routes (6 files) ✅
│   │   ├── services/          # Business logic (4 files) ✅
│   │   ├── types/             # TypeScript types ✅
│   │   ├── utils/             # Helpers (errors, jwt) ✅
│   │   └── server.ts          # Entry point ✅
│   └── package.json
│
├── frontend/                   # Next.js 15
│   ├── app/                   # Pages (App Router)
│   │   ├── (auth)/           # Login, Register
│   │   └── (dashboard)/      # Main app pages
│   ├── components/            # Reusable UI components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── expenses/         # Expense components
│   │   ├── todo/             # Todo components
│   │   ├── premium/          # Upgrade modal
│   │   └── ui/               # shadcn components
│   ├── lib/
│   │   ├── api/              # API client & services ✅
│   │   ├── hooks/            # Custom hooks
│   │   └── utils.ts          # Utilities ✅
│   ├── types/                # TypeScript interfaces ✅
│   └── package.json
│
├── Pages/                     # Reference UI specs (.txt)
├── Components/                # Reference components (.txt)
└── README.md                  # This file
```

---

## Development Workflow

1. **Backend is ready** - Test all endpoints with Postman or curl
2. **Frontend setup complete** - API client, types, and utilities ready
3. **Build frontend pages** - Use reference .txt files for UI structure
4. **Test integration** - Connect frontend to backend
5. **Add features** - Voice input, receipt upload, AI insights
6. **Deploy**:
   - Backend: Render, Railway, or Heroku
   - Frontend: Vercel or Netlify
   - Database: MongoDB Atlas

---

## Support

For questions or issues:

1. Check the implementation plan at `~/.claude/plans/sharded-bouncing-galaxy.md`
2. Review API documentation in this README
3. Test endpoints using the curl examples above
4. Reference the `.txt` files for frontend UI patterns

---

## License

ISC

---

**Built with Claude Code** 🚀

Backend: 100% Complete ✅
Frontend: 40% Complete (Core setup done, pages & components remaining)
