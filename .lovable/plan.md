

# CardioCare — Full MVP Plan

## Overview
A Progressive Web App (PWA) for hypertension management with gamification. Users log blood pressure and weight, receive instant feedback and personalized activity recommendations, and earn points/badges/levels for consistent engagement. Built with Lovable Cloud (Supabase) for user accounts and cloud data sync.

---

## 1. Design System & Theme
- Implement the calming blue/green color palette from the PRD (Serene Blue, Sage Green, Mint Green, Gold accents)
- Large, readable fonts with high contrast for accessibility
- Soft, rounded card-based UI — no bright reds; use soft salmon for urgent alerts only
- Mobile-first responsive layout optimized for phone screens

## 2. Authentication
- Email/password sign-up and login
- User profiles table storing basic info (name, age, optional health context)
- Protected routes — all app features require login

## 3. Dashboard (Home Screen)
- Welcome greeting with current level and XP progress bar
- Today's BP summary with color-coded status indicator (green/yellow/orange)
- Quick-action buttons: "Log BP", "Log Weight"
- Today's activity checklist with completion status
- Streak counter and recent badges earned

## 4. Health Data Input
- **Blood Pressure logging**: Simple form for systolic/diastolic values with date/time, plus optional notes (e.g., "after exercise")
- **Weight logging**: Quick weight entry with date
- Input validation for realistic ranges
- History stored in the database with timestamps

## 5. Blood Pressure Analysis & Feedback
- Instant classification based on AHA guidelines:
  - Normal (< 120/80) — green
  - Elevated (120-129 / < 80) — yellow
  - Stage 1 Hypertension (130-139 / 80-89) — orange
  - Stage 2 Hypertension (≥ 140 / ≥ 90) — soft salmon
  - Hypertensive Crisis (> 180 / > 120) — salmon with urgent message to seek care
- Clear visual feedback card after each entry with the classification, a brief explanation, and what to do next

## 6. Health History & Trends
- Line charts showing BP readings over time (systolic and diastolic)
- Weight trend chart
- Filterable by date range (7 days, 30 days, 90 days)
- Average readings displayed per period

## 7. Personalized Activity Recommendations
- Daily activity list generated based on latest BP stage:
  - Step goals (e.g., "Walk 6,000 steps today")
  - Water intake targets (e.g., "Drink 8 glasses of water")
  - Dietary tips (e.g., "Try a low-sodium meal today")
  - Relaxation activities (e.g., "10 minutes of deep breathing")
- Each activity is a checkable item users can mark as done
- Activities adapt — higher BP stages get gentler, more recovery-focused tasks

## 8. Gamification System
- **Points/XP**: Earn XP for logging BP (+10), logging weight (+5), completing each activity (+15), completing all daily activities (+25 bonus)
- **Levels**: Progress through levels (e.g., Level 1: Heart Starter → Level 10: CardioChampion) with escalating XP thresholds
- **Badges**: Awarded for milestones:
  - "First Log" — first BP entry
  - "Week Warrior" — 7-day logging streak
  - "Monthly Master" — 30-day streak
  - "Activity Ace" — complete all activities 5 days in a row
  - "Trend Setter" — BP improved over 2 weeks
- **Streaks**: Track consecutive days of logging and activity completion
- Badges gallery page to view earned and locked badges

## 9. PWA Setup
- Install prompt and service worker for offline access
- App manifest with CardioCare branding and icons
- Add-to-home-screen capability for mobile

## 10. Database Structure (Lovable Cloud)
- `profiles` — user profile data
- `bp_readings` — blood pressure logs (systolic, diastolic, timestamp, notes)
- `weight_readings` — weight logs
- `activities` — daily recommended activities per user
- `activity_completions` — track which activities were completed
- `user_gamification` — current XP, level, streak count
- `badges_earned` — badges awarded to users
- Row Level Security on all tables so users only access their own data

## Pages Summary
1. **Login / Sign Up** — authentication
2. **Dashboard** — home with summary, quick actions, streak
3. **Log BP** — blood pressure entry form + instant feedback
4. **Log Weight** — weight entry form
5. **History** — charts and trends for BP and weight
6. **Activities** — today's recommended activities checklist
7. **Achievements** — badges gallery, level progress, XP history
8. **Profile/Settings** — user info, account management

