import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal as RNModal,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from './ThemeContext';
import { Theme } from '../theme';
import { modalService } from '../services/modalService';

interface ModalButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface ModalOptions {
  title: string;
  message?: string;
  buttons?: ModalButton[];
}

interface ModalContextType {
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const { theme } = useTheme();

  const showModal = useCallback((opts: ModalOptions) => {
    setOptions(opts);
    setVisible(true);
  }, []);

  // Connect to global service
  React.useEffect(() => {
    modalService.setHandler(showModal);
  }, [showModal]);

  const hideModal = useCallback(() => {
    setVisible(false);
    setTimeout(() => setOptions(null), 300);
  }, []);

  const handleButtonPress = (button: ModalButton) => {
    if (button.onPress) {
      button.onPress();
    }
    hideModal();
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <RNModal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
      >
        <ModalContent
          options={options}
          onButtonPress={handleButtonPress}
          onBackdropPress={hideModal}
          theme={theme}
        />
      </RNModal>
    </ModalContext.Provider>
  );
};

const ModalContent: React.FC<{
  options: ModalOptions | null;
  onButtonPress: (button: ModalButton) => void;
  onBackdropPress: () => void;
  theme: Theme;
}> = ({ options, onButtonPress, onBackdropPress, theme }) => {
  const [scaleAnim] = React.useState(new Animated.Value(0.9));
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!options) return null;

  const styles = createModalStyles(theme);
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  const defaultButtons: ModalButton[] = options.buttons || [
    { text: 'OK', style: 'default' },
  ];

  return (
    <View style={styles.backdrop}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onBackdropPress}
      />
      <Animated.View
        style={[
          styles.modal,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            width: isMobile ? '90%' : 400,
          },
        ]}
      >
        <Text style={styles.title}>{options.title}</Text>
        {options.message && (
          <Text style={styles.message}>{options.message}</Text>
        )}

        <View style={styles.buttonContainer}>
          {defaultButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.button,
                button.style === 'destructive' && styles.destructiveButton,
                button.style === 'cancel' && styles.cancelButton,
              ]}
              onPress={() => onButtonPress(button)}
            >
              <Text
                style={[
                  styles.buttonText,
                  button.style === 'destructive' &&
                    styles.destructiveButtonText,
                  button.style === 'cancel' && styles.cancelButtonText,
                ]}
              >
                {button.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const createModalStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      ...theme.shadows.large,
      zIndex: 1000,
    },
    title: {
      ...theme.textVariants.header,
      fontSize: 20,
      color: theme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    message: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: 22,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    destructiveButton: {
      backgroundColor: theme.colors.error,
    },
    buttonText: {
      ...theme.textVariants.button,
      color: '#FFF',
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.colors.text,
    },
    destructiveButtonText: {
      color: '#FFF',
    },
  });
