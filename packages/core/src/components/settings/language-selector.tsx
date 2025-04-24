"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { useTranslation } from "react-i18next"
import { Button } from "../ui/button"
import { Check, ChevronLeft } from "lucide-react-native"

interface LanguageSelectorProps {
  currentLanguage: string
  onSelectLanguage: (language: string) => void
  onCancel: () => void
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onSelectLanguage, onCancel }) => {
  const { t } = useTranslation()

  const languages = [
    { code: "en", name: t("settings.english") },
    { code: "fr", name: t("settings.french") },
    { code: "ar", name: t("settings.arabic") },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          variant="ghost"
          leftIcon={<ChevronLeft size={20} color="#4a5568" />}
          title={t("common.back")}
          onPress={onCancel}
          style={styles.backButton}
        />
        <Text style={styles.title}>{t("settings.language")}</Text>
      </View>

      <ScrollView style={styles.languageList}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={styles.languageItem}
            onPress={() => onSelectLanguage(language.code)}
          >
            <Text
              style={[
                styles.languageName,
                language.code === "ar" && styles.rtlText,
                language.code === currentLanguage && styles.selectedLanguage,
              ]}
            >
              {language.name}
            </Text>
            {language.code === currentLanguage && <Check size={20} color="#0070f3" />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  languageName: {
    fontSize: 16,
    color: "#4a5568",
  },
  rtlText: {
    textAlign: "right",
  },
  selectedLanguage: {
    color: "#0070f3",
    fontWeight: "600",
  },
})
