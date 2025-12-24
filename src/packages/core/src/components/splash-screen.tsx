"use client"

import type React from "react"
import { useEffect } from "react"
import { View, Text, StyleSheet, Image, Animated, Easing, Platform } from "react-native"
import { useSelector } from "react-redux"
import type { RootState } from "../redux/store"

interface SplashScreenProps {
  onFinish?: () => void
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { theme } = useSelector((state: RootState) => state.ui)
  const opacity = new Animated.Value(0)
  const scale = new Animated.Value(0.8)

  useEffect(() => {
    // Fade in and scale up animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start()

    // Fade out after a delay
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start(() => {
        if (onFinish) {
          onFinish()
        }
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [opacity, scale, onFinish])

  const isDarkMode = theme === "dark"

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
       {/*  <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" /> */}
        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>HR Management</Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>Your complete HR solution</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    ...Platform.select({
      web: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      },
    }),
  },
  darkContainer: {
    backgroundColor: "#1a202c",
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0070f3",
    marginBottom: 8,
  },
  darkTitle: {
    color: "#63b3ed",
  },
  subtitle: {
    fontSize: 18,
    color: "#4a5568",
  },
  darkSubtitle: {
    color: "#a0aec0",
  },
})
