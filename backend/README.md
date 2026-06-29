# LocalRent AI Room Finder - Backend API & Services

This directory contains the Node.js/Express API server that powers the LocalRent platform, an AI-driven solution for discovering affordable, local rooms without the traditional door-to-door hassle.

The backend handles database modeling, authentication security, external third-party integrations, and the core business logic for listing properties, executing natural language AI searches, and managing the booking lifecycles between local landlords and seekers.

## 🛠️ Architecture & Technologies

- **Node.js & Express.js**: High-performance RESTful API infrastructure.
- **MongoDB & Mongoose**: NoSQL document storage with complex aggregations and referencing.
- **JSON Web Tokens (JWT)**: Stateless authentication utilizing short-lived access tokens and HTTP-only refresh cookies to prevent XSS attacks.
- **Google Gemini AI**: Integration for Natural Language Processing (NLP) search mapping and review summarization.
- **Resend**: Transactional email service for booking lifecycle events and OTP verifications.
- **ImageKit**: Cloud storage for property image uploads via Multer streams.

## 🏗️ Folder Structure

```
/src
├── /config        # Environment variables, constants, and database connection
├── /controllers   # HTTP request/response handlers
├── /middleware    # Auth guards, request validation, rate-limiting, error handling
├── /models        # Mongoose database schemas (Listing, Booking, User, Review)
├── /routes        # Express router definitions
└── /services      # Core business logic separated from HTTP logic
    ├── aiService.js
    ├── authService.js
    ├── bookingService.js
    ├── emailService.js
    ├── imageService.js
    ├── notificationService.js
    ├── reviewService.js
    └── trustService.js
```

## 🔒 Security Measures

1. **Rate Limiting**: Strict rate limiters on `/api/auth` endpoints to prevent brute-force attacks.
2. **Helmet**: Secured HTTP headers.
3. **CORS**: Configured specifically for the client origin in development, bypassing in production via monolithic routing.
4. **Validation**: Deep input validation middleware to prevent NoSQL injection and malformed requests.

## 🔑 Environment Variables

To run the backend, create a `.env` file in the root of the `backend/` directory and populate it with the following configuration. **Do not commit actual secrets.**

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database_name>

# Security
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Third-party Services (ImageKit)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint

# Third-party Services (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# AI Integration (Google Gemini)
AI_API_KEY=your_google_gemini_api_key
AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/
AI_MODEL=gemini-3.1-flash-lite
```

## 🚀 Running the Backend Independently

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure your `.env` file is properly configured.
4. Run the development server (uses node `--watch`):
   ```bash
   npm run dev
   ```

## 📡 Core API Domains

- **`/api/auth`**: Registration, login, logout, refresh-token, and OTP verification.
- **`/api/users`**: Profile management and public profile viewing.
- **`/api/listings`**: CRUD operations for property listings + AI Search endpoint.
- **`/api/bookings`**: Booking request creation, landlord approval flows, and tenant lifecycle tracking.
- **`/api/reviews`**: Verified review submission and AI summarization fetching.
- **`/api/notifications`**: In-app notification polling and read-receipts.
