import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import {
  selectAllNotifications,
  selectUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../../store/slices/notificationsSlice';
import { formatDate } from '../../utils/dateUtils';
import { Theme } from '../../theme';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    bellButton: {
      padding: 8,
      position: 'relative',
    },
    bellIcon: {
      fontSize: 22,
    },
    badge: {
      position: 'absolute',
      top: 4,
      right: 4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 1.5,
      borderColor: '#FFF',
    },
    badgeText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.2)',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingTop: 80, // Adjust based on header height
      paddingRight: 20,
    },
    popover: {
      width: 320,
      borderRadius: 16,
      ...theme.shadows.large,
    },
    popoverHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
    },
    popoverTitle: {
      fontSize: 16,
      fontWeight: '700',
    },
    markReadText: {
      fontSize: 12,
      fontWeight: '600',
    },
    notificationItem: {
      padding: 16,
      borderBottomWidth: 1,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    notificationTitle: {
      fontSize: 14,
      flex: 1,
    },
    notificationDate: {
      fontSize: 10,
      marginLeft: 8,
    },
    notificationMessage: {
      fontSize: 13,
      lineHeight: 18,
      opacity: 0.8,
    },
    emptyContainer: {
      padding: 32,
      alignItems: 'center',
    },
  });

export const NotificationBell = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const notifications = useSelector(selectAllNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleNotificationPress = (id: string) => {
    dispatch(markAsRead(id));
    // Could navigate to a specific screen if link is present
    // setModalVisible(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { borderBottomColor: theme.colors.border },
        !item.isRead && { backgroundColor: `${theme.colors.primary}10` },
      ]}
      onPress={() => handleNotificationPress(item.id)}
    >
      <View style={styles.notificationHeader}>
        <Text
          style={[
            styles.notificationTitle,
            { color: theme.colors.text },
            !item.isRead && { fontWeight: '700' },
          ]}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.notificationDate, { color: theme.colors.subText }]}
        >
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <Text
        style={[styles.notificationMessage, { color: theme.colors.text }]}
        numberOfLines={2}
      >
        {item.message}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        style={styles.bellButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.bellIcon}>🔔</Text>
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[styles.popover, { backgroundColor: theme.colors.surface }]}
          >
            <View
              style={[
                styles.popoverHeader,
                { borderBottomColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.popoverTitle, { color: theme.colors.text }]}>
                {t('notifications.title')}
              </Text>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={() => dispatch(markAllAsRead())}>
                  <Text
                    style={[
                      styles.markReadText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {t('notifications.markAllAsRead')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={notifications}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={{ color: theme.colors.subText }}>
                    {t('notifications.noNotifications')}
                  </Text>
                </View>
              }
              style={{ maxHeight: 400 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
