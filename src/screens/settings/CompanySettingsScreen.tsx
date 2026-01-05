import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { companySettingsDb } from '../../database/companySettingsDb';
import { companiesDb } from '../../database/companiesDb';
import { Company, CompanySettings } from '../../database/schema';
import { Theme } from '../../theme';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

export const CompanySettingsScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { setActiveTab } = React.useContext(WebNavigationContext) as any;

    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const [maxHours, setMaxHours] = useState('');

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompanyId) {
            loadSettings(selectedCompanyId);
        }
    }, [selectedCompanyId]);

    const loadCompanies = async () => {
        const all = await companiesDb.getAll();
        setCompanies(all);
        if (all.length > 0) {
            const initialId = user?.companyId || all[0].id;
            setSelectedCompanyId(initialId);
        }
    };

    const loadSettings = async (companyId: number) => {
        const s = await companySettingsDb.getSettingsByCompany(companyId);
        setSettings(s);
        setMaxHours(s.maxPermissionHours.toString());
    };

    const handleSave = async () => {
        if (!settings || !selectedCompanyId) return;

        try {
            await companySettingsDb.saveSettings({
                ...settings,
                maxPermissionHours: parseInt(maxHours) || 2,
            });
            showToast(t('common.success'), 'success');
        } catch (error) {
            showToast(t('common.error'), 'error');
        }
    };

    const navigateTo = (screen: string) => {
        if (Platform.OS === 'web') {
            setActiveTab?.(screen);
        } else {
            navigation.navigate(screen);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('companies.select') || 'Select Company'}</Text>
                <View style={styles.card}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.companySelectors}>
                        {companies.map(c => (
                            <TouchableOpacity
                                key={c.id}
                                style={[
                                    styles.companyButton,
                                    selectedCompanyId === c.id && styles.selectedCompanyButton
                                ]}
                                onPress={() => setSelectedCompanyId(c.id)}
                            >
                                <Text style={[
                                    styles.companyButtonText,
                                    selectedCompanyId === c.id && styles.selectedCompanyButtonText
                                ]}>{c.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {selectedCompanyId && (
                <>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('settings.params') || 'Parameters'}</Text>
                        <View style={styles.card}>
                            <View style={styles.inputRow}>
                                <Text style={styles.label}>{t('permissions.maxHours')}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={maxHours}
                                    onChangeText={setMaxHours}
                                    keyboardType="numeric"
                                    placeholder="2"
                                    placeholderTextColor={theme.colors.subText}
                                />
                            </View>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('settings.management') || 'Management'}</Text>
                        <View style={styles.card}>
                            <TouchableOpacity
                                style={[styles.menuRow, styles.borderBottom]}
                                onPress={() => navigateTo('Departments')}
                            >
                                <Text style={styles.menuText}>🏛️ {t('navigation.departments')}</Text>
                                <Text style={styles.arrow}>›</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.menuRow}
                                onPress={() => navigateTo('Services')}
                            >
                                <Text style={styles.menuText}>⚙️ {t('navigation.services')}</Text>
                                <Text style={styles.arrow}>›</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
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
            padding: theme.spacing.l,
            ...theme.shadows.small,
        },
        companySelectors: {
            flexDirection: 'row',
            gap: theme.spacing.s,
        },
        companyButton: {
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.s,
            borderRadius: theme.spacing.xl,
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        selectedCompanyButton: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        companyButtonText: {
            color: theme.colors.text,
            fontWeight: '600',
        },
        selectedCompanyButtonText: {
            color: '#FFFFFF',
        },
        inputRow: {
            marginBottom: theme.spacing.l,
        },
        label: {
            ...theme.textVariants.body,
            color: theme.colors.text,
            marginBottom: theme.spacing.s,
            fontWeight: '600',
        },
        input: {
            backgroundColor: theme.colors.background,
            borderRadius: theme.spacing.s,
            padding: theme.spacing.m,
            borderWidth: 1,
            borderColor: theme.colors.border,
            color: theme.colors.text,
            fontSize: 16,
        },
        saveButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.spacing.s,
            padding: theme.spacing.m,
            alignItems: 'center',
        },
        saveButtonText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 16,
        },
        menuRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: theme.spacing.m,
        },
        menuText: {
            ...theme.textVariants.body,
            color: theme.colors.text,
            fontSize: 16,
        },
        borderBottom: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            paddingBottom: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        arrow: {
            color: theme.colors.subText,
            fontSize: 20,
        },
    });
