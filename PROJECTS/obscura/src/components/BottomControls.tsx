import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, ISO_VALUES, SHUTTER_SPEEDS } from '../constants/camera';
import { CameraSettings, UIState } from '../types/camera';
import CaptureButton from './CaptureButton';

interface BottomControlsProps {
  settings: CameraSettings;
  uiState: UIState;
  onSettingChange: <K extends keyof CameraSettings>(key: K, value: CameraSettings[K]) => void;
  onCapture: () => void;
  lastCapturedImage: string | null;
}

const BottomControls: React.FC<BottomControlsProps> = ({
  settings,
  uiState,
  onSettingChange,
  onCapture,
  lastCapturedImage,
}) => {
  const insets = useSafeAreaInsets();

  const handleModeChange = (mode: 'photo' | 'video' | 'portrait') => {
    onSettingChange('captureMode', mode);
    Haptics.selectionAsync();
  };

  const handleTimerChange = () => {
    const modes: Array<'off' | '3s' | '10s'> = ['off', '3s', '10s'];
    const currentIndex = modes.indexOf(settings.timerMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onSettingChange('timerMode', modes[nextIndex]);
    Haptics.selectionAsync();
  };

  const handleCameraFlip = () => {
    onSettingChange('cameraType', settings.cameraType === 'back' ? 'front' : 'back');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <BlurView intensity={50} style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Control Row 1 - Mode Selector and Timer */}
      <View style={styles.controlRow}>
        <View style={styles.modeSelector}>
          {(['photo', 'video', 'portrait'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                settings.captureMode === mode && styles.activeModeButton,
              ]}
              onPress={() => handleModeChange(mode)}
            >
              <Text
                style={[
                  styles.modeText,
                  settings.captureMode === mode && styles.activeModeText,
                ]}
              >
                {mode.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.timerButton} onPress={handleTimerChange}>
          <Ionicons name="timer-outline" size={20} color={COLORS.textPrimary} />
          <Text style={styles.timerText}>{settings.timerMode.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Control Row 2 - Gallery, Capture, Camera Flip */}
      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.galleryThumbnail}>
          {lastCapturedImage ? (
            <Image 
              source={{ uri: lastCapturedImage } as any} 
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.emptyThumbnail}>
              <Ionicons name="images-outline" size={24} color={COLORS.textSecondary} />
            </View>
          )}
        </TouchableOpacity>

        <CaptureButton
          onPress={onCapture}
          isRecording={uiState.recordingState === 'recording'}
          mode={settings.captureMode}
        />

        <TouchableOpacity style={styles.flipButton} onPress={handleCameraFlip}>
          <Ionicons name="camera-reverse-outline" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Control Row 3 - Manual Controls */}
      <View style={styles.manualControlsRow}>
        <ManualControl
          label="ISO"
          values={ISO_VALUES}
          currentValue={settings.iso}
          onValueChange={(value) => onSettingChange('iso', value)}
        />
        
        <ManualControl
          label="SHUTTER"
          values={SHUTTER_SPEEDS}
          currentValue={settings.shutterSpeed}
          onValueChange={(value) => onSettingChange('shutterSpeed', value)}
        />
      </View>
    </BlurView>
  );
};

interface ManualControlProps {
  label: string;
  values: (number | string)[];
  currentValue: number | string;
  onValueChange: (value: any) => void;
}

const ManualControl: React.FC<ManualControlProps> = ({
  label,
  values,
  currentValue,
  onValueChange,
}) => (
  <View style={styles.manualControl}>
    <Text style={styles.controlLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.controlScroll}>
      {values.map((value) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.controlValue,
            currentValue === value && styles.activeControlValue,
          ]}
          onPress={() => {
            onValueChange(value);
            Haptics.selectionAsync();
          }}
        >
          <Text
            style={[
              styles.controlValueText,
              currentValue === value && styles.activeControlValueText,
            ]}
          >
            {value}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 1,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    padding: 4,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  activeModeButton: {
    backgroundColor: COLORS.accent,
  },
  modeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  activeModeText: {
    color: COLORS.primary,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  timerText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    marginLeft: 4,
  },
  galleryThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.secondary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  emptyThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    padding: 10,
  },
  manualControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  manualControl: {
    flex: 1,
    marginHorizontal: 10,
  },
  controlLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  controlScroll: {
    maxHeight: 40,
  },
  controlValue: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
  },
  activeControlValue: {
    backgroundColor: COLORS.highlight,
  },
  controlValueText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  activeControlValueText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default BottomControls;
