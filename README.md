# 🏢 FACIELIS — Facility Assurance & Audit Platform

> **Where Facilities Earn Trust.** A modern, automated, and rule-driven system for managing, inspecting, and maintaining facility assets in real time.

---

## 🌟 Introduction (For Everyone)

**FACIELIS** is a smart digital assistant for managing physical spaces—like office floors, cabins, equipment, and electronics. 

Imagine you are running a large office campus. Instead of using paper checklists, sending emails about broken air conditioners, or guessing when repairs are finished, **FACIELIS** connects everyone together:
* **Administrators** see the entire building layout, load standard reference images, upload assets, and manage integrity questions.
* **Auditors** walk around the building, compare physical assets to standard reference images, mark items as **Good** or **Defective**, and submit audits instantly.
* **Technicians** get instantly notified of broken items with original photo evidence, upload geo-tagged photo proof of their repair, and log coordinates.
* **Managers** review repairs side-by-side, sign off on work, and automatically issue fitness certificates.

---

## 🗺️ System Architecture & Workflow Diagrams

### 1. The Core Lifecycle Loop
The diagram below illustrates how a defect is identified during an audit, routed to the technician, repaired, signed off by the manager, and verified in subsequent audits.

```mermaid
graph TD
    A[1. Auditor Inspects Venue] -->|Finds Defect| B[2. Rule Engine Assigns Dept & SLA]
    B -->|Notify Technician| C[3. Technician Uploads Proof & GPS]
    C -->|Submits Repair| D[4. Manager Compares Photos & Signs Off]
    D -->|Approved| E[5. Auto-Issues Fitness Certificate]
    D -->|Rejected| B
    E -->|Next Audit| F[6. Auditor Re-verifies Asset Condition]
    F -->|Inspection Complete| A
```

### 2. Detailed Auditor & Integrity Verification Flow
To prevent fraudulent "desk audits", FACIELIS uses an integrity verification system requiring physical verification questions.

```mermaid
graph TD
    Start[Start Venue Audit] --> Inspect[Inspect Assets & Sub-components]
    Inspect --> DefaultPass[Defaults to GOOD for fast-testing]
    Inspect --> DefectFail[Mark DEFECTIVE & Upload Photo]
    DefectFail --> SubmitChecklist[Submit Inspection Checklist]
    DefaultPass --> SubmitChecklist
    SubmitChecklist --> IntegrityCheck[Integrity Verification Stage]
    IntegrityCheck --> AnswerQ[Answer Random Venue Questions e.g. Count Tables/Fans]
    IntegrityCheck --> Reverify[Verify Previous Repairs in Person]
    AnswerQ --> CompleteAudit[Complete Audit & Compile Scores]
    Reverify --> CompleteAudit
```

---

## 📸 Portal Screenshots

### 🔑 1-Click Multi-Role Login Portal
Seamlessly switch between Super Admin, Facility Manager, Auditor, and Technician views with a single click.
![FACIELIS Login Portal](/public/screenshots/login_page.png)

### ❓ Cross-Audit Integrity Questions Bank
Configure manual verification questions for each room (e.g. table count, fan count) to eliminate fake audits and ensure auditors are physically present in the room.
![Cross-Audit Integrity Question Bank](/public/screenshots/cross_audit_page.png)

### 🛠️ Side-by-Side Manager Sign-Off
Managers compare the auditor's original defect photo against the technician's repair proof photo with GPS logs for error-free quality assurance.
![Manager Repair Sign-Off](/public/screenshots/repair_approvals_page.png)

---

## 🚀 Key Features

* **Visual Audit Standards**: High-resolution reference images for every single asset type (ACs, Printers, Routers, Fans, Chairs) to guide the auditor's inspection.
* **Fast-Testing Auditor Mode**: Pre-filled defaults (all assets default to `GOOD`) with commented clicks validation, letting you test and submit 600+ component audits with one click.
* **Smart Rule Engine**: Automatically assigns broken components to the correct department (e.g. electrical issues go to electricians) with SLAs and priorities.
* **GPS & Time Logs**: Technician repairs are geo-tagged and timestamped to provide verifiable proof of work.
* **Manager Repair Approvals**: Replaces old double-verification steps with a direct, single manager sign-off dashboard.

---

## 🛠️ How to Run the App (For Developers)

Follow these simple steps to run the application on your computer:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database Config
Ensure PostgreSQL is running, then verify the connection URL in the `.env` file:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/facielis"
```

### 4. Push Schema & Seed Data
```bash
npx prisma db push
npx prisma db seed
```

### 5. Run the Application

#### A. Run in Development Mode (Recommended)
Compiles files on the fly and starts instantly:
```bash
npm run dev
```
Open **[http://localhost:3847](http://localhost:3847)** in your web browser.

#### B. Build & Run in Production Mode
```bash
npm run build
npm run start
```
Open **[http://localhost:3847](http://localhost:3847)** in your web browser.

---

## 👥 Demo Logins
Use these accounts to test each role in the application:

* **Super Admin**: `admin@facielis.com` / `password123`
* **Facility Manager**: `manager@facielis.com` / `password123`
* **Auditor**: `auditor1@facielis.com` / `password123`
* **Technician**: `tech.elec@facielis.com` / `password123`
# FACIELIS
