import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { currenciesDb } from '../../database/currenciesDb';
import { Currency } from '../../database/schema';
import { Theme } from '../../theme';

export const ManageCurrenciesScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { showModal } = useModal();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState('');
  const [editingSymbol, setEditingSymbol] = useState('');

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    const all = await currenciesDb.getAll();
    setCurrencies(all);
  };

  const handleAdd = async () => {
    if (!newCode.trim() || !newSymbol.trim()) {
      showToast(t('payroll.fillRequired'), 'info');
      return;
    }
    await currenciesDb.add(newCode.trim().toUpperCase(), newSymbol.trim());
    setNewCode('');
    setNewSymbol('');
    loadCurrencies();
  };

  const handleUpdate = async () => {
    if (!editingId || !editingCode.trim() || !editingSymbol.trim()) return;
    await currenciesDb.update(
      editingId,
      editingCode.trim().toUpperCase(),
      editingSymbol.trim(),
    );
    setEditingId(null);
    setEditingCode('');
    setEditingSymbol('');
    loadCurrencies();
  };

  const handleDelete = (id: string) => {
    showModal({
      title: t('common.confirm'),
      message: t('common.confirmDelete'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await currenciesDb.delete(id);
              loadCurrencies();
              showToast(t('common.success'), 'success');
            } catch (error) {
              showToast(t('common.error'), 'error');
              console.error(error);
            }
          },
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {t('common.add')} {t('payroll.currency')}
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            value={newCode}
            onChangeText={setNewCode}
            placeholder="USD"
            placeholderTextColor={theme.colors.subText}
            autoCapitalize="characters"
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={newSymbol}
            onChangeText={setNewSymbol}
            placeholder="$"
            placeholderTextColor={theme.colors.subText}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>{t('common.add')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.list}>
        {currencies.map(currency => (
          <View key={currency.id} style={styles.item}>
            {editingId === currency.id ? (
              <View style={styles.editRow}>
                <TextInput
                  style={[styles.input, { flex: 2 }]}
                  value={editingCode}
                  onChangeText={setEditingCode}
                  autoCapitalize="characters"
                  autoFocus
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={editingSymbol}
                  onChangeText={setEditingSymbol}
                />
                <TouchableOpacity onPress={handleUpdate}>
                  <Text style={styles.saveText}>{t('common.save')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingId(null)}>
                  <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.row}>
                <View style={styles.info}>
                  <Text style={styles.code}>{currency.code}</Text>
                  <Text style={styles.symbol}>{currency.symbol}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingId(currency.id);
                      setEditingCode(currency.code);
                      setEditingSymbol(currency.symbol);
                    }}
                  >
                    <Text style={styles.editText}>{t('common.edit')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(currency.id)}>
                    <Text style={styles.deleteText}>{t('common.delete')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.m,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.l,
      ...theme.shadows.small,
    },
    sectionTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.primary,
      marginBottom: theme.spacing.s,
    },
    inputRow: { flexDirection: 'row', gap: theme.spacing.s },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
      fontSize: 16,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.spacing.s,
      paddingHorizontal: theme.spacing.l,
      justifyContent: 'center',
    },
    addButtonText: { color: '#FFF', fontWeight: 'bold' },
    list: { flex: 1 },
    item: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.s,
      ...theme.shadows.small,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    info: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m },
    code: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    symbol: { fontSize: 18, color: theme.colors.subText },
    editRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    actions: { flexDirection: 'row', gap: 16 },
    editText: { color: theme.colors.primary },
    deleteText: { color: theme.colors.error },
    saveText: { color: theme.colors.success, fontWeight: 'bold' },
    cancelText: { color: theme.colors.subText },
  });
