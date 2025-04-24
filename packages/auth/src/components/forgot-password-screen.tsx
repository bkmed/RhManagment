"use client"

import { useState } from "react"
import { View, StyleSheet, Text, Platform } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { resetPassword, clearError, clearPasswordResetStatus } from "../../../core/src/redux/slices/authSlice"
import type { AppDispatch, RootState } from "../../../core/src/redux/store"
import { Button } from "../../../core/src/components/ui/button"
import { Input } from "../../../core/src/components/ui/input"
import { Card } from "../../../core/src/components/ui/card"
import { KeyRound, ChevronLeft, Mail } from "lucide-react-native"
import { useTranslation } from "react-i18next"

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void
}

export const ForgotPasswordScreen = ({ onBackToLogin }: ForgotPasswordScreenProps) => {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)

  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, passwordResetSent } = useSelector((state: RootState) => state.auth)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleResetPassword = async () => {
    if (!email) {
      setEmailError(t("auth.emailRequired"))
      return
    }

    if (!validateEmail(email)) {
      setEmailError(t("auth.invalidEmail"))
      return
    }

    setEmailError(null)
    dispatch(resetPassword(email))
  }

  const handleBackToLogin = () => {
    dispatch(clearError())
    dispatch(clearPasswordResetStatus())
    onBackToLogin()
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.logoContainer}>
          <KeyRound size={40} color="#0070f3" />
          <Text style={styles.title}>{t("auth.forgotPasswordTitle")}</Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {passwordResetSent ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{t("auth.passwordResetSent")}</Text>
            <Text style={styles.successSubtext}>{t("auth.passwordResetInstructions")}</Text>
            <Button title={t("auth.backToLogin")} onPress={handleBackToLogin} fullWidth style={styles.button} />
          </View>
        ) : (
          <>
            <Text style={styles.instructionText}>{t("auth.forgotPasswordInstructions")}</Text>

            <Input
              label={t("auth.email")}
              placeholder={t("auth.enterEmail")}
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                setEmailError(null)
                if (error) dispatch(clearError())
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
              leftIcon={<Mail size={20} color="#718096" />}
              fullWidth
            />

            <Button
              title={loading ? t("auth.sending") : t("auth.resetPassword")}
              onPress={handleResetPassword}
              disabled={loading}
              fullWidth
              style={styles.button}
            />

            <Button
              title={t("auth.backToLogin")}
              onPress={handleBackToLogin}
              variant="outline"
              leftIcon={<ChevronLeft size={16} color="#0070f3" />}
              fullWidth
              style={styles.backButton}
            />
          </>
        )}
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
    padding: 24,
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
    textAlign: "center",
  },
  instructionText: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    marginTop: 16,
  },
  backButton: {
    marginTop: 12,
  },
  errorText: {
    color: "#e53e3e",
    marginBottom: 16,
    textAlign: "center",
  },
  successContainer: {
    alignItems: "center",
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#38a169",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtext: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 24,
    textAlign: "center",
  },
})
