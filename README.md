<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h1 align="center">LocalRent</h1>

  <p align="center">
    An AI-Powered, Broker-Free Room & PG Discovery Platform
    <br />
    <a href="#about-the-project"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#">View Demo</a>
    ·
    <a href="#">Report Bug</a>
    ·
    <a href="#">Request Feature</a>
  </p>
</div>

<!-- BADGES -->
<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</div>

<br />

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#core-features">Core Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#frontend-setup">Frontend Setup</a></li>
        <li><a href="#backend-setup">Backend Setup</a></li>
      </ul>
    </li>
    <li><a href="#production-deployment">Production Deployment</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

---

## About The Project

**LocalRent** is a hyper-local property discovery platform designed to eliminate the middleman. It connects property owners directly with tenants, catering specifically to students and young professionals seeking affordable and trustworthy accommodations (Rooms, PGs, and Apartments).

By leveraging artificial intelligence, LocalRent transforms the traditional, tedious property search into a seamless, natural language experience.

### Core Features

*   **AI Natural Language Search:** Skip complex filters. Type exactly what you need (e.g., *"quiet 1BHK near college under 15k"*), and the AI automatically parses your intent to deliver exact matches.
*   **AI Review Summaries:** Our AI aggregates and analyzes dozens of past tenant reviews into a single, highly accurate paragraph, highlighting the genuine pros and cons.
*   **Verified Direct Contact:** Phone numbers are securely masked until a booking is requested and approved, ensuring privacy for both landlords and tenants.
*   **Gamified Trust System:** Build your reputation. Landlords and tenants earn "Trust Scores" and profile badges based on successful, completed stays.
*   **End-to-End Booking Management:** Landlords have a dedicated dashboard to approve requests, mark tenants as "Moved In", and complete stays—unlocking verified reviews.

### Built With

The project utilizes a monolithic repository architecture.

**Frontend UI**
*   React 18
*   Vite
*   Tailwind CSS
*   Redux Toolkit

**Backend API**
*   Node.js
*   Express.js
*   MongoDB (Mongoose)
*   Google Gemini 2.5 Flash (AI Integration)
*   Resend (Transactional Emails)
*   ImageKit (Media Storage)

---

## Getting Started

To get a local copy up and running, follow these simple steps. You will need to run the **Frontend** and **Backend** concurrently.

### Prerequisites

*   Node.js (v18 or higher)
*   npm (v9 or higher)
*   A MongoDB cluster URI (Atlas)

### 1. Frontend Setup

The frontend consumes the local API running on port 5000.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will now be running on `http://localhost:5173`. API requests to `/api/*` are automatically proxied to the backend.*

### 2. Backend Setup

The backend handles the API, database operations, and third-party services.

1. Open a new terminal window and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory using the template below:
   ```env
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database_name>
   
   JWT_ACCESS_SECRET=your_jwt_access_secret_here
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
   
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=noreply@yourdomain.com
   
   AI_API_KEY=your_google_gemini_api_key
   AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/
   AI_MODEL=gemini-2.5-flash
   ```
4. Start the Node.js development server:
   ```bash
   npm run dev
   ```

---

## Production Deployment

LocalRent is optimized for **Monolithic Deployment**. The Express backend is configured to statically serve the compiled React frontend, meaning you only need to deploy a single web service.

### Hosting Guide (e.g., Render, Heroku)

1. Connect your GitHub repository to your hosting provider.
2. Set the **Build Command** to:
   ```bash
   npm run build
   ```
   *(This triggers the root `package.json` to install dependencies and compile the frontend).*
3. Set the **Start Command** to:
   ```bash
   npm start
   ```
   *(This starts the backend server in production mode).*
4. Add all environment variables from the `backend/.env` template to your hosting provider's dashboard.
   *Note: If using Render, the application auto-detects `RENDER_EXTERNAL_URL` for email links, so `CLIENT_URL` is not required.*

---

## Project Structure

- **[`/frontend`](./frontend/README.md)**: Contains the React source code, components, pages, Redux slices, and UI assets.
- **[`/backend`](./backend/README.md)**: Contains the Express server, MongoDB schemas, controllers, routing logic, and external API integrations.

---

## Contact

Project Link: [https://github.com/your_username/localrent](https://github.com/your_username/localrent)
