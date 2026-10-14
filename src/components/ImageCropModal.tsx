import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Image, Text, TouchableOpacity, ActivityIndicator, PanResponder, StyleSheet } from 'react-native';
import { useT } from '../i18n/useT';
import { CROP_ASPECT_RATIO, coverFit, clampPan, frameToSourceCrop, cropImage } from '../utils/imageCrop';

interface Props {
  visible: boolean;
  imageUri: string | null;
  onConfirm: (croppedUri: string) => void;
  onCancel: () => void;
}

export default function ImageCropModal({ visible, imageUri, onConfirm, onCancel }: Props) {
  const { t } = useT();
  const [frameWidth, setFrameWidth] = useState(0);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  const frameHeight = frameWidth / CROP_ASPECT_RATIO;
  const fit = imageSize ? coverFit(imageSize.width, imageSize.height, frameWidth, frameHeight) : null;

  const offsetRef = useRef(offset);
  offsetRef.current = offset;
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!visible || !imageUri) return;
    setImageSize(null);
    setOffset({ x: 0, y: 0 });
    Image.getSize(
      imageUri,
      (width, height) => setImageSize({ width, height }),
      () => setImageSize({ width: 1, height: 1 })
    );
  }, [visible, imageUri]);

  useEffect(() => {
    if (!fit || !frameWidth || !frameHeight) return;
    setOffset(clampPan(
      (frameWidth - fit.drawWidth) / 2,
      (frameHeight - fit.drawHeight) / 2,
      fit.drawWidth,
      fit.drawHeight,
      frameWidth,
      frameHeight
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSize, frameWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStart.current = offsetRef.current;
      },
      onPanResponderMove: (_evt, gestureState) => {
        if (!fit) return;
        setOffset(clampPan(
          dragStart.current.x + gestureState.dx,
          dragStart.current.y + gestureState.dy,
          fit.drawWidth,
          fit.drawHeight,
          frameWidth,
          frameHeight
        ));
      },
    })
  ).current;

  async function handleConfirm() {
    if (!imageUri || !fit) return;
    setSaving(true);
    try {
      const region = frameToSourceCrop(offset.x, offset.y, fit.scale, frameWidth, frameHeight);
      const uri = await cropImage(imageUri, region);
      onConfirm(uri);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={styles.screen}>
        <Text style={styles.title}>{t('cropPhotoTitle')}</Text>
        <Text style={styles.hint}>{t('cropPhotoHint')}</Text>

        <View
          style={styles.frame}
          onLayout={(e) => setFrameWidth(e.nativeEvent.layout.width)}
        >
          {imageUri && imageSize && fit && frameWidth > 0 ? (
            <View style={StyleSheet.absoluteFill} accessibilityLabel="crop-frame" {...panResponder.panHandlers}>
              <Image
                source={{ uri: imageUri }}
                style={{
                  position: 'absolute',
                  left: offset.x,
                  top: offset.y,
                  width: fit.drawWidth,
                  height: fit.drawHeight,
                }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#5B8DEF" />
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={saving}>
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={saving || !fit}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>{t('usePhoto')}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center' },
  hint: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  frame: {
    width: '100%',
    aspectRatio: CROP_ASPECT_RATIO,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 28 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  cancelText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#5B8DEF',
  },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
