"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { useTranslation } from "react-i18next"
import { Card } from "../../../core/src/components/ui/card"
import { Button } from "../../../core/src/components/ui/button"
import { Input } from "../../../core/src/components/ui/input"
import { ChevronLeft } from "lucide-react-native"
import { createUser, updateUser } from "../user-service"

interface User {
  id: string
  email: string
  displayName: string
  role: string
  status: "active" | "inactive" | "suspended"
  lastLogin?: string
}

interface UserFormProps {
  user: User | null
  isEditing: boolean
  onClose: () => void
}

export const UserForm: React.FC<UserFormProps> = ({ user, isEditing, onClose }) => {
  const { t } = useTranslation()

  // Form state
  const [email, setEmail] = useState(user?.email || "")
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState(user?.role || "employee")
  const [status, setStatus] = useState(user?.status || "active")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    // Validate form
    if (!isEditing && (!email || !password || !confirmPassword || !displayName)) {
      setError(t("auth.allFieldsRequired"))
      return
    }

    if (isEditing && !displayName) {
      setError(t("auth.allFieldsRequired"))
      return
    }

    if (!isEditing && password !== confirmPassword) {
      setError(t("auth.passwordMismatch"))
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (isEditing && user) {
        // Update existing user
        await updateUser(user.id, {
          displayName,
          role,
          status,
        })
      } else {
        // Create new user
        await createUser({
          email,
          displayName,
          password,
          role,
          status,
        })
      }

      onClose()
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button
          variant="ghost"
          leftIcon={<ChevronLeft size={20} color="#4a5568" />}
          title={t("common.back")}
          onPress={onClose}
          style={styles.backButton}
        />
        <Text style={styles.title}>{isEditing ? t("userManagement.editUser") : t("userManagement.addUser")}</Text>
      </View>

      <Card style={styles.formCard}>
        {error && <Text style={styles.errorText}>{error}</Text>}

        <Input
          label={t("auth.fullName")}
          placeholder={t("auth.fullName")}
          value={displayName}
          onChangeText={setDisplayName}
          fullWidth
          style={styles.input}
        />

        <Input
          label={t("auth.email")}
          placeholder={t("auth.email")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isEditing} // Email cannot be changed when editing
          fullWidth
          style={styles.input}
        />

        {!isEditing && (
          <>
            <Input
              label={t("auth.password")}
              placeholder={t("auth.password")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              fullWidth
              style={styles.input}
            />

            <Input
              label={t("auth.confirmPassword")}
              placeholder={t("auth.confirmPassword")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              fullWidth
              style={styles.input}
            />
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("userManagement.role")}</Text>
          <View style={styles.roleButtons}>
            <Button
              title={t("auth.employee")}
              variant={role === "employee" ? "primary" : "outline"}
              onPress={() => setRole("employee")}
              style={styles.roleButton}
            />
            <Button
              title={t("auth.advisor")}
              variant={role === "advisor" ? "primary" : "outline"}
              onPress={() => setRole("advisor")}
              style={styles.roleButton}
            />
            <Button
              title={t("auth.admin")}
              variant={role === "admin" ? "primary" : "outline"}
              onPress={() => setRole("admin")}
              style={styles.roleButton}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("userManagement.status")}</Text>
          <View style={styles.statusButtons}>
            <Button
              title={t("userManagement.active")}
              variant={status === "active" ? "primary" : "outline"}
              onPress={() => setStatus("active")}
              style={styles.statusButton}
            />
            <Button
              title={t("userManagement.inactive")}
              variant={status === "inactive" ? "primary" : "outline"}
              onPress={() => setStatus("inactive")}
              style={styles.statusButton}
            />
            <Button
              title={t("userManagement.suspended")}
              variant={status === "suspended" ? "primary" : "outline"}
              onPress={() => setStatus("suspended")}
              style={styles.statusButton}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button title={t("common.cancel")} variant="outline" onPress={onClose} style={styles.actionButton} />
          <Button
            title={loading ? t("common.loading") : isEditing ? t("common.save") : t("userManagement.addUser")}
            disabled={loading}
            onPress={handleSubmit}
            style={[styles.actionButton, styles.submitButton]}
          />
        </View>
      </Card>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
  },
  formCard: {
    margin: 16,
    padding: 16,
  },
  errorText: {
    color: "#e53e3e",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4a5568",
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  statusButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  actionButton: {
    minWidth: 100,
    marginLeft: 8,
  },
  submitButton: {
    minWidth: 150,
  },
})
