import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { COLORS } from '../constants/camera';

interface FocusIndicatorProps {
  focusPoint: { x: number; y: number } | null;
  scale: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
}

const FocusIndicator: React.FC<FocusIndicatorProps> = ({ focusPoint, scale, opacity }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    left: focusPoint ? focusPoint.x - 50 : 0,
    top: focusPoint ? focusPoint.y - 50 : 0,
  }));

  if (!focusPoint) return null;

  return <Animated.View style={[styles.focusRing, animatedStyle]} />;
};

const styles = StyleSheet.create({
  focusRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
});

export default FocusIndicator;
