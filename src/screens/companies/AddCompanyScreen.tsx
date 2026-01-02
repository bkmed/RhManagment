import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { companiesDb } from '../../database/companiesDb';
import { Theme } from '../../theme';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext'; // Ensure consistency if needed, though mostly for delete

export const AddCompanyScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { showToast } = useToast();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Validation state
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = t('common.required');
        // Add more validation if needed (email regex, phone regex)

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            await companiesDb.add({
                name,
                address,
                country,
                email,
                phone,
                logo: '', // Optional or future enhancement
            });
            showToast(t('common.success'), 'success');
            navigation.goBack();
        } catch (error) {
            console.error('Error saving company:', error);
            showToast(t('common.saveError'), 'error'); // Ensure key exists or use fallback
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.title}>{t('companies.details') || 'Company Details'}</Text>

                    {/* Name */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('companies.name') || t('common.name')}</Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            value={name}
                            onChangeText={setName}
                            placeholder={t('companies.namePlaceholder') || 'e.g. Acme Corp'}
                            placeholderTextColor={theme.colors.subText}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    {/* Address */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('companies.address') || t('common.address')}</Text>
                        <TextInput
                            style={styles.input}
                            value={address}
                            onChangeText={setAddress}
                            placeholder={t('companies.addressPlaceholder') || 'e.g. 123 Business St'}
                            placeholderTextColor={theme.colors.subText}
                        />
                    </View>

                    {/* Country */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('companies.country') || 'Country'}</Text>
                        <TextInput
                            style={styles.input}
                            value={country}
                            onChangeText={setCountry}
                            placeholder={t('companies.countryPlaceholder') || 'e.g. USA'}
                            placeholderTextColor={theme.colors.subText}
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('companies.email') || t('common.email')}</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder={t('companies.emailPlaceholder') || 'e.g. contact@acme.com'}
                            placeholderTextColor={theme.colors.subText}
                        />
                    </View>

                    {/* Phone */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('companies.phone') || t('common.phone')}</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholder={t('companies.phonePlaceholder') || 'e.g. +1 234 567 890'}
                            placeholderTextColor={theme.colors.subText}
                        />
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
        },
        scrollContent: {
            padding: theme.spacing.m,
        },
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.spacing.m,
            padding: theme.spacing.l,
            ...theme.shadows.medium,
            maxWidth: 600,
            width: '100%',
            alignSelf: 'center',
        },
        title: {
            ...theme.textVariants.header,
            color: theme.colors.text,
            marginBottom: theme.spacing.l,
            textAlign: 'center',
        },
        fieldContainer: {
            marginBottom: theme.spacing.m,
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
        },
        inputError: {
            borderColor: theme.colors.error,
        },
        errorText: {
            color: theme.colors.error,
            fontSize: 12,
            marginTop: 4,
        },
        saveButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.spacing.m,
            padding: theme.spacing.m,
            alignItems: 'center',
            marginTop: theme.spacing.m,
            ...theme.shadows.small,
        },
        saveButtonText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
            fontSize: 16,
        },
    });
