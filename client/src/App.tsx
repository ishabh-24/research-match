// ============================================================
// client/src/App.tsx — Root App Component + Router
// ============================================================
// Uses react-router-dom to declare all client-side routes.
// Replaces Next.js file-based routing from the app/ directory.
//
// ROUTE STRUCTURE:
//   /                   → Landing (public)
//   /login              → Login (public)
//   /signup             → Signup (public)
//   /studies            → Studies browser (public)
//   /studies/:id        → StudyDetail (public)
//   /profile/setup      → ProfileSetup (protected)
//   /dashboard          → Dashboard (protected, PARTICIPANT)
//   /participant/applications → Applications (protected, PARTICIPANT)
//   /researcher/dashboard    → ResearcherDashboard (protected, RESEARCHER)
//   /researcher/studies/new  → NewStudy (protected, RESEARCHER)
//
// TODO:
//   1. Wrap protected routes with a ProtectedRoute component
//      that checks isAuthenticated() and redirects to /login if false
//   2. Add role-based redirect for /researcher/* routes
// ============================================================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Studies from "./pages/Studies";
import StudyDetail from "./pages/StudyDetail";
import ProfileSetup from "./pages/ProfileSetup";
import Applications from "./pages/participant/Applications";
import ResearcherDashboard from "./pages/researcher/Dashboard";
import NewStudy from "./pages/researcher/NewStudy";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/studies" element={<Studies />} />
                <Route path="/studies/:id" element={<StudyDetail />} />

                {/* Protected routes — TODO: wrap with ProtectedRoute */}
                <Route path="/profile/setup" element={<ProfileSetup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/participant/applications" element={<Applications />} />
                <Route path="/researcher/dashboard" element={<ResearcherDashboard />} />
                <Route path="/researcher/studies/new" element={<NewStudy />} />
            </Routes>
        </BrowserRouter>
    );
}
