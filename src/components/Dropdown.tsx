import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';

interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  data: DropdownItem[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  data,
  value,
  onSelect,
  placeholder,
  error,
  disabled,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const [visible, setVisible] = useState(false);

  const renderItem = ({ item }: { item: DropdownItem }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        onSelect(item.value);
        setVisible(false);
      }}
    >
      <Text
        style={[
          styles.itemText,
          item.value === value && styles.selectedItemText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const selectedItem = data.find(item => item.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.selector,
          error ? styles.selectorError : null,
          disabled ? styles.selectorDisabled : null,
        ]}
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
      >
        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {selectedItem
            ? selectedItem.label
            : placeholder || t('common.select')}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={visible} transparent animationType="slide">
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.closeButton}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={item => item.value}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.m,
    },
    label: {
      ...theme.textVariants.caption,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
    },
    selector: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectorError: {
      borderColor: theme.colors.error,
    },
    selectorDisabled: {
      backgroundColor: theme.colors.background,
      opacity: 0.6,
    },
    valueText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    placeholderText: {
      color: theme.colors.subText,
    },
    chevron: {
      color: theme.colors.subText,
      fontSize: 12,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.spacing.l,
      borderTopRightRadius: theme.spacing.l,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    closeButton: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    listContent: {
      paddingBottom: theme.spacing.xl,
    },
    item: {
      padding: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    itemText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    selectedItemText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });
