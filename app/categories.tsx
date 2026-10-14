import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCategoryStore, categoryLabel, EventCategory } from '../src/store/categoryStore';
import { useT } from '../src/i18n/useT';
import { DEFAULT_COLOR } from '../src/types';
import ColorPicker from '../src/components/ColorPicker';
import ConfirmDialog from '../src/components/ConfirmDialog';
import { webMaxWidth } from '../src/utils/webStyle';

interface FormState {
  id?: string;
  label: string;
  color: string;
}

export default function CategoriesScreen() {
  const { t } = useT();
  const { categories, addCategory, updateCategory, removeCategory } = useCategoryStore();
  const [form, setForm] = useState<FormState | null>(null);
  const [labelError, setLabelError] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function openAdd() {
    setLabelError(false);
    setForm({ label: '', color: DEFAULT_COLOR });
  }

  function openEdit(cat: EventCategory) {
    setLabelError(false);
    setForm({ id: cat.id, label: categoryLabel(cat, t), color: cat.color });
  }

  function handleSave() {
    if (!form) return;
    const label = form.label.trim();
    if (!label) {
      setLabelError(true);
      return;
    }
    if (form.id) updateCategory(form.id, label, form.color);
    else addCategory(label, form.color);
    setForm(null);
  }

  function handleDelete() {
    if (!confirmDeleteId) return;
    removeCategory(confirmDeleteId);
    setConfirmDeleteId(null);
    setForm(null);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t('categoriesTitle'),
          headerRight: () => (
            <TouchableOpacity onPress={openAdd} style={styles.headerBtn} accessibilityLabel="add-category">
              <Ionicons name="add" size={26} color="#5B8DEF" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.screen} contentContainerStyle={[styles.content, webMaxWidth]}>
        <View style={styles.card}>
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.row, index > 0 && styles.rowDivider]}
              onPress={() => openEdit(cat)}
            >
              <View style={[styles.dot, { backgroundColor: cat.color }]} />
              <Text style={styles.rowText}>{categoryLabel(cat, t)}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!form} transparent animationType="slide" onRequestClose={() => setForm(null)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {form?.id ? t('editCategory') : t('addCategory')}
            </Text>

            <TextInput
              style={[styles.input, labelError && styles.inputError]}
              placeholder={t('categoryNamePlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={form?.label ?? ''}
              onChangeText={(text) => { setForm((f) => f && { ...f, label: text }); setLabelError(false); }}
              maxLength={20}
            />
            {labelError && <Text style={styles.errorText}>{t('categoryNameRequired')}</Text>}

            <View style={styles.colorPickerWrap}>
              <ColorPicker
                selected={form?.color ?? DEFAULT_COLOR}
                onChange={(color) => setForm((f) => f && { ...f, color })}
              />
            </View>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: form?.color ?? DEFAULT_COLOR }]} onPress={handleSave}>
              <Text style={styles.saveText}>{t('save')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setForm(null)}>
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>

            {form?.id && (
              <TouchableOpacity style={styles.deleteBtn} onPress={() => setConfirmDeleteId(form.id!)}>
                <Text style={styles.deleteText}>{t('delete')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={!!confirmDeleteId}
        title={t('deleteCategoryTitle')}
        message={t('deleteCategoryMessage', { title: form?.label ?? '' })}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 20 },
  headerBtn: { marginRight: 4, padding: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F3F4F6',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowText: { flex: 1, fontSize: 16, color: '#111' },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 16 },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111',
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  colorPickerWrap: { marginTop: 18 },
  saveBtn: {
    marginTop: 22,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cancelBtn: { marginTop: 12, paddingVertical: 12, alignItems: 'center' },
  cancelText: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  deleteBtn: { marginTop: 4, paddingVertical: 12, alignItems: 'center' },
  deleteText: { fontSize: 15, color: '#EF4444', fontWeight: '600' },
});
