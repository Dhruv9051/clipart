import { Dimensions } from "react-native";

export const Colors = {
  bg: '#0A0A0F',
  surface: '#13131A',
  surfaceHigh: '#1E1E2E',
  border: '#2A2A3E',
  primary: '#7C3AED',
  primaryLight: '#A855F7',
  primaryGlow: 'rgba(124, 58, 237, 0.3)',
  accent: '#06B6D4',
  accentGlow: 'rgba(6, 182, 212, 0.3)',
  text: '#F1F5F9',
  textMuted: '#64748B',
  textSub: '#94A3B8',
  success: '#10B981',
  error: '#EF4444',
  white: '#FFFFFF',
};

export const Fonts = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const STYLES_CONFIG = [
  {
    id: 'cartoon',
    label: 'Cartoon',
    emoji: '🎨',
    description: 'Bold outlines, vibrant colors',
    gradient: ['#7C3AED', '#A855F7'],
    prompt: 'Exact subject and composition as input image, transformed into a cartoon style illustration, bold black outlines, bright vivid colors, clean vector art, Disney/Pixar inspired, professional clipart',
    negativePrompt: 'altered subject, completely different image, realistic, photographic, deformed, ugly',
  },
  {
    id: 'anime',
    label: 'Anime',
    emoji: '⛩️',
    description: 'Japanese art style',
    gradient: ['#EC4899', '#F43F5E'],
    prompt: 'Exact subject and composition as input image, anime style illustration, manga art style, clean linework, vibrant colors, Studio Ghibli inspired, professional',
    negativePrompt: 'altered subject, completely different image, photorealistic, 3d render, deformed',
  },
  {
    id: 'pixel',
    label: 'Pixel Art',
    emoji: '👾',
    description: '8-bit retro game style',
    gradient: ['#06B6D4', '#0EA5E9'],
    prompt: 'Exact subject and composition as input image, 8-bit retro video game pixel art style, chunky pixels, limited color palette, clean pixelated',
    negativePrompt: 'altered subject, completely different image, high resolution, realistic, painting, smooth lines',
  },
  {
    id: 'flat',
    label: 'Flat',
    emoji: '✏️',
    description: 'Minimal flat illustration',
    gradient: ['#10B981', '#059669'],
    prompt: 'Exact subject and composition as input image, flat design illustration, minimal style, geometric shapes, no gradients, modern flat vector art, clean simple design, professional clipart',
    negativePrompt: 'altered subject, completely different image, 3d, realistic, heavy shading, gradients, photographic',
  },
  {
    id: 'sketch',
    label: 'Sketch',
    emoji: '🖊️',
    description: 'Hand-drawn pencil sketch',
    gradient: ['#F59E0B', '#EF4444'],
    prompt: 'Exact subject and composition as input image, pencil sketch illustration, hand drawn style, cross hatching, graphite drawing, detailed sketch art, black and white, professional illustration',
    negativePrompt: 'altered subject, completely different image, color, realistic, photograph, digital painting',
  },
];

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

export const RF = {
  xs: Math.max(scale(11), 10),
  sm: Math.max(scale(13), 11),
  md: Math.max(scale(15), 13),
  lg: Math.max(scale(18), 16),
  xl: Math.max(scale(22), 20),
  xxl: Math.max(scale(28), 24),
  xxxl: Math.max(scale(36), 28),
};