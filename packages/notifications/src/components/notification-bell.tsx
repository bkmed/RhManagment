"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Pressable } from "react-native"
import { Bell } from "lucide-react-native"
import { getUnreadNotificationCount } from "../notification-service"

interface NotificationBellProps {
  userId: string
  onPress: () => void
}

export const NotificationBell = ({ userId, onPress }: NotificationBellProps) => {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount(userId)
        setUnreadCount(count)
      } catch (error) {
        console.error("Error fetching unread count:", error)
      }
    }

    fetchUnreadCount()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [userId])

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Bell size={24} color="#4a5568" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: 8,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#e53e3e",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
})
