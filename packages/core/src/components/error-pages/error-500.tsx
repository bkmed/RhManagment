import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Button } from "../ui/button"
import { AlertTriangle } from "lucide-react-native"

interface Error500Props {
  onRetry?: () => void
  onGoHome?: () => void
}

export const Error500: React.FC<Error500Props> = ({ onRetry, onGoHome }) => {
  return (
    <View style={styles.container}>
      <AlertTriangle size={80} color="#e53e3e" style={styles.icon} />
      <Text style={styles.title}>500</Text>
      <Text style={styles.subtitle}>Server Error</Text>
      <Text style={styles.description}>Something went wrong on our servers. We're working to fix the issue.</Text>
      <View style={styles.buttonContainer}>
        {onRetry && <Button title="Try Again" onPress={onRetry} variant="outline" style={styles.button} />}
        {onGoHome && <Button title="Go Home" onPress={onGoHome} style={styles.button} />}
      </View>
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
    fontSize: 72,
    fontWeight: "bold",
    color: "#e53e3e",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 400,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    marginHorizontal: 8,
  },
})
