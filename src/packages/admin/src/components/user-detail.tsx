"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { useTranslation } from "react-i18next"
import { Card } from "../../../core/src/components/ui/card"
import { Button } from "../../../core/src/components/ui/button"
import { Separator } from "../../../core/src/components/ui/separator"
import { Badge } from "../../../core/src/components/ui/badge"
import { ChevronLeft, Edit, Trash2, Shield } from "lucide-react-native"
import { getUserById, deleteUser } from "../user-service"
import { UserForm } from "./user-form"

interface UserDetailProps {
  userId: string
  onBack: () => void
  onDeleted: () => void
}

export const UserDetail: React.FC<UserDetailProps> = ({ userId, onBack, onDeleted }) => {
  const { t } = useTranslation()
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await getUserById(userId)
      setUser(userData)
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleDelete = async () => {
    if (confirm(t("userManagement.deleteConfirm"))) {
      try {
        await deleteUser(userId)
        onDeleted()
      } catch (err: any) {
        setError(err.message || t("common.error"))
      }
    }
  }

  const handleEditComplete = () => {
    setIsEditing(false)
    fetchUserData()
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "primary"
      case "advisor":
        return "warning"
      default:
        return "default"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "inactive":
        return "default"
      case "suspended":
        return "error"
      default:
        return "default"
    }
  }

  if (isEditing) {
    return <UserForm user={user} isEditing={true} onClose={handleEditComplete} />
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
        <Text style={styles.title}>{t("userManagement.userManagement")}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>{t("common.loading")}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title={t("common.retry")} onPress={fetchUserData} style={styles.retryButton} />
        </View>
      ) : !user ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t("common.noData")}</Text>
          <Button title={t("common.back")} onPress={onBack} style={styles.retryButton} />
        </View>
      ) : (
        <Card style={styles.userCard}>
          <View style={styles.userHeader}>
            <View>
              <Text style={styles.userName}>{user.displayName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <View style={styles.badgesContainer}>
              <Badge text={user.role} variant={getRoleBadgeVariant(user.role)} style={styles.badge} />
              <Badge text={user.status} variant={getStatusBadgeVariant(user.status)} style={styles.badge} />
            </View>
          </View>

          <Separator style={styles.separator} />

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("auth.email")}:</Text>
              <Text style={styles.detailValue}>{user.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("userManagement.role")}:</Text>
              <Text style={styles.detailValue}>{user.role}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("userManagement.status")}:</Text>
              <Text style={styles.detailValue}>{user.status}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("common.createdAt")}:</Text>
              <Text style={styles.detailValue}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </Text>
            </View>
            {user.lastLogin && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t("userManagement.lastLogin")}:</Text>
                <Text style={styles.detailValue}>{new Date(user.lastLogin).toLocaleDateString()}</Text>
              </View>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <Button
              title={t("userManagement.managePermissions")}
              leftIcon={<Shield size={18} color="#fff" />}
              style={styles.actionButton}
            />
            <Button
              title={t("common.edit")}
              leftIcon={<Edit size={18} color="#fff" />}
              onPress={handleEdit}
              style={styles.actionButton}
            />
            <Button
              title={t("common.delete")}
              leftIcon={<Trash2 size={18} color="#fff" />}
              variant="danger"
              onPress={handleDelete}
              style={styles.actionButton}
            />
          </View>
        </Card>
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
  userCard: {
    margin: 16,
    padding: 16,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#718096",
  },
  badgesContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  badge: {
    marginBottom: 8,
  },
  separator: {
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  detailLabel: {
    width: 120,
    fontSize: 16,
    fontWeight: "500",
    color: "#4a5568",
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: "#2d3748",
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginHorizontal: -4,
  },
  actionButton: {
    margin: 4,
    flex: 1,
    minWidth: "30%",
  },
})
