import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { COLORS } from '../constants/camera';

interface CaptureButtonProps {
  onPress: () => void;
  isRecording: boolean;
  mode: 'photo' | 'video' | 'portrait';
}

const CaptureButton: React.FC<CaptureButtonProps> = ({ onPress, isRecording, mode }) => {
  const scale = useSharedValue(1);
  const innerScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const innerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
    backgroundColor: isRecording ? '#FF3B30' : COLORS.accent,
    borderRadius: isRecording ? 8 : 35,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
    innerScale.value = withSpring(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    innerScale.value = withSpring(1);
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.outerCircle, animatedStyle]}>
        <Animated.View style={[styles.innerCircle, innerAnimatedStyle]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 70,
    height: 70,
  },
});

export default CaptureButton;
