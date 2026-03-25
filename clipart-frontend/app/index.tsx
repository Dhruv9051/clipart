import React, { useState } from 'react';
import {
  Alert, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageUploadBox from '../components/ImageUploadBox';
import StyleCard from '../components/StyleCard';
import { Colors, Fonts, Radius, Spacing, STYLES_CONFIG } from '../constants/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['cartoon', 'anime', 'pixel', 'flat', 'sketch']);

  const pickImage = () => {
    Alert.alert('Upload Photo', 'Choose source', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: openGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed', 'Camera access is required.');
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
    if (status !== 'granted') return Alert.alert('Permission needed', 'Gallery access is required.');
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
      prev.includes(id) ? (prev.length > 1 ? prev.filter(s => s !== id) : prev) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (!imageUri) return Alert.alert('No image', 'Please upload a photo first.');
    if (selectedStyles.length === 0) return Alert.alert('No style', 'Select at least one style.');
    router.push({ pathname: '/generate', params: { imageUri, styles: selectedStyles.join(',') } });
  };

  const rows = [STYLES_CONFIG.slice(0, 3), STYLES_CONFIG.slice(3)];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + 80 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={[Colors.primary, Colors.accent]} style={styles.badge}>
          <Text style={styles.badgeText}>✦ AI Powered</Text>
        </LinearGradient>
        <Text style={styles.title}>Clipart{'\n'}Generator</Text>
        <Text style={styles.subtitle}>Transform your photo into stunning clipart styles instantly</Text>
      </View>

      {/* Upload */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>1 · Your Photo</Text>
        <ImageUploadBox imageUri={imageUri} onPress={pickImage} />
      </View>

      {/* Style picker */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>2 · Choose Styles <Text style={styles.sectionSub}>({selectedStyles.length} selected)</Text></Text>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.row}>
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

      {/* Generate button */}
      <Pressable onPress={handleGenerate} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryLight]}
          style={styles.generateBtn}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          <Text style={styles.generateText}>✦ Generate Cliparts</Text>
          <Text style={styles.generateSub}>{selectedStyles.length} style{selectedStyles.length > 1 ? 's' : ''} · parallel generation</Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.xl },
  header: { gap: Spacing.sm },
  badge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full },
  badgeText: { color: Colors.white, fontSize: Fonts.sizes.xs, fontWeight: Fonts.weights.bold, letterSpacing: 1 },
  title: { fontSize: Fonts.sizes.xxxl, fontWeight: Fonts.weights.extrabold, color: Colors.text, lineHeight: 42 },
  subtitle: { fontSize: Fonts.sizes.md, color: Colors.textMuted, lineHeight: 22 },
  section: { gap: Spacing.sm },
  sectionLabel: { fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.bold, color: Colors.textSub, textTransform: 'uppercase', letterSpacing: 1.2 },
  sectionSub: { color: Colors.primary, textTransform: 'none' },
  row: { flexDirection: 'row' },
  generateBtn: {
    padding: Spacing.lg, borderRadius: Radius.xl,
    alignItems: 'center', gap: 4,
  },
  generateText: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, color: Colors.white },
  generateSub: { fontSize: Fonts.sizes.sm, color: 'rgba(255,255,255,0.7)' },
});