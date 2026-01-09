import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { menuPreferencesService, MenuPreferences } from '../../services/menuPreferencesService';
import { notificationService } from '../../services/notificationService';

// Define the available menu items that can be toggled
// This should ideally match what's in useNavigationSections in AppNavigator
const AVAILABLE_MENU_ITEMS = [
    { key: 'Payroll', category: 'management' },
    { key: 'Leaves', category: 'management' },
    { key: 'Claims', category: 'management' },
    { key: 'Invoices', category: 'management' },
    { key: 'Remote', category: 'management' },
    { key: 'Illnesses', category: 'management' },
    { key: 'Employees', category: 'organization' },
    { key: 'Companies', category: 'organization' },
    { key: 'Teams', category: 'organization' },
    { key: 'CompanySettings', category: 'organization' },
    { key: 'Analytics', category: 'analytics' },
    { key: 'Announcements', category: 'communication' },
    { key: 'Chat', category: 'communication' },
    { key: 'Assistant', category: 'communication' },
];

export const MenuCustomizationScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [preferences, setPreferences] = useState<MenuPreferences>({ hiddenItems: [], customOrder: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        const prefs = await menuPreferencesService.getPreferences();
        setPreferences(prefs);
        setLoading(false);
    };

    const toggleItem = async (key: string) => {
        try {
            const newHiddenItems = await menuPreferencesService.toggleItemVisibility(key);
            setPreferences(prev => ({ ...prev, hiddenItems: newHiddenItems }));
        } catch (error) {
            console.error(error);
            notificationService.showToast(t('common.error'), 'error');
        }
    };

    const renderItem = ({ item }: { item: { key: string, category: string } }) => {
        // Basic check: if item requires specific permission, we probably shouldn't even show it here 
        // OR we show it but standard RBAC will hide it anyway.
        // For simplicity, we just let users toggle what they want.

        const isHidden = preferences.hiddenItems.includes(item.key);
        const label = t(`navigation.${item.key.toLowerCase()}`) || t(`${item.key.toLowerCase()}.title`) || item.key;

        return (
            <View style={styles.row}>
                <View>
                    <Text style={styles.itemLabel}>{label}</Text>
                    <Text style={styles.itemCategory}>{t(`sections.${item.category}`)}</Text>
                </View>
                <Switch
                    value={!isHidden}
                    onValueChange={() => toggleItem(item.key)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                />
            </View>
        );
    };

    const groupedItems = Object.values(
        AVAILABLE_MENU_ITEMS.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
        }, {} as any)
    ).flat() as { key: string, category: string }[];

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{t('settings.customizeMenu') || 'Customize Menu'}</Text>
            <Text style={styles.subHeader}>{t('settings.customizeMenuDesc') || 'Toggle visibility of menu items.'}</Text>

            <FlatList
                data={groupedItems}
                renderItem={renderItem}
                keyExtractor={item => item.key}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    listContent: { padding: theme.spacing.m },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        margin: theme.spacing.m,
        marginBottom: theme.spacing.xs
    },
    subHeader: {
        fontSize: 14,
        color: theme.colors.subText,
        marginHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.l
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.s
    },
    itemLabel: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '500'
    },
    itemCategory: {
        fontSize: 12,
        color: theme.colors.subText,
        textTransform: 'uppercase',
        marginTop: 2
    },
    separator: {
        height: 1,
        backgroundColor: theme.colors.border
    }
});
