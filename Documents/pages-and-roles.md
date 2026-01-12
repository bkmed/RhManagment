# Pages and Role Access Matrix

## Overview

This document defines which user roles can access which pages in the RH Management system.

## Role Definitions

- **Admin**: System administrator with full access
- **RH**: HR Manager with company-wide access
- **Chef d'équipe**: Team Leader with team-level access
- **Employee**: Individual employee with personal access

## Access Matrix

| Page/Feature            | Admin         | RH               | Chef d'équipe | Employee      | Notes                       |
| ----------------------- | ------------- | ---------------- | ------------- | ------------- | --------------------------- |
| **General**             |
| Home                    | ✅            | ✅               | ✅            | ✅            | Dashboard accessible to all |
| Profile                 | ✅            | ✅               | ✅            | ✅            | Personal profile management |
| Settings                | ✅            | ✅               | ✅            | ✅            | Personal settings           |
| Notifications           | ✅            | ✅               | ✅            | ✅            | View notifications          |
| **Analytics**           |
| Analytics               | ✅ (all data) | ✅ (company)     | ✅ (team)     | ✅ (personal) | Scope varies by role        |
| Team Analytics          | ✅            | ✅               | ✅            | ❌            | Aggregated team metrics     |
| HR Insights             | ✅            | ✅               | ❌            | ❌            | Company-wide insights       |
| **Employee Management** |
| Employees List          | ✅            | ✅               | ❌            | ❌            | View all employees          |
| Add Employee            | ✅            | ✅               | ❌            | ❌            | Create new employee         |
| Edit Employee           | ✅            | ✅               | ❌            | ❌            | Modify employee data        |
| Delete Employee         | ✅            | ✅               | ❌            | ❌            | Remove employee             |
| Employee Details        | ✅            | ✅               | ✅ (team)     | ✅ (self)     | View employee profile       |
| **Company Management**  |
| Companies List          | ✅            | ❌               | ❌            | ❌            | View all companies          |
| Add Company             | ✅            | ❌               | ❌            | ❌            | Create new company          |
| Edit Company            | ✅            | ❌               | ❌            | ❌            | Modify company data         |
| Company Settings        | ✅            | ✅ (own)         | ❌            | ❌            | Configure company           |
| **Team Management**     |
| Teams List              | ✅            | ✅               | ❌            | ❌            | View all teams              |
| Add Team                | ✅            | ✅               | ❌            | ❌            | Create new team             |
| Edit Team               | ✅            | ✅               | ❌            | ❌            | Modify team data            |
| My Team                 | ✅            | ✅               | ✅            | ✅            | View own team               |
| Team Members            | ✅            | ✅               | ✅ (own)      | ✅ (view)     | Manage team members         |
| **Organization**        |
| Departments             | ✅            | ✅               | ❌            | ❌            | Manage departments          |
| Services                | ✅            | ✅               | ❌            | ❌            | Manage services             |
| Org Chart               | ✅            | ✅               | ✅            | ✅            | View organization structure |
| **Leave Management**    |
| Leaves List             | ✅            | ✅               | ✅            | ✅            | View leaves                 |
| Add Leave               | ✅            | ✅               | ✅            | ✅            | Request leave               |
| Edit Leave              | ✅            | ✅               | ✅ (own)      | ✅ (own)      | Modify leave request        |
| Approve/Reject Leave    | ✅ (all)      | ✅ (company)     | ✅ (team)     | ❌            | Leave approval              |
| Pending Approvals       | ✅ (all)      | ✅ (company)     | ✅ (team)     | ✅ (own)      | View pending requests       |
| **Illness Management**  |
| Illnesses List          | ✅            | ✅               | ✅            | ✅            | View illness records        |
| Add Illness             | ✅            | ✅               | ✅            | ✅            | Add illness record          |
| Add Illness (Others)    | ✅            | ✅               | ✅ (team)     | ❌            | Add for other employees     |
| Employee Planning       | ✅ (all)      | ✅ (company)     | ✅ (team)     | ✅ (own)      | View illness planning       |
| **Payroll**             |
| Payroll List            | ✅            | ✅               | ✅ (own)      | ✅ (own)      | View payroll items          |
| Add Payroll             | ✅            | ✅               | ❌            | ❌            | Create payroll entry        |
| Edit Payroll            | ✅            | ✅               | ❌            | ❌            | Modify payroll              |
| Payroll History         | ✅            | ✅               | ✅ (own)      | ✅ (own)      | View history                |
| Payslip                 | ✅            | ✅               | ✅ (own)      | ✅ (own)      | Generate payslip            |
| **Invoices**            |
| Invoices List           | ✅            | ✅               | ❌            | ❌            | View all invoices           |
| Add Invoice             | ✅            | ✅               | ❌            | ❌            | Create invoice              |
| Edit Invoice            | ✅            | ✅               | ❌            | ❌            | Modify invoice              |
| Invoice Details         | ✅            | ✅               | ❌            | ❌            | View invoice details        |
| **Claims**              |
| Claims List             | ✅            | ✅               | ✅            | ✅            | View claims                 |
| Add Claim               | ✅            | ✅               | ✅            | ✅            | Submit claim                |
| Process Claim           | ✅ (all)      | ✅ (company)     | ✅ (team)     | ❌            | Approve/reject claim        |
| **Devices**             |
| Devices List            | ✅            | ✅               | ❌            | ❌            | View all devices            |
| Add Device              | ✅            | ✅               | ❌            | ❌            | Add new device              |
| My Devices              | ✅            | ✅               | ✅            | ✅            | View assigned devices       |
| Assign Device           | ✅            | ✅               | ❌            | ❌            | Assign to employee          |
| **Notifications**       |
| Manage Notifications    | ✅            | ❌               | ❌            | ❌            | Send system notifications   |
| Send to Team            | ✅            | ✅ (own team)    | ✅ (own team) | ❌            | Team notifications          |
| Send to Company         | ✅            | ✅ (own company) | ❌            | ❌            | Company notifications       |
| Send to All             | ✅            | ❌               | ❌            | ❌            | System-wide notifications   |
| **Communication**       |
| Chat                    | ✅            | ✅               | ✅            | ✅            | Company chat                |
| Announcements           | ✅            | ✅               | ✅ (view)     | ✅ (view)     | Company announcements       |
| Create Announcement     | ✅            | ✅               | ❌            | ❌            | Post announcement           |
| **Performance**         |
| Career Hub              | ✅            | ✅               | ✅            | ✅            | Career development          |
| Performance Reviews     | ✅            | ✅               | ✅ (team)     | ✅ (own)      | View reviews                |
| Add Review              | ✅            | ✅               | ✅ (team)     | ❌            | Create review               |
| Goals                   | ✅            | ✅               | ✅            | ✅            | Manage goals                |
| **Review Periods**      |
| Review Periods          | ✅            | ✅               | ❌            | ❌            | Manage review periods       |
| Add Review Period       | ✅            | ✅               | ❌            | ❌            | Create new period           |

## Access Rules Summary

### Admin

- **Full Access**: All pages and features
- **Data Scope**: All companies, teams, and employees
- **Special Permissions**: Send global notifications, manage system settings

### RH (HR Manager)

- **Company Scope**: All employees and teams within their company
- **Management**: Employees, teams, departments, services, invoices, payroll
- **Approvals**: Leave and claim requests for company employees
- **Restrictions**: Cannot manage other companies or send global notifications

### Chef d'équipe (Team Leader)

- **Team Scope**: Only their team members
- **Management**: View team, approve team leave/claims
- **Personal**: Can submit own leaves, claims, view own payroll
- **Restrictions**: Cannot add employees, manage payroll, access HR features

### Employee

- **Personal Scope**: Only their own data
- **Self-Service**: Submit leaves, claims, view payroll, update profile
- **View**: Team members, company announcements, org chart
- **Restrictions**: No approval or management capabilities

## Special Cases

### Own Requests

- No role can approve/reject their own leave or claim requests
- Requires approval from higher-level role

### Conditional Access

- Employee Details: Users can view details based on their scope
- Planning Views: Visibility filtered by role and relationship

### Data Filtering

All list views are automatically filtered based on role:

- Admin sees all
- RH sees company scope
- Chef d'équipe sees team scope
- Employee sees personal scope

---

_Last Updated: 2026-01-08_
