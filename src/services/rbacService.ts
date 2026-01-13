import { User } from './authService';

export enum Role {
    ADMIN = 'admin',
    RH = 'rh',
    MANAGER = 'manager',
    EMPLOYEE = 'employee',
    UNDEFINED = 'undefined',
}

export enum Permission {
    // Employee Management
    VIEW_EMPLOYEES = 'view_employees',
    EDIT_EMPLOYEES = 'edit_employees',
    ADD_EMPLOYEES = 'add_employees',
    DELETE_EMPLOYEES = 'delete_employees',

    // Payroll
    VIEW_PAYROLL = 'view_payroll',
    MANAGE_PAYROLL = 'manage_payroll',

    // Leaves & Claims
    APPROVE_LEAVES = 'approve_leaves',
    APPROVE_CLAIMS = 'approve_claims',

    // Settings
    MANAGE_SETTINGS = 'manage_settings',
    MANAGE_COMPANY = 'manage_company',
    MANAGE_TEAMS = 'manage_teams',
    MANAGE_INVOICES = 'manage_invoices',
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.ADMIN]: [
        Permission.VIEW_EMPLOYEES,
        Permission.ADD_EMPLOYEES,
        Permission.EDIT_EMPLOYEES,
        Permission.DELETE_EMPLOYEES,
        Permission.MANAGE_COMPANY,
        Permission.MANAGE_TEAMS,
        Permission.APPROVE_LEAVES,
        Permission.MANAGE_SETTINGS,
        Permission.MANAGE_PAYROLL,
        Permission.MANAGE_INVOICES,
    ],
    [Role.RH]: [
        Permission.VIEW_EMPLOYEES,
        Permission.ADD_EMPLOYEES,
        Permission.EDIT_EMPLOYEES,
        Permission.DELETE_EMPLOYEES,
        Permission.VIEW_PAYROLL,
        Permission.MANAGE_PAYROLL,
        Permission.APPROVE_LEAVES,
        Permission.APPROVE_CLAIMS,
        Permission.MANAGE_TEAMS,
        Permission.MANAGE_INVOICES,
    ],
    [Role.MANAGER]: [
        Permission.VIEW_EMPLOYEES, // Can restrict to own team in logic
        Permission.APPROVE_LEAVES,
        Permission.APPROVE_CLAIMS,
    ],
    [Role.EMPLOYEE]: [
        // Basic employee permissions are mostly handled by "isMe" checks or public routes
    ],
    [Role.UNDEFINED]: [],
};

class RbacService {
    /**
     * Check if a user has a specific permission
     */
    hasPermission(user: User | null, permission: Permission): boolean {
        if (!user) return false;

        // Normalize role string to enum
        const userRole = this.getUserRole(user);
        const permissions = ROLE_PERMISSIONS[userRole] || [];

        return permissions.includes(permission);
    }

    /**
     * Get valid Role enum from user object
     */
    getUserRole(user: User): Role {
        if (!user || !user.role) return Role.UNDEFINED;

        const roleStr = user.role.toLowerCase();
        if (Object.values(Role).includes(roleStr as Role)) {
            return roleStr as Role;
        }

        return Role.UNDEFINED;
    }

    /**
     * Check if user is an Admin
     */
    isAdmin(user: User | null): boolean {
        return this.getUserRole(user as User) === Role.ADMIN;
    }

    /**
     * Check if user is RH (or Admin, as Admin usually has superset, but strictly checking role here)
     */
    isRH(user: User | null): boolean {
        return this.getUserRole(user as User) === Role.RH;
    }

    /**
     * Check if user is Manager
     */
    isManager(user: User | null): boolean {
        return this.getUserRole(user as User) === Role.MANAGER;
    }

    /**
     * Check if user is Employee
     */
    isEmployee(user: User | null): boolean {
        return this.getUserRole(user as User) === Role.EMPLOYEE;
    }

    /**
     * Check if user is a Manager with a team and company assigned
     */
    isFullyAssignedManager(user: User | null): boolean {
        if (!user) return false;
        return (
            this.isManager(user) &&
            !!user.teamId &&
            !!user.companyId &&
            !!user.employeeId
        );
    }

    /**
     * Alias for isFullyAssignedManager for Team Leader terminology
     */
    isFullyAssignedTeamLeader(user: User | null): boolean {
        return this.isFullyAssignedManager(user);
    }

    /**
     * Check if user is RH with a company assigned
     */
    isFullyAssignedRH(user: User | null): boolean {
        if (!user) return false;
        return this.isRH(user) && !!user.companyId && !!user.employeeId;
    }
}

export const rbacService = new RbacService();
