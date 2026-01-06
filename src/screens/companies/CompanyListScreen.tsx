import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { companiesDb } from '../../database/companiesDb';
import { Company } from '../../database/schema';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useContext, useMemo, useState, useCallback } from 'react';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';

export const CompanyListScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { showModal } = useModal();
    const { showToast } = useToast();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { setActiveTab } = useContext(WebNavigationContext) as any;

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCompanies = async () => {
        try {
            const data = await companiesDb.getAll();
            setCompanies(data);
        } catch (error) {
            console.error('Error loading companies:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCompanies();
        }, []),
    );

    const handleEdit = (company: Company) => {
        if (Platform.OS === 'web') {
            setActiveTab('Companies', 'AddCompany', { id: company.id });
        } else {
            navigation.navigate('AddCompany', { id: company.id });
        }
    };

    const handleDelete = (company: Company) => {
        showModal({
            title: t('common.deleteTitle'),
            message: `${t('common.deleteMessage')}\n"${company.name}"`,
            buttons: [
                {
                    text: t('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await companiesDb.delete(company.id);
                            showToast(t('common.success'), 'success');
                            loadCompanies();
                        } catch (error) {
                            console.error('Error deleting company:', error);
                            showToast(t('common.deleteFailed'), 'error');
                        }
                    },
                },
            ],
        });
    };

    const renderItem = ({ item }: { item: Company }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    {item.address && (
                        <Text style={styles.detailText}>📍 {item.address}</Text>
                    )}
                    {item.email && (
                        <Text style={styles.detailText}>✉️ {item.email}</Text>
                    )}
                    {item.phone && (
                        <Text style={styles.detailText}>📞 {item.phone}</Text>
                    )}
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEdit(item)}
                    >
                        <Text style={styles.actionText}>{t('common.edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDelete(item)}
                    >
                        <Text style={styles.actionText}>{t('common.delete')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                    style={{ marginTop: 20 }}
                />
            ) : (
                <FlatList
                    data={companies}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{t('companies.empty')}</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    if (Platform.OS === 'web') {
                        setActiveTab('Companies', 'AddCompany');
                    } else {
                        navigation.navigate('AddCompany');
                    }
                }}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        listContent: {
            padding: theme.spacing.m,
            maxWidth: 800,
            width: '100%',
            alignSelf: 'center',
        },
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
            ...theme.shadows.small,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        info: {
            flex: 1,
        },
        actions: {
            flexDirection: 'row',
            gap: 8,
        },
        actionButton: {
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
        },
        editButton: {
            backgroundColor: theme.colors.primary + '20',
        },
        deleteButton: {
            backgroundColor: theme.colors.error + '20',
        },
        actionText: {
            ...theme.textVariants.caption,
            fontSize: 12,
            fontWeight: '600',
        },
        name: {
            ...theme.textVariants.subheader,
            color: theme.colors.text,
            fontSize: 18,
            marginBottom: 4,
        },
        detailText: {
            ...theme.textVariants.caption,
            color: theme.colors.subText,
            marginTop: 2,
        },
        emptyContainer: {
            alignItems: 'center',
            marginTop: 40,
        },
        emptyText: {
            ...theme.textVariants.body,
            color: theme.colors.subText,
        },
        fab: {
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            ...theme.shadows.medium,
            zIndex: 999,
        } as any,
        fabText: {
            fontSize: 32,
            color: '#FFF',
            marginTop: -2,
        },
    });
