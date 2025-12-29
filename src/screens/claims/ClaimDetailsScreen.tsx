import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Image,
} from 'react-native';
import { claimsDb } from '../../database/claimsDb';
import { notificationService } from '../../services/notificationService';
import { Claim } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { formatDateTime } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ClaimDetailsScreen = ({ navigation, route }: any) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { claimId } = route.params;
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [claim, setClaim] = useState<Claim | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClaim();
    }, [claimId]);

    const loadClaim = async () => {
        try {
            const data = await claimsDb.getById(claimId);
            setClaim(data);
        } catch (error) {
            showToast(t('claims.loadError'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status: 'processed' | 'rejected') => {
        if (!claim) return;
        try {
            setLoading(true);
            await claimsDb.update(claimId, { status });
            setClaim({ ...claim, status });
            notificationService.showAlert(t('common.success'), t('claims.statusUpdated'));
        } catch (error) {
            notificationService.showAlert(t('common.error'), t('claims.updateError'));
        } finally {
            setLoading(false);
        }
    };

    if (loading || !claim) {
        return (
            <View style={styles.container}>
                <Text style={{ color: theme.colors.text }}>{t('common.loading')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <View style={styles.headerRow}>
                        <View style={styles.typeTag}>
                            <Text style={styles.typeText}>
                                {t(`claims.type${claim.type.charAt(0).toUpperCase() + claim.type.slice(1)}`)}
                            </Text>
                        </View>
                        {claim.isUrgent && (
                            <View style={styles.urgentTag}>
                                <Text style={styles.urgentText}>{t('common.urgent').toUpperCase()}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.date}>{formatDateTime(claim.createdAt)}</Text>

                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status, theme) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(claim.status, theme) }]}>
                            {t(`claims.status${claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}`)}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>{t('claims.description')}</Text>
                    <Text style={styles.value}>{claim.description}</Text>
                </View>

                {claim.photoUri && (
                    <View style={styles.section}>
                        <Text style={styles.label}>{t('illnesses.photoButton')}</Text>
                        <TouchableOpacity
                            onPress={() => {
                                // Potentially add full screen view later
                            }}
                        >
                            <Image source={{ uri: claim.photoUri }} style={styles.photo} resizeMode="contain" />
                        </TouchableOpacity>
                    </View>
                )}

                {(user?.role === 'admin' || user?.role === 'rh') && claim.status === 'pending' && (
                    <View style={styles.adminActions}>
                        <TouchableOpacity
                            style={[styles.button, styles.approveButton]}
                            onPress={() => handleUpdateStatus('processed')}
                        >
                            <Text style={styles.buttonText}>{t('claims.process')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.rejectButton]}
                            onPress={() => handleUpdateStatus('rejected')}
                        >
                            <Text style={styles.buttonText}>{t('claims.reject')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const getStatusColor = (status: string, theme: Theme) => {
    switch (status) {
        case 'processed': return theme.colors.success;
        case 'rejected': return theme.colors.error;
        default: return theme.colors.warning;
    }
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
        },
        content: {
            padding: theme.spacing.m,
            paddingBottom: 40,
            maxWidth: 600,
            width: '100%',
            alignSelf: 'center',
        },
        section: {
            backgroundColor: theme.colors.surface,
            borderRadius: 20,
            padding: theme.spacing.l,
            marginBottom: theme.spacing.m,
            ...theme.shadows.small,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.m,
        },
        typeTag: {
            backgroundColor: theme.colors.background,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 10,
        },
        typeText: {
            ...theme.textVariants.caption,
            fontWeight: '700',
            color: theme.colors.text,
            textTransform: 'uppercase',
            fontSize: 11,
        },
        urgentTag: {
            backgroundColor: theme.colors.error,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
        },
        urgentText: {
            fontSize: 10,
            fontWeight: 'bold',
            color: '#FFF',
            textTransform: 'uppercase',
        },
        date: {
            ...theme.textVariants.body,
            color: theme.colors.subText,
            marginBottom: theme.spacing.m,
            fontSize: 14,
            fontWeight: '500',
        },
        label: {
            ...theme.textVariants.caption,
            marginBottom: 6,
            color: theme.colors.subText,
            fontWeight: '700',
            textTransform: 'uppercase',
            fontSize: 11,
            letterSpacing: 0.5,
        },
        value: {
            ...theme.textVariants.body,
            color: theme.colors.text,
            lineHeight: 24,
        },
        statusBadge: {
            alignSelf: 'flex-start',
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 12,
            marginTop: theme.spacing.s,
        },
        statusText: {
            fontSize: 13,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        adminActions: {
            flexDirection: 'row',
            gap: theme.spacing.m,
            marginTop: theme.spacing.m,
        },
        button: {
            flex: 1,
            padding: theme.spacing.m,
            borderRadius: 12,
            alignItems: 'center',
            ...theme.shadows.small,
        },
        approveButton: {
            backgroundColor: theme.colors.success,
        },
        rejectButton: {
            backgroundColor: theme.colors.error,
        },
        buttonText: {
            ...theme.textVariants.button,
            color: '#FFF',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        photo: {
            width: '100%',
            height: 350,
            borderRadius: 16,
            marginTop: theme.spacing.m,
        },
    });
