import { useState, useCallback, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as ImageManipulator from 'expo-image-manipulator';
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

  // Compress image on web using canvas
  const compressImageWeb = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 1024;
        let { width, height } = img;

        // Scale down if too large
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Export as JPEG at 80% quality, strip the data URL prefix
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressed.split(',')[1]);
      };
      img.src = dataUrl;
    });
  };

  const generateSingleStyle = async (
    imageUri: string,
    style: (typeof STYLES_CONFIG)[0]
  ) => {
    GenerationStore.updateResult(style.id, { status: 'loading' });

    try {
      let base64: string;

      if (Platform.OS === 'web') {
        // Web: imageUri is already a data URL "data:image/jpeg;base64,..."
        // Compress via canvas before extracting base64
        const compressedBase64 = await compressImageWeb(imageUri);
        base64 = compressedBase64;
      } else {
        // Mobile: compress via ImageManipulator then read as base64
        const manipulated = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 1024 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const data = await ApiService.generateClipart({
        imageBase64: base64,
        styleId: style.id,
        prompt: style.prompt,
        negativePrompt: style.negativePrompt,
      });

      if (Platform.OS === 'web') {
        GenerationStore.updateResult(style.id, {
          status: 'done',
          uri: data.imageUrl,
        });
      } else {
        const localUri = `${
          FileSystem.cacheDirectory
        }clipart_${style.id}_${Date.now()}.png`;
        const download = await FileSystem.downloadAsync(data.imageUrl, localUri);
        if (download.status !== 200) throw new Error('Download failed');
        GenerationStore.updateResult(style.id, {
          status: 'done',
          uri: download.uri,
        });
      }
    } catch (err: any) {
      console.error(`[useGenerate] ${style.id} failed:`, err.message);
      GenerationStore.updateResult(style.id, { status: 'error' });
    }
  };

  const startGeneration = useCallback(
    (imageUri: string, selectedStyles: typeof STYLES_CONFIG) => {
      const state = GenerationStore.getState();

      // If we already have results or are generating for this same request — skip
      const hasResults =
        state.selectedStyleIds.length > 0 &&
        state.selectedStyleIds.some(
          (id) =>
            state.results[id]?.status === 'done' ||
            state.results[id]?.status === 'loading'
        );

      if (hasResults) {
        console.log('[useGenerate] Results exist — skipping re-trigger');
        return;
      }

      // Fire all in parallel
      selectedStyles.forEach((style) => {
        generateSingleStyle(imageUri, style);
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