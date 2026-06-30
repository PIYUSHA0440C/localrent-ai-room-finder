# LocalRent AI Room Finder - Frontend UI/UX

This directory contains the React-based user interface for LocalRent, a platform built to solve the real-world problem of finding affordable, local rooms and PGs without the exhaustion of door-to-door searches.

The frontend is designed to be highly responsive, modern, and user-centric, featuring tailored, role-based routing for Landlords (to effortlessly list their spaces) and Seekers/Tenants (to discover hidden gems).

## 🎨 Design System & Technologies

- **React** (Functional components & hooks)
- **Vite** (Next-generation frontend tooling for blazing fast HMR)
- **Tailwind CSS** (Utility-first styling with a custom theme in `index.css`)
- **Redux Toolkit** (Global state management for auth, listings, and bookings)
- **React Router DOM** (Client-side routing and protected routes)
- **React Hot Toast** (Elegant, accessible notifications)
- **Heroicons** (Premium SVG icons via `react-icons/hi`)

## 🏗️ Folder Structure

```
/src
├── /assets        # Static assets (images, logos)
├── /components    # Reusable UI components (Navbar, Footer, ListingCard, ReviewModal)
├── /config        # Constants and frontend configuration
├── /lib           # Axios interceptors, API utilities
├── /pages         # Top-level route components (Home, Dashboard, ListingDetail)
├── /store         # Redux slices and asynchronous thunks
├── /utils         # Helper functions (formatting currency, dates, trust badges)
├── App.jsx        # Main application component & route definitions
└── main.jsx       # React DOM entry point
```

## 🔐 Role-Based Access

The frontend intelligently manages user sessions using JWTs stored in HTTP-only cookies and memory.
- **Guests**: Can view listings and use the AI Search, but cannot view landlord contact numbers or book properties.
- **Tenants**: Get a dedicated Dashboard to track booking requests, active stays, and have the ability to leave reviews upon stay completion.
- **Landlords**: Get a dedicated Dashboard to manage incoming booking requests (Approve/Reject) and mark tenants as moved in or completed.

## 🚀 Running the Frontend Independently

If you wish to work on the UI independently without building the backend:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```

*Note: The frontend expects the backend API to be running on `localhost:5000`. If you encounter API errors, ensure the backend development server is actively running.*
