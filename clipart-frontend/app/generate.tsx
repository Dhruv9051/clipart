import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ResultCard from '../components/ResultCard';
import { Colors, Fonts, Spacing, STYLES_CONFIG } from '../constants/theme';
import { useGenerate } from '../hooks/useGenerate';

export default function GenerateScreen() {
  const insets = useSafeAreaInsets();
  const { imageUri, styles: stylesParam } = useLocalSearchParams<{ imageUri: string; styles: string }>();
  const selectedIds = stylesParam?.split(',') ?? [];
  const selectedStyles = STYLES_CONFIG.filter(s => selectedIds.includes(s.id));
  const { results, startGeneration, downloadImage, shareImage } = useGenerate();

  useEffect(() => {
    if (imageUri && selectedStyles.length > 0) {
      startGeneration(imageUri, selectedStyles);
    }
  }, []);

  const doneCount = Object.values(results).filter(r => r.status === 'done').length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.progressBar}>
        <Text style={styles.progressText}>
          {doneCount}/{selectedStyles.length} complete
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(doneCount / selectedStyles.length) * 100}%` as any }]} />
        </View>
      </View>

      {selectedStyles.map(style => (
        <ResultCard
          key={style.id}
          label={style.label}
          emoji={style.emoji}
          imageUri={results[style.id]?.uri}
          status={results[style.id]?.status ?? 'loading'}
          onDownload={() => downloadImage(style.id)}
          onShare={() => shareImage(style.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, gap: Spacing.md },
  progressBar: { gap: Spacing.xs, marginBottom: Spacing.sm },
  progressText: { fontSize: Fonts.sizes.sm, color: Colors.textMuted, textAlign: 'right' },
  track: { height: 4, backgroundColor: Colors.surfaceHigh, borderRadius: 99 },
  fill: { height: 4, backgroundColor: Colors.primary, borderRadius: 99 },
});