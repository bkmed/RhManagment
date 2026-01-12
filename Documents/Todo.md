# HR Management Platform – Product & Engineering Specification

## Overview
This document defines functional, technical, and UX requirements for improving and stabilizing the HR Management platform.  
The goal is to deliver a **secure, role-based, multilingual, and production-ready system** across Web, iOS, and Android, with consistent data rules, analytics, notifications, and testing.

---

## 1. Roles & Access Model

### Supported Roles
- **Admin**
- **HR (RH)**
- **Team Leader (Chef d’équipe)**
- **Employee**

### Core Constraints
- One **company per employee**
- One **team per employee**
- One **company per team**
- One **Rh per company**
- One **Team Leader per team**
- Missing role key:
  - `roles.undefined`

---

## 2. Navigation, Menu & Layout

### Main Menu
- Add **Analytics** page under **General** section
- Menu must be fully responsive (height & width on resize)
- Allow users (with permission) to rearrange and edit menu items

### Navigation Fixes
- Department/Service → Back button must return to **Company Settings**
- Fix unauthorized access:
  - If a user is disconnected and loads any page → force logout & redirect
  - Add local service to manage:
    - Authentication state
    - Device/session tracking
    - Concurrent session control

### Naming & UX
- Rename **“param entreprise”** to a professional label in all languages

---

## 3. Profile & Personal Information

### Profile Screen
- Add **Team section** when user belongs to a company
- If user clicks Team without company:
  - Display **“Not assigned to company”** message
-page profile est hachee

### Personal Information
- Replace **Name** with **Alias**
- Replace **Age** with **Date of Birth**
  - Age is calculated automatically
- Email:
  - Required
  - Must be unique
- Replace **Lieu de travail** with **Job Title**

### Missing Keys
- `navigation.personalInfo`
- `profile.documents`

---

## 4. Employees & Assignments

### Employee Management
- Add Employee:
  - Allowed: **Admin, HR**
- Dropdown filtering rules:
  - Exclude employees already assigned to a company
  - Exclude employees already assigned to a team (within company)

### Team Management
- AddTeamScreen:
  - Exclude employees already assigned to a team in selected company
- Team assignment:
  - Exclude teams already assigned to companies
- Employee selection in team:
  - Display selected employee count
  - Highlight count in **red** when:
    - Count = 0
    - Count > 10 (restriction exceeded)

---

## 5. Absence, Leave & Illness

### Absence Visibility
- View absences by:
  - Same team
  - Same company
- Review period management (role-based)

### Leaves
- Default status: **Pending**
  - Employee cannot select status
- Missing key:
  - `leaves.status`
- Field updates:
  - **Titre*** → **Objet**
  - **Lieu de travail** → **Cause**
- Add reminders (Web & Mobile) on creation
- Save action:
  - Must work correctly
  - Show success or error message

### Illness
- Remove Illness from menu (already covered under Leave)
- Field updates:
  - Payroll Item Name* → **Objet**
  - **Weekly** → professional illness date label
  - **Expiry Date (Optional)** → **End Date**
- Display number of days taken (start/end date)
- Employee name:
  - Auto-filled for logged employee
  - HR/Admin:
    - Dedicated page with employee dropdown
    - Filters by company & team
- Planning visibility:
  - Employee: own planning only
  - Team Leader: own team
  - HR: all employees in company
  - Admin: all employees

---

## 6. Payroll

### Add Payroll
- Access:
  - Admin: all employees
  - HR: employees in same company
  - Team Leader / Employee: cannot add
- Validation:
  - Worked hours ≤ 168
  - Exceeding hours → overtime
    - Add overtime hourly cost
    - Include in total

### Tickets
- Ticket Restaurant:
  - Number of tickets (number)
  - Cost (number)
- Ticket Cadeaux:
  - Number of tickets (number)
  - Cost (number)

### Fields & Filters
- Remove:
  - Lieu de travail
  - Service
- Admin only:
  - Company dropdown
  - Team dropdown (filters employees)

---

## 7. Claims

### Add Claim
- If type = **Material**:
  - Dynamically display material dropdown list

---

## 8. Invoices

### Access Control
- View & Add:
  - Admin
  - HR only

### Add Invoice
- Company dropdown required
- Filtering by company

### UI Fix
- “No Invoice” section background must match theme

---

## 9. Approvals & Workflows

### Pending Approvals Visibility
- Admin: all
- HR: all employees in company
- Team Leader: own team
- Employee: own requests only

### Restrictions
- HR, Admin, Team Leader:
  - Can see their own requests
  - Cannot approve/refuse their own leave

---

## 10. Analytics

### Employee Analytics
- Dedicated page
- Personal statistics only
- Remove HR Insights → Upcoming Leaves (Employees)

### Role-Based Analytics
- Admin: all companies & teams
- HR: all teams in same company
- Team Leader: own team
- Employee: own data

---

## 11. Search

### Global Search
- Must respect role-based access
- Employees must not see companies or pages they are not allowed to access

---

## 12. Notifications

### Notification Management
- Admin:
  - All employees
  - By company
  - By team
- HR:
  - By company
  - By team

### Broadcast Notifications
- Missing translation keys in all languages
- Clicking a notification must navigate correctly

### Welcome Message
Replace:
```js
title: 'Welcome to RhManagment!',
message: 'Explore the new Phase 3 features like Search and Chat.'




-nouvelle annonce Type de Paiement replace with title
-navigation.setOptions is not a function
-TypeError: navigation.setOptions is not a function
    at eval (webpack://rhmanagment/./src/screens/illnesses/AddIllnessScreen.tsx?:1:6701)
-refresh list after add or edit or delete or approval or denied
-common.count common.unitprice common.count common.unitprice missing payroll.overtimeHours payroll.overtimeRate
-detail must hace placeholder and  detail must be more pro
message derreur add paie et la fiche de paie enleve les heure en bas

homescreen employee ui not working
approuve employer register by sign up or deaprouve
