# Reminex — Intelligent Second Brain & Workspace

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple.svg)](https://vitejs.dev/)

**Reminex** is a personal intelligent workspace and second brain application designed to capture thoughts, schedule tasks with AI natural language intent, manage Kanban project workflows, and visualize productivity habits.

---

## 🌟 Core Features

- **🏠 Daily Cockpit**: Live ticking clock, daily mindset quotes, quick stats, and urgent task alerts.
- **📝 Fast Thought Capture**: Markdown composer with instant shortcodes for images, links, checklists, and automatic `#hashtag` tagging.
- **✅ Action & Task Manager**: 4-state workflow (`To Do`, `Ongoing (with timers)`, `Completed`), priority badges, and embedded Calendar view.
- **🔗 Collaboration**: 1-click shareable task link generator and teammate email invitations.
- **🎙️ Speech-to-Text Voice Capture**: Integrated Web Speech API microphone for instantaneous hands-free thought capture.
- **🤖 AI Brain Assistant**: Conversational knowledge retrieval with auto-task creation from natural language (e.g., *"Add task: Review Q3 budget tomorrow"*).
- **📊 Kanban Project Boards**: 3-column boards (*Backlog*, *In Progress*, *Done*) with subtask checklists and progress tracking.
- **📅 Month Calendar**: Visual calendar grid with color-coded dot badges for tasks and memories.
- **📈 Productivity Analytics**: SVG velocity charts, donut completion ratios, and an 84-day (12-week) streak heatmap.
- **⚙️ Typography & Permissions**: Dynamic font size scaling (`14px` / `16px` / `18px`), font style picker, desktop push alarms, and timezone geolocation sync.
- **🌙 Sleep Mode (DND)**: Do Not Disturb switch with customizable quiet hours.
- **📜 Complete Audit Log (`/history`)**: Chronological event tracking with action filtering and 1-click JSON export.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 8
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Dark Glassmorphism Design System
- **State Management**: Zustand
- **Data Layer**: TanStack Query (React Query) with in-memory offline fallback
- **Backend / Auth**: Supabase (with 1-click Developer Skip Login bypass for testing)
- **Icons**: Lucide React
- **Date Utilities**: Date-fns

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/vivekp8/Reminex.git
cd Reminex
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 👨‍💻 Author & Maintainer

Designed and engineered by **Vivek Potnuru** ([@vivekp8](https://github.com/vivekp8)).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
