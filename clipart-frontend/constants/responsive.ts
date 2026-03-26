import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base screen width used for scaling (iPhone 11 Pro)
const BASE_WIDTH = 390;

export const scale = (size: number) => {
  return Math.round(PixelRatio.roundToNearestPixel(
    (SCREEN_WIDTH / BASE_WIDTH) * size
  ));
};

export const verticalScale = (size: number) => {
  return Math.round(PixelRatio.roundToNearestPixel(
    (SCREEN_HEIGHT / 844) * size
  ));
};

export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 375,
  isMedium: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLarge: SCREEN_WIDTH >= 414,
};