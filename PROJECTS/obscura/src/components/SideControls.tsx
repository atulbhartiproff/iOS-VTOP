import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { COLORS, ZOOM_LEVELS } from '../constants/camera';

interface SideControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const SideControls: React.FC<SideControlsProps> = ({ zoom, onZoomChange }) => {
  const translateY = useSharedValue(0);
  const sliderHeight = 200;
  const maxZoom = 10;
  const minZoom = 1;

  // Update slider position when zoom changes externally
  useEffect(() => {
    const normalizedPosition = ((maxZoom - zoom) / (maxZoom - minZoom)) * sliderHeight - sliderHeight / 2;
    translateY.value = withSpring(normalizedPosition, {
      damping: 15,
      stiffness: 150,
    });
  }, [zoom, maxZoom, minZoom, sliderHeight, translateY]);

  // Safe zoom level button handler
  const handleZoomLevelPress = useCallback((level: number) => {
    try {
      onZoomChange(level);
      Haptics.selectionAsync();
    } catch (error) {
      console.log('Zoom level press error:', error);
    }
  }, [onZoomChange]);

  // Zoom increment/decrement handlers
  const handleZoomIn = useCallback(() => {
    try {
      const newZoom = Math.min(maxZoom, Math.round((zoom + 0.5) * 2) / 2);
      if (newZoom !== zoom) {
        onZoomChange(newZoom);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.log('Zoom in error:', error);
    }
  }, [zoom, maxZoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    try {
      const newZoom = Math.max(minZoom, Math.round((zoom - 0.5) * 2) / 2);
      if (newZoom !== zoom) {
        onZoomChange(newZoom);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.log('Zoom out error:', error);
    }
  }, [zoom, minZoom, onZoomChange]);

  // Animated style for slider thumb
  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.zoomControl}>
        {/* Zoom In Button */}
        <TouchableOpacity 
          style={[
            styles.zoomButton,
            zoom >= maxZoom && styles.disabledButton
          ]} 
          onPress={handleZoomIn}
          disabled={zoom >= maxZoom}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.zoomButtonText, 
            zoom >= maxZoom && styles.disabledText
          ]}>
            +
          </Text>
        </TouchableOpacity>

        {/* Zoom level indicators */}
        <View style={styles.zoomLabelsContainer}>
          {ZOOM_LEVELS.map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => handleZoomLevelPress(level)}
              style={[
                styles.zoomLabelContainer,
                Math.abs(zoom - level) < 0.3 && styles.activeZoomLabelContainer,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.zoomLabel,
                  Math.abs(zoom - level) < 0.3 && styles.activeZoomLabel,
                ]}
              >
                {level}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Visual slider indicator - no gesture handling */}
        <View style={styles.sliderContainer}>
          <View style={styles.slider}>
            <View style={styles.sliderTrack} />
            <Animated.View style={[styles.sliderThumb, sliderStyle]} />
          </View>
          
          {/* Current zoom display */}
          <Text style={styles.currentZoomText}>
            {zoom.toFixed(1)}x
          </Text>
        </View>

        {/* Zoom Out Button */}
        <TouchableOpacity 
          style={[
            styles.zoomButton,
            zoom <= minZoom && styles.disabledButton
          ]} 
          onPress={handleZoomOut}
          disabled={zoom <= minZoom}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.zoomButtonText, 
            zoom <= minZoom && styles.disabledText
          ]}>
            −
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -180 }],
    zIndex: 1,
  },
  zoomControl: {
    alignItems: 'center',
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: COLORS.secondary,
    opacity: 0.5,
  },
  zoomButtonText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  zoomLabelsContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  zoomLabelContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 3,
    borderRadius: 12,
    backgroundColor: 'transparent',
    minWidth: 36,
    alignItems: 'center',
  },
  activeZoomLabelContainer: {
    backgroundColor: COLORS.secondary,
  },
  zoomLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeZoomLabel: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  sliderContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  slider: {
    width: 6,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sliderTrack: {
    width: 4,
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
    position: 'absolute',
  },
  sliderThumb: {
    width: 22,
    height: 22,
    backgroundColor: COLORS.accent,
    borderRadius: 11,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currentZoomText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SideControls;
