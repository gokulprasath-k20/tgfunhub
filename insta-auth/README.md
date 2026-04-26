# InstaAuth - Full Stack Authentication System

A production-ready authentication system similar to Instagram's signup flow.

## 📁 Project Structure

```text
insta-auth/
├── backend/                # Express.js Server
│   ├── config/             # DB Connection
│   ├── controllers/        # Auth Logic
│   ├── middleware/         # Error Handling & Rate Limiting
│   ├── models/             # Mongoose Schemas (User, OTP)
│   ├── routes/             # API Endpoints
│   ├── utils/              # JWT, OTP, Email Utils
│   └── server.js           # Entry Point
└── frontend/               # Next.js App Router
    ├── src/
    │   ├── app/            # Pages (Signup, Verify, Login, Dashboard)
    │   ├── components/     # UI Components
    │   └── utils/          # API/Axios Setup
```

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed
- MongoDB running locally or a MongoDB Atlas URI

### 2. Backend Setup
1. `cd backend`
2. Configure `.env` file (already created with defaults)
   - Ensure `MONGO_URI` is correct.
   - For real emails, fill `EMAIL_USER` and `EMAIL_PASS` (e.g., Mailtrap or Gmail).
3. `npm install` (already done)
4. `node server.js`

### 3. Frontend Setup
1. `cd frontend`
2. `npm install` (already done)
3. `npm run dev`

## 🔐 Authentication Flow
1. **Signup**: Enter email -> Receives 6-digit OTP (logged in backend console if email not configured).
2. **Verify**: Enter OTP + Choose Username & Password.
   - If username exists, it auto-generates a variant (e.g., `user123`).
3. **Login**: Authenticate with username and password.
4. **Dashboard**: Protected route accessible only after login.

## 🛠 Features
- **JWT Authentication**: Secure tokens for session management.
- **OTP Verification**: Email-based identity confirmation.
- **Rate Limiting**: Prevents brute-force on the signup endpoint.
- **Auto-Username**: Seamlessly handles username collisions.
- **Global Error Handling**: Consistent API responses for all failure cases.
