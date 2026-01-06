import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { selectMessagesByReceiver, sendMessage } from '../../store/slices/messagesSlice';
import { ChatMessage } from '../../database/schema';

export const ChatScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { user } = useAuth();
    const dispatch = useDispatch();
    const messages = useSelector(selectMessagesByReceiver('all'));
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage: ChatMessage = {
            id: Math.random().toString(36).substr(2, 9),
            text: inputText,
            senderId: user?.id?.toString() || 'unknown',
            receiverId: 'all',
            createdAt: new Date().toISOString(),
        };

        dispatch(sendMessage(newMessage));
        setInputText('');
    };

    const renderItem = ({ item }: { item: ChatMessage }) => {
        const isMe = item.senderId === user?.id?.toString();
        return (
            <View style={[
                styles.messageContainer,
                isMe ? styles.myMessage : styles.theirMessage
            ]}>
                {!isMe && (
                    <Text style={[styles.senderName, { color: theme.colors.subText }]}>
                        {item.senderId === 'admin' ? 'System' : `Employee ${item.senderId} `}
                    </Text>
                )}
                <View style={[
                    styles.messageBubble,
                    { backgroundColor: isMe ? theme.colors.primary : theme.colors.surface },
                    !isMe && { borderColor: theme.colors.border, borderWidth: 1 }
                ]}>
                    <Text style={[
                        styles.messageText,
                        { color: isMe ? '#FFF' : theme.colors.text }
                    ]}>
                        {item.text}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        { color: isMe ? 'rgba(255,255,255,0.7)' : theme.colors.subText }
                    ]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    onLayout={() => flatListRef.current?.scrollToEnd()}
                    ListEmptyComponent={() => (
                        <View style={styles.centered}>
                            <Text style={{ color: theme.colors.subText }}>{t('chat.noMessages')}</Text>
                        </View>
                    )}
                />

                <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder={t('chat.typeMessage')}
                        placeholderTextColor={theme.colors.subText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleSend}
                    >
                        <Text style={styles.sendIcon}>🏹</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
    },
    messageContainer: {
        marginBottom: 16,
        maxWidth: '80%',
    },
    myMessage: {
        alignSelf: 'flex-end',
    },
    theirMessage: {
        alignSelf: 'flex-start',
    },
    senderName: {
        fontSize: 11,
        marginBottom: 4,
        marginLeft: 4,
    },
    messageBubble: {
        padding: 12,
        borderRadius: 18,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 10,
        maxHeight: 100,
        fontSize: 16,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendIcon: {
        fontSize: 20,
        color: '#FFF',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
});
