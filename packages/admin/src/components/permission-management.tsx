"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { Card } from "../../../core/src/components/ui/card"
import { Input } from "../../../core/src/components/ui/input"
import { Badge } from "../../../core/src/components/ui/badge"
import { getAllEmployees } from "../../../employees/src/employee-service"
import { getUserRole } from "../../../auth/src/auth-service"
import { Permission, RolePermissions, type RoleType } from "../../../core/src/types/permissions"
import {
  getUserPermissions,
  getUserCustomPermissions,
  grantPermission,
  denyPermission,
  resetUserCustomPermissions,
} from "../../../core/src/services/permission-service"
import { Shield, User, Check, X, RefreshCw } from "lucide-react-native"

interface PermissionManagementProps {
  userId: string
}

export const PermissionManagement = ({ userId }: PermissionManagementProps) => {
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; role: RoleType }>>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [employeePermissions, setEmployeePermissions] = useState<Permission[]>([])
  const [customPermissions, setCustomPermissions] = useState<{
    grantedPermissions: Permission[]
    deniedPermissions: Permission[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true)
        setError(null)

        const fetchedEmployees = await getAllEmployees()
        
        // Get role for each employee
        const employeesWithRoles = await Promise.all(
          fetchedEmployees.map(async (employee) => {
            const role = await getUserRole(employee.userId) as RoleType
            return {
              id: employee.id,
              name: `${employee.firstName} ${employee.lastName}`,
              role: role || "employee",
            }
          })
        )

        setEmployees(employeesWithRoles)
      } catch (err: any) {
        setError(err.message || "Failed to fetch employees")
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  useEffect(() => {
    const fetchEmployeePermissions = async () => {
      if (!selectedEmployeeId) return

      try {
        setLoading(true)
        setError(null)

        const employee = employees.find(e => e.id === selectedEmployeeId)
        if (!employee) return

        // Get all permissions for the employee
        const permissions = await getUserPermissions(employee.id)
        setEmployeePermissions(permissions)

        // Get custom permissions
        const custom = await getUserCustomPermissions(employee.id)
        setCustomPermissions(custom ? {
          grantedPermissions: custom.grantedPermissions,
          deniedPermissions: custom.deniedPermissions,
        } : {
          grantedPermissions: [],
          deniedPermissions: [],
        })
      } catch (err: any) {
        setError(err.message || "Failed to fetch employee permissions")
      } finally {
        setLoading(false)
      }
    }

    fetchEmployeePermissions()
  }, [selectedEmployeeId, employees])

  const handleGrantPermission = async (permission: Permission) => {
    if (!selectedEmployeeId) return

    try {
      await grantPermission(selectedEmployeeId, permission)
      
      // Update local state
      setCustomPermissions(prev => {
        if (!prev) return {
          grantedPermissions: [permission],
          deniedPermissions: [],
        }

        return {
          grantedPermissions: [...prev.grantedPermissions, permission],
          deniedPermissions: prev.deniedPermissions.filter(p => p !== permission),
        }
      })

      // Update employee permissions
      if (!employeePermissions.includes(permission)) {
        setEmployeePermissions(prev => [...prev, permission])
      }
    } catch (err: any) {
      setError(err.message || "Failed to grant permission")
    }
  }

  const handleDenyPermission = async (permission: Permission) => {
    if (!selectedEmployeeId) return

    try {
      await denyPermission(selectedEmployeeId, permission)
      
      // Update local state
      setCustomPermissions(prev => {
        if (!prev) return {
          grantedPermissions: [],
          deniedPermissions: [permission],
        }

        return {
          grantedPermissions: prev.grantedPermissions.filter(p => p !== permission),
          deniedPermissions: [...prev.deniedPermissions, permission],
        }
      })

      // Update employee permissions
      setEmployeePermissions(prev => prev.filter(p => p !== permission))
    } catch (err: any) {
      setError(err.message || "Failed to deny permission")
    }
  }

  const handleResetPermissions = async () => {
    if (!selectedEmployeeId) return

    try {
      await resetUserCustomPermissions(selectedEmployeeId)
      
      // Update local state
      setCustomPermissions({
        grantedPermissions: [],
        deniedPermissions: [],
      })

      // Refresh employee permissions
      const employee = employees.find(e => e.id === selectedEmployeeId)
      if (employee) {
        const rolePermissions = RolePermissions[employee.role] || []
        setEmployeePermissions(rolePermissions)
      }
    } catch (err: any) {
      setError(err.message || "Failed to reset permissions")
    }
  }

  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isPermissionGranted = (permission: Permission) => {
    return employeePermissions.includes(permission)
  }

  const isCustomGranted = (permission: Permission) => {
    return customPermissions?.grantedPermissions.includes(permission) || false
  }

  const isCustomDenied = (permission: Permission) => {
    return customPermissions?.deniedPermissions.includes(permission) || false
  }

  const renderPermissionItem = (permission: Permission) => {
    const isGranted = isPermissionGranted(permission)
    const isCustomG = isCustomGranted(permission)
    const isCustomD = isCustomDenied(permission)

    return (
      <View key={permission} style={styles.permissionItem}>
        <View style={styles.permissionInfo}>
          <Text style={styles.permissionName}>{permission.replace(/_/g, " ").toUpperCase()}</Text>
          <Badge
            text={isGranted ? "Granted" : "Denied"}
            variant={isGranted ? "success" : "error"}
          />
          {(isCustomG || isCustomD) && (
            <Badge
              text="Custom"
              variant="warning"
              style={styles.customBadge}
            />
          )}
        </View>
        <View style={styles.permissionActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.grantButton,
              isGranted && styles.activeButton,
            ]}
            onPress={() => handleGrantPermission(permission)}
          >
            <Check size={16} color={isGranted ? "#fff" : "#48bb78"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.denyButton,
              !isGranted && styles.activeButton,
            ]}
            onPress={() => handleDenyPermission(permission)}
          >
            <X size={16} color={!isGranted ? "#fff" : "#e53e3e"} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Permission Management</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <User size={20} color="#4a5568" />
          <Text style={styles.cardTitle}>Select Employee</Text>
        </View>

        <Input
          placeholder="Search employees..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          fullWidth
        />

        <ScrollView style={styles.employeeList} horizontal>
          {filteredEmployees.map((employee) => (
            <TouchableOpacity
              key={employee.id}
              style={[
                styles.employeeItem,
                selectedEmployeeId === employee.id && styles.selectedEmployee,
              ]}
              onPress={() => setSelectedEmployeeId(employee.id)}
            >
              <Text style={styles.employeeName}>{employee.name}</Text>
              <Badge
                text={employee.role.replace("_", " ").toUpperCase()}
                variant={
                  employee.role === "admin"
                    ? "primary"
                    : employee.role === "hr_advisor"
                    ? "warning"
                    : "default"
                }
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>

      {selectedEmployeeId && (
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Shield size={20} color="#4a5568" />
            <Text style={styles.cardTitle}>Manage Permissions</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetPermissions}
            >
              <RefreshCw size={16} color="#4a5568" />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.permissionsList}>
            {Object.values(Permission).map(renderPermissionItem)}
          </View>
        </Card>
      )}
    </ScrollView>
  )
