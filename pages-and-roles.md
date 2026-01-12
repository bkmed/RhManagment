# Pages and Roles Access Control

This document outlines the application pages and the roles required to access them.

## Roles

- **Admin**: Full access to all system features.
- **RH (Human Resources)**: Manages employees, payroll, leaves, and company settings.
- **Chef d'équipe (Manager)**: Manages a specific team, approves leaves, views team analytics.
- **Employee**: Views own profile, payslips, leaves, submits requests.

## Page Access Matrix

| Screen                   | Route Name            | Access Roles       | Notes                                 |
| :----------------------- | :-------------------- | :----------------- | :------------------------------------ |
| **Dashboard**            | `Home`                | All                | Content varies by role                |
| **Login**                | `Login`               | All (Public)       |                                       |
| **Profile**              | `Profile`             | All                | Own profile only                      |
| **Employee List**        | `EmployeeList`        | Admin, RH, Manager | Manager sees own team                 |
| **Add Employee**         | `AddEmployee`         | Admin, RH          |                                       |
| **Payroll List**         | `PayrollList`         | Admin, RH          | Employee sees own payslips in Profile |
| **Add Payroll**          | `AddPayroll`          | Admin, RH          |                                       |
| **Leave List**           | `LeaveList`           | All                | Own leaves for Employee               |
| **Add Leave**            | `AddLeave`            | All                |                                       |
| **Leave Approvals**      | `LeaveApprovalList`   | Admin, RH, Manager |                                       |
| **Team Absences**        | `TeamAbsences`        | Admin, RH, Manager |                                       |
| **Company Absences**     | `CompanyAbsences`     | Admin, RH          |                                       |
| **Claims List**          | `ClaimsList`          | All                | Own claims only                       |
| **Add Claim**            | `AddClaim`            | All                |                                       |
| **Manage Notifications** | `ManageNotifications` | Admin, RH          | Broadcast messages                    |
| **Company Settings**     | `CompanySettings`     | Admin, RH          |                                       |
| **Review Periods**       | `ReviewPeriod`        | Admin, RH          |                                       |
| **Performance Review**   | `PerformanceReview`   | Admin, RH, Manager |                                       |
