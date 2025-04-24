"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "../notification-service"
import { Card } from "../../../core/src/components/ui/card"
import { Button } from "../../../core/src/components/ui/button"
import { Bell, FileText, Calendar, User } from "lucide-react-native"

interface NotificationCenterProps {
  userId: string
  onNotificationPress?: (notification: Notification) => void
}

export const NotificationCenter = ({ userId, onNotificationPress }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const fetchedNotifications = await getUserNotifications(userId)
        setNotifications(fetchedNotifications)
      } catch (err: any) {
        setError(err.message || "Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [userId])

  const handleNotificationPress = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id)

        // Update local state
        setNotifications((prevNotifications) =>
          prevNotifications.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
        )
      }

      if (onNotificationPress) {
        onNotificationPress(notification)
      }
    } catch (err) {
      console.error("Error handling notification press:", err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userId)

      // Update local state
      setNotifications((prevNotifications) => prevNotifications.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "leave_request":
      case "leave_approved":
      case "leave_rejected":
        return <Calendar size={24} color="#4a5568" />
      case "payslip_available":
        return <FileText size={24} color="#4a5568" />
      case "document_uploaded":
        return <FileText size={24} color="#4a5568" />
      case "role_changed":
        return <User size={24} color="#4a5568" />
      default:
        return <Bell size={24} color="#4a5568" />
    }
  }

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity onPress={() => handleNotificationPress(item)}>
      <Card style={[styles.notificationCard, !item.read && styles.unreadCard]}>
        <View style={styles.notificationContent}>
          <View style={styles.notificationIcon}>{getNotificationIcon(item.type)}</View>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
          {!item.read && <View style={styles.unreadIndicator} />}
        </View>
      </Card>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading notifications...</Text>
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

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <Button
            title="Mark all as read"
            variant="outline"
            onPress={handleMarkAllAsRead}
            style={styles.markReadButton}
          />
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Bell size={48} color="#a0aec0" />
          <Text style={styles.emptyStateText}>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3748",
  },
  markReadButton: {
    paddingHorizontal: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  notificationCard: {
    marginBottom: 8,
    padding: 12,
  },
  unreadCard: {
    backgroundColor: "#ebf8ff",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#4a5568",
    marginTop: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: "#a0aec0",
    marginTop: 4,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0070f3",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#a0aec0",
    marginTop: 16,
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 16,
    textAlign: "center",
  },
})
