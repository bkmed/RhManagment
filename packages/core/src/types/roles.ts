export type UserRole = "admin" | "advisor" | "employee"

export interface RolePermissions {
  canViewAllEmployees: boolean
  canEditEmployees: boolean
  canApproveLeaveRequests: boolean
  canManagePayroll: boolean
  canViewPayslips: boolean
  canEditPayslips: boolean
  canManageRoles: boolean
  canViewRecruitment: boolean
  canManageRecruitment: boolean
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    canViewAllEmployees: true,
    canEditEmployees: true,
    canApproveLeaveRequests: true,
    canManagePayroll: true,
    canViewPayslips: true,
    canEditPayslips: true,
    canManageRoles: true,
    canViewRecruitment: true,
    canManageRecruitment: true,
  },
  advisor: {
    canViewAllEmployees: true,
    canEditEmployees: false,
    canApproveLeaveRequests: true,
    canManagePayroll: false,
    canViewPayslips: true,
    canEditPayslips: false,
    canManageRoles: false,
    canViewRecruitment: true,
    canManageRecruitment: false,
  },
  employee: {
    canViewAllEmployees: false,
    canEditEmployees: false,
    canApproveLeaveRequests: false,
    canManagePayroll: false,
    canViewPayslips: true, // Can view their own payslips
    canEditPayslips: false,
    canManageRoles: false,
    canViewRecruitment: false,
    canManageRecruitment: false,
  },
}

export const hasPermission = (role: UserRole, permission: keyof RolePermissions): boolean => {
  return rolePermissions[role][permission]
}
