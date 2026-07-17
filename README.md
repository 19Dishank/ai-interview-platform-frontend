# Verquo — AI-Powered Technical Interviewing Platform

[![Next.js Version](https://img.shields.io/badge/Next.js-16.2.10-black?logo=next.js)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-19.2.4-blue?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

Verquo is a premium, AI-powered technical interviewing platform designed to streamline the developer hiring process. Candidates take a rigorous, interactive AI technical assessment **once** and receive a verified, comprehensive performance profile. This profile can then be shared directly with multiple recruiters, completely eliminating repetitive and inconsistent early-stage technical screening rounds.

---

## 🚀 Key Features

### 👤 Candidate Portal
* **Interactive AI Interviewer**: A fully immersive text/voice interview environment covering React internals, performance profiling, system design, and coding challenges.
* **Verified Assessments**: Clear timestamped evidence of problem-solving ability, communication quality, and technical depth.
* **Profile Builder**: A custom developer profile dashboard featuring professional experience, target salary expectations, notice period, and core skill listings.
* **History & Insights**: Comprehensive records of past attempts, score breakdown trends, and template details.

### 💼 Recruiter Portal
* **Candidate Search Engine**: Highly filterable grid/list views to locate qualified candidates by role domain (Frontend, Backend, DevOps, ML, etc.), experience levels, expected CTC, notice period, or specific technologies.
* **Side-by-Side Comparison**: Interactively compare candidate scores, strengths, weaknesses, and key metrics in a unified comparison interface.
* **Verified Portfolios**: Access timestamped evaluation transcripts, technical summaries, and granular performance scoring.

### 🛡️ Admin Dashboard
* **Platform Health Analytics**: Overall stats tracking candidates, recruiters, average interview scores, active jobs, and completion rates.
* **User Management**: Moderation panel to review users, account status, and registration histories.
* **Template Architect**: Modular interview configuration tools to adjust template duration, technology focus, and question quantity.
* **Subscription Management**: Access control for recruiter licensing, seats, and renewal cycles.

---

## 🎨 Design System & Aesthetics

* **Curated Harmonious Palette**: Built with a sleek dark-teal theme, amber highlighting (`var(--primary)`, `var(--success)`, `var(--accent)`), and an elegant, modern dark mode.
* **Micro-Animations**: Custom loader animations with pinging glows, rotating rings, and hover-triggered structural transitions.
* **Responsive Layouts**: Designed to adapt fluidly from extra-small mobile interfaces up to massive ultra-wide monitors.
* **Seamless Dark/Light Mode**: Local storage cached theme toggling via standard Tailwind `dark:` utility directives.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (App Router & Server-Side Rendering support)
* **Core Library**: [React 19](https://react.dev/)
* **Styles & Layout**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS
* **Icons**: [Lucide React](https://lucide.dev/)
* **Charts**: [Recharts](https://recharts.org/) (Custom data visualizations for stats and scores)
* **UI Components**: Radix UI Primitives (Dropdowns, Select, Dialogs, Progress indicators, Sliders, and Tooltips)

---

## 📂 Project Structure

```
├── app/                  # Next.js App Router Pages
│   ├── (auth)/           # Authentication flows (Login/Signup via OTP)
│   ├── admin/            # Admin dashboard, templates, subscriptions
│   ├── candidate/        # Candidate interview flows, profiles, history, and reports
│   ├── recruiter/        # Recruiter search interfaces and profile comparison
│   ├── globals.css       # Core stylesheets and CSS variables design system
│   └── layout.tsx        # App wrapper and Theme provider context
├── components/           # Reusable Component Architecture
│   ├── admin/            # Admin specific UI components
│   ├── candidate/        # Candidate report and setup structures
│   ├── landing/          # Hero, Philosophy, CTA, Benefits, and Footer
│   ├── layout/           # Base shells, Navbar, user menus, mobile adapters
│   ├── recruiter/        # Filter panels, candidate lists/grids, contact modals
│   └── ui/               # Tailored primitive controls (Buttons, Cards, Badges, Inputs)
├── context/              # Context Providers (ThemeProvider)
├── data/                 # Platform Mock Database (mock.ts)
├── types/                # Strict TypeScript interfaces
└── next.config.ts        # Next.js configuration parameters
```

---

## ⚡ Getting Started

First, ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application in action.

### 3. Build for Production
To bundle the optimized production files:
```bash
npm run build
```

### 4. Code Quality & Linting
Run ESLint checkups:
```bash
npm run lint
```

---

## 📝 License
This project is licensed under the MIT License.
