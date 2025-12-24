"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Image, Platform } from "react-native"
import { type Employee, getEmployeeByUserId, updateEmployee } from "../employee-service"
import { getCurrentUser } from "../../../auth/src/auth-service"
import { Button } from "../../../core/src/components/ui/button"
import { Card } from "../../../core/src/components/ui/card"
import { EditProfile } from "./edit-profile"

export const EmployeeProfile = () => {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Employee>>({})
  const [showEditProfile, setShowEditProfile] = useState(false)

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const currentUser = getCurrentUser()
        if (!currentUser) {
          setError("User not authenticated")
          setLoading(false)
          return
        }

        const employeeData = await getEmployeeByUserId(currentUser.uid)
        if (employeeData) {
          setEmployee(employeeData)
          setFormData(employeeData)
        } else {
          setError("Employee profile not found")
        }
      } catch (err: any) {
        setError(err.message || "Failed to load employee data")
      } finally {
        setLoading(false)
      }
    }

    fetchEmployeeData()
  }, [])

  const handleInputChange = (field: keyof Employee, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = async () => {
    if (!employee) return

    try {
      setLoading(true)
      const updatedEmployee = await updateEmployee(employee.id, formData)
      setEmployee(updatedEmployee)
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdated = (updatedEmployee: Employee) => {
    setEmployee(updatedEmployee)
    setFormData(updatedEmployee)
    setShowEditProfile(false)
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  if (!employee) {
    return (
      <View style={styles.container}>
        <Text>No employee profile found</Text>
      </View>
    )
  }

  if (showEditProfile) {
    return <EditProfile onBack={() => setShowEditProfile(false)} onProfileUpdated={handleProfileUpdated} />
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {employee.profilePicture ? (
              <Image source={{ uri: employee.profilePicture }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {`${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.name}>{`${employee.firstName} ${employee.lastName}`}</Text>
            <Text style={styles.position}>{employee.position}</Text>
            <Text style={styles.department}>{employee.department}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{employee.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{employee.phone || "Not provided"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{employee.address || "Not provided"}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Employment Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hire Date:</Text>
            <Text style={styles.infoValue}>{employee.hireDate}</Text>
          </View>
        </View>

        {employee.emergencyContact && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{employee.emergencyContact.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Relationship:</Text>
              <Text style={styles.infoValue}>{employee.emergencyContact.relationship}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{employee.emergencyContact.phone}</Text>
            </View>
          </View>
        )}

        <Button
          title="Edit Profile"
          variant="outline"
          onPress={() => setShowEditProfile(true)}
          style={styles.editButton}
        />
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7fafc",
  },
  profileCard: {
    padding: 20,
  },
  header: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageContainer: {
    marginRight: Platform.OS === "web" ? 20 : 0,
    marginBottom: Platform.OS === "web" ? 0 : 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0070f3",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },
  headerInfo: {
    flex: 1,
    alignItems: Platform.OS === "web" ? "flex-start" : "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3748",
  },
  position: {
    fontSize: 18,
    color: "#4a5568",
    marginTop: 4,
  },
  department: {
    fontSize: 16,
    color: "#718096",
    marginTop: 2,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontWeight: "500",
    color: "#4a5568",
  },
  infoValue: {
    flex: 1,
    color: "#2d3748",
  },
  editButton: {
    marginTop: 16,
  },
  editForm: {
    marginTop: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelButton: {
    marginRight: 12,
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 16,
    textAlign: "center",
  },
})
