"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Image, Platform } from "react-native"
import { type Employee, getEmployeeByUserId, updateEmployee } from "../employee-service"
import { getCurrentUser } from "../../../auth/src/auth-service"
import { Button } from "../../../core/src/components/ui/button"
import { Input } from "../../../core/src/components/ui/input"
import { Card } from "../../../core/src/components/ui/card"
import { Camera, Upload, ChevronLeft } from "lucide-react-native"
import { useTranslation } from "react-i18next"

interface EditProfileProps {
  onBack: () => void
  onProfileUpdated?: (employee: Employee) => void
}

export const EditProfile = ({ onBack, onProfileUpdated }: EditProfileProps) => {
  const { t } = useTranslation()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Employee>>({})
  const [profileImage, setProfileImage] = useState<File | null>(null)

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
          setFormData({
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            phone: employeeData.phone || "",
            address: employeeData.address || "",
            emergencyContact: employeeData.emergencyContact || {
              name: "",
              relationship: "",
              phone: "",
            },
          })
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

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfileImage(event.target.files[0])
    }
  }

  const handleSaveProfile = async () => {
    if (!employee) return

    try {
      setSaving(true)
      setError(null)

      // Upload profile image if selected
      const updatedData = { ...formData }
      if (profileImage) {
        // In a real app, you would upload the image to storage and get the URL
        // For now, we'll just simulate this
        // updatedData.profilePicture = await uploadProfileImage(employee.id, profileImage)
      }

      const updatedEmployee = await updateEmployee(employee.id, updatedData)
      setEmployee(updatedEmployee)

      if (onProfileUpdated) {
        onProfileUpdated(updatedEmployee)
      }

      onBack()
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>{t("common.loading")}</Text>
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
        <Text>{t("profile.noProfile")}</Text>
      </View>
    )
  }

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
        <Text style={styles.title}>{t("profile.editProfile")}</Text>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: URL.createObjectURL(profileImage) }} style={styles.profileImage} />
            ) : employee.profilePicture ? (
              <Image source={{ uri: employee.profilePicture }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>
                  {`${formData.firstName?.charAt(0) || ""}${formData.lastName?.charAt(0) || ""}`}
                </Text>
              </View>
            )}
          </View>

          {Platform.OS === "web" && (
            <View style={styles.imageUploadButtons}>
              <Button
                title={t("profile.takePhoto")}
                leftIcon={<Camera size={16} color="#fff" />}
                variant="outline"
                style={styles.imageButton}
              />
              <label htmlFor="profile-upload" style={{ width: "100%" }}>
                <Button
                  title={t("profile.uploadPhoto")}
                  leftIcon={<Upload size={16} color="#fff" />}
                  style={styles.imageButton}
                  onPress={() => document.getElementById("profile-upload")?.click()}
                />
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
              </label>
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>{t("profile.personalInformation")}</Text>

          <Input
            label={t("profile.firstName")}
            value={formData.firstName}
            onChangeText={(value) => handleInputChange("firstName", value)}
            fullWidth
            style={styles.input}
          />

          <Input
            label={t("profile.lastName")}
            value={formData.lastName}
            onChangeText={(value) => handleInputChange("lastName", value)}
            fullWidth
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>{t("profile.contactInformation")}</Text>

          <Input label={t("profile.email")} value={employee.email} editable={false} fullWidth style={styles.input} />

          <Input
            label={t("profile.phone")}
            value={formData.phone as string}
            onChangeText={(value) => handleInputChange("phone", value)}
            fullWidth
            style={styles.input}
          />

          <Input
            label={t("profile.address")}
            value={formData.address as string}
            onChangeText={(value) => handleInputChange("address", value)}
            fullWidth
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>{t("profile.emergencyContact")}</Text>

          <Input
            label={t("profile.name")}
            value={formData.emergencyContact?.name}
            onChangeText={(value) => handleEmergencyContactChange("name", value)}
            fullWidth
            style={styles.input}
          />

          <Input
            label={t("profile.relationship")}
            value={formData.emergencyContact?.relationship}
            onChangeText={(value) => handleEmergencyContactChange("relationship", value)}
            fullWidth
            style={styles.input}
          />

          <Input
            label={t("profile.phone")}
            value={formData.emergencyContact?.phone}
            onChangeText={(value) => handleEmergencyContactChange("phone", value)}
            fullWidth
            style={styles.input}
          />

          <View style={styles.buttonGroup}>
            <Button title={t("common.cancel")} variant="outline" onPress={onBack} style={styles.cancelButton} />
            <Button
              title={saving ? t("common.saving") : t("common.save")}
              onPress={handleSaveProfile}
              disabled={saving}
            />
          </View>
        </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d3748",
  },
  profileCard: {
    padding: 20,
  },
  profileImageSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#0070f3",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
  },
  imageUploadButtons: {
    flexDirection: "column",
    width: "100%",
    maxWidth: 300,
    gap: 8,
  },
  imageButton: {
    marginBottom: 8,
  },
  formSection: {
    width: "100%",
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
  input: {
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
