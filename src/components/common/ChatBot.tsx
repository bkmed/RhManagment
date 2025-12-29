import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Modal,
    SafeAreaView,
    Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { selectAllEmployees } from '../../store/slices/employeesSlice';
import { selectAllTeams } from '../../store/slices/teamsSlice';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export const ChatBot = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Hello ${user?.name}! I am your HR Assistant Pro. How can I help you today?`,
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const employees = useSelector(selectAllEmployees);
    const teams = useSelector(selectAllTeams);

    const flatListRef = useRef<FlatList>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isOpen) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [isOpen]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            const botResponse = generateResponse(inputText);
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
        }, 1000);
    };

    const generateResponse = (text: string) => {
        const input = text.toLowerCase();

        if (input.includes('vacation') || input.includes('leave')) {
            return `You have ${user?.remainingVacationDays || 0} vacation days remaining for this year. You can request more in the Leaves section!`;
        }

        if (input.includes('team') || input.includes('manager')) {
            const myTeam = teams.find(t => t.id === user?.teamId);
            if (myTeam) {
                return `You are in the ${myTeam.name} team. Your department is ${myTeam.department}.`;
            }
            return "I couldn't find your team information. Please check your profile.";
        }

        if (input.includes('employee') || input.includes('colleague')) {
            return `There are currently ${employees.length} employees in the company. You can find them in the Employees directory!`;
        }

        if (input.includes('hello') || input.includes('hi')) {
            return "Hi there! I'm here to help with any HR questions you have.";
        }

        if (input.includes('payroll') || input.includes('salary')) {
            return "You can view your active payroll items and history in the Payroll section. Reminders are also available!";
        }

        return "That's a great question! As an AI HR Assistant, I recommend checking the specific section in the app or contacting your HR manager for more details.";
    };

    const renderItem = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageWrapper,
            item.sender === 'user' ? styles.userWrapper : styles.botWrapper
        ]}>
            <View style={[
                styles.bubble,
                item.sender === 'user'
                    ? { backgroundColor: theme.colors.primary }
                    : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }
            ]}>
                <Text style={[
                    styles.messageText,
                    { color: item.sender === 'user' ? '#FFF' : theme.colors.text }
                ]}>
                    {item.text}
                </Text>
            </View>
            <Text style={[styles.timestamp, { color: theme.colors.subText }]}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    );

    return (
        <>
            <TouchableOpacity
                style={[styles.floatingButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setIsOpen(true)}
            >
                <Text style={styles.botIcon}>🤖</Text>
                <View style={styles.proBadge}>
                    <Text style={styles.proText}>PRO</Text>
                </View>
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsOpen(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={[styles.chatContainer, { backgroundColor: theme.colors.background }]}
                    >
                        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                            <View style={styles.headerInfo}>
                                <Text style={styles.headerTitle}>Assistant HR Pro</Text>
                                <Text style={styles.headerStatus}>Online • Free Tier</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
                                <Text style={styles.closeIcon}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                        />

                        {isTyping && (
                            <Text style={[styles.typingIndicator, { color: theme.colors.subText }]}>
                                Assistant is typing...
                            </Text>
                        )}

                        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
                            <TextInput
                                style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Ask me anything..."
                                placeholderTextColor={theme.colors.subText}
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
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        zIndex: 1000,
    },
    botIcon: {
        fontSize: 30,
    },
    proBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FFD700',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFF',
    },
    proText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#000',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    chatContainer: {
        height: '80%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerStatus: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
    closeButton: {
        padding: 4,
    },
    closeIcon: {
        color: '#FFF',
        fontSize: 24,
    },
    listContent: {
        padding: 20,
    },
    messageWrapper: {
        marginBottom: 20,
        maxWidth: '85%',
    },
    userWrapper: {
        alignSelf: 'flex-end',
    },
    botWrapper: {
        alignSelf: 'flex-start',
    },
    bubble: {
        padding: 14,
        borderRadius: 20,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
        marginHorizontal: 8,
    },
    typingIndicator: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        fontSize: 12,
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 12,
        fontSize: 16,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendIcon: {
        fontSize: 22,
        color: '#FFF',
    },
});
