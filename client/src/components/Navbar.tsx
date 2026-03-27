// ============================================================
// components/Navbar.tsx — Top Navigation Bar
// ============================================================
// WHAT TO PUT HERE:
//   Client component. Responsive top nav shown on all pages.
//
// LEFT SIDE: Logo + brand name → link to /
//
// CENTER (desktop only): Nav links
//   - Browse Studies → /studies
//   - How It Works → /#how-it-works (landing page anchor)
//
// RIGHT SIDE:
//   If NOT logged in:
//     - "Log In" button → /login
//     - "Sign Up" button (primary) → /signup
//
//   If logged in as PARTICIPANT:
//     - Notification bell with unread count badge
//     - Avatar dropdown: Profile | My Applications | Sign Out
//
//   If logged in as RESEARCHER:
//     - Notification bell
//     - "My Dashboard" link
//     - Avatar dropdown: Dashboard | Settings | Sign Out
//
// MOBILE: Hamburger menu → slide-out drawer with all links.
//
// IMPLEMENTATION NOTES:
//   - Use useSession() from next-auth/react to get session client-side.
//   - Notification count from GET /api/notifications (useQuery with TanStack).
// ============================================================

"use client";

export function Navbar() {
    // TODO: implement responsive navbar
    return <nav>{/* TODO */}</nav>;
}
