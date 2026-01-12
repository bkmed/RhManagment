# Use Cases by Role - RH Management System

## Overview

This document describes typical use cases for each of the four user roles in the RH Management system.

---

## 1. Admin (System Administrator)

### Primary Responsibilities

- Overall system management
- Multi-company oversight
- System configuration
- Global notifications and announcements

### Use Cases

#### UC-A1: Company Onboarding

**Actor**: Admin  
**Goal**: Set up a new company in the system  
**Steps**:

1. Navigate to Companies
2. Click "Add Company"
3. Enter company details (name, address, contact info)
4. Save company
5. Create initial departments and teams
6. Add HR manager for the company
7. Configure company-specific settings

#### UC-A2: System-Wide Analytics Review

**Actor**: Admin  
**Goal**: Review performance across all companies  
**Steps**:

1. Navigate to Analytics
2. Select "All Companies" view
3. Review key metrics (employee count, leave utilization, pending approvals)
4. Compare performance across companies
5. Export reports for executive review

#### UC-A3: Global Notification Broadcast

**Actor**: Admin  
**Goal**: Send important system-wide notification  
**Steps**:

1. Navigate to Manage Notifications
2. Click "Send to All"
3. Compose notification title and message
4. Select notification type (info, warning, urgent)
5. Schedule or send immediately
6. Track notification delivery and read status

#### UC-A4: Employee Transfer Between Companies

**Actor**: Admin  
**Goal**: Move an employee from one company to another  
**Steps**:

1. Navigate to Employees
2. Search and select employee
3. Edit employee profile
4. Change company assignment
5. Update team assignment
6. Notify relevant managers
7. Update access permissions

#### UC-A5: System Configuration

**Actor**: Admin  
**Goal**: Configure system-wide settings  
**Steps**:

1. Navigate to Settings
2. Configure leave policies by country
3. Set default working hours
4. Configure notification preferences
5. Set up integrations
6. Save configuration

---

## 2. RH (HR Manager)

### Primary Responsibilities

- Company employee management
- Team structure management
- Leave and payroll administration
- Company-level reporting

### Use Cases

#### UC-R1: New Employee Onboarding

**Actor**: RH  
**Goal**: Add a new employee to the company  
**Steps**:

1. Navigate to Employees
2. Click "Add Employee"
3. Enter employee details:
   - Personal info (name, alias, birthDate, contact)
   - Job info (jobTitle, department, team)
   - Email (unique, required)
   - Hiring date
4. Assign to team
5. Set role (employee or chef_dequipe)
6. Generate login credentials
7. Send welcome notification

#### UC-R2: Payroll Processing

**Actor**: RH  
**Goal**: Process monthly payroll for company employees  
**Steps**:

1. Navigate to Payroll
2. Click "Add Payroll"
3. Select payroll month/year
4. For each employee:
   - Enter base salary
   - Calculate overtime (if hours worked > 168)
   - Add bonuses
   - Add meal vouchers (count × cost)
   - Add gift vouchers (count × cost)
5. Review total calculation
6. Save payroll entry
7. Generate payslips

#### UC-R3: Leave Approval Management

**Actor**: RH  
**Goal**: Review and process pending leave requests  
**Steps**:

1. Navigate to Pending Approvals
2. Filter by company employees
3. Review each request:
   - Check employee's remaining leave balance
   - Verify dates and duration
   - Check team coverage
4. Approve or decline with comments
5. System auto-notifies employee
6. Update leave balance

#### UC-R4: Team Restructuring

**Actor**: RH  
**Goal**: Create new team and assign employees  
**Steps**:

1. Navigate to Teams
2. Click "Add Team"
3. Enter team name and department
4. Select team leader (chef_dequipe)
5. Select team members (max 10):
   - Filter by employees not in other teams
   - See selection count (red if > 10 or = 0)
6. Assign team to company
7. Save team
8. Notify team members

#### UC-R5: Invoice Management

**Actor**: RH  
**Goal**: Process company expense invoices  
**Steps**:

1. Navigate to Invoices
2. Filter by company
3. Click "Add Invoice"
4. Select company
5. Enter invoice details:
   - Description
   - Amount
   - Currency
   - Upload receipt/invoice document
6. Set status (pending/approved)
7. Save invoice
8. Track for payment processing

#### UC-R6: Company Analytics Review

**Actor**: RH  
**Goal**: Generate monthly HR report for management  
**Steps**:

1. Navigate to Analytics
2. Select date range (current month)
3. Review metrics:
   - Employee headcount by department
   - Leave utilization
   - Pending approvals count
   - Illness records
   - Attendance rate
4. View team comparisons
5. Export report
6. Present to management

---

## 3. Chef d'équipe (Team Leader)

### Primary Responsibilities

- Team member oversight
- Team leave/claim approval
- Team performance monitoring
- Day-to-day team coordination

### Use Cases

#### UC-C1: Team Leave Approval

**Actor**: Chef d'équipe  
**Goal**: Approve team member's leave request  
**Steps**:

1. Receive leave request notification
2. Navigate to Pending Approvals
3. Filter "My Team"
4. Review request details:
   - Team member name
   - Leave dates and duration
   - Reason/cause
5. Check team schedule for coverage
6. Approve or decline
7. Add comments if needed
8. Employee gets notified automatically

#### UC-C2: Team Illness Tracking

**Actor**: Chef d'équipe  
**Goal**: Add illness record for team member  
**Steps**:

1. Navigate to Illnesses
2. Click "Add Illness"
3. Select team member from dropdown (filtered by team)
4. Enter illness details:
   - Date of illness
   - End date (system calculates days)
   - Subject/Object
5. Upload medical certificate if available
6. Save record
7. View team's overall illness planning

#### UC-C3: Team Analytics Review

**Actor**: Chef d'équipe  
**Goal**: Monitor team performance and attendance  
**Steps**:

1. Navigate to Analytics
2. View team scope only
3. Review:
   - Team attendance rate
   - Upcoming leaves
   - Illness records
   - Claims submitted
4. Identify trends or issues
5. Plan team resources accordingly

#### UC-C4: Own Leave Request

**Actor**: Chef d'équipe  
**Goal**: Request personal leave  
**Steps**:

1. Navigate to Leaves
2. Click "Add Leave"
3. Enter leave details:
   - Leave type
   - Object/Subject
   - Dates (start - end)
   - Cause/Reason
4. Enable reminder (1 hour before)
5. Submit (status defaults to "pending")
6. Wait for RH or Admin approval
7. Cannot approve own request

#### UC-C5: Team Member Profile Review

**Actor**: Chef d'équipe  
**Goal**: View team member's professional information  
**Steps**:

1. Navigate to My Team
2. Select team member
3. View profile information:
   - Personal details (read-only)
   - Job title and hiring date
   - Skills and expertise
   - Current leave balance
   - Recent activity
4. Cannot edit (no permission)

---

## 4. Employee

### Primary Responsibilities

- Personal profile management
- Leave and claim submission
- Personal data viewing
- Self-service HR tasks

### Use Cases

#### UC-E1: Submit Leave Request

**Actor**: Employee  
**Goal**: Request vacation leave  
**Steps**:

1. Navigate to Leaves
2. Click "Add Leave"
3. Select leave type
4. Enter object/subject (e.g., "Summer Vacation")
5. Select dates (start and end)
6. Enter cause/reason
7. Enable reminder notification
8. Submit (auto-status: pending)
9. Receive confirmation
10. Wait for approval from chef_dequipe or RH

#### UC-E2: Submit Expense Claim

**Actor**: Employee  
**Goal**: Claim reimbursement for business expense  
**Steps**:

1. Navigate to Claims
2. Click "Add Claim"
3. Select claim type:
   - Material
   - Account/Access
   - Other
4. If "Material" selected:
   - Material dropdown appears
   - Select specific material
5. Enter description
6. Enter amount
7. Upload receipt/proof
8. Mark as urgent if needed
9. Submit claim
10. Track status in claims list

#### UC-E3: View Personal Payroll

**Actor**: Employee  
**Goal**: Check monthly payslip  
**Steps**:

1. Navigate to Payroll
2. View list of personal payroll entries only
3. Select current month
4. View payslip details:
   - Base salary
   - Bonuses
   - Overtime
   - Meal/gift vouchers
   - Deductions
   - Net pay
5. Download or print payslip
6. Cannot add or edit payroll

#### UC-E4: Update Personal Profile

**Actor**: Employee  
**Goal**: Update contact information  
**Steps**:

1. Navigate to Profile
2. Click "Edit Profile"
3. Update allowed fields:
   - Phone number
   - Address
   - Skills
   - Social links (LinkedIn, etc.)
4. Cannot edit:
   - Email (unique, managed by RH)
   - Job title
   - Birthdate
   - Company/team assignment
5. Upload profile photo
6. Save changes

#### UC-E5: View Team Members

**Actor**: Employee  
**Goal**: See who is on their team  
**Steps**:

1. If assigned to company:
   - Navigate to Profile → My Team
   - View team members list
   - See team leader
   - View basic contact info
2. If not assigned to company:
   - See message: "Not assigned to company"

#### UC-E6: Check Personal Analytics

**Actor**: Employee  
**Goal**: Review personal HR statistics  
**Steps**:

1. Navigate to Analytics
2. View personal scope only:
   - Remaining vacation days
   - Leave history
   - Attendance rate
   - Submitted claims status
3. No access to:
   - HR insights
   - Team metrics
   - Company data

#### UC-E7: Add Illness Record

**Actor**: Employee  
**Goal**: Record personal illness  
**Steps**:

1. Navigate to Illnesses
2. Click "Add Illness"
3. Employee name auto-filled (current user)
4. Enter date of illness
5. Enter end date (system shows days count)
6. Enter object/subject (e.g., "Flu")
7. Upload medical certificate
8. Save record
9. Can only view own illness planning

#### UC-E8: View Assigned Devices

**Actor**: Employee  
**Goal**: Check assigned company devices  
**Steps**:

1. Navigate to Profile → My Material
2. View list of assigned devices:
   - Device name
   - Serial number
   - Type
   - Condition (working/faulty)
3. Report device as faulty if needed
4. Cannot assign/unassign devices

---

## Cross-Role Scenarios

### Scenario 1: Leave Request Flow

1. **Employee** submits leave request → status: pending
2. **Chef d'équipe** receives notification, reviews, approves
3. **RH** can see all company approvals, may review
4. **Admin** has visibility of all approvals system-wide
5. Employee receives approval notification
6. Leave balance automatically updated

### Scenario 2: New Employee Journey

1. **Admin** creates company and initial structure
2. **RH** adds new employee with profile details
3. **RH** assigns employee to team
4. **Chef d'équipe** receives notification of new team member
5. **Employee** receives welcome notification and credentials
6. **Employee** logs in, completes profile
7. **Employee** begins submitting leaves/claims

### Scenario 3: Performance Review Cycle

1. **RH** creates review period for company
2. **Admin** can see all review periods
3. **Chef d'équipe** conducts reviews for team members
4. **Employee** views own reviews and sets goals
5. **RH** generates company-wide review reports
6. **Admin** compares across companies

---

## Summary Matrix

| Use Case Type       | Admin    | RH           | Chef d'équipe | Employee      |
| ------------------- | -------- | ------------ | ------------- | ------------- |
| System Management   | ✅       | ❌           | ❌            | ❌            |
| Company Management  | ✅       | ✅           | ❌            | ❌            |
| Employee Management | ✅       | ✅           | ❌            | ❌            |
| Team Management     | ✅       | ✅           | ✅ (view)     | ✅ (view)     |
| Leave Requests      | ✅       | ✅           | ✅            | ✅            |
| Leave Approvals     | ✅ (all) | ✅ (company) | ✅ (team)     | ❌            |
| Payroll Management  | ✅       | ✅           | ❌            | ❌            |
| Payroll Viewing     | ✅ (all) | ✅ (company) | ✅ (own)      | ✅ (own)      |
| Claims Processing   | ✅ (all) | ✅ (company) | ✅ (team)     | ❌            |
| Analytics           | ✅ (all) | ✅ (company) | ✅ (team)     | ✅ (personal) |
| Invoices            | ✅       | ✅           | ❌            | ❌            |
| Notifications       | ✅ (all) | ✅ (company) | ✅ (team)     | ❌            |

---

_Last Updated: 2026-01-08_
