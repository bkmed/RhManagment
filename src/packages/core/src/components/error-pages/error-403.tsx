import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Button } from "../ui/button"
import { ShieldAlert } from "lucide-react-native"

interface Error403Props {
  onGoBack?: () => void
  onGoHome?: () => void
}

export const Error403: React.FC<Error403Props> = ({ onGoBack, onGoHome }) => {
  return (
    <View style={styles.container}>
      <ShieldAlert size={80} color="#ed8936" style={styles.icon} />
      <Text style={styles.title}>403</Text>
      <Text style={styles.subtitle}>Access Denied</Text>
      <Text style={styles.description}>You don't have permission to access this resource.</Text>
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
    color: "#ed8936",
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
