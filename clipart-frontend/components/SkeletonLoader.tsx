import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, DimensionValue } from 'react-native';
import { Colors, Radius } from '../constants/theme';

export default function SkeletonLoader({ width, height, borderRadius = Radius.md }: {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
}) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: Colors.surfaceHigh, opacity },
      ]}
    />
  );
}