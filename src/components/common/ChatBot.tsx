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
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { selectAllEmployees } from '../../store/slices/employeesSlice';
import { selectAllTeams } from '../../store/slices/teamsSlice';
import { selectPendingLeaves } from '../../store/slices/leavesSlice';
import { selectPendingClaims } from '../../store/slices/claimsSlice';
import { trackQuery } from '../../store/slices/analyticsSlice';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { useContext } from 'react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    action?: {
        label: string;
        screen: string;
        subScreen?: string;
    };
}

export const ChatBot = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const { setActiveTab } = useContext(WebNavigationContext); // For Web Navigation

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    // Initial Greeting Effect
    useEffect(() => {
        setMessages([
            {
                id: '1',
                text: t('chatBot.greeting', { name: user?.name || 'User' }),
                sender: 'bot',
                timestamp: new Date(),
            },
        ]);
    }, [t, user?.name]);

    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const employees = useSelector(selectAllEmployees);
    const teams = useSelector(selectAllTeams);
    const pendingLeaves = useSelector(selectPendingLeaves);
    const pendingClaims = useSelector(selectPendingClaims);

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

    const dispatch = useDispatch(); // Add dispatch hook

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
        };

        // Track user query in metrics
        dispatch(trackQuery({
            id: userMessage.id,
            text: userMessage.text,
            timestamp: userMessage.timestamp.toISOString(),
            role: 'user',
        }));

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            const response = generateResponse(inputText); // Now returns object
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.text,
                sender: 'bot',
                timestamp: new Date(),
                action: response.action,
            };
            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
        }, 1000);
    };

    // Multilingual Intent Keywords
    const INTENTS = {
        payroll: ['payroll', 'salary', 'pay', 'paie', 'salaire', 'gehalt', 'nómina', 'nómina', 'راتب', 'رواتب'],
        leave: ['leave', 'vacation', 'off', 'congé', 'vacances', 'urlaub', 'abwesenheit', 'vacaciones', 'permiso', 'إجازة', 'عطلة'],
        team: ['team', 'manager', 'équipe', 'chef', 'leitung', 'equipo', 'jefe', 'فريق', 'مدير'],
        claim: ['claim', 'expense', 'refund', 'réclamation', 'dépense', 'forderung', 'reclamación', 'gasto', 'مطالبة', 'مصروفات'],
        profile: ['profile', 'setting', 'edit', 'profil', 'paramètre', 'einstellung', 'perfil', 'ajuste', 'ملف', 'إعدادات'],
        employees: ['employee', 'staff', 'worker', 'employé', 'personnel', 'mitarbeiter', 'empleado', 'trabajador', 'موظف', 'عمال'],
        approvals: ['approval', 'pending', 'request', 'approbation', 'attente', 'genehmigung', 'ausstehend', 'aprobación', 'pendiente', 'موافقة', 'معلقة'],
        hello: ['hello', 'hi', 'bonjour', 'salut', 'hallo', 'hola', 'مرحبا', 'أهلا', '你好', 'नमस्ते'],
        howAreYou: ['how are you', 'how is it going', 'comment ça va', 'ca va', 'ça va', 'wie geht es', 'como estas', 'cómo estás', 'كيف حالك', '你好吗', 'आप कैसे हैं']
    };

    const generateResponse = (text: string): { text: string, action?: { label: string, screen: string, subScreen?: string } } => {
        const input = text.toLowerCase();

        const checkIntent = (keywords: string[]) => keywords.some(k => input.includes(k));

        // 1. Admin Specific: Stats & Approvals
        if (user?.role === 'admin') {
            if (checkIntent(INTENTS.approvals)) {
                const totalPending = pendingLeaves.length + pendingClaims.length;
                return {
                    text: t('chatBot.pendingApprovals', { count: totalPending }),
                    action: { label: t('chatBot.pendingApprovalsAction'), screen: 'LeavesTab' }
                };
            }
            if (checkIntent(INTENTS.employees) || input.includes('stat')) {
                return {
                    text: t('chatBot.adminStats', { employees: employees.length, teams: teams.length }),
                    action: { label: t('chatBot.employeesAction'), screen: 'Employees' }
                };
            }
        } else {
            // Employee Specific: My Requests Status
            if (checkIntent(INTENTS.approvals) || input.includes('status')) {
                // Filter for current user's requests
                const myPendingLeaves = pendingLeaves.filter(l => String(l.employeeId) === String(user?.id)).length;
                const myPendingClaims = pendingClaims.filter(c => String(c.employeeId) === String(user?.id)).length;
                const totalMyPending = myPendingLeaves + myPendingClaims;

                return {
                    text: t('chatBot.pendingApprovals', { count: totalMyPending }), // Reuse key or add new one? reused key works "You have X pending requests"
                    action: { label: t('chatBot.pendingApprovalsAction'), screen: 'LeavesTab' }
                };
            }
        }

        // 2. Navigation: Payroll
        if (checkIntent(INTENTS.payroll)) {
            return {
                text: t('chatBot.payroll'),
                action: { label: t('chatBot.payrollAction'), screen: 'PayrollTab' }
            };
        }

        // 3. Navigation: Leaves / Vacation
        if (checkIntent(INTENTS.leave)) {
            return {
                text: t('chatBot.leave', { days: user?.remainingVacationDays || 0 }),
                action: { label: t('chatBot.leaveAction'), screen: 'LeavesTab', subScreen: 'AddLeave' }
            };
        }

        // 4. Navigation: Team
        if (checkIntent(INTENTS.team)) {
            const myTeam = teams.find(t => t.id === user?.teamId);
            if (myTeam) {
                return {
                    text: t('chatBot.team', { team: myTeam.name, dept: myTeam.department }),
                    action: { label: t('chatBot.teamAction'), screen: 'Profile', subScreen: 'MyTeam' }
                };
            }
            return {
                text: t('chatBot.teamUnknown'),
                action: { label: t('chatBot.profileAction'), screen: 'Profile' }
            };
        }

        // 5. Navigation: Claims
        if (checkIntent(INTENTS.claim)) {
            return {
                text: t('chatBot.claim'),
                action: { label: t('chatBot.claimAction'), screen: 'ClaimsTab', subScreen: 'AddClaim' }
            };
        }

        // 6. Navigation: Profile
        if (checkIntent(INTENTS.profile)) {
            return {
                text: t('chatBot.profile'),
                action: { label: t('chatBot.profileAction'), screen: 'Profile' }
            };
        }

        // 7. General Employee Directory (for non-admins too)
        if (checkIntent(INTENTS.employees)) {
            return {
                text: t('chatBot.employees', { count: employees.length }),
                action: { label: t('chatBot.employeesAction'), screen: 'Employees' }
            };
        }

        if (checkIntent(INTENTS.howAreYou)) {
            return { text: t('chatBot.responseCaVa') };
        }

        if (checkIntent(INTENTS.hello)) {
            return { text: `${t('chatBot.howCanIHelp')}\n\n${t('chatBot.helpDetails')}` };
        }

        return { text: t('chatBot.fallback') };
    };

    const handleAction = (action: { label: string, screen: string, subScreen?: string }) => {
        setIsOpen(false);
        if (Platform.OS === 'web') {
            // Web Navigation
            // Map mobile tab/stack names to Web Tabs
            let webTab = action.screen;
            if (action.screen === 'PayrollTab') webTab = 'Payroll';
            if (action.screen === 'LeavesTab') webTab = 'Leaves';
            if (action.screen === 'ClaimsTab') webTab = 'Claims';

            setActiveTab(webTab, action.subScreen);
        } else {
            // Mobile Navigation
            if (action.subScreen) {
                // Determine stack based on screen/tab
                // This is a bit simplified; ideally navigation structure is more flattened or we know exact stack
                // For now, let's try navigating to the Tab then the Screen if possible, or just the screen if it's unique
                navigation.navigate(action.screen, { screen: action.subScreen });
            } else {
                navigation.navigate(action.screen);
            }
        }
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

                {/* Render Action Button if present */}
                {item.action && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
                        onPress={() => handleAction(item.action!)}
                    >
                        <Text style={styles.actionButtonText}>{item.action.label} →</Text>
                    </TouchableOpacity>
                )}
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
                                <Text style={styles.headerTitle}>{t('common.assistant') || 'Assistant HR Pro'}</Text>
                                <Text style={styles.headerStatus}>{t('common.online') || 'Online'}</Text>
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
                                placeholder={t('common.askAnything') || "Ask me anything..."}
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
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }
        }),
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
    actionButton: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    actionButtonText: {
        color: '#000',
        fontWeight: '600',
        fontSize: 14,
    },
});
