import { TextInput, View, Text, StyleSheet, type TextInputProps } from "react-native"

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  fullWidth?: boolean
}

export const Input = ({ label, error, fullWidth = false, style, ...props }: InputProps) => {
  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput style={[styles.input, error && styles.inputError, style]} placeholderTextColor="#a0aec0" {...props} />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  fullWidth: {
    width: "100%",
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "500",
    color: "#4a5568",
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  inputError: {
    borderColor: "#fc8181",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 12,
    marginTop: 4,
  },
})
