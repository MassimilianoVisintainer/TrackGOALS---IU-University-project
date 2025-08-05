#  TrackGOALS – Habit & Goal Tracking Web App

**TrackGOALS** is a full-stack web application designed for users to track their daily habits and long-term goals, developed as part of the IU course **DLMCSPSE01 – Software Engineering**. The full progect document can be found [here](https://docs.google.com/document/d/1twmyKx73PC_7cgLAao0r9m7q2IPEKW3EXtwP4RpPdXM/edit?tab=t.0#bookmark=id.gsvbmxvfop9v).

This app helps users build consistent routines and stay motivated with a clean dashboard, habit streak tracking, and goal progress visualization. Built with React, Node.js, MongoDB, and JWT-based authentication.

---

##  Table of Contents

- Features
- Tech Stack
- System Overview
- Installation
- Usage
- Testing
- CI/CD
- Author
- License

---

##  Features 

###  User Authentication
- Secure login & signup with JWT
- Protected routes via `PrivateRoute`

###  Habit Tracking
- Add, delete, complete daily/weekly/monthly habits
- Auto-reset daily habits
- Completion tracking with dates

###  Goal Management
- Create, update, delete long-term goals
- Track progress with deadlines and completion toggle
- Filter goals by completion status

###  Dashboard Analytics
- View habit/goal stats and progress
- Date-range filters
- Visualizations (chart, progress bars)


---

## Tech Stack

| Frontend        | Backend           | Database       | Auth        |  DevOps           |
|------------------|-------------------|----------------|-------------|------------------|
| React + Vite     | Node.js + Express | MongoDB Atlas  | JWT + bcrypt | GitHub Actions CI |

---

## System Overview

### Architecture

- **Frontend**: React SPA (Axios, Router DOM)
- **Backend**: REST API with Express
- **Database**: MongoDB Atlas
- **Security**: JWT tokens stored in `localStorage`
- **CI/CD**: GitHub Actions for frontend testing

---

##  Installation

### 1. Clone the repo

```bash
git clone https://github.com/MassimilianoVisintainer/TrackGOALS---IU-University-project.git
cd TrackGOALS---IU-University-project

```
### 2. Set up Backend
```bash
cd trackgoals-backend
npm install

```

Start the server:

```bash
npm start
```

### 3. Set up Frontend

Open a new terminal tab/window and run:

```bash
cd trackgoals-frontend
npm install
```
Start the frontend:

```bash
npm start
```
The app will run at: http://localhost:3000



##  Testing

The project uses **Jest** and **React Testing Library** for frontend unit tests.

```bash
cd trackgoals-frontend
npm test
```

Test coverage includes:

- Login & Signup forms
- Habit and Goal components
- Dashboard statistics
- API error handling

---

##  CI/CD

GitHub Actions is configured to run tests on every push or PR to \`main\`.

Workflow file:  
\`trackgoals-frontend/.github/workflows/frontend-tests.yml\`

Steps:
- Checkout repo
- Set up Node.js
- Install dependencies
- Run tests

---

##  Author

**Massimiliano Visintainer**  
Matriculation Number: \`9219959\`  
Project for **IU International University of Applied Sciences**  
Course: *DLMCSPSE01 – Software Engineering*  
Supervisor: *Holger Klus*

---

##  License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

##  Walkthrough

1. Login using test credentials:
   - Email: \`test@test.com\`
   - Password: \`123456\`

2. Navigate between:
   - 📋 **Habits Page** to add, mark, or delete habits.
   - 🎯 **Goals Page** to manage long-term goals.
   - 📊 **Dashboard** to view visual stats and analytics.
