import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { selectAllEmployees } from '../../store/slices/employeesSlice';
import { selectAllTeams } from '../../store/slices/teamsSlice';
import { selectAllAnnouncements } from '../../store/slices/announcementsSlice';
import { Employee, Team, Announcement } from '../../database/schema';

interface SearchResult {
    id: string;
    title: string;
    subtitle: string;
    type: 'employee' | 'team' | 'announcement';
    originalItem: any;
}

export const SearchOverlay = ({ visible, onClose, onSelect }: {
    visible: boolean;
    onClose: () => void;
    onSelect: (item: SearchResult) => void;
}) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [query, setQuery] = useState('');

    const employees = useSelector(selectAllEmployees);
    const teams = useSelector(selectAllTeams);
    const announcements = useSelector(selectAllAnnouncements);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const results = useMemo(() => {
        if (!query.trim()) return [];

        const lowerQuery = query.toLowerCase();
        const searchResults: SearchResult[] = [];

        // Search Employees
        employees.forEach((e: Employee) => {
            const name = e.name || '';
            const email = e.email || '';
            if (name.toLowerCase().includes(lowerQuery) || email.toLowerCase().includes(lowerQuery)) {
                searchResults.push({
                    id: String(e.id),
                    title: name,
                    subtitle: e.position || email || '',
                    type: 'employee',
                    originalItem: e,
                });
            }
        });

        // Search Teams
        teams.forEach((tm: Team) => {
            const teamName = tm.name || '';
            if (teamName.toLowerCase().includes(lowerQuery)) {
                searchResults.push({
                    id: String(tm.id),
                    title: teamName,
                    subtitle: tm.department || '',
                    type: 'team',
                    originalItem: tm,
                });
            }
        });

        // Search Announcements
        announcements.forEach((a: Announcement) => {
            const title = a.title || '';
            const content = a.content || '';
            if (title.toLowerCase().includes(lowerQuery) || content.toLowerCase().includes(lowerQuery)) {
                searchResults.push({
                    id: String(a.id),
                    title: title,
                    subtitle: formatDate(a.createdAt),
                    type: 'announcement',
                    originalItem: a,
                });
            }
        });

        return searchResults;
    }, [query, employees, teams, announcements]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'employee': return '👥';
            case 'team': return '🤝';
            case 'announcement': return '📢';
            default: return '🔍';
        }
    };

    const renderItem = ({ item }: { item: SearchResult }) => (
        <TouchableOpacity
            style={[styles.resultItem, { borderBottomColor: theme.colors.border }]}
            onPress={() => onSelect(item)}
        >
            <View style={[styles.typeIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
                <Text style={{ fontSize: 18 }}>{getIcon(item.type)}</Text>
            </View>
            <View style={styles.resultText}>
                <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.resultSubtitle, { color: theme.colors.subText }]}>{item.subtitle}</Text>
            </View>
            <Text style={[styles.typeLabel, { color: theme.colors.subText }]}>{t(`navigation.${item.type === 'employee' ? 'employees' : item.type === 'team' ? 'teams' : 'announcements'}`)}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
                    <View style={[styles.searchBar, { borderBottomColor: theme.colors.border }]}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={[styles.input, { color: theme.colors.text }]}
                            value={query}
                            onChangeText={setQuery}
                            placeholder={t('common.searchPlaceholderGlobal')}
                            placeholderTextColor={theme.colors.subText}
                            autoFocus
                        />
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{t('common.close')}</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={results}
                        renderItem={renderItem}
                        keyExtractor={(item) => `${item.type}-${item.id}`}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            query ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={{ color: theme.colors.subText }}>No results found for "{query}"</Text>
                                </View>
                            ) : null
                        }
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        marginTop: Platform.OS === 'web' ? 20 : 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    searchIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 18,
        paddingVertical: 8,
    },
    closeButton: {
        paddingLeft: 16,
    },
    list: {
        padding: 16,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    typeIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    resultText: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    resultSubtitle: {
        fontSize: 13,
    },
    typeLabel: {
        fontSize: 11,
        fontStyle: 'italic',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
});
