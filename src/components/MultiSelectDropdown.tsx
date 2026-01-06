import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';

interface DropdownItem {
  label: string;
  value: string;
}

interface MultiSelectDropdownProps {
  label: string;
  data: DropdownItem[];
  selectedValues: string[];
  onSelect: (values: string[]) => void;
  placeholder?: string;
  error?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  data,
  selectedValues,
  onSelect,
  placeholder,
  error,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const [visible, setVisible] = useState(false);

  const toggleSelection = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelect(selectedValues.filter(v => v !== value));
    } else {
      onSelect([...selectedValues, value]);
    }
  };

  const renderItem = ({ item }: { item: DropdownItem }) => {
    const isSelected = selectedValues.includes(item.value);
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => toggleSelection(item.value)}
      >
        <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>
          {item.label}
        </Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  const selectedLabels = data
    .filter(item => selectedValues.includes(item.value))
    .map(item => item.label)
    .join(', ');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.selector, error ? styles.selectorError : null]}
        onPress={() => setVisible(true)}
      >
        <Text
          style={[
            styles.valueText,
            !selectedValues.length && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedValues.length > 0
            ? selectedLabels
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
                <Text style={styles.closeButton}>{t('common.done')}</Text>
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
    valueText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.s,
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    selectedItemText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    checkmark: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
