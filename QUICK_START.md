# xtodolist - Quick Start Guide

## Get the Backend Running in 5 Minutes

### Step 1: Set Up Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with minimal config:

```env
NODE_ENV=development
PORT=5000

# Use local MongoDB (or get Atlas free tier)
MONGODB_URI=mongodb://localhost:27017/xtodolist

# Generate random secrets (any long string)
JWT_SECRET=my-super-secret-jwt-key-for-development-only
JWT_REFRESH_SECRET=my-refresh-secret-for-development-only
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Get FREE Gemini API key: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# Get FREE Cloudinary account: https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-secret

# Email (optional - can skip for now)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 2: Install & Run

```bash
# In backend folder
npm install
npm run dev
```

You should see:

```
🚀 Server running in development mode on port 5000
📊 Health check: http://localhost:5000/health
🔗 API endpoint: http://localhost:5000/api
```

### Step 3: Test It Works

```bash
curl http://localhost:5000/health
```

Expected:

```json
{
  "success": true,
  "message": "xtodolist API is running"
}
```

---

## Test the Full Flow (2 Minutes)

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@test.com",
    "password": "password123",
    "fullName": "Demo User"
  }'
```

Copy the `accessToken` from response.

### 2. Create Expenses

```bash
export TOKEN="paste-your-token-here"

curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Coffee at Starbucks",
    "amount": 5.50,
    "category": "dining",
    "currency": "USD"
  }'

curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Uber ride home",
    "amount": 15.00,
    "category": "transport",
    "currency": "USD"
  }'

curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Groceries from Walmart",
    "amount": 78.50,
    "category": "groceries",
    "currency": "USD"
  }'
```

### 3. Get Your Expenses

```bash
curl -X GET "http://localhost:5000/api/expenses" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Get Analytics

```bash
curl -X GET "http://localhost:5000/api/expenses/analytics/summary" \
  -H "Authorization: Bearer $TOKEN"
```

You'll see:

- Today's total spending
- Weekly spending
- Monthly spending
- Category breakdown with percentages
- Monthly trends

### 5. Upgrade to Premium (Manual)

```bash
curl -X POST http://localhost:5000/api/subscription/upgrade \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Test AI Insights (Premium Feature)

```bash
curl -X GET http://localhost:5000/api/expenses/ai-insights \
  -H "Authorization: Bearer $TOKEN"
```

You'll get 3 AI-generated insights about your spending!

### 7. Test Voice Parsing

```bash
curl -X POST http://localhost:5000/api/expenses/parse-voice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "transcript": "I spent fifty dollars on groceries"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "description": "groceries",
    "amount": 50,
    "category": "groceries"
  }
}
```

---

## Common Issues & Solutions

### MongoDB Connection Error

**Problem:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:**

- Option A: Start local MongoDB: `mongod`
- Option B: Use MongoDB Atlas (free tier):
  1. Go to https://www.mongodb.com/cloud/atlas
  2. Create free cluster
  3. Get connection string
  4. Update `MONGODB_URI` in `.env`

### GEMINI_API_KEY Not Set

**Problem:** AI features return errors

**Solution:**

1. Go to https://makersuite.google.com/app/apikey
2. Create API key (FREE)
3. Add to `.env`: `GEMINI_API_KEY=your-key`
4. Restart server

### Cloudinary Upload Fails

**Problem:** Receipt upload returns 500 error

**Solution:**

1. Go to https://cloudinary.com (FREE account)
2. Get credentials from dashboard
3. Add to `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-key
   CLOUDINARY_API_SECRET=your-secret
   ```
4. Restart server

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**

- Change PORT in `.env` to `5001` or another port
- Or kill process on port 5000:

  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F

  # Mac/Linux
  lsof -ti:5000 | xargs kill -9
  ```

---

## Next: Build the Frontend

Once the backend is running:

1. **Install frontend dependencies:**

   ```bash
   cd ../frontend
   npm install
   ```

2. **Create `.env.local`:**

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **The frontend foundation is ready** - you now need to build:

   - Auth pages (login, register)
   - Dashboard pages (home, expenses, reports, todo, settings)
   - Components (20+ UI components)

4. **Use the `.txt` files as reference**:
   - Look in `Pages/` folder for page layouts
   - Look in `Components/` folder for component structure
   - Replace `base44` calls with the API services in `lib/api/`

---

## API Documentation

See `README.md` for complete API endpoint list.

Quick reference:

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `POST /api/expenses/upload-receipt` - Upload & OCR receipt
- `POST /api/expenses/parse-voice` - Parse voice transcript
- `GET /api/expenses/analytics/summary` - Get analytics
- `GET /api/expenses/ai-insights` - Get AI insights (Premium)
- `POST /api/subscription/upgrade` - Upgrade to premium

---

## Development Tips

1. **Use Postman** for easier API testing (import cURL commands)
2. **Check backend logs** - all errors are logged to console
3. **MongoDB Compass** - GUI for viewing database (https://www.mongodb.com/products/compass)
4. **VS Code REST Client** - Test APIs directly in VS Code

---

## Success Criteria

✅ Backend health check returns 200
✅ User can register & login
✅ User can create/read/update/delete expenses
✅ Analytics endpoint returns spending data
✅ AI insights work (with Gemini API key)
✅ Voice parsing extracts expense info
✅ Receipt upload works (with Cloudinary)

All backends features are working? **Backend is complete!** ✅

Now focus on building the frontend pages and components.
