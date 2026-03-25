import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';

type Props = {
  imageUri: string | null;
  onPress: () => void;
};

export default function ImageUploadBox({ imageUri, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
      {imageUri ? (
        <View style={styles.previewWrapper}>
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          <View style={styles.changeOverlay}>
            <Text style={styles.changeText}>Tap to change</Text>
          </View>
        </View>
      ) : (
        <LinearGradient
          colors={['rgba(124,58,237,0.15)', 'rgba(6,182,212,0.1)']}
          style={styles.uploadBox}
        >
          <View style={styles.iconRing}>
            <Text style={styles.icon}>📷</Text>
          </View>
          <Text style={styles.uploadTitle}>Upload your photo</Text>
          <Text style={styles.uploadSub}>Camera or gallery • JPG, PNG</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  uploadBox: {
    height: 200,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 28 },
  uploadTitle: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.semibold, color: Colors.text },
  uploadSub: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
  previewWrapper: { height: 200, borderRadius: Radius.xl, overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  changeOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', padding: Spacing.sm, alignItems: 'center',
  },
  changeText: { color: Colors.white, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.medium },
});