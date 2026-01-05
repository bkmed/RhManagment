import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { departmentsDb } from '../../database/departmentsDb';
import { Theme } from '../../theme';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

export const AddDepartmentScreen = ({ navigation, route }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { showToast } = useToast();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { setActiveTab } = React.useContext(WebNavigationContext) as any;

    const departmentId = route?.params?.departmentId;
    const isEdit = !!departmentId;

    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit) {
            loadDepartment();
        }
    }, [departmentId]);

    const loadDepartment = async () => {
        try {
            const departments = await departmentsDb.getAll();
            const dept = departments.find(d => d.id === departmentId);
            if (dept) {
                setName(dept.name);
            }
        } catch (err) {
            showToast(t('common.error'), 'error');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError(t('common.required'));
            return;
        }

        try {
            if (isEdit) {
                await departmentsDb.update(departmentId, name.trim());
                showToast(t('common.success'), 'success');
            } else {
                await departmentsDb.add(name.trim());
                showToast(t('common.success'), 'success');
            }

            // Navigate back
            if (Platform.OS === 'web') {
                setActiveTab?.('Departments');
            } else {
                navigation.goBack();
            }
        } catch (err) {
            showToast(t('common.saveError'), 'error');
        }
    };

    const handleCancel = () => {
        if (Platform.OS === 'web') {
            setActiveTab?.('Departments');
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>
                    {isEdit ? t('common.edit') : t('departments.add')}
                </Text>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>{t('common.department')} *</Text>
                    <TextInput
                        style={[styles.input, error && styles.inputError]}
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            if (error) setError('');
                        }}
                        placeholder={t('departments.namePlaceholder')}
                        placeholderTextColor={theme.colors.subText}
                    />
                    {error && <Text style={styles.errorText}>{error}</Text>}
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={handleCancel}
                    >
                        <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.saveButton]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
            padding: theme.spacing.m,
        },
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.spacing.m,
            padding: theme.spacing.l,
            ...theme.shadows.medium,
        },
        title: {
            ...theme.textVariants.header,
            color: theme.colors.text,
            marginBottom: theme.spacing.l,
        },
        fieldContainer: {
            marginBottom: theme.spacing.l,
        },
        label: {
            ...theme.textVariants.body,
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
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
        inputError: {
            borderColor: theme.colors.error,
        },
        errorText: {
            color: theme.colors.error,
            fontSize: 12,
            marginTop: theme.spacing.xs,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: theme.spacing.m,
        },
        button: {
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.m,
            borderRadius: theme.spacing.s,
            minWidth: 100,
            alignItems: 'center',
        },
        cancelButton: {
            backgroundColor: theme.colors.border,
        },
        cancelButtonText: {
            color: theme.colors.text,
            fontWeight: '600',
        },
        saveButton: {
            backgroundColor: theme.colors.primary,
        },
        saveButtonText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
        },
    });
