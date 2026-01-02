import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllMessages, sendMessage } from '../../store/slices/messagesSlice';
import { selectAllEmployees } from '../../store/slices/employeesSlice';
import { Theme } from '../../theme';
import { ChatMessage } from '../../database/schema';

export const CompanyChatScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { user } = useAuth();
    const dispatch = useDispatch();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const messages = useSelector(selectAllMessages);
    const employees = useSelector(selectAllEmployees);

    // Reverse messages for FlatList (newest at bottom) if inverted, or just scroll to end.
    // Usually chat is inverted or we scroll to end. Let's stick to standard scroll to end for now or inverted for better UX.
    // Let's use standard FlatList and scroll to end on load/new message.

    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (!inputText.trim() || !user) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            senderId: String(user.id), // Ensure string
            receiverId: 'all',
            createdAt: new Date().toISOString(),
        };

        dispatch(sendMessage(newMessage));
        setInputText('');
    };

    // Helper to find sender details
    const getSenderDetails = (senderId: string) => {
        // Check if it's the current user first (optimization)
        if (String(user?.id) === senderId) {
            return { name: user?.name, photo: user?.photoUri };
        }

        // Find in employees list
        const employee = employees.find(e => String(e.id) === senderId);
        if (employee) {
            return { name: employee.name, photo: employee.photoUri }; // Use name (full name usually)
        }

        // Check for 'admin' sender from initial state
        if (senderId === 'admin') {
            return { name: 'Admin', photo: undefined };
        }

        return { name: 'Unknown', photo: undefined };
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderItem = ({ item }: { item: ChatMessage }) => {
        const isMe = String(user?.id) === item.senderId;
        const sender = getSenderDetails(item.senderId);

        return (
            <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
                {!isMe && (
                    <View style={styles.avatarContainer}>
                        {sender.photo ? (
                            <Image source={{ uri: sender.photo }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar]}>
                                <Text style={styles.avatarText}>{sender.name?.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={[styles.bubbleContainer, isMe ? styles.myBubbleContainer : styles.otherBubbleContainer]}>
                    {!isMe && (
                        <Text style={styles.senderName}>{sender.name}</Text>
                    )}
                    <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                            {item.text}
                        </Text>
                    </View>
                    <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.otherTimestamp]}>
                        {formatTime(item.createdAt)}
                    </Text>
                </View>

                {isMe && (
                    <View style={styles.avatarContainer}>
                        {user?.photoUri ? (
                            <Image source={{ uri: user.photoUri }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.placeholderAvatar]}>
                                <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('chat.companyChat') || 'Company Chat'}</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Adjust based on TabBar height
                style={styles.inputContainerWrapper}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder={t('chat.typeMessage') || 'Type a message...'}
                        placeholderTextColor={theme.colors.subText}
                        multiline
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Text style={styles.sendIcon}>➤</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
        },
        header: {
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            alignItems: 'center',
            ...theme.shadows.small,
            zIndex: 1,
        },
        headerTitle: {
            ...theme.textVariants.header,
            color: theme.colors.text,
            fontSize: 18,
        },
        listContent: {
            padding: theme.spacing.m,
            paddingBottom: theme.spacing.xl,
        },
        messageRow: {
            flexDirection: 'row',
            marginBottom: theme.spacing.m,
            alignItems: 'flex-end',
        },
        myMessageRow: {
            justifyContent: 'flex-end',
        },
        otherMessageRow: {
            justifyContent: 'flex-start',
        },
        avatarContainer: {
            marginHorizontal: 8,
        },
        avatar: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.border,
        },
        placeholderAvatar: {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.secondary,
        },
        avatarText: {
            color: '#FFF',
            fontWeight: 'bold',
            fontSize: 14,
        },
        bubbleContainer: {
            maxWidth: '70%',
        },
        myBubbleContainer: {
            alignItems: 'flex-end',
        },
        otherBubbleContainer: {
            alignItems: 'flex-start',
        },
        senderName: {
            fontSize: 12,
            color: theme.colors.subText,
            marginBottom: 4,
            marginLeft: 4,
        },
        bubble: {
            padding: 12,
            borderRadius: 16,
            minWidth: 40,
        },
        myBubble: {
            backgroundColor: theme.colors.primary,
            borderBottomRightRadius: 4,
        },
        otherBubble: {
            backgroundColor: theme.colors.surface,
            borderBottomLeftRadius: 4,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        messageText: {
            fontSize: 16,
            lineHeight: 22,
        },
        myMessageText: {
            color: '#FFFFFF',
        },
        otherMessageText: {
            color: theme.colors.text,
        },
        timestamp: {
            fontSize: 10,
            color: theme.colors.subText,
            marginTop: 4,
            alignSelf: 'flex-end',
            marginRight: 4,
        },
        myTimestamp: {
            alignSelf: 'flex-start', // Actually looks better if aligned with bubble edge, but text-align right
            marginLeft: 4,
        },
        otherTimestamp: {
            marginLeft: 4,
        },
        inputContainerWrapper: {
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            paddingBottom: Platform.OS === 'ios' ? 24 : 12, // Safe area handling manually if needed or just padding
        },
        input: {
            flex: 1,
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            maxHeight: 100,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        sendButton: {
            marginLeft: 12,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        sendIcon: {
            color: '#FFF',
            fontSize: 18,
            marginLeft: 2, // Optical adjustment
        },
    });
