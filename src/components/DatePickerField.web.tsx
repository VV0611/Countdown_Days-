import React from 'react';
import dayjs from 'dayjs';
import { Language } from '../i18n/translations';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  language: Language;
}

// Web build: @react-native-community/datetimepicker renders nothing on web,
// so this uses the browser's native <input type="date"> instead.
export default function DatePickerField({ value, onChange }: Props) {
  return (
    <input
      type="date"
      value={dayjs(value).format('YYYY-MM-DD')}
      onChange={(e) => {
        const next = e.target.value;
        if (next) onChange(dayjs(next, 'YYYY-MM-DD').toDate());
      }}
      style={inputStyle}
    />
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  backgroundColor: '#fff',
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  padding: '14px 16px',
  fontSize: 16,
  color: '#111',
  fontFamily: 'inherit',
};
