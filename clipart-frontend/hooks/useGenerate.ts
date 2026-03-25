import { useState, useCallback, useRef } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { STYLES_CONFIG } from '../constants/theme';
import { ApiService } from '../services/api';

type ResultStatus = 'idle' | 'loading' | 'done' | 'error';
type Result = { status: ResultStatus; uri?: string };
type Results = Record<string, Result>;

export function useGenerate() {
  const [results, setResults] = useState<Results>({});
  const resultsRef = useRef<Results>({});

  const updateResult = useCallback((styleId: string, update: Partial<Result>) => {
    setResults(prev => {
      const next = { ...prev, [styleId]: { ...prev[styleId], ...update } };
      resultsRef.current = next;
      return next;
    });
  }, []);

  const generateSingleStyle = async (
    imageUri: string,
    styleId: string,
    prompt: string
  ) => {
    updateResult(styleId, { status: 'loading' });

    try {
      let base64: string;

      if (Platform.OS === 'web') {
        // On web, imageUri is already a data URL like "data:image/jpeg;base64,..."
        base64 = imageUri.split(',')[1];
      } else {
        // On mobile, read file as base64
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
        // On web, just use the URL directly — no local file system
        updateResult(styleId, { status: 'done', uri: data.imageUrl });
      } else {
        // On mobile, download to local cache
        const localUri = `${FileSystem.cacheDirectory}clipart_${styleId}_${Date.now()}.png`;
        const download = await FileSystem.downloadAsync(data.imageUrl, localUri);
        if (download.status !== 200) throw new Error('Download failed');
        updateResult(styleId, { status: 'done', uri: download.uri });
      }
    } catch (err: any) {
      console.error(`[useGenerate] ${styleId} failed:`, err.message);
      updateResult(styleId, { status: 'error' });
    }
  };

  const startGeneration = useCallback(
    async (imageUri: string, selectedStyles: typeof STYLES_CONFIG) => {
      // Set all to loading immediately for instant UI feedback
      const initial: Results = {};
      selectedStyles.forEach(s => {
        initial[s.id] = { status: 'loading' };
      });
      setResults(initial);
      resultsRef.current = initial;

      // Stagger requests by 12 seconds each to avoid rate limit
      // Remove this once payment method is added to Replicate
      for (let i = 0; i < selectedStyles.length; i++) {
        const style = selectedStyles[i];
        if (i > 0) {
          await new Promise(r => setTimeout(r, 12000)); // 12s gap
        }
        generateSingleStyle(imageUri, style.id, style.prompt);
      }
    },
    [updateResult]
  );

  const downloadImage = useCallback(async (styleId: string) => {
    const uri = resultsRef.current[styleId]?.uri;
    if (!uri) return;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Storage access is required.');
      return;
    }

    try {
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('✓ Saved', 'Image saved to your gallery.');
    } catch {
      Alert.alert('Error', 'Could not save image.');
    }
  }, []);

  const shareImage = useCallback(async (styleId: string) => {
    const uri = resultsRef.current[styleId]?.uri;
    if (!uri) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Not available', 'Sharing not supported on this device.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your clipart',
      });
    } catch {
      Alert.alert('Error', 'Could not share image.');
    }
  }, []);

  return { results, startGeneration, downloadImage, shareImage };
}