"use client"

import type React from "react"
import { useState, useRef } from "react"
import { View, Text, StyleSheet, Image, Animated, Dimensions, TouchableOpacity, Platform } from "react-native"
import { useTranslation } from "react-i18next"
import { useDispatch } from "react-redux"
import { setOnboardingComplete } from "../../redux/slices/uiSlice"
import { Button } from "../ui/button"
import { PermissionsScreen } from "./permissions-screen"

const { width } = Dimensions.get("window")

const slides = [
  {
    key: "slide1",
    //image: require("../../assets/onboarding/employee-management.png"),
    titleKey: "onboarding.slide1.title",
    descriptionKey: "onboarding.slide1.description",
  },
  {
    key: "slide2",
  //  image: require("../../assets/onboarding/leave-management.png"),
    titleKey: "onboarding.slide2.title",
    descriptionKey: "onboarding.slide2.description",
  },
  {
    key: "slide3",
  //  image: require("../../assets/onboarding/payroll.png"),
    titleKey: "onboarding.slide3.title",
    descriptionKey: "onboarding.slide3.description",
  },
]

interface OnboardingScreenProps {
  onComplete: () => void
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [activeIndex, setActiveIndex] = useState(0)
  const [showPermissions, setShowPermissions] = useState(false)
  const scrollX = useRef(new Animated.Value(0)).current

  const handleSkip = () => {
    setShowPermissions(true)
  }

  const handleNext = () => {
    if (activeIndex === slides.length - 1) {
      setShowPermissions(true)
    } else {
      setActiveIndex(activeIndex + 1)
    }
  }

  const handlePermissionsComplete = () => {
    dispatch(setOnboardingComplete(true))
    onComplete()
  }

  if (showPermissions) {
    return <PermissionsScreen onComplete={handlePermissionsComplete} />
  }

  return (
    <View style={styles.container}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>{t("onboarding.skip")}</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width)
          setActiveIndex(newIndex)
        }}
        contentContainerStyle={styles.scrollContainer}
      >
        {slides.map((slide, index) => (
          <View key={slide.key} style={styles.slide}>
            <Image source={slide.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>{t(slide.titleKey)}</Text>
            <Text style={styles.description}>{t(slide.descriptionKey)}</Text>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { opacity: activeIndex === index ? 1 : 0.3 },
              { width: activeIndex === index ? 20 : 10 },
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button title={t("onboarding.next")} onPress={handleNext} fullWidth />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  skipContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    color: "#0070f3",
    fontWeight: "600",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0070f3",
    marginHorizontal: 5,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 50 : 20,
  },
})
