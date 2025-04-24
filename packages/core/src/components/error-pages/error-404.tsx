import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Button } from "../ui/button"
import { FileQuestion } from "lucide-react-native"

interface Error404Props {
  onGoBack?: () => void
  onGoHome?: () => void
}

export const Error404: React.FC<Error404Props> = ({ onGoBack, onGoHome }) => {
  return (
    <View style={styles.container}>
      <FileQuestion size={80} color="#718096" style={styles.icon} />
      <Text style={styles.title}>404</Text>
      <Text style={styles.subtitle}>Page Not Found</Text>
      <Text style={styles.description}>The page you are looking for doesn't exist or has been moved.</Text>
      <View style={styles.buttonContainer}>
        {onGoBack && <Button title="Go Back" onPress={onGoBack} variant="outline" style={styles.button} />}
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
    color: "#2d3748",
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
