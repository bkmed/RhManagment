import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore"
import { type Permission, RolePermissions, type CustomUserPermissions, type RoleType } from "../types/permissions"
import { getUserRole } from "../../../auth/src/auth-service"

// Initialize Firestore
const db = getFirestore()

// Cache for custom user permissions
const userPermissionsCache = new Map<string, CustomUserPermissions>()

/**
 * Check if a user has a specific permission
 */
export const hasPermission = async (userId: string, permission: Permission): Promise<boolean> => {
  try {
    // Get user role
    const role = await getUserRole(userId)
    if (!role) return false

    // Get role-based permissions
    const rolePermissions = RolePermissions[role as RoleType] || []

    // Check if permission is granted by role
    if (rolePermissions.includes(permission)) {
      // Check if there are custom permissions that deny this permission
      const customPermissions = await getUserCustomPermissions(userId)
      if (customPermissions && customPermissions.deniedPermissions.includes(permission)) {
        return false
      }
      return true
    }

    // Check if there are custom permissions that grant this permission
    const customPermissions = await getUserCustomPermissions(userId)
    if (customPermissions && customPermissions.grantedPermissions.includes(permission)) {
      return true
    }

    return false
  } catch (error) {
    console.error("Error checking permission:", error)
    return false
  }
}

/**
 * Get all permissions for a user
 */
export const getUserPermissions = async (userId: string): Promise<Permission[]> => {
  try {
    // Get user role
    const role = await getUserRole(userId)
    if (!role) return []

    // Get role-based permissions
    const rolePermissions = RolePermissions[role as RoleType] || []

    // Get custom permissions
    const customPermissions = await getUserCustomPermissions(userId)

    if (!customPermissions) {
      return rolePermissions
    }

    // Combine role permissions with granted custom permissions, and remove denied permissions
    const allPermissions = [...rolePermissions, ...customPermissions.grantedPermissions].filter(
      (permission) => !customPermissions.deniedPermissions.includes(permission),
    )

    // Remove duplicates
    return [...new Set(allPermissions)]
  } catch (error) {
    console.error("Error getting user permissions:", error)
    return []
  }
}

/**
 * Get custom permissions for a user
 */
export const getUserCustomPermissions = async (userId: string): Promise<CustomUserPermissions | null> => {
  try {
    // Check cache first
    if (userPermissionsCache.has(userId)) {
      return userPermissionsCache.get(userId) || null
    }

    const permissionsRef = doc(db, "userPermissions", userId)
    const permissionsSnap = await getDoc(permissionsRef)

    if (permissionsSnap.exists()) {
      const customPermissions = permissionsSnap.data() as CustomUserPermissions
      userPermissionsCache.set(userId, customPermissions)
      return customPermissions
    }

    return null
  } catch (error) {
    console.error("Error getting custom user permissions:", error)
    return null
  }
}

/**
 * Set custom permissions for a user
 */
export const setUserCustomPermissions = async (
  userId: string,
  grantedPermissions: Permission[],
  deniedPermissions: Permission[],
): Promise<void> => {
  try {
    const permissionsRef = doc(db, "userPermissions", userId)

    const customPermissions: CustomUserPermissions = {
      userId,
      grantedPermissions,
      deniedPermissions,
    }

    await setDoc(permissionsRef, customPermissions)

    // Update cache
    userPermissionsCache.set(userId, customPermissions)
  } catch (error) {
    console.error("Error setting custom user permissions:", error)
    throw error
  }
}

/**
 * Grant a specific permission to a user
 */
export const grantPermission = async (userId: string, permission: Permission): Promise<void> => {
  try {
    const customPermissions = (await getUserCustomPermissions(userId)) || {
      userId,
      grantedPermissions: [],
      deniedPermissions: [],
    }

    // Remove from denied if present
    customPermissions.deniedPermissions = customPermissions.deniedPermissions.filter((p) => p !== permission)

    // Add to granted if not already present
    if (!customPermissions.grantedPermissions.includes(permission)) {
      customPermissions.grantedPermissions.push(permission)
    }

    await setUserCustomPermissions(userId, customPermissions.grantedPermissions, customPermissions.deniedPermissions)
  } catch (error) {
    console.error("Error granting permission:", error)
    throw error
  }
}

/**
 * Deny a specific permission to a user
 */
export const denyPermission = async (userId: string, permission: Permission): Promise<void> => {
  try {
    const customPermissions = (await getUserCustomPermissions(userId)) || {
      userId,
      grantedPermissions: [],
      deniedPermissions: [],
    }

    // Remove from granted if present
    customPermissions.grantedPermissions = customPermissions.grantedPermissions.filter((p) => p !== permission)

    // Add to denied if not already present
    if (!customPermissions.deniedPermissions.includes(permission)) {
      customPermissions.deniedPermissions.push(permission)
    }

    await setUserCustomPermissions(userId, customPermissions.grantedPermissions, customPermissions.deniedPermissions)
  } catch (error) {
    console.error("Error denying permission:", error)
    throw error
  }
}

/**
 * Reset custom permissions for a user
 */
export const resetUserCustomPermissions = async (userId: string): Promise<void> => {
  try {
    const permissionsRef = doc(db, "userPermissions", userId)
    await setDoc(permissionsRef, {
      userId,
      grantedPermissions: [],
      deniedPermissions: [],
    })

    // Update cache
    userPermissionsCache.set(userId, {
      userId,
      grantedPermissions: [],
      deniedPermissions: [],
    })
  } catch (error) {
    console.error("Error resetting custom user permissions:", error)
    throw error
  }
}

/**
 * Clear the permissions cache
 */
export const clearPermissionsCache = (): void => {
  userPermissionsCache.clear()
}
