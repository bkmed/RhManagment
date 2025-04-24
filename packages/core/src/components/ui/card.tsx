import type { ReactNode } from "react"
import { View, Text, StyleSheet, type ViewStyle } from "react-native"

interface CardProps {
  title?: string
  children: ReactNode
  style?: ViewStyle
}

export const Card = ({ title, children, style }: CardProps) => {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1a202c",
  },
  content: {
    flex: 1,
  },
})
