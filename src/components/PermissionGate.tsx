import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Permission, rbacService } from '../services/rbacService';

interface PermissionGateProps {
    permission: Permission;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * A wrapper component that only renders its children if the current user
 * has the required permission.
 * 
 * Usage:
 * <PermissionGate permission={Permission.EDIT_EMPLOYEES}>
 *   <EditButton />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
    permission,
    children,
    fallback = null,
}) => {
    const { user } = useAuth();
    const hasAccess = rbacService.hasPermission(user, permission);

    if (!hasAccess) {
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
};
