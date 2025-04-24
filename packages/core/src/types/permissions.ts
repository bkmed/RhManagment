// Define all possible permissions in the system
export enum Permission {
  // Employee permissions
  VIEW_OWN_PROFILE = "view_own_profile",
  EDIT_OWN_PROFILE = "edit_own_profile",
  VIEW_OWN_PAYSLIPS = "view_own_payslips",
  REQUEST_LEAVE = "request_leave",
  VIEW_OWN_LEAVE = "view_own_leave",
  CANCEL_OWN_LEAVE = "cancel_own_leave",
  RECORD_OWN_ILLNESS = "record_own_illness",
  VIEW_OWN_ILLNESS = "view_own_illness",

  // HR Advisor permissions
  VIEW_ALL_EMPLOYEES = "view_all_employees",
  VIEW_EMPLOYEE_DETAILS = "view_employee_details",
  EDIT_EMPLOYEE_DETAILS = "edit_employee_details",
  APPROVE_LEAVE = "approve_leave",
  REJECT_LEAVE = "reject_leave",
  VIEW_ALL_LEAVE = "view_all_leave",
  MANAGE_ILLNESS_RECORDS = "manage_illness_records",
  VIEW_PAYROLL_REPORTS = "view_payroll_reports",

  // Admin permissions
  MANAGE_USERS = "manage_users",
  MANAGE_ROLES = "manage_roles",
  MANAGE_PERMISSIONS = "manage_permissions",
  CREATE_PAYSLIPS = "create_payslips",
  EDIT_PAYSLIPS = "edit_payslips",
  DELETE_PAYSLIPS = "delete_payslips",
  VIEW_SYSTEM_LOGS = "view_system_logs",
  CONFIGURE_SYSTEM = "configure_system",
  MANAGE_DOCUMENTS = "manage_documents",
}

// Define role types
export type RoleType = "employee" | "hr_advisor" | "admin"

// Define the permission set for each role
export const RolePermissions: Record<RoleType, Permission[]> = {
  employee: [
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_PAYSLIPS,
    Permission.REQUEST_LEAVE,
    Permission.VIEW_OWN_LEAVE,
    Permission.CANCEL_OWN_LEAVE,
    Permission.RECORD_OWN_ILLNESS,
    Permission.VIEW_OWN_ILLNESS,
  ],
  hr_advisor: [
    // Include all employee permissions
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_PAYSLIPS,
    Permission.REQUEST_LEAVE,
    Permission.VIEW_OWN_LEAVE,
    Permission.CANCEL_OWN_LEAVE,
    Permission.RECORD_OWN_ILLNESS,
    Permission.VIEW_OWN_ILLNESS,

    // HR specific permissions
    Permission.VIEW_ALL_EMPLOYEES,
    Permission.VIEW_EMPLOYEE_DETAILS,
    Permission.EDIT_EMPLOYEE_DETAILS,
    Permission.APPROVE_LEAVE,
    Permission.REJECT_LEAVE,
    Permission.VIEW_ALL_LEAVE,
    Permission.MANAGE_ILLNESS_RECORDS,
    Permission.VIEW_PAYROLL_REPORTS,
  ],
  admin: [
    // Include all permissions
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_PAYSLIPS,
    Permission.REQUEST_LEAVE,
    Permission.VIEW_OWN_LEAVE,
    Permission.CANCEL_OWN_LEAVE,
    Permission.RECORD_OWN_ILLNESS,
    Permission.VIEW_OWN_ILLNESS,

    Permission.VIEW_ALL_EMPLOYEES,
    Permission.VIEW_EMPLOYEE_DETAILS,
    Permission.EDIT_EMPLOYEE_DETAILS,
    Permission.APPROVE_LEAVE,
    Permission.REJECT_LEAVE,
    Permission.VIEW_ALL_LEAVE,
    Permission.MANAGE_ILLNESS_RECORDS,
    Permission.VIEW_PAYROLL_REPORTS,

    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.MANAGE_PERMISSIONS,
    Permission.CREATE_PAYSLIPS,
    Permission.EDIT_PAYSLIPS,
    Permission.DELETE_PAYSLIPS,
    Permission.VIEW_SYSTEM_LOGS,
    Permission.CONFIGURE_SYSTEM,
    Permission.MANAGE_DOCUMENTS,
  ],
}

// Custom permissions for specific users
export interface CustomUserPermissions {
  userId: string
  grantedPermissions: Permission[]
  deniedPermissions: Permission[]
}
