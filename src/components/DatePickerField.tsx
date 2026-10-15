import React, { useState } from 'react';
import { TouchableOpacity, Text, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Language } from '../i18n/translations';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  language: Language;
}

// Native (iOS/Android) date field. The web build uses DatePickerField.web.tsx
// instead — @react-native-community/datetimepicker has no web implementation,
// it just renders null there.
export default function DatePickerField({ value, onChange, language }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateButtonText}>
          {language === 'zh'
            ? dayjs(value).format('YYYY年M月D日')
            : dayjs(value).format('MMMM D, YYYY')}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_, date) => {
            setShowPicker(Platform.OS === 'ios');
            if (date) onChange(date);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateButtonText: { fontSize: 16, color: '#111' },
});
