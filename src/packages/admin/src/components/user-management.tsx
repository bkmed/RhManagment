"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { useTranslation } from "react-i18next"
import { Card } from "../../../core/src/components/ui/card"
import { Button } from "../../../core/src/components/ui/button"
import { Input } from "../../../core/src/components/ui/input"
import { Badge } from "../../../core/src/components/ui/badge"
import { Search, Filter, Plus, Edit, Trash2 } from "lucide-react-native"
import { getAllUsers, deleteUser } from "../user-service"
import { UserForm } from "./user-form"

interface User {
  id: string
  email: string
  displayName: string
  role: string
  status: "active" | "inactive" | "suspended"
  lastLogin?: string
}

interface UserManagementProps {
  adminId: string
}

export const UserManagement: React.FC<UserManagementProps> = ({ adminId }) => {
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const fetchedUsers = await getAllUsers()
      setUsers(fetchedUsers)
      setFilteredUsers(fetchedUsers)
    } catch (err: any) {
      setError(err.message || t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    setIsAddingUser(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditingUser(true)
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
      setUsers(users.filter((user) => user.id !== userId))
      alert(t("userManagement.userDeleted"))
    } catch (err: any) {
      setError(err.message || t("common.error"))
    }
  }

  const handleUserFormClose = () => {
    setIsAddingUser(false)
    setIsEditingUser(false)
    setSelectedUser(null)
    fetchUsers()
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

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>

      <View style={styles.userMeta}>
        <Badge text={item.role} variant={getRoleBadgeVariant(item.role)} style={styles.badge} />
        <Badge text={item.status} variant={getStatusBadgeVariant(item.status)} style={styles.badge} />
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEditUser(item)}>
          <Edit size={18} color="#4a5568" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteUser(item.id)}>
          <Trash2 size={18} color="#e53e3e" />
        </TouchableOpacity>
      </View>
    </View>
  )

  if (isAddingUser || isEditingUser) {
    return <UserForm user={selectedUser} isEditing={isEditingUser} onClose={handleUserFormClose} />
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("userManagement.userManagement")}</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#718096" style={styles.searchIcon} />
          <Input
            placeholder={t("userManagement.search")}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            fullWidth
          />
        </View>
        <Button
          leftIcon={<Filter size={18} color="#fff" />}
          title={t("common.filter")}
          variant="outline"
          style={styles.filterButton}
        />
      </View>

      <Card style={styles.usersCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t("userManagement.users")}</Text>
          <Button
            leftIcon={<Plus size={18} color="#fff" />}
            title={t("userManagement.addUser")}
            onPress={handleAddUser}
            style={styles.addButton}
          />
        </View>

        {loading ? (
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        ) : filteredUsers.length === 0 ? (
          <Text style={styles.emptyText}>{t("common.noResults")}</Text>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.usersList}
          />
        )}
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7fafc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2d3748",
  },
  errorText: {
    color: "#e53e3e",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  searchIcon: {
    position: "absolute",
    zIndex: 1,
    left: 12,
  },
  searchInput: {
    paddingLeft: 40,
  },
  filterButton: {
    height: 44,
  },
  usersCard: {
    padding: 16,
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
  },
  addButton: {
    height: 36,
  },
  usersList: {
    paddingBottom: 16,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3748",
  },
  userEmail: {
    fontSize: 14,
    color: "#718096",
  },
  userMeta: {
    flexDirection: "row",
    marginRight: 16,
  },
  badge: {
    marginRight: 8,
  },
  userActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
  },
  loadingText: {
    textAlign: "center",
    padding: 16,
    color: "#718096",
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
    color: "#718096",
  },
})
