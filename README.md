# HabitTracker

The Habit Tracker is a modern, single-page application (SPA) designed to help users create, track, and manage daily habits to build streaks and boost productivity. The application is fully responsive across all devices and features robust user authentication and authorization. It uses Firebase Admin SDK on the server side (Vercel) to verify user tokens, securing all protected API routes and ensuring data integrity.

---

## Key Features

- **User Authentication** – Secure login/registration with email-password and Google OAuth. Password validation ensures strength (uppercase, lowercase, 6+ characters).
- **Habit Management** – Create, read, update, and delete habits with full CRUD operations. Private/public habit sharing with the community.
- **Streak Tracking** – Automatic streak calculation and 30-day completion percentage display on habit details with visual badges.
- **Community Habits** – Browse public habits shared by other users with powerful search and category-based filtering.
- **Task Completion** – Mark habits complete daily with duplicate prevention. Completion history tracked in MongoDB with timestamps.
- **Protected Routes** – Secure private routes (Add Habit, My Habits, Habit Details) with persistent authentication on page reload.
- **Responsive Design** – Fully responsive UI for mobile, tablet, and desktop. Tailwind CSS and DaisyUI for modern styling.
- **Real-time Notifications** – Toast notifications for user feedback (success, error, loading states) powered by React Hot Toast.
- **Smooth Animations** – Framer Motion animations for hero banner and section transitions enhancing user experience.

---

## Tech Stack

**Frontend:**
- React 19 + Vite
- Tailwind CSS v4 + DaisyUI
- React Router v7 for navigation
- Axios for API calls
- Firebase Authentication
- Framer Motion for animations
- React Hot Toast for notifications
- Lucide React & React Icons for UI icons

**Backend:**
- Node.js + Express.js
- MongoDB Atlas
- Firebase Admin SDK
- CORS enabled for cross-origin requests

**Deployment:** 
- Netlify - https://habit-tracker24.netlify.app/ (FrontEnd)
- Vercel - https://habit-tracker-server-pi.vercel.app/ (BackEnd)

---

## Requirements Met

✅ **Authentication:** Email/password + Google login with password validation  
✅ **CRUD Operations:** Full Create, Read, Update, Delete for habits  
✅ **Home Page:** Hero banner, 6 featured habits, Why Build Habits section, extra sections with animations  
✅ **Habit Tracking:** Streak calculation, completion history, 30-day progress  
✅ **Search & Filter:** Category-based filtering and keyword search on Browse Habits  
✅ **Protected Routes:** Private routes with auth persistence  
✅ **Error Handling:** Custom error messages via toast (no Lorem ipsum, no default alerts)  
✅ **404 Page:** Custom error page for not found routes  
✅ **Responsive Design:** Mobile, tablet, desktop views  
✅ **Loading Spinner:** Loading states throughout the app  
✅ **GitHub Commits:** 15+ client commits, 8+ server commits

---

## Live Demo

**Live Site:** https://habit-tracker24.netlify.app/
**Repository:** 
- Client-side GitHub repository: https://github.com/Eshrat48/habit-tracker-client.git 
- Server-side GitHub repository: https://github.com/Eshrat48/habit-tracker-server.git
