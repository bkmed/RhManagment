"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Switch } from "react-native"
import { useTranslation } from "react-i18next"
import { Card } from "../../../core/src/components/ui/card"
import { Button } from "../../../core/src/components/ui/button"
import { Separator } from "../../../core/src/components/ui/separator"
import { ChevronLeft, Shield, RefreshCw } from "lucide-react-native"
import {
  Permission,
  RolePermissions,
  type RoleType,
  type CustomUserPermissions,
} from "../../../core/src/types/permissions"
import {
  getUserCustomPermissions,
  setUserCustomPermissions,
  resetUserCustomPermissions,
} from "../../../core/src/services/permission-service"

interface RolePermissionsProps {
  userId: string
  role: RoleType
  onBack: () => void
}

export const RolePermissionsScreen: React.FC<RolePermissionsProps> = ({ userId, role, onBack }) => {
  const { t } = useTranslation()
  const [customPermissions, setCustomPermissions] = useState<CustomUserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create a state object for each permission
  const [permissionStates, setPermissionStates] = useState<Record<Permission, boolean>>(
    {} as Record<Permission, boolean>,
  )

  // Get default permissions for the role
  const defaultRolePermissions = RolePermissions[role] || []

  useEffect(() => {
    fetchUserPermissions()
  }, [userId])

  const fetchUserPermissions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get custom permissions for the user
      const userCustomPermissions = await getUserCustomPermissions(userId)
      setCustomPermissions(userCustomPermissions)

      // Initialize permission states based on role defaults and any custom overrides
      const initialPermissionStates = {} as Record<Permission, boolean>

      // Start with all permissions set to false
      Object.values(Permission).forEach((permission) => {
        initialPermissionStates[permission] = false
      })

      // Apply role-based permissions
      defaultRolePermissions.forEach((permission) => {
        initialPermissionStates[permission] = true
      })

      // Apply custom overrides
      if (userCustomPermissions) {
        // Grant custom permissions
        userCustomPermissions.grantedPermissions.forEach((permission) => {
          initialPermissionStates[permission as Permission] = true
        })

        // Deny custom permissions
        userCustomPermissions.deniedPermissions.forEach((permission) => {
          initialPermissionStates[permission as Permission] = false
        })
      }

      setPermissionStates(initialPermissionStates)
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePermission = (permission: Permission) => {
    setPermissionStates((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }))
  }

  const handleSavePermissions = async () => {
    try {
      setSaving(true)
      setError(null)

      // Determine which permissions are different from the default role permissions
      const grantedPermissions: Permission[] = []
      const deniedPermissions: Permission[] = []

      Object.entries(permissionStates).forEach(([permission, isGranted]) => {
        const isDefaultGranted = defaultRolePermissions.includes(permission as Permission)

        // If the permission is granted but not by default, add to grantedPermissions
        if (isGranted && !isDefaultGranted) {
          grantedPermissions.push(permission as Permission)
        }

        // If the permission is not granted but is granted by default, add to deniedPermissions
        if (!isGranted && isDefaultGranted) {
          deniedPermissions.push(permission as Permission)
        }
      })

      // Save the custom permissions
      await setUserCustomPermissions(userId, grantedPermissions, deniedPermissions)

      // Refresh the permissions
      await fetchUserPermissions()
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setSaving(false)
    }
  }

  const handleResetPermissions = async () => {
    try {
      setSaving(true)
      setError(null)

      // Reset the user's custom permissions
      await resetUserCustomPermissions(userId)

      // Refresh the permissions
      await fetchUserPermissions()
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setSaving(false)
    }
  }

  const isCustomPermission = (permission: Permission): boolean => {
    if (!customPermissions) return false

    return (
      customPermissions.grantedPermissions.includes(permission) ||
      customPermissions.deniedPermissions.includes(permission)
    )
  }

  const groupPermissionsByCategory = () => {
    const employeePermissions = Object.values(Permission).filter(
      (p) =>
        p.startsWith("view_own") || p.startsWith("edit_own") || p.startsWith("request_") || p.startsWith("cancel_own"),
    )
    const hrPermissions = Object.values(Permission).filter(
      (p) => p.startsWith("view_all") || p.startsWith("approve_") || p.startsWith("reject_") || p.startsWith("manage_"),
    )
    const adminPermissions = Object.values(Permission).filter(
      (p) => !employeePermissions.includes(p) && !hrPermissions.includes(p),
    )

    return { employeePermissions, hrPermissions, adminPermissions }
  }

  const { employeePermissions, hrPermissions, adminPermissions } = groupPermissionsByCategory()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button
          variant="ghost"
          leftIcon={<ChevronLeft size={20} color="#4a5568" />}
          title={t("common.back")}
          onPress={onBack}
          style={styles.backButton}
        />
        <Text style={styles.title}>{t("permissions.managePermissions")}</Text>
        <Button
          variant="ghost"
          leftIcon={<RefreshCw size={20} color="#4a5568" />}
          onPress={handleResetPermissions}
          disabled={saving || loading || !customPermissions}
          style={styles.resetButton}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>{t("common.loading")}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title={t("common.retry")} onPress={fetchUserPermissions} style={styles.retryButton} />
        </View>
      ) : (
        <>
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Shield size={20} color="#4a5568" />
              <Text style={styles.infoTitle}>
                {t("userManagement.role")}: {role}
              </Text>
            </View>
            <Text style={styles.infoText}>{t("permissions.roleInfo")}</Text>
          </Card>

          <Card style={styles.permissionsCard}>
            <Text style={styles.sectionTitle}>{t("permissions.employeePermissions")}</Text>
            {employeePermissions.map((permission) => (
              <View key={permission} style={styles.permissionItem}>
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionName}>{permission.replace(/_/g, " ").toUpperCase()}</Text>
                  {isCustomPermission(permission) && <Text style={styles.customBadge}>{t("permissions.custom")}</Text>}
                </View>
                <Switch
                  value={permissionStates[permission]}
                  onValueChange={() => handleTogglePermission(permission)}
                  trackColor={{ false: "#cbd5e0", true: "#0070f3" }}
                />
              </View>
            ))}

            <Separator style={styles.separator} />

            <Text style={styles.sectionTitle}>{t("permissions.hrPermissions")}</Text>
            {hrPermissions.map((permission) => (
              <View key={permission} style={styles.permissionItem}>
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionName}>{permission.replace(/_/g, " ").toUpperCase()}</Text>
                  {isCustomPermission(permission) && <Text style={styles.customBadge}>{t("permissions.custom")}</Text>}
                </View>
                <Switch
                  value={permissionStates[permission]}
                  onValueChange={() => handleTogglePermission(permission)}
                  trackColor={{ false: "#cbd5e0", true: "#0070f3" }}
                />
              </View>
            ))}

            <Separator style={styles.separator} />

            <Text style={styles.sectionTitle}>{t("permissions.adminPermissions")}</Text>
            {adminPermissions.map((permission) => (
              <View key={permission} style={styles.permissionItem}>
                <View style={styles.permissionInfo}>
                  <Text style={styles.permissionName}>{permission.replace(/_/g, " ").toUpperCase()}</Text>
                  {isCustomPermission(permission) && <Text style={styles.customBadge}>{t("permissions.custom")}</Text>}
                </View>
                <Switch
                  value={permissionStates[permission]}
                  onValueChange={() => handleTogglePermission(permission)}
                  trackColor={{ false: "#cbd5e0", true: "#0070f3" }}
                />
              </View>
            ))}

            <Button
              title={saving ? t("common.saving") : t("common.save")}
              onPress={handleSavePermissions}
              disabled={saving}
              style={styles.saveButton}
            />
          </Card>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 8,
  },
  resetButton: {
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#e53e3e",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    minWidth: 120,
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#718096",
  },
  permissionsCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 12,
    marginTop: 8,
  },
  permissionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  permissionInfo: {
    flex: 1,
  },
  permissionName: {
    fontSize: 14,
    color: "#4a5568",
  },
  customBadge: {
    fontSize: 12,
    color: "#0070f3",
    fontWeight: "500",
  },
  separator: {
    marginVertical: 16,
  },
  saveButton: {
    marginTop: 24,
  },
})
