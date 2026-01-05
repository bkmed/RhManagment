import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { ChatBot } from './ChatBot';

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        chatButton: {
            padding: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderRadius: 8,
            backgroundColor: `${theme.colors.primary}10`,
        },
        chatIcon: {
            fontSize: 22,
        },
        chatLabel: {
            fontSize: 14,
            fontWeight: '600',
        },
    });

export const ChatBotButton = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <TouchableOpacity
                style={styles.chatButton}
                onPress={() => setIsOpen(true)}
            >
                <Text style={styles.chatIcon}>🤖</Text>
                <Text style={[styles.chatLabel, { color: theme.colors.primary }]}>
                    {t('common.assistant') || 'Assistant'}
                </Text>
            </TouchableOpacity>

            {isOpen && (
                <ChatBot
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
};
