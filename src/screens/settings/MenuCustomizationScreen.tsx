import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
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

export const MenuCustomizationScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [preferences, setPreferences] = useState<MenuPreferences>({ hiddenItems: [], customOrder: [] });
    const [, setLoading] = useState(true);

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

    const moveItem = async (key: string, direction: 'up' | 'down') => {
        const currentOrder = preferences.customOrder && preferences.customOrder.length > 0
            ? preferences.customOrder
            : AVAILABLE_MENU_ITEMS.map(i => i.key);

        const index = currentOrder.indexOf(key);
        if (index === -1) return;

        const newOrder = [...currentOrder];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= newOrder.length) return;

        [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];

        try {
            await menuPreferencesService.reorderItems(newOrder);
            setPreferences(prev => ({ ...prev, customOrder: newOrder }));
        } catch (error) {
            console.error(error);
            notificationService.showToast(t('common.error'), 'error');
        }
    };

    const renderItem = ({ item, index }: { item: { key: string, category: string }, index: number }) => {
        const isHidden = preferences.hiddenItems.includes(item.key);
        const label = t(`navigation.${item.key.toLowerCase()}`) || t(`${item.key.toLowerCase()}.title`) || item.key;

        return (
            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.itemLabel}>{label}</Text>
                    <Text style={styles.itemCategory}>{t(`sections.${item.category}`)}</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => moveItem(item.key, 'up')}
                        disabled={index === 0}
                        style={[styles.moveButton, index === 0 && styles.disabledButton]}
                    >
                        <Text style={styles.moveButtonText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => moveItem(item.key, 'down')}
                        disabled={index === groupedItems.length - 1}
                        style={[styles.moveButton, index === groupedItems.length - 1 && styles.disabledButton]}
                    >
                        <Text style={styles.moveButtonText}>↓</Text>
                    </TouchableOpacity>
                    <Switch
                        value={!isHidden}
                        onValueChange={() => toggleItem(item.key)}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    />
                </View>
            </View>
        );
    };

    const groupedItems = useMemo(() => {
        const order = preferences.customOrder && preferences.customOrder.length > 0
            ? preferences.customOrder
            : AVAILABLE_MENU_ITEMS.map(i => i.key);

        return order.map(key => AVAILABLE_MENU_ITEMS.find(i => i.key === key)).filter(Boolean) as { key: string, category: string }[];
    }, [preferences.customOrder]);

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
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s
    },
    moveButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center'
    },
    moveButtonText: {
        fontSize: 16,
        color: theme.colors.primary,
        fontWeight: 'bold'
    },
    disabledButton: {
        opacity: 0.3
    }
});
