# Use Cases

## 1. Employee Requests Leave

**Actor**: Employee
**Scenario**:

1. Employee logs in and navigates to "Leaves".
2. Clicks "Add Leave".
3. Selects leave type (e.g., Vacation), dates, and provides a reason.
4. Submits the request.
   **Outcome**: Leave request is saved with "Pending" status. Manager and HR receive a notification.

## 2. Manager Approves Leave

**Actor**: Manager (Chef d'équipe)
**Scenario**:

1. Manager receives notification or checks "Approvals" list.
2. Views pending request details (dates, reason).
3. Checks team availability calendar.
4. Clicks "Approve".
   **Outcome**: Status changes to "Approved". Employee is notified. Leave balance is deducted.

## 3. RH Runs Payroll

**Actor**: HR Officer
**Scenario**:

1. HR navigates to "Payroll".
2. Selects "Add Payroll" or "Generate for Month".
3. Selects Employee.
4. Enters base salary, bonuses, and deductions.
5. Reviews and submits.
   **Outcome**: Payroll record created. Employee receives "Payslip Available" notification.

## 4. Admin Manages Access

**Actor**: Admin
**Scenario**:

1. Admin navigates to "Employees".
2. Edits an employee's profile.
3. Changes Role from "Employee" to "Chef d'équipe".
4. Assigns a Team to manage.
   **Outcome**: User now has extended permissions to view team data and approve requests.

## 5. Broadcast Notification

**Actor**: HR / Admin
**Scenario**:

1. Navigates to "Broadcast Notification".
2. Enters "Office Closure" alert.
3. Selects Target: "All Company".
4. Sends.
   **Outcome**: All users receive a push notification/toast about the office closure.
