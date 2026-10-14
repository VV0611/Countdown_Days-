import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME_COLORS } from '../types';

interface Props {
  selected: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ selected, onChange }: Props) {
  return (
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
});
