import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, ActivityIndicator, Platform } from 'react-native';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import SkeletonLoader from './SkeletonLoader';

type Props = {
  label: string;
  emoji: string;
  imageUri?: string;
  status: 'idle' | 'loading' | 'done' | 'error';
  onDownload: () => void;
  onShare: () => void;
};

export default function ResultCard({ label, emoji, imageUri, status, onDownload, onShare }: Props) {
  const handleWebDownload = async () => {
    if (!imageUri) return;
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `clipart-${label.toLowerCase()}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      window.open(imageUri, '_blank');
    }
  };

  const handleWebShare = async () => {
    if (!imageUri) return;
    try {
      if (navigator.share) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const file = new File([blob], `clipart-${label.toLowerCase()}.png`, { type: 'image/png' });
        await navigator.share({ files: [file], title: `${label} Clipart` });
      } else {
        await navigator.clipboard.writeText(imageUri);
        alert('Image URL copied to clipboard!');
      }
    } catch {
      window.open(imageUri, '_blank');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label}>{label}</Text>
        {status === 'loading' && (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 'auto' }} />
        )}
        {status === 'done' && <Text style={styles.done}>✓ Done</Text>}
        {status === 'error' && <Text style={styles.error}>✗ Failed</Text>}
      </View>

      <View style={styles.imageBox}>
        {status === 'loading' && (
          <SkeletonLoader width="100%" height={200} borderRadius={Radius.md} />
        )}
        {status === 'done' && imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        )}
        {status === 'error' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Generation failed. Try again.</Text>
          </View>
        )}
        {status === 'idle' && (
          <SkeletonLoader width="100%" height={200} borderRadius={Radius.md} />
        )}
      </View>

      {status === 'done' && (
        <View style={styles.actions}>
          <Pressable
            onPress={Platform.OS === 'web' ? handleWebDownload : onDownload}
            style={styles.actionBtn}
          >
            <Text style={styles.actionText}>⬇ Save</Text>
          </Pressable>
          <Pressable
            onPress={Platform.OS === 'web' ? handleWebShare : onShare}
            style={[styles.actionBtn, styles.shareBtn]}
          >
            <Text style={styles.actionText}>↗ Share</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  emoji: { fontSize: 20 },
  label: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.semibold, color: Colors.text },
  done: { marginLeft: 'auto', color: Colors.success, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.medium },
  error: { marginLeft: 'auto', color: Colors.error, fontSize: Fonts.sizes.sm },
  imageBox: { borderRadius: Radius.md, overflow: 'hidden', minHeight: 200 },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: Radius.md,
  },
  errorBox: {
    height: 200, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceHigh, borderRadius: Radius.md,
  },
  errorText: { color: Colors.error, fontSize: Fonts.sizes.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md,
    backgroundColor: Colors.surfaceHigh, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  shareBtn: { backgroundColor: Colors.primaryGlow, borderColor: Colors.primary },
  actionText: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.medium },
});