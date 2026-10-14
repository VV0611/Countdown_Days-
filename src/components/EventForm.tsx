import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { CountdownEvent, EventType, DEFAULT_COLOR } from '../types';
import ColorPicker from './ColorPicker';
import ConfirmDialog from './ConfirmDialog';
import { useT } from '../i18n/useT';
import { webMaxWidth } from '../utils/webStyle';

type FormData = Omit<CountdownEvent, 'id' | 'createdAt'>;

interface Props {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onDelete?: () => void;
}

export default function EventForm({ initialData, onSubmit, onDelete }: Props) {
  const { t, language } = useT();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [targetDate, setTargetDate] = useState<Date>(
    initialData?.targetDate ? new Date(initialData.targetDate) : new Date()
  );
  const [type, setType] = useState<EventType>(initialData?.type ?? 'countdown');
  const [themeColor, setThemeColor] = useState(initialData?.themeColor ?? DEFAULT_COLOR);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [titleError, setTitleError] = useState(false);

  function handleSubmit() {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    onSubmit({
      title: title.trim(),
      targetDate: dayjs(targetDate).format('YYYY-MM-DD'),
      type,
      themeColor,
      repeat: initialData?.repeat ?? 'none',
      isLunar: false,
      pinned: initialData?.pinned ?? false,
      categoryId: initialData?.categoryId,
      coverImage: initialData?.coverImage,
      note: initialData?.note,
    });
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.container, webMaxWidth]} keyboardShouldPersistTaps="handled">
      {/* Title */}
      <Text style={styles.label}>{t('fieldTitle')}</Text>
      <TextInput
        style={[styles.input, titleError && styles.inputError]}
        placeholder={t('titlePlaceholder')}
        placeholderTextColor="#9CA3AF"
        value={title}
        onChangeText={(text) => { setTitle(text); setTitleError(false); }}
        maxLength={40}
      />
      {titleError && <Text style={styles.errorText}>{t('titleRequired')}</Text>}

      {/* Date */}
      <Text style={styles.label}>{t('fieldDate')}</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateButtonText}>
          {language === 'zh'
            ? dayjs(targetDate).format('YYYY年M月D日')
            : dayjs(targetDate).format('MMMM D, YYYY')}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={targetDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) setTargetDate(date);
          }}
        />
      )}

      {/* Type */}
      <Text style={styles.label}>{t('fieldType')}</Text>
      <View style={styles.segmentRow}>
        {(['countdown', 'countup'] as EventType[]).map((optionType) => (
          <TouchableOpacity
            key={optionType}
            style={[styles.segment, type === optionType && { backgroundColor: themeColor }]}
            onPress={() => setType(optionType)}
          >
            <Text style={[styles.segmentText, type === optionType && styles.segmentTextActive]}>
              {t(optionType === 'countdown' ? 'typeCountdown' : 'typeCountup')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color */}
      <Text style={styles.label}>{t('fieldColor')}</Text>
      <ColorPicker selected={themeColor} onChange={setThemeColor} />

      {/* Preview */}
      <View style={[styles.preview, { backgroundColor: themeColor }]}>
        <Text style={styles.previewTitle}>{title || t('previewPlaceholderTitle')}</Text>
        <Text style={styles.previewType}>
          {t(type === 'countdown' ? 'typeCountdown' : 'typeCountup')}
        </Text>
      </View>

      {/* Submit */}
      <TouchableOpacity style={[styles.submitBtn, { backgroundColor: themeColor }]} onPress={handleSubmit}>
        <Text style={styles.submitText}>{initialData?.title ? t('saveChanges') : t('addEvent')}</Text>
      </TouchableOpacity>

      {/* Delete */}
      {onDelete && (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowDeleteConfirm(true)}>
          <Text style={styles.deleteText}>{t('deleteEvent')}</Text>
        </TouchableOpacity>
      )}

      <ConfirmDialog
        visible={showDeleteConfirm}
        title={t('deleteConfirmTitle')}
        message={t('deleteConfirmMessage', { title })}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={() => { setShowDeleteConfirm(false); onDelete?.(); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 20, paddingBottom: 48 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
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
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateButtonText: { fontSize: 16, color: '#111' },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  segmentTextActive: { color: '#fff' },
  preview: {
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    minHeight: 80,
    justifyContent: 'center',
  },
  previewTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  previewType: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  submitBtn: {
    marginTop: 28,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  deleteBtn: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteText: { fontSize: 15, color: '#EF4444', fontWeight: '600' },
});
