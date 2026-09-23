# DevPulse 🚀
> Production-Ready Full Stack Project & Incident Tracking Platform built with React, TypeScript, Tailwind CSS, and Node.js/Express.

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Architecture Overview

```
+-------------------------------------------------------------+
|                  DevPulse Client (SPA)                      |
|  - React 18 + TypeScript + Vite                             |
|  - Tailwind CSS UI + Lucide Icons                           |
|  - Metrics Dashboard, Kanban Board, List View, Auth Modal   |
+------------------------------+------------------------------+
                               |
                        HTTP / REST (JSON)
                               |
+------------------------------v------------------------------+
|                  DevPulse Backend (API)                     |
|  - Node.js + Express REST API (Port 5000)                   |
|  - JWT Authentication & RBAC Middleware                     |
|  - Task & Incident Management Services                      |
|  - Analytics & Audit Logging                                |
|  - ACID Compliant Relational Persistence (SQLite/JSON Store)|
+-------------------------------------------------------------+
```

---

## ✨ Features

- 🔐 **Stateless Authentication**: JWT-based login, registration, and role-based permissions (`admin`, `member`).
- 📊 **Real-Time Engineering Metrics**: Live calculation of completion rate, active tasks, high-severity incident count, and team velocity.
- 📋 **Interactive Kanban & List Views**: Seamless toggling between Kanban columns (`todo`, `in_progress`, `completed`) and structured tabular data.
- ⚡ **High-Performance Filtering**: Multi-condition live search across title, description, priority (`low`, `medium`, `high`, `critical`), and status.
- 📝 **Incident & Task CRUD**: Full modal workflow for creating, updating, resolving, and deleting tasks with form validation.
- 🧪 **Automated Testing Suite**: End-to-end integration tests verifying auth lifecycles, permissions, and database operations.
- 📱 **Responsive Design**: Mobile-first design system with native dark mode support.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React |
| **Backend** | Node.js, Express.js, JSON Web Tokens (JWT), Crypto / bcryptjs, CORS |
| **Persistence** | Embedded SQLite / JSON Relational Storage with ACID-guaranteed file sync |
| **Testing** | Node.js Integration Test Suite, Automated Health Verifications |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Installation
Clone the repository and install all dependencies:
```bash
# Clone the repository
git clone https://github.com/<your-username>/devpulse-fullstack.git
cd devpulse-fullstack

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Running Locally

#### Option A: Run Server and Client Separately
In Terminal 1 (Backend):
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

In Terminal 2 (Frontend):
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

#### Option B: Standalone Verification Test
Run the automated test suite to verify the full backend workflow:
```bash
cd server
npm test
```

---

## 📡 API Reference

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (`Bearer <token>`) |

### Tasks & Incidents Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/tasks` | Get all tasks (supports `?status=&priority=&search=`) | Yes |
| `POST` | `/api/tasks` | Create a new task or incident | Yes |
| `PUT` | `/api/tasks/:id` | Update task status, priority, or details | Yes |
| `DELETE` | `/api/tasks/:id` | Delete a task (Admin/Creator only) | Yes |

### Analytics Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/analytics/stats` | Aggregated dashboard metrics & sprint velocity | Yes |

---

## 📄 License
This project is licensed under the MIT License - feel free to use it for personal learning and portfolio resumes.
