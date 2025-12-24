import { Pressable, Text, StyleSheet, type ViewStyle, type TextStyle, type PressableProps } from "react-native"

type ButtonVariant = "primary" | "secondary" | "outline" | "danger"

interface ButtonProps extends PressableProps {
  title: string
  variant?: ButtonVariant
  fullWidth?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export const Button = ({ title, variant = "primary", fullWidth = false, style, textStyle, ...props }: ButtonProps) => {
  return (
    <Pressable style={[styles.button, styles[variant], fullWidth && styles.fullWidth, style]} {...props}>
      <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  primary: {
    backgroundColor: "#0070f3",
  },
  secondary: {
    backgroundColor: "#6c757d",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#0070f3",
  },
  danger: {
    backgroundColor: "#dc3545",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "white",
  },
  secondaryText: {
    color: "white",
  },
  outlineText: {
    color: "#0070f3",
  },
  dangerText: {
    color: "white",
  },
})
