import React, { useEffect, useState } from 'react';
import {
  Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageUploadBox from '../components/ImageUploadBox';
import StyleCard from '../components/StyleCard';
import { Colors, Fonts, Radius, Spacing, STYLES_CONFIG } from '../constants/theme';
import { GenerationStore } from '../store/generationStore';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    ['cartoon', 'anime', 'pixel', 'flat', 'sketch']
  );
  const [hasResults, setHasResults] = useState(
    GenerationStore.hasActiveGeneration()
  );

  useEffect(() => {
    const unsubscribe = GenerationStore.subscribe(() => {
      setHasResults(GenerationStore.hasActiveGeneration());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const pickImage = () => {
    Alert.alert('Upload Photo', 'Choose source', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: openGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission needed', 'Camera access is required.');
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission needed', 'Gallery access is required.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const toggleStyle = (id: string) => {
    setSelectedStyles(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(s => s !== id) : prev
        : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (!imageUri) {
      return Alert.alert('No image', 'Please upload a photo first.');
    }
    if (selectedStyles.length === 0) {
      return Alert.alert('No style', 'Select at least one style.');
    }
    // Store imageUri in store
    GenerationStore.setGenerating(imageUri, selectedStyles);
    router.push({
      pathname: '/generate',
      params: { styles: selectedStyles.join(',') }, // removed imageUri
    });
  };

  const rows = [STYLES_CONFIG.slice(0, 3), STYLES_CONFIG.slice(3, 5)];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + 80 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Clipart{'\n'}Generator</Text>
        <Text style={styles.subtitle}>
          Transform your images into clipart styles instantly
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>1 · Your Photo</Text>
        <ImageUploadBox
          imageUri={imageUri}
          onPress={pickImage}
          onWebFileSelect={(uri) => setImageUri(uri)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          2 · Choose Styles{' '}
          <Text style={styles.sectionSub}>({selectedStyles.length} selected)</Text>
        </Text>
        {rows.map((row, ri) => (
          <View
            key={ri}
            style={[
              styles.row,
              ri === 1 && { justifyContent: 'center' },
            ]}
          >
            {row.map(s => (
              <StyleCard
                key={s.id}
                {...s}
                selected={selectedStyles.includes(s.id)}
                onPress={() => toggleStyle(s.id)}
              />
            ))}
          </View>
        ))}
      </View>
      {hasResults && (
        <Pressable
          onPress={() => {
            const s = GenerationStore.getState();
            router.push({
              pathname: '/generate',
              params: { styles: s.selectedStyleIds.join(',') },
            });
          }}
          style={({ pressed }) => [styles.viewResultsBtn, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={styles.viewResultsText}>↗ View current results</Text>
        </Pressable>
      )}
      <Pressable
        onPress={handleGenerate}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      >
        <LinearGradient
          colors={[Colors.accentGlow, Colors.accent]}
          style={styles.generateBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.generateText}>✦ Generate Cliparts</Text>
          <Text style={styles.generateSub}>
            {selectedStyles.length} style{selectedStyles.length > 1 ? 's' : ''}
          </Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.xl },
  header: { gap: Spacing.sm },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  badgeText: {
    color: Colors.white,
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
    letterSpacing: 1,
  },
  title: {
    fontSize: Math.min(Fonts.sizes.xxxl, width * 0.09),
    fontWeight: Fonts.weights.extrabold,
    color: Colors.text,
    lineHeight: Math.min(42, width * 0.11),
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  section: { gap: Spacing.sm },
  sectionLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.bold,
    color: Colors.textSub,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionSub: { color: Colors.primary, textTransform: 'none' },
  row: { flexDirection: 'row' },
  input: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  generateBtn: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    alignItems: 'center',
    gap: 4,
  },
  generateText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
  },
  generateSub: { fontSize: Fonts.sizes.sm, color: 'rgba(255,255,255,0.7)' },
  viewResultsBtn: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  viewResultsText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.primaryLight,
  },
});
