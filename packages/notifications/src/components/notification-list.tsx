"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native"
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "../notification-service"
import { Card } from "../../../core/src/components/ui/card"
import { Button } from "../../../core/src/components/ui/button"

interface NotificationListProps {
  userId: string
  onClose?: () => void
}

export const NotificationList = ({ userId, onClose }: NotificationListProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const userNotifications = await getUserNotifications(userId)
      setNotifications(userNotifications)
    } catch (err: any) {
      setError(err.message || "Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [userId])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userId)
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <Pressable
      style={[styles.notificationItem, item.read ? styles.read : styles.unread]}
      onPress={() => handleMarkAsRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      {!item.read && <View style={styles.unreadIndicator} />}
    </Pressable>
  )

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {notifications.some((n) => !n.read) && (
          <Button title="Mark all as read" variant="outline" onPress={handleMarkAllAsRead} />
        )}
      </View>

      {loading ? (
        <Text style={styles.message}>Loading notifications...</Text>
      ) : error ? (
        <Text style={styles.errorMessage}>{error}</Text>
      ) : notifications.length === 0 ? (
        <Text style={styles.message}>No notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      )}

      {onClose && <Button title="Close" variant="outline" onPress={onClose} style={styles.closeButton} />}
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
    width: "100%",
    maxWidth: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
  },
  list: {
    flex: 1,
  },
  notificationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
  },
  unread: {
    backgroundColor: "#ebf8ff",
  },
  read: {
    backgroundColor: "transparent",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: "600",
    fontSize: 14,
    color: "#2d3748",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#718096",
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0070f3",
    marginLeft: 8,
  },
  message: {
    padding: 16,
    textAlign: "center",
    color: "#718096",
  },
  errorMessage: {
    padding: 16,
    textAlign: "center",
    color: "#e53e3e",
  },
  closeButton: {
    marginTop: 16,
  },
})
