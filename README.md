# INTERNSHIP MANAGEMENT SYSTEM (IMS)
### Full-Stack Web-Based Internship Management, Verification & Tracking Platform

---

## 1. Project Title
**INTERNSHIP MANAGEMENT SYSTEM (IMS)**  
*An Enterprise-Grade, Three-Tier Platform Connecting Students, Corporate Employers, Faculty Advisors, and Institutional Administrators.*

---

## 2. Project Overview
The **Internship Management System (IMS)** is a full-stack, production-architected web application engineered to modernize and automate the complete higher-education internship lifecycle. 

Rather than relying on fragmented email threads, paper-based NOC (No Objection Certificate) forms, and unmonitored spreadsheets, IMS provides a single, real-time relational platform where:
- **Students** discover vetted industry opportunities, apply with snapshot resumes, track application progression, log weekly technical reports, and receive academic credits.
- **Employers** manage corporate brand presence, publish opportunities, review student candidates, conduct interview scheduling, and issue offers.
- **Faculty Advisors** verify prerequisite academic criteria, approve or reject NOC requests, monitor weekly student progress logs, provide mentoring feedback, and issue official letter grades (A+ to F).
- **System Administrators** supervise institutional compliance, audit user activity, verify corporate partners, and export accreditation-ready CSV reports.

---

## 3. Problem Statement
In traditional collegiate placement workflows:
1. **Lack of Centralized Oversight**: Departmental faculty have limited visibility into off-campus student engagements and cannot verify whether an internship satisfies academic curriculum prerequisites.
2. **Delayed Clearance Cycles**: Students struggle through manual signatures for No Objection Certificates (NOCs), risking missed employer deadlines.
3. **Absence of Continuous Mentorship**: Once placed, students rarely receive continuous academic guidance, leading to unverified attendance and superficial post-internship evaluations.
4. **Data Fragmentation**: Administrative officers spend hundreds of hours manually compiling reports for institutional accreditation bodies (e.g., NAAC, NBA, ABET).

---

## 4. Proposed Solution
IMS delivers an integrated, role-based platform that enforces a strict state machine across the complete lifecycle:
```
Student Registration → Profile & Resume Setup → Internship Discovery → 
Application Submission → Faculty Academic Clearance (NOC) → 
Employer Review & Shortlisting → Interview Scheduling & Assessment → 
Selection & Offer Extension → Student Offer Acceptance → 
Active Placement Record Initialized → Weekly Progress Logging → 
Faculty Mentorship & Review → Final Multi-Criteria Evaluation & Grading → 
Placement Completion & Institutional Accreditation Reporting
```

---

## 5. Technology Stack (One Consistent, Unified Stack)

| Tier | Technology | Description & Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React.js (v18) + Vite** | Single Page Application (SPA) offering sub-millisecond HMR and responsive component rendering. |
| **Styling & Icons** | **Tailwind CSS + Lucide React** | Production utility-first styling with cohesive enterprise typography, badges, and modals. |
| **HTTP Transport** | **Axios** | Centralized client with automatic `Authorization: Bearer <token>` injection and 401 interceptors. |
| **Routing** | **React Router (v6)** | Declarative client routing with nested role guards (`RoleGuard.jsx`) and dynamic layout shells. |
| **Backend Runtime** | **Node.js + Express.js (ES Modules)** | High-throughput REST API structured in clean Controller-Service-Repository layers. |
| **Database & ORM** | **Prisma ORM** | Type-safe declarative schema modeling, relational integrity, migrations, and parameterized query execution. |
| **Database Engines** | **SQLite (Local Dev Default) / PostgreSQL (Production)** | Zero-dependency instantaneous local evaluation via SQLite, with ready-to-run PostgreSQL production schema (`schema.postgresql.prisma`). |
| **Authentication** | **JWT (JSON Web Tokens) + Bcrypt.js** | Stateless session tokens signed with HS256 secrets, paired with salt-hashed passwords (10 rounds). |
| **File Management** | **Multer** | Multipart form handling with MIME inspection, 5MB limits, and cryptographic UUID file renaming. |
| **Security & Headers** | **Helmet + CORS + Express Rate Limit** | Hardened HTTP headers, cross-origin resource policy, and brute-force mitigation on auth routes. |

---

## 6. Core User Roles & Permissions Matrix

| Capability / Workflow | Student | Employer | Faculty | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Self-Registration & Profile** | Yes | Yes | Admin Created | Pre-seeded / Admin |
| **Upload Resume (PDF/DOCX max 5MB)** | Yes | — | — | — |
| **Browse & Filter Open Internships** | Yes | Yes (Own) | Read-only | Full Control |
| **Submit Applications with Cover Note** | Yes | — | — | — |
| **Academic Review & NOC Clearance** | — | — | Yes (Assigned) | Yes |
| **Applicant Shortlisting & Interviewing** | — | Yes (Own) | — | Yes |
| **Extend Offer / Selection** | — | Yes (Own) | — | Yes |
| **Accept Offer & Spawn Placement** | Yes | — | — | — |
| **Submit Weekly Progress Reports** | Yes (Active) | — | — | — |
| **Provide Weekly Progress Feedback** | — | — | Yes | Yes |
| **Assign Mid-Term / Final Grades** | — | — | Yes | Yes |
| **Company Verification Management** | — | — | — | Yes |
| **Immutable Security Audit Log** | — | — | — | Yes |
| **CSV Accreditation Report Export** | — | — | — | Yes |

---

## 7. Database Entities & Relational Design

The system implements 12 normalized models in Prisma:
1. **User**: Authentication credentials, name, email, password hash, role (`STUDENT`, `EMPLOYER`, `FACULTY`, `ADMIN`), active status.
2. **StudentProfile**: Roll number, department, academic year, CGPA, technical skills, phone, resume snapshot, assigned faculty advisor relation.
3. **EmployerProfile**: Corporate legal name, industry sector, website, address, contact person, phone, verification status (`PENDING`, `VERIFIED`, `REJECTED`), logo file.
4. **FacultyProfile**: Institutional faculty ID, department, designation, phone, relation to advisee students.
5. **InternshipPosting**: Title, description, required department, required skills, eligibility, location, remote flag, monthly stipend, openings, start/end dates, deadline, status (`DRAFT`, `PUBLISHED`, `CLOSED`, `COMPLETED`).
6. **Application**: Unique compound key `@@unique([studentId, internshipId])` preventing duplicate submissions; tracks resume snapshot, cover letter, faculty remarks, employer remarks, and status.
7. **Interview**: Links 1-to-1 with Application; stores round name, date, time, mode (`ONLINE`, `IN_PERSON`), meeting link, location, outcome result (`SCHEDULED`, `PASSED`, `FAILED`, `RESCHEDULED`), notes.
8. **InternshipRecord**: Generated automatically upon student offer acceptance; status (`ONGOING`, `COMPLETED`, `TERMINATED`), duration, industry supervisor contacts.
9. **ProgressLog**: Weekly reporting submissions containing tasks completed, skills gained, roadblocks/challenges faced, student remarks, and faculty feedback sign-off.
10. **EvaluationGrade**: Multi-criteria score assessment: attendance (0-100), technical (0-100), performance (0-100), communication (0-100), computed overall percentage, final letter grade (`A+`, `A`, `B+`, `B`, `C`, `D`, `F`), evaluator feedback.
11. **Notification**: In-app notifications with read status, timestamps, and reference IDs.
12. **AuditLog**: Immutable compliance logging: actor user ID, action name, resource type, resource ID, IP address, metadata JSON.

---

## 8. Application State Machine

```
            [APPLIED]
               │
               ▼
      [FACULTY_PENDING] ────► [REJECTED (Faculty Clearance Denied)]
               │ (Faculty Approves)
               ▼
       [UNDER_REVIEW]   ────► [REJECTED (Employer Review)]
               │ (Employer Shortlists)
               ▼
    [INTERVIEW_SCHEDULED] ──► [REJECTED (Interview Failed)]
               │ (Interview Passed & Selected)
               ▼
          [SELECTED]    ────► [REJECTED (Offer Declined)]
               │ (Student Accepts Offer)
               ▼
          [ACCEPTED]
               │
               ▼ (Automated Placement Creation)
      [INTERNSHIP RECORD]
      Status: [ONGOING]
               │
               ├─► Student Submits Weekly Progress Logs (Weeks 1..N)
               ├─► Faculty Reviews & Signs Off on Weekly Logs
               │
               ▼ (Faculty Issues Final Evaluation & Letter Grade)
      [INTERNSHIP RECORD]
      Status: [COMPLETED]
```

---

## 9. Project Directory Structure

```
Internship_Management/
├── client/                             # Frontend React SPA
│   ├── public/                         # Public assets & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                 # Badge.jsx, Modal.jsx
│   │   │   └── layout/                 # Navbar.jsx, Sidebar.jsx
│   │   ├── context/                    # AuthContext.jsx, NotificationContext.jsx
│   │   ├── layouts/                    # DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── admin/                  # Dashboard, Users, Employers, Postings, Applications, AuditLogs, Reports
│   │   │   ├── auth/                   # LoginPage, RegisterStudentPage, RegisterEmployerPage
│   │   │   ├── employer/               # Dashboard, Profile, Internships, Applications, Interviews
│   │   │   ├── faculty/                # Dashboard, Students, Applications, Placements
│   │   │   ├── public/                 # LandingPage
│   │   │   └── student/                # Dashboard, Profile, Internships, Applications, Placement, Evaluations
│   │   ├── routes/                     # RoleGuard.jsx
│   │   ├── services/                   # api.js (Axios with Bearer interceptors)
│   │   ├── App.jsx                     # Route matrix definition
│   │   ├── index.css                   # Tailwind directives & theme
│   │   └── main.jsx                    # Root ReactDOM bootstrap
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                             # Backend REST API
│   ├── prisma/
│   │   ├── schema.prisma               # Active SQLite schema (zero-dependency local dev)
│   │   ├── schema.postgresql.prisma    # PostgreSQL production schema with native enums
│   │   ├── seed.js                     # Realistic seed script for all 4 roles + workflows
│   │   └── dev.db                      # Local SQLite database
│   ├── src/
│   │   ├── config/                     # db.js (Prisma singleton)
│   │   ├── controllers/                # 10 Domain Controllers
│   │   ├── middlewares/                # authMiddleware, roleGuard, uploadMiddleware, errorHandler
│   │   ├── routes/                     # 10 REST Router declarations
│   │   ├── services/                   # Domain business logic & state machine engines
│   │   ├── utils/                      # jwt.js, logger.js, auditLogger.js, notificationHelper.js
│   │   ├── app.js                      # Express app configuration & middlewares
│   │   └── server.js                   # Server bootstrap & lifecycle listeners
│   ├── uploads/
│   │   ├── resumes/                    # Secure local resume storage
│   │   └── logos/                      # Secure company logos storage
│   ├── test-api.js                     # Integration test runner
│   ├── test-e2e-workflow.js            # 15-step end-to-end lifecycle verification script
│   ├── .env                            # Active environment configuration
│   ├── .env.example
│   ├── .env.postgresql.example
│   └── package.json
│
├── .gitignore
├── .env.example
├── package.json                        # Root concurrently orchestrator
└── README.md                           # Documentation & Evaluation Manual
```

---

## 10. Pre-Configured Demo Credentials

The database is pre-seeded with realistic data across all 4 roles. You can also use the **1-Click Autofill** buttons on the Login Page:

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@internship.com` | `Admin@123` | Institutional governance, user control, company verification, audit logs, reports. |
| **Corporate Employer** | `employer@techcorp.com` | `Employer@123` | TechCorp Solutions Inc., posting management, applicant reviews, interview scheduling, selections. |
| **Faculty Advisor** | `faculty@college.com` | `Faculty@123` | Prof. Eleanor Hughes (CSE), assigned advisee supervision, academic NOC approvals, progress reviews, grading. |
| **Student** | `student@college.com` | `Student@123` | Alex Rivera (CS2023-0104), profile, resume management, application tracking, active placement, progress logs. |

---

## 11. Quick Start & Execution Instructions

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Option A: One-Command Root Launch (Recommended)
From the root `Internship_Management/` directory:
```bash
# 1. Install all dependencies (root, server, and client)
npm run install:all

# 2. Launch both Backend API (Port 5000) and Frontend SPA (Port 5173) concurrently
npm run dev
```
Open your browser at: **`http://localhost:5173`**

---

### Option B: Separate Terminal Launch

#### Terminal 1 — Backend REST API:
```bash
cd server
npm install
npx prisma db push
node prisma/seed.js
npm run dev
```
*Backend API runs at: `http://localhost:5000` (Health Check: `http://localhost:5000/api/v1/health`)*

#### Terminal 2 — Frontend React Client:
```bash
cd client
npm install
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## 12. PostgreSQL Production Setup (Optional)
If you wish to run against a live PostgreSQL database instead of the default local SQLite:
1. In `server/.env`, change `DATABASE_URL` to your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/internship_db?schema=public"
   ```
2. Copy `server/prisma/schema.postgresql.prisma` over `server/prisma/schema.prisma`.
3. Push schema and seed:
   ```bash
   cd server
   npx prisma db push
   node prisma/seed.js
   ```

---

## 13. Automated Test Verification

The project includes automated integration and end-to-end lifecycle verification suites:

### 1. API & RBAC Test Suite
Validates health checks, login across all 4 roles, password hashing, live database metric calculations, search filters, and RBAC 403 Forbidden enforcement:
```bash
cd server
node test-api.js
```

### 2. Complete 15-Step End-to-End Acceptance Test
Simulates the entire real-world lifecycle from start to finish:
```bash
cd server
node test-e2e-workflow.js
```
**Verified Scenario:**
1. Employer logs in & publishes a new internship.
2. Student discovers the posting via keyword search & submits application.
3. Faculty advisor reviews student eligibility & grants academic clearance.
4. Employer shortlists candidate & books an online interview.
5. Employer logs interview result (`PASSED`) & extends an official offer (`SELECTED`).
6. Student accepts offer -> Automated `InternshipRecord` spawned with status `ONGOING`.
7. Student submits Week 1 progress report.
8. Faculty advisor reviews report & records mentoring feedback.
9. Faculty advisor submits final evaluation & issues grade `A+`.
10. System state engine marks `InternshipRecord` as `COMPLETED`.
11. Administrator logs in, monitors audit trail, and exports placement CSV report.

---

## 14. Evaluator Demonstration Walkthrough

When presenting to evaluators, follow this recommended walkthrough:
1. **Landing Page (`/`)**: Show the clean institutional design, role benefits breakdown, and the 1-Click Demo Login launchpad.
2. **Student Journey**:
   - Click "Student Demo".
   - View the Student Dashboard with live application metrics and active placement alerts.
   - Go to "Profile & Resume" -> Show uploaded resume and assigned Faculty Advisor info.
   - Go to "Browse Internships" -> Demonstrate keyword and department filtering.
   - Open an internship and submit an application with a cover letter.
   - Go to "My Applications" -> Show real-time status tracking.
3. **Faculty Journey**:
   - Switch to Faculty Demo (`faculty@college.com`).
   - Notice the pending application in the "Pending Approvals" tab.
   - Inspect the candidate's credentials and click "Approve Academic Clearance".
4. **Employer Journey**:
   - Switch to Employer Demo (`employer@techcorp.com`).
   - Go to "Applicants Review" -> Notice the candidate is now approved and ready for employer review.
   - Click "Shortlist", then click "Schedule Interview" with date, time, and Google Meet link.
   - Go to "Interviews" tab -> Click "Record Outcome" -> Mark as `PASSED`.
   - On the applicant, click "Select Candidate (Offer)".
5. **Offer Acceptance & Active Placement**:
   - Switch back to Student Demo -> The applicant card now highlights "Official Internship Offer Extended!".
   - Click "Accept Offer & Start Placement" -> An active `InternshipRecord` is spawned!
   - Navigate to "Active Placement" -> Click "Submit Weekly Log" -> Enter week tasks, skills, and challenges.
6. **Faculty Grading & Completion**:
   - Switch to Faculty Demo -> Navigate to "Supervised Placements".
   - Review the student's weekly log and enter mentoring feedback.
   - Click "Evaluate & Assign Grade" -> Select `A+`, enter multi-criteria scores, and submit final evaluation.
   - The placement concludes with status `COMPLETED`.
7. **Administrator Control**:
   - Switch to Admin Demo (`admin@internship.com`).
   - View live, computed system metrics (never hardcoded).
   - Go to "User Management" -> Search users, toggle account active/inactive, or add new faculty.
   - Go to "Company Verification" -> Review and verify corporate partners.
   - Go to "Audit Logs" -> Demonstrate immutable tracking of all previous actions with actor IDs and timestamps.
   - Go to "Reports" -> Click "Download CSV" to demonstrate accreditation export.

---

## 15. Security & Architectural Best Practices
- **No Hardcoded Secrets**: All keys, ports, and connection strings are managed via `.env`.
- **SQL Injection Immune**: 100% of database access is mediated by Prisma's parameterized query engine.
- **Strict Role-Based Access Control**: Backend routes protected with `verifyToken` and `requireRoles(...)` middleware; cannot be bypassed via frontend URL manipulation.
- **Resource Ownership Validation**: Students cannot access other students' logs; employers cannot edit competitors' postings.
- **File Upload Hardening**: Strict MIME-type inspection (PDF/DOCX for resumes, PNG/JPG for logos), 5MB size limits, and randomized UUID filenames to eliminate path traversal attacks.
- **Audit Compliance**: All mission-critical operations are recorded in an immutable `AuditLog` table.

---

## 16. Future Enhancements
- Automated SMTP email & SMS notification delivery.
- AI-driven resume parsing and skill-matching recommendations.
- Student digital certificate generation upon placement completion.
- Video conferencing integration directly within the interview scheduler.
- Mobile application using React Native.
