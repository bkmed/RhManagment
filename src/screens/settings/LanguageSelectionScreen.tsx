import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  I18nManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { storageService } from '../../services/storage';
import { notificationService } from '../../services/notificationService';
import { Theme } from '../../theme';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇹🇳' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

export const LanguageSelectionScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { setActiveTab } = React.useContext(WebNavigationContext) as any;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleLanguageChange = async (langCode: string) => {
    try {
      await i18n.changeLanguage(langCode);
      storageService.setString('user-language', langCode);

      const shouldBeRTL = langCode === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);
        if (Platform.OS !== 'web') {
          notificationService.showAlert(
            t('profile.restartRequired'),
            t('profile.restartRequiredMessage'),
          );
        }
      }

      if (Platform.OS === 'web') {
        setActiveTab?.('Home');
      } else {
        navigation.goBack();
      }
    } catch (error) {
      notificationService.showAlert(
        t('common.error'),
        t('profile.languageChangeError'),
      );
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
        <View style={styles.card}>
          {LANGUAGES.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.row,
                index !== LANGUAGES.length - 1 && styles.borderBottom,
                i18n.language === lang.code && styles.selectedRow,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <View style={styles.langInfo}>
                <Text style={styles.flag}>{lang.flag}</Text>
                <Text style={styles.rowText}>{lang.label}</Text>
              </View>
              {i18n.language === lang.code && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    section: {
      padding: theme.spacing.m,
    },
    sectionTitle: {
      ...theme.textVariants.body,
      fontWeight: 'bold',
      color: theme.colors.subText,
      marginBottom: theme.spacing.s,
      marginLeft: theme.spacing.xs,
      textTransform: 'uppercase',
      fontSize: 12,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      overflow: 'hidden',
      ...theme.shadows.small,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.l,
    },
    langInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    flag: {
      fontSize: 24,
      marginRight: theme.spacing.m,
    },
    rowText: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      fontSize: 16,
    },
    borderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    selectedRow: {
      backgroundColor: `${theme.colors.primary}10`,
    },
    checkIcon: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: 18,
    },
  });
