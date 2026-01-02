import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { companiesDb } from '../../database/companiesDb';
import { Company } from '../../database/schema';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export const CompanyListScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);

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
                    // AddCompanyScreen not yet implemented, but we can add a simple console log or alert
                    console.log('Add Company pressed');
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
            elevation: 6,
        },
        fabText: {
            fontSize: 32,
            color: '#FFF',
            marginTop: -2,
        },
    });
