import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME_COLORS } from '../types';
import AdvancedColorPicker from './AdvancedColorPicker';
import { useT } from '../i18n/useT';

interface Props {
  selected: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ selected, onChange }: Props) {
  const { t } = useT();
  const [expanded, setExpanded] = useState(false);
  const isPreset = THEME_COLORS.includes(selected as typeof THEME_COLORS[number]);

  return (
    <View>
      <View style={styles.row}>
        {THEME_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.swatch, { backgroundColor: color }]}
            onPress={() => onChange(color)}
            activeOpacity={0.8}
          >
            {selected === color && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.swatch, styles.customSwatch, !isPreset && { borderColor: selected }]}
          onPress={() => setExpanded((e) => !e)}
          activeOpacity={0.8}
        >
          {!isPreset ? (
            <View style={[styles.customFill, { backgroundColor: selected }]} />
          ) : (
            <Ionicons name="color-palette-outline" size={18} color="#6B7280" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setExpanded((e) => !e)}>
        <Text style={styles.toggleText}>
          {expanded ? t('fewerColors') : t('moreColors')}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.advanced}>
          <AdvancedColorPicker value={selected} onChange={onChange} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSwatch: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
  },
  customFill: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  toggleText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#5B8DEF',
  },
  advanced: {
    marginTop: 14,
  },
});
