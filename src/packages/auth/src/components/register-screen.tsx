"use client"

import { useState } from "react"
import { View, StyleSheet, Text, Platform } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { registerUser, clearError } from "../../../core/src/redux/slices/authSlice"
import type { AppDispatch, RootState } from "../../../core/src/redux/store"
import { Button } from "../../../core/src/components/ui/button"
import { Input } from "../../../core/src/components/ui/input"
import { Card } from "../../../core/src/components/ui/card"
import { UserPlus } from "lucide-react-native"
import type { UserRole } from "../../../core/src/types/roles"

interface RegisterScreenProps {
  onLoginPress: () => void
}

export const RegisterScreen = ({ onLoginPress }: RegisterScreenProps) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [role, setRole] = useState<UserRole>("employee")
  const [error, setError] = useState<string | null>(null)

  const dispatch = useDispatch<AppDispatch>()
  const { loading, error: authError } = useSelector((state: RootState) => state.auth)

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !displayName) {
      setError("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setError(null)
    dispatch(registerUser({ email, password, displayName, role }))
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.logoContainer}>
          <UserPlus size={40} color="#0070f3" />
          <Text style={styles.title}>Create an Account</Text>
        </View>

        {(error || authError) && <Text style={styles.errorText}>{error || authError}</Text>}

        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={displayName}
          onChangeText={(text) => {
            setDisplayName(text)
            setError(null)
            if (authError) dispatch(clearError())
          }}
          fullWidth
        />

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => {
            setEmail(text)
            setError(null)
            if (authError) dispatch(clearError())
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          fullWidth
        />

        <Input
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={(text) => {
            setPassword(text)
            setError(null)
            if (authError) dispatch(clearError())
          }}
          secureTextEntry
          fullWidth
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text)
            setError(null)
            if (authError) dispatch(clearError())
          }}
          secureTextEntry
          fullWidth
        />

        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Select Role</Text>
          <View style={styles.roleButtons}>
            <Button
              title="Employee"
              variant={role === "employee" ? "primary" : "outline"}
              onPress={() => setRole("employee")}
              style={styles.roleButton}
            />
            <Button
              title="Advisor"
              variant={role === "advisor" ? "primary" : "outline"}
              onPress={() => setRole("advisor")}
              style={styles.roleButton}
            />
            <Button
              title="Admin"
              variant={role === "admin" ? "primary" : "outline"}
              onPress={() => setRole("admin")}
              style={styles.roleButton}
            />
          </View>
        </View>

        <Button
          title={loading ? "Creating account..." : "Register"}
          onPress={handleRegister}
          disabled={loading}
          fullWidth
          style={styles.button}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Text style={styles.loginLink} onPress={onLoginPress}>
            Login
          </Text>
        </View>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f7fafc",
  },
  card: {
    width: Platform.OS === "web" ? 400 : "100%",
    maxWidth: 400,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    color: "#2d3748",
  },
  button: {
    marginTop: 16,
  },
  errorText: {
    color: "#e53e3e",
    marginBottom: 16,
    textAlign: "center",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    color: "#4a5568",
  },
  loginLink: {
    color: "#0070f3",
    fontWeight: "500",
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#4a5568",
  },
  roleButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 4,
  },
})
