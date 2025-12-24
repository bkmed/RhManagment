import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Button } from "../ui/button"
import { WifiOff } from "lucide-react-native"

interface ErrorOfflineProps {
  onRetry?: () => void
}

export const ErrorOffline: React.FC<ErrorOfflineProps> = ({ onRetry }) => {
  return (
    <View style={styles.container}>
      <WifiOff size={80} color="#4299e1" style={styles.icon} />
      <Text style={styles.title}>You're Offline</Text>
      <Text style={styles.description}>Please check your internet connection and try again.</Text>
      {onRetry && <Button title="Retry Connection" onPress={onRetry} style={styles.button} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f7fafc",
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 400,
  },
  button: {
    minWidth: 200,
  },
})
