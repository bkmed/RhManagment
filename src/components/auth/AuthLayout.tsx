import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isTabletOrDesktop = width >= 768;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} // 'height' can sometimes be buggy on web/android depending on structure
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + (isWeb ? 40 : 20),
            paddingBottom: insets.bottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, isTabletOrDesktop && styles.cardDesktop]}>
          <View style={styles.header}>
            <Image
              source={require('../../../public/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.m,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.xl,
      padding: theme.spacing.l,
      ...theme.shadows.medium,
      // Add subtle border for better definition on light backgrounds
      borderWidth: 1,
      borderColor: theme.colors.border ? theme.colors.border : 'transparent',
    },
    cardDesktop: {
      padding: theme.spacing.xl,
      maxWidth: 480,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: theme.spacing.m,
    },
    title: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      textAlign: 'center',
    },
  });
