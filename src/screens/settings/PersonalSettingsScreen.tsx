import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

export const PersonalSettingsScreen = () => {
    const { theme, themeMode, setThemeMode } = useTheme();
    const { t, i18n } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'ar', label: 'العربية', flag: '🇸🇦' },
        { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
    ];

    const themes = [
        { id: 'light', label: t('settings.themeLight') || 'Light' },
        { id: 'dark', label: t('settings.themeDark') || 'Dark' },
        { id: 'premium', label: t('settings.themePremium') || 'Premium' },
    ];

    const toggleLanguage = (code: string) => {
        i18n.changeLanguage(code);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('settings.language') || 'Language'}</Text>
                <View style={styles.card}>
                    {languages.map((lang, index) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[
                                styles.row,
                                index !== languages.length - 1 && styles.borderBottom,
                                i18n.language === lang.code && styles.selectedRow
                            ]}
                            onPress={() => toggleLanguage(lang.code)}
                        >
                            <Text style={styles.rowText}>{lang.flag} {lang.label}</Text>
                            {i18n.language === lang.code && <Text style={styles.checkIcon}>✓</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('settings.theme') || 'Theme'}</Text>
                <View style={styles.card}>
                    {themes.map((th, index) => (
                        <TouchableOpacity
                            key={th.id}
                            style={[
                                styles.row,
                                index !== themes.length - 1 && styles.borderBottom,
                                themeMode === th.id && styles.selectedRow
                            ]}
                            onPress={() => setThemeMode(th.id as any)}
                        >
                            <Text style={styles.rowText}>{th.label}</Text>
                            {themeMode === th.id && <Text style={styles.checkIcon}>✓</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('settings.notifications') || 'Notifications'}</Text>
                <View style={styles.card}>
                    <View style={[styles.row, styles.borderBottom]}>
                        <Text style={styles.rowText}>{t('settings.pushNotifications') || 'Push Notifications'}</Text>
                        <Switch trackColor={{ false: theme.colors.border, true: theme.colors.primary }} value={true} />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowText}>{t('settings.emailNotifications') || 'Email Notifications'}</Text>
                        <Switch trackColor={{ false: theme.colors.border, true: theme.colors.primary }} value={false} />
                    </View>
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
