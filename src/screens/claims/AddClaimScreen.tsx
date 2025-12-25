import React, { useState, useMemo, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { claimsDb } from '../../database/claimsDb';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { ClaimType } from '../../database/schema';
import { Dropdown } from '../../components/Dropdown';

export const AddClaimScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { user } = useAuth();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [type, setType] = useState<ClaimType>('material');
    const [description, setDescription] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [loading, setLoading] = useState(false);



    const { setActiveTab } = useContext(WebNavigationContext);

    const handleSave = async () => {
        if (!description.trim()) {
            Alert.alert(t('common.error'), t('common.required'));
            return;
        }

        setLoading(true);
        try {
            const claimData = {
                employeeId: user?.employeeId || 0,
                type,
                description: description.trim(),
                isUrgent,
                status: 'pending' as const,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await claimsDb.add(claimData);

            Alert.alert(t('common.success'), t('claims.successMessage'), [
                { text: 'OK', onPress: () => goBack() }
            ]);
        } catch (error) {
            console.error('Error saving claim:', error);
            Alert.alert(t('common.error'), t('claims.saveError'));
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        if (Platform.OS === 'web') {
            setActiveTab('Home');
        } else {
            navigation.goBack();
        }
    };

    const claimTypes = [
        { label: t('claims.typeMaterial'), value: 'material' },
        { label: t('claims.typeAccount'), value: 'account' },
        { label: t('claims.typeOther'), value: 'other' },
    ];

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>{t('claims.newClaim')}</Text>

                    <View style={styles.section}>
                        <View style={styles.fieldContainer}>
                            <Dropdown
                                label={t('claims.type')}
                                data={claimTypes}
                                value={type}
                                onSelect={(val) => setType(val as ClaimType)}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>{t('claims.description')} *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder={t('claims.descriptionPlaceholder')}
                                placeholderTextColor={theme.colors.subText}
                                multiline
                                numberOfLines={6}
                            />
                        </View>

                        <View style={styles.switchRow}>
                            <View>
                                <Text style={[styles.label, { color: theme.colors.error }]}>{t('common.urgent')}</Text>
                                <Text style={styles.captionText}>{t('claims.urgentNote')}</Text>
                            </View>
                            <Switch
                                value={isUrgent}
                                onValueChange={setIsUrgent}
                                trackColor={{
                                    false: theme.colors.border,
                                    true: theme.colors.error,
                                }}
                                thumbColor={theme.colors.surface}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? t('common.loading') : t('common.submit')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: { backgroundColor: theme.colors.background },
        content: { padding: theme.spacing.m },
        formContainer: {
            maxWidth: Platform.OS === 'web' ? 600 : undefined,
            width: '100%',
            alignSelf: 'center',
        },
        title: {
            ...theme.textVariants.header,
            color: theme.colors.text,
            marginBottom: theme.spacing.l,
            textAlign: 'center'
        },
        section: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.spacing.m,
            padding: theme.spacing.l,
            marginBottom: theme.spacing.l,
            ...theme.shadows.small,
        },
        fieldContainer: {
            marginBottom: theme.spacing.m,
        },
        label: {
            ...theme.textVariants.caption,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: theme.spacing.s,
        },
        input: {
            backgroundColor: theme.colors.background,
            borderRadius: theme.spacing.s,
            padding: theme.spacing.m,
            fontSize: 16,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        textArea: {
            height: 120,
            textAlignVertical: 'top'
        },
        switchRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: theme.spacing.m,
            paddingTop: theme.spacing.m,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border
        },
        captionText: {
            ...theme.textVariants.caption,
            color: theme.colors.subText,
        },
        saveButton: {
            backgroundColor: theme.colors.primary,
            padding: theme.spacing.m,
            borderRadius: theme.spacing.s,
            alignItems: 'center',
            marginTop: theme.spacing.l,
        },
        saveButtonDisabled: { opacity: 0.5 },
        saveButtonText: {
            ...theme.textVariants.button,
            color: theme.colors.surface,
        },
    });
