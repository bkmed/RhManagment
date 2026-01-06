import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';

interface DateTimePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
  minimumDate?: Date;
  maximumDate?: Date;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export const DateTimePickerField: React.FC<DateTimePickerFieldProps> = ({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  required = false,
  error,
  placeholder,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const handleOpen = () => {
    setTempDate(value || new Date());
    setShow(true);
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    if (tempDate) {
      onChange(tempDate);
    }
    setShow(false);
  };

  const handleCancel = () => {
    setShow(false);
  };

  const formattedValue = value
    ? mode === 'time'
      ? value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : value.toLocaleDateString()
    : placeholder ||
      (mode === 'time' ? t('common.selectTime') : t('common.selectDate'));

  // Web Support: Use native HTML input
  if (Platform.OS === 'web') {
    const handleWebChange = (e: any) => {
      const inputValue = e.target.value;
      if (mode === 'time') {
        if (inputValue) {
          const [hours, minutes] = inputValue.split(':').map(Number);
          const newDate = value ? new Date(value) : new Date();
          newDate.setHours(hours);
          newDate.setMinutes(minutes);
          newDate.setSeconds(0);
          newDate.setMilliseconds(0);
          onChange(newDate);
        }
      } else {
        const dateValue = new Date(inputValue);
        if (!isNaN(dateValue.getTime())) {
          onChange(dateValue);
        }
      }
    };

    // For time input on web, value format is HH:MM
    // For date input on web, value format is YYYY-MM-DD
    const webValue = value
      ? mode === 'time'
        ? value.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : value.toISOString().split('T')[0]
      : '';

    return (
      <View style={styles.container}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <input
          type={mode === 'time' ? 'time' : 'date'}
          value={webValue}
          onChange={handleWebChange}
          style={{
            padding: 10,
            fontSize: 16,
            borderWidth: 1,
            borderColor: error ? theme.colors.error : theme.colors.border,
            borderRadius: 8,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            width: '100%',
            boxSizing: 'border-box',
            fontFamily: 'system-ui',
          }}
          min={
            minimumDate ? minimumDate.toISOString().split('T')[0] : undefined
          }
          max={
            maximumDate ? maximumDate.toISOString().split('T')[0] : undefined
          }
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>

      <TouchableOpacity
        style={[styles.input, error ? styles.inputError : null]}
        onPress={handleOpen}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {formattedValue}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Android/iOS Date Picker */}
      {show &&
        (Platform.OS === 'ios' ? (
          <Modal
            transparent
            animationType="slide"
            visible={show}
            onRequestClose={handleCancel}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={handleCancel}>
                    <Text style={styles.cancelButton}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleConfirm}>
                    <Text style={styles.doneButton}>
                      {t('common.validate')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDate || value || new Date()}
                  mode={mode}
                  is24Hour={true}
                  display="spinner"
                  onChange={handleChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  textColor={theme.colors.text}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={value || new Date()}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        ))}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.m,
    },
    label: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    required: {
      color: theme.colors.error,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    inputText: {
      ...theme.textVariants.body,
      color: theme.colors.text,
    },
    placeholder: {
      color: theme.colors.subText,
    },
    errorText: {
      ...theme.textVariants.caption,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    doneButton: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButton: {
      color: theme.colors.error,
      fontSize: 16,
      fontWeight: '400',
    },
  });
