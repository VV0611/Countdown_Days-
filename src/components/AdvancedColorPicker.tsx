import React, { useRef, useState } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { hsvToHex, hexToHsv, hueToHex } from '../utils/colorUtils';

interface Props {
  value: string;
  onChange: (hex: string) => void;
}

const HUE_COLORS = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'] as const;
const HUE_HEIGHT = 28;
const HANDLE = 22;
const HUE_HANDLE_WIDTH = 10;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function AdvancedColorPicker({ value, onChange }: Props) {
  const { h, s, v } = hexToHsv(value);

  // Refs so the PanResponder (created once) always sees the latest values.
  const hsvRef = useRef({ h, s, v });
  hsvRef.current = { h, s, v };
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const squareRef = useRef<View>(null);
  const hueRef = useRef<View>(null);
  const squareMeasure = useRef({ pageX: 0, pageY: 0, width: 0, height: 0 });
  const hueMeasure = useRef({ pageX: 0, width: 0 });
  // Bumps a render after the initial onLayout measurement so the handles,
  // which read squareMeasure/hueMeasure refs, paint in the right spot
  // instead of sitting at the top-left corner until the first drag.
  const [, forceRender] = useState(0);

  function updateFromSquare(pageX: number, pageY: number) {
    const { pageX: ox, pageY: oy, width, height } = squareMeasure.current;
    if (!width || !height) return;
    const x = clamp(pageX - ox, 0, width);
    const y = clamp(pageY - oy, 0, height);
    onChangeRef.current(hsvToHex({ h: hsvRef.current.h, s: x / width, v: 1 - y / height }));
  }

  function updateFromHue(pageX: number) {
    const { pageX: ox, width } = hueMeasure.current;
    if (!width) return;
    const x = clamp(pageX - ox, 0, width);
    onChangeRef.current(hsvToHex({ h: (x / width) * 360, s: hsvRef.current.s, v: hsvRef.current.v }));
  }

  const squarePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_evt, gestureState) => {
        squareRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
          squareMeasure.current = { pageX, pageY, width, height };
          updateFromSquare(gestureState.x0, gestureState.y0);
        });
      },
      onPanResponderMove: (_evt, gestureState) => {
        updateFromSquare(gestureState.moveX, gestureState.moveY);
      },
    })
  ).current;

  const huePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_evt, gestureState) => {
        hueRef.current?.measure((_x, _y, width, _height, pageX, pageY) => {
          hueMeasure.current = { pageX, width };
          updateFromHue(gestureState.x0);
        });
      },
      onPanResponderMove: (_evt, gestureState) => {
        updateFromHue(gestureState.moveX);
      },
    })
  ).current;

  const hueHex = hueToHex(h);

  return (
    <View>
      <View
        ref={squareRef}
        style={styles.square}
        accessibilityLabel="color-sv-square"
        {...squarePan.panHandlers}
        onLayout={() => squareRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
          squareMeasure.current = { pageX, pageY, width, height };
          forceRender((n) => n + 1);
        })}
      >
        <LinearGradient
          colors={['#fff', hueHex]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['transparent', '#000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          pointerEvents="none"
          style={[
            styles.squareHandle,
            {
              left: s * squareMeasure.current.width - HANDLE / 2,
              top: (1 - v) * squareMeasure.current.height - HANDLE / 2,
              backgroundColor: value,
            },
          ]}
        />
      </View>

      <View
        ref={hueRef}
        style={styles.hueBar}
        accessibilityLabel="color-hue-bar"
        {...huePan.panHandlers}
        onLayout={() => hueRef.current?.measure((_x, _y, width, _height, pageX, pageY) => {
          hueMeasure.current = { pageX, width };
          forceRender((n) => n + 1);
        })}
      >
        <LinearGradient
          colors={HUE_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          pointerEvents="none"
          style={[
            styles.hueHandle,
            { left: (h / 360) * hueMeasure.current.width - HUE_HANDLE_WIDTH / 2 },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  squareHandle: {
    position: 'absolute',
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  hueBar: {
    width: '100%',
    height: HUE_HEIGHT,
    borderRadius: HUE_HEIGHT / 2,
    overflow: 'hidden',
    marginTop: 14,
  },
  hueHandle: {
    position: 'absolute',
    top: 0,
    width: HUE_HANDLE_WIDTH,
    height: HUE_HEIGHT,
    borderRadius: HUE_HANDLE_WIDTH / 2,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
