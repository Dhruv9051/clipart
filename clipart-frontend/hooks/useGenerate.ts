import { useState, useCallback, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { STYLES_CONFIG } from '../constants/theme';
import { ApiService } from '../services/api';
import { GenerationStore } from '../store/generationStore';

type ResultStatus = 'idle' | 'loading' | 'done' | 'error';
type Result = { status: ResultStatus; uri?: string };
type Results = Record<string, Result>;

export function useGenerate() {
  const [results, setResults] = useState<Results>(
    GenerationStore.getState().results
  );
  const [isGenerating, setIsGenerating] = useState(
    GenerationStore.getState().isGenerating
  );

  useEffect(() => {
    const unsubscribe = GenerationStore.subscribe(() => {
      const s = GenerationStore.getState();
      setResults({ ...s.results });
      setIsGenerating(s.isGenerating);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const generateSingleStyle = async (
    imageUri: string,
    styleId: string,
    prompt: string
  ) => {
    GenerationStore.updateResult(styleId, { status: 'loading' });

    try {
      let base64: string;

      if (Platform.OS === 'web') {
        base64 = imageUri.split(',')[1];
      } else {
        base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const data = await ApiService.generateClipart({
        imageBase64: base64,
        styleId,
        prompt,
      });

      if (Platform.OS === 'web') {
        GenerationStore.updateResult(styleId, { status: 'done', uri: data.imageUrl });
      } else {
        const localUri = `${FileSystem.cacheDirectory}clipart_${styleId}_${Date.now()}.png`;
        const download = await FileSystem.downloadAsync(data.imageUrl, localUri);
        if (download.status !== 200) throw new Error('Download failed');
        GenerationStore.updateResult(styleId, { status: 'done', uri: download.uri });
      }
    } catch (err: any) {
      console.error(`[useGenerate] ${styleId} failed:`, err.message);
      GenerationStore.updateResult(styleId, { status: 'error' });
    }
  };

  const startGeneration = useCallback(
  (imageUri: string, selectedStyles: typeof STYLES_CONFIG) => {
    const state = GenerationStore.getState();

    // If we already have results or are generating for this same request — skip
    const hasResults = state.selectedStyleIds.length > 0 &&
      state.selectedStyleIds.some(
        id => state.results[id]?.status === 'done' || state.results[id]?.status === 'loading'
      );

    if (hasResults) {
      console.log('[useGenerate] Results exist — skipping re-trigger');
      return;
    }

    // Fire all in parallel
    selectedStyles.forEach(style => {
      generateSingleStyle(imageUri, style.id, style.prompt);
    });
  },
  []
);

  const downloadImage = useCallback(async (styleId: string) => {
    const uri = GenerationStore.getState().results[styleId]?.uri;
    if (!uri) return;

    if (Platform.OS !== 'web') {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Storage access required.');
        return;
      }
      try {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('✓ Saved', 'Image saved to your gallery.');
      } catch {
        Alert.alert('Error', 'Could not save image.');
      }
    }
  }, []);

  const shareImage = useCallback(async (styleId: string) => {
    const uri = GenerationStore.getState().results[styleId]?.uri;
    if (!uri) return;

    if (Platform.OS !== 'web') {
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert('Not available', 'Sharing not supported.');
          return;
        }
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your clipart',
        });
      } catch {
        Alert.alert('Error', 'Could not share image.');
      }
    }
  }, []);

  return { results, isGenerating, startGeneration, downloadImage, shareImage };
}