import React, { useEffect } from 'react';
import {
  ScrollView, StyleSheet, Text, View,
  Pressable, Alert, BackHandler, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ResultCard from '../components/ResultCard';
import { Colors, Fonts, Spacing, STYLES_CONFIG } from '../constants/theme';
import { useGenerate } from '../hooks/useGenerate';
import { GenerationStore } from '../store/generationStore';

export default function GenerateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { styles: stylesParam } = useLocalSearchParams<{ styles: string }>();

  const selectedIds = stylesParam?.split(',') ?? [];
  const selectedStyles = STYLES_CONFIG.filter(s => selectedIds.includes(s.id));
  const { results, isGenerating, startGeneration, downloadImage, shareImage } = useGenerate();
  const doneCount = Object.values(results).filter(r => r.status === 'done').length;
  const imageUri = GenerationStore.getState().imageUri;

  useEffect(() => {
    if (!imageUri || selectedStyles.length === 0) {
      router.replace('/');
      return;
    }
    startGeneration(imageUri, selectedStyles);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'web') return;

      const onBackPress = () => {
        router.back();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        subscription.remove();
      };
    }, [isGenerating])
  );

  const handleNewGeneration = () => {
    GenerationStore.reset();
    router.replace('/');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.progressBar}>
        <Text style={styles.progressText}>
          {isGenerating
            ? `Generating... ${doneCount}/${selectedStyles.length} complete`
            : `✓ All ${doneCount} cliparts ready!`}
        </Text>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${selectedStyles.length > 0
                  ? (doneCount / selectedStyles.length) * 100
                  : 0}%` as any,
              },
            ]}
          />
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

      {!isGenerating && doneCount > 0 && (
        <Pressable onPress={handleNewGeneration} style={styles.newBtn}>
          <Text style={styles.newBtnText}>← Generate New Clipart</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, gap: Spacing.md },
  progressBar: { gap: Spacing.xs, marginBottom: Spacing.sm },
  progressText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'right',
    fontWeight: Fonts.weights.medium,
  },
  track: { height: 4, backgroundColor: Colors.surfaceHigh, borderRadius: 99 },
  fill: { height: 4, backgroundColor: Colors.primary, borderRadius: 99 },
  newBtn: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  newBtnText: {
    color: Colors.text,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
  },
});