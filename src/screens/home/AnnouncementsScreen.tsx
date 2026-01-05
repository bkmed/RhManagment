import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import {
    selectAllAnnouncements,
    addAnnouncement,
    deleteAnnouncement
} from '../../store/slices/announcementsSlice';
import { Announcement } from '../../database/schema';
import { formatDate } from '../../utils/dateUtils';
import { RootState } from '../../store';
import { selectAllCompanies, selectSelectedCompanyId, setSelectedCompanyId } from '../../store/slices/companiesSlice';

export const AnnouncementsScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { user } = useAuth();
    const dispatch = useDispatch();
    const announcements = useSelector(selectAllAnnouncements);
    const companies = useSelector(selectAllCompanies);
    const selectedCompanyId = useSelector(selectSelectedCompanyId);
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState<'news' | 'event' | 'alert'>('news');

    const isAdmin = user?.role === 'admin' || user?.role === 'rh';

    React.useEffect(() => {
        if (!isAdmin && user?.companyId && !selectedCompanyId) {
            dispatch(setSelectedCompanyId(user.companyId));
        }
    }, [isAdmin, user?.companyId, selectedCompanyId, dispatch]);

    const handleCreateAnnouncement = () => {
        if (!newTitle.trim() || !newContent.trim()) return;

        const announcement: Announcement = {
            id: Date.now(),
            title: newTitle,
            content: newContent,
            category: newCategory,
            authorId: Number(user?.id) || 0,
            authorName: user?.name || 'Admin',
            companyId: selectedCompanyId || 0,
            createdAt: new Date().toISOString(),
            date: new Date().toISOString(),
        };

        dispatch(addAnnouncement(announcement));
        setModalVisible(false);
        setNewTitle('');
        setNewContent('');
        setNewCategory('news');
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'event': return '📅';
            case 'alert': return '⚠️';
            default: return '📢';
        }
    };

    const renderItem = ({ item }: { item: Announcement }) => (
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: `${theme.colors.primary}15` }]}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
                    <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
                        {item.category.toUpperCase()}
                    </Text>
                </View>
                <Text style={[styles.dateText, { color: theme.colors.subText }]}>
                    {formatDate(item.createdAt)}
                </Text>
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
            <Text style={[styles.content, { color: theme.colors.text, opacity: 0.8 }]}>{item.content}</Text>

            <View style={styles.cardFooter}>
                <Text style={[styles.author, { color: theme.colors.subText }]}>
                    {t('payroll.issuedBy')}: {item.authorName}
                </Text>
                {isAdmin && (
                    <TouchableOpacity
                        onPress={() => item.id && dispatch(deleteAnnouncement(item.id))}
                        style={styles.deleteButton}
                    >
                        <Text style={{ color: theme.colors.error, fontSize: 12, fontWeight: '600' }}>
                            {t('common.delete')}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (!selectedCompanyId) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{t('announcements.title')}</Text>
                </View>
                <View style={styles.centered}>
                    {!isAdmin && !user?.companyId ? (
                        <Text style={[styles.emptyText, { color: theme.colors.text, textAlign: 'center' }]}>
                            {t('companies.noCompanyAssigned')}
                        </Text>
                    ) : isAdmin ? (
                        <>
                            <Text style={[styles.emptyText, { color: theme.colors.text, marginBottom: 20 }]}>
                                {t('companies.selectCompany')}
                            </Text>
                            <FlatList
                                data={companies}
                                keyExtractor={(item) => String(item.id)}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.companyItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                        onPress={() => dispatch(setSelectedCompanyId(item.id))}
                                    >
                                        <Text style={[styles.companyNameText, { color: theme.colors.text }]}>{item.name}</Text>
                                        <Text style={{ fontSize: 18 }}>➤</Text>
                                    </TouchableOpacity>
                                )}
                                style={{ width: '100%', paddingHorizontal: 20 }}
                            />
                        </>
                    ) : (
                        <ActivityIndicator color={theme.colors.primary} />
                    )}
                </View>
            </View>
        );
    }

    const filteredAnnouncements = announcements.filter(a => a.companyId === selectedCompanyId);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                {isAdmin && (
                    <TouchableOpacity onPress={() => dispatch(setSelectedCompanyId(null))} style={styles.backButton}>
                        <Text style={[styles.backIcon, { color: theme.colors.primary }]}>←</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>{t('announcements.title')}</Text>
            </View>
            <FlatList
                data={[...filteredAnnouncements].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
                renderItem={renderItem}
                keyExtractor={(item) => (item.id || 0).toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.colors.subText }]}>
                            {t('announcements.noAnnouncements')}
                        </Text>
                    </View>
                }
            />

            {isAdmin && (
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                            {t('announcements.addAnnouncement')}
                        </Text>

                        <ScrollView>
                            <Text style={[styles.label, { color: theme.colors.text }]}>{t('payroll.name')}</Text>
                            <TextInput
                                style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
                                value={newTitle}
                                onChangeText={setNewTitle}
                                placeholder={t('announcements.placeholder')}
                                placeholderTextColor={theme.colors.subText}
                            />

                            <Text style={[styles.label, { color: theme.colors.text }]}>{t('claims.description')}</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { borderColor: theme.colors.border, color: theme.colors.text }]}
                                value={newContent}
                                onChangeText={setNewContent}
                                multiline
                                numberOfLines={4}
                                placeholder={t('announcements.placeholder')}
                                placeholderTextColor={theme.colors.subText}
                            />

                            <Text style={[styles.label, { color: theme.colors.text }]}>{t('claims.type')}</Text>
                            <View style={styles.categoryToggle}>
                                {(['news', 'event', 'alert'] as const).map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setNewCategory(cat)}
                                        style={[
                                            styles.categoryOption,
                                            { borderColor: theme.colors.border },
                                            newCategory === cat && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.categoryOptionText,
                                            { color: theme.colors.text },
                                            newCategory === cat && { color: '#FFF' }
                                        ]}>
                                            {cat.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.colors.border }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={{ color: theme.colors.text }}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handleCreateAnnouncement}
                            >
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('announcements.publish')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        listContent: {
            padding: 16,
            paddingBottom: 100,
        },
        card: {
            padding: 16,
            borderRadius: 16,
            marginBottom: 16,
            borderWidth: 1,
            ...theme.shadows.small,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        categoryBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            gap: 6,
        },
        categoryIcon: {
            fontSize: 14,
        },
        categoryText: {
            fontSize: 10,
            fontWeight: 'bold',
            letterSpacing: 0.5,
        },
        dateText: {
            fontSize: 12,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 8,
        },
        content: {
            fontSize: 14,
            lineHeight: 20,
            marginBottom: 16,
        },
        cardFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0,0,0,0.05)',
            paddingTop: 12,
        },
        author: {
            fontSize: 12,
            fontStyle: 'italic',
        },
        deleteButton: {
            padding: 4,
        },
        fab: {
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            ...theme.shadows.medium,
        },
        fabIcon: {
            fontSize: 32,
            color: '#FFF',
            lineHeight: 36,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        modalContainer: {
            width: '100%',
            maxWidth: 500,
            borderRadius: 24,
            padding: 24,
            maxHeight: '80%',
        },
        modalTitle: {
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 20,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 8,
            marginTop: 16,
        },
        input: {
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            fontSize: 16,
        },
        textArea: {
            height: 120,
            textAlignVertical: 'top',
        },
        categoryToggle: {
            flexDirection: 'row',
            gap: 8,
            marginTop: 8,
        },
        categoryOption: {
            flex: 1,
            padding: 10,
            borderRadius: 10,
            borderWidth: 1,
            alignItems: 'center',
        },
        categoryOptionText: {
            fontSize: 10,
            fontWeight: 'bold',
        },
        modalFooter: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 24,
        },
        modalButton: {
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
            minWidth: 100,
            alignItems: 'center',
        },
        emptyContainer: {
            height: 300,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyText: {
            fontSize: 16,
        },
        header: {
            padding: 16,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.05)',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: 'bold',
        },
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        companyItem: {
            width: '100%',
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 1,
        },
        companyNameText: {
            fontSize: 16,
            fontWeight: '600',
        },
        backButton: {
            position: 'absolute',
            left: 16,
            padding: 8,
        },
        backIcon: {
            fontSize: 24,
            fontWeight: 'bold',
        },
    });
