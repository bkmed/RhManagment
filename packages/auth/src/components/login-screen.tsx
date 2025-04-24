"use client"

import { useState } from "react"
import { View, StyleSheet, Text, Platform } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { loginUser, clearError } from "../../../core/src/redux/slices/authSlice"
import type { AppDispatch, RootState } from "../../../core/src/redux/store"
import { Button } from "../../../core/src/components/ui/button"
import { Input } from "../../../core/src/components/ui/input"
import { Card } from "../../../core/src/components/ui/card"
import { LogIn, Mail, Lock } from "lucide-react-native"
import { useTranslation } from "react-i18next"

interface LoginScreenProps {
  onRegisterPress: () => void
  onForgotPasswordPress: () => void
}

export const LoginScreen = ({ onRegisterPress, onForgotPasswordPress }: LoginScreenProps) => {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)

  const validateForm = (): boolean => {
    let isValid = true

    if (!email) {
      setEmailError(t("auth.emailRequired"))
      isValid = false
    } else {
      setEmailError(null)
    }

    if (!password) {
      setPasswordError(t("auth.passwordRequired"))
      isValid = false
    } else {
      setPasswordError(null)
    }

    return isValid
  }

  const handleLogin = async () => {
    if (!validateForm()) {
      return
    }

    dispatch(loginUser({ email, password }))
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.logoContainer}>
          <LogIn size={40} color="#0070f3" />
          <Text style={styles.title}>{t("auth.loginTitle")}</Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

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

        <Input
          label={t("auth.password")}
          placeholder={t("auth.enterPassword")}
          value={password}
          onChangeText={(text) => {
            setPassword(text)
            setPasswordError(null)
            if (error) dispatch(clearError())
          }}
          secureTextEntry
          error={passwordError}
          leftIcon={<Lock size={20} color="#718096" />}
          fullWidth
        />

        <View style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordLink} onPress={onForgotPasswordPress}>
            {t("auth.forgotPassword")}
          </Text>
        </View>

        <Button
          title={loading ? t("auth.loggingIn") : t("auth.login")}
          onPress={handleLogin}
          disabled={loading}
          fullWidth
          style={styles.button}
        />

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>{t("auth.noAccount")} </Text>
          <Text style={styles.registerLink} onPress={onRegisterPress}>
            {t("auth.register")}
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
  },
  button: {
    marginTop: 16,
  },
  errorText: {
    color: "#e53e3e",
    marginBottom: 16,
    textAlign: "center",
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  forgotPasswordLink: {
    color: "#0070f3",
    fontWeight: "500",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  registerText: {
    color: "#4a5568",
  },
  registerLink: {
    color: "#0070f3",
    fontWeight: "500",
  },
})
