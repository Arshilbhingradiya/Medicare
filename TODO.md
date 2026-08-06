# Implementation Plan

## Task 1: Doctor full name in search page headline
- [x] Update `server/controllers/doctor-controller.js` to populate doctor name from linked User
- [x] Update `client/src/components/Patient/Doctorsearch.jsx` for clean full-name headline

## Task 2: Doctor dashboard horizontal cards (one per row)
- [x] Update `client/src/components/Doctor/Doctordashboard.jsx` to full-width horizontal cards

## Task 3: Animated Home & About pages
- [ ] Update `client/src/pages/home.jsx` with richer animations
- [ ] Update `client/src/pages/About.jsx` with richer animations

## Task 4: Professional animated Login & Signup
- [ ] Update `client/src/pages/login.jsx` redesign
- [ ] Update `client/src/pages/signup.jsx` redesign
- [ ] Update `client/src/pages/css/login.css`
- [ ] Update `client/src/pages/css/signup.css`

## Task 5: Hide Book Appointment for admin
- [ ] Update `client/src/components/Navbar.jsx` to hide Book Appointment for admin
- [ ] Update `client/src/pages/home.jsx` & `About.jsx` to hide Book CTA for admin

## Task 6: Admin always has a role, no patient/doctor rights
- [ ] Update `client/src/components/Navbar.jsx` to prioritize admin role
- [ ] Update `client/src/App.jsx` / `PrivateRoute.jsx` for admin routing

## Task 7: Admin view all users, contacts, premium subscriptions
- [ ] Verify existing Admin pages (users, contacts, subscriptions)

## Task 8: Analytics - subscribed doctors with city filter
- [ ] Update `client/src/pages/AdminDashboard.jsx` with city-wise subscribed doctor analytics

## Task 9: Revenue dashboard (monthly/yearly subscription revenue)
- [ ] Update `client/src/pages/AdminDashboard.jsx` with revenue breakdown

## Followup
- [ ] Start both servers and verify all pages
