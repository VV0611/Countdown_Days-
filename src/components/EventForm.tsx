import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import dayjs from 'dayjs';
import { CountdownEvent, EventType, DEFAULT_COLOR } from '../types';
import ColorPicker from './ColorPicker';
import ConfirmDialog from './ConfirmDialog';
import ImageCropModal from './ImageCropModal';
import DatePickerField from './DatePickerField';
import { useT } from '../i18n/useT';
import { webMaxWidth } from '../utils/webStyle';
import { useCategoryStore, categoryLabel } from '../store/categoryStore';

type FormData = Omit<CountdownEvent, 'id' | 'createdAt'>;

interface Props {
  initialData?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onDelete?: () => void;
}

export default function EventForm({ initialData, onSubmit, onDelete }: Props) {
  const { t, language } = useT();
  const router = useRouter();
  const { categories } = useCategoryStore();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [targetDate, setTargetDate] = useState<Date>(
    initialData?.targetDate ? new Date(initialData.targetDate) : new Date()
  );
  const [type, setType] = useState<EventType>(initialData?.type ?? 'countdown');
  const [themeColor, setThemeColor] = useState(initialData?.themeColor ?? DEFAULT_COLOR);
  const [categoryId, setCategoryId] = useState<string | undefined>(initialData?.categoryId);
  const [coverImage, setCoverImage] = useState<string | undefined>(initialData?.coverImage);
  const [pickedUri, setPickedUri] = useState<string | null>(null);
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
      categoryId,
      coverImage,
      note: initialData?.note,
    });
  }

  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setPickedUri(result.assets[0].uri);
    }
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
      <DatePickerField value={targetDate} onChange={setTargetDate} language={language} />

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

      {/* Category */}
      <Text style={styles.label}>{t('fieldCategory')}</Text>
      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, !categoryId && styles.chipActive]}
          onPress={() => setCategoryId(undefined)}
        >
          <Text style={[styles.chipText, !categoryId && styles.chipTextActive]}>{t('categoryNone')}</Text>
        </TouchableOpacity>
        {categories.map((cat) => {
          const active = categoryId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, active && { backgroundColor: cat.color }]}
              onPress={() => setCategoryId(active ? undefined : cat.id)}
            >
              <View style={[styles.chipDot, { backgroundColor: active ? '#fff' : cat.color }]} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{categoryLabel(cat, t)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity onPress={() => router.push('/categories')}>
        <Text style={styles.linkText}>{t('manageCategories')}</Text>
      </TouchableOpacity>

      {/* Color */}
      <Text style={styles.label}>{t('fieldColor')}</Text>
      <ColorPicker selected={themeColor} onChange={setThemeColor} />

      {/* Cover photo */}
      <Text style={styles.label}>{t('fieldCoverPhoto')}</Text>
      {coverImage ? (
        <View style={styles.coverPreviewWrap}>
          <Image source={{ uri: coverImage }} style={styles.coverPreview} />
          <TouchableOpacity style={styles.coverRemoveBtn} onPress={() => setCoverImage(undefined)}>
            <Text style={styles.coverRemoveText}>{t('removePhoto')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.photoBtn} onPress={handlePickPhoto}>
          <Text style={styles.photoBtnText}>{t('choosePhoto')}</Text>
        </TouchableOpacity>
      )}

      <ImageCropModal
        visible={!!pickedUri}
        imageUri={pickedUri}
        onConfirm={(uri) => { setCoverImage(uri); setPickedUri(null); }}
        onCancel={() => setPickedUri(null)}
      />

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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#111827' },
  chipDot: { width: 7, height: 7, borderRadius: 3.5 },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: '#fff' },
  linkText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#5B8DEF',
  },
  photoBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    paddingVertical: 18,
    alignItems: 'center',
  },
  photoBtnText: { fontSize: 15, fontWeight: '600', color: '#5B8DEF' },
  coverPreviewWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  coverPreview: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#E5E7EB',
  },
  coverRemoveBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  coverRemoveText: { color: '#fff', fontSize: 12, fontWeight: '600' },
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
