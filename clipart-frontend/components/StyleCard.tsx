import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';

type Props = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  gradient: string[];
  selected: boolean;
  onPress: () => void;
};

export default function StyleCard({ label, emoji, description, gradient, selected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrapper, pressed && { opacity: 0.85 }]}>
      <LinearGradient
        colors={selected ? (gradient as [string, string]) : [Colors.surfaceHigh, Colors.surfaceHigh]}
        style={[styles.card, selected && styles.selected]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        <Text style={styles.desc}>{description}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, margin: Spacing.xs },
  card: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 4,
  },
  selected: { borderColor: 'transparent' },
  emoji: { fontSize: 28, marginBottom: 2 },
  label: { fontSize: Fonts.sizes.md, fontWeight: Fonts.weights.semibold, color: Colors.textMuted },
  labelSelected: { color: Colors.white },
  desc: { fontSize: Fonts.sizes.xs, color: Colors.textMuted, textAlign: 'center' },
});