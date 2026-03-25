import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';

type Props = {
  imageUri: string | null;
  onPress: () => void;
  onWebFileSelect?: (uri: string) => void;
};

export default function ImageUploadBox({ imageUri, onPress, onWebFileSelect }: Props) {
  const handleWebUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const uri = event.target?.result as string;
      onWebFileSelect?.(uri);
    };
    reader.readAsDataURL(file);
  };

  if (Platform.OS === 'web') {
    return (
      <View>
        {imageUri ? (
          <View style={styles.previewWrapper}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
            <label style={webStyles.changeLabel}>
              <input
                type="file"
                accept="image/*"
                onChange={handleWebUpload}
                style={webStyles.hiddenInput}
              />
              <Text style={styles.changeText}>Tap to change</Text>
            </label>
          </View>
        ) : (
          <label style={webStyles.uploadLabel}>
            <input
              type="file"
              accept="image/*"
              onChange={handleWebUpload}
              style={webStyles.hiddenInput}
            />
            <LinearGradient
              colors={['rgba(124,58,237,0.15)', 'rgba(6,182,212,0.1)']}
              style={styles.uploadBox}
            >
              <View style={styles.iconRing}>
                <Text style={styles.icon}>📷</Text>
              </View>
              <Text style={styles.uploadTitle}>Upload your photo</Text>
              <Text style={styles.uploadSub}>Click or drag • JPG, PNG • Max 5MB</Text>
            </LinearGradient>
          </label>
        )}
      </View>
    );
  }

  // Mobile version
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

const webStyles = {
  uploadLabel: {
    cursor: 'pointer',
    display: 'block',
  } as React.CSSProperties,
  changeLabel: {
    cursor: 'pointer',
    display: 'block',
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    textAlign: 'center' as const,
  } as React.CSSProperties,
  hiddenInput: {
    display: 'none',
  } as React.CSSProperties,
};

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
  uploadTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.text,
  },
  uploadSub: { fontSize: Fonts.sizes.sm, color: Colors.textMuted },
  previewWrapper: { height: 200, borderRadius: Radius.xl, overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  changeOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', padding: Spacing.sm, alignItems: 'center',
  },
  changeText: {
    color: Colors.white,
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
  },
});