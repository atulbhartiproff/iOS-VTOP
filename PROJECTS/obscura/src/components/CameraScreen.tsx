import { CameraType, CameraView, FlashMode } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

import { COLORS } from '../constants/camera';
import { useCameraPermissions } from '../hooks/useCameraPermissions';
import { useCameraSettings } from '../hooks/useCameraSettings';
import { UIState } from '../types/camera';

import BottomControls from './BottomControls';
import FocusIndicator from './FocusIndicator';
import TopBar from './TopBar';

const { width, height } = Dimensions.get('window');

const CameraScreen: React.FC = () => {
  const cameraRef = useRef<CameraView>(null);
  const { cameraPermission, mediaLibraryPermission } = useCameraPermissions();
  const { settings, updateSetting } = useCameraSettings();
  
  const [uiState, setUIState] = useState<UIState>({
    controlsVisible: true,
    recordingState: 'idle',
    lastCapturedImage: null,
    focusPoint: null,
    exposureValue: 0,
  });

  const zoomValue = useSharedValue(1);
  const focusScale = useSharedValue(0);
  const focusOpacity = useSharedValue(0);
  const baseZoom = useSharedValue(1);

  // Safe function calls for UI thread
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy') => {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
    }
  }, []);

  const updateFocusPoint = useCallback((x: number, y: number) => {
    setUIState(prev => ({ ...prev, focusPoint: { x, y } }));
  }, []);

  const updateZoom = useCallback((zoom: number) => {
    updateSetting('zoom', zoom);
  }, [updateSetting]);

  // Fixed tap gesture - only for camera preview area
  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onStart((event) => {
      'worklet';
      const { x, y } = event;
      
      // Only handle taps in the camera preview area (avoid UI controls)
      if (y > 100 && y < height - 250 && x > 50 && x < width - 100) {
        runOnJS(updateFocusPoint)(x, y);
        
        focusScale.value = withSpring(1, { damping: 15 });
        focusOpacity.value = withTiming(1, { duration: 200 }, () => {
          focusOpacity.value = withTiming(0, { duration: 1000 });
          focusScale.value = withTiming(0, { duration: 1000 });
        });

        runOnJS(triggerHaptic)('light');
      }
    });

  // Fixed pinch gesture with proper zoom handling
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      'worklet';
      baseZoom.value = zoomValue.value;
    })
    .onUpdate((event) => {
      'worklet';
      const newZoom = Math.max(1, Math.min(10, baseZoom.value * event.scale));
      zoomValue.value = newZoom;
      runOnJS(updateZoom)(newZoom);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(triggerHaptic)('light');
    });

  // Combine gestures with proper exclusion
  const cameraGestures = Gesture.Race(pinchGesture, tapGesture);

  const capturePhoto = useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      triggerHaptic('medium');
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        exif: true,
      });

      if (mediaLibraryPermission && photo) {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        setUIState(prev => ({ ...prev, lastCapturedImage: photo.uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
    }
  }, [mediaLibraryPermission, triggerHaptic]);

  const toggleRecording = useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      if (uiState.recordingState === 'idle') {
        setUIState(prev => ({ ...prev, recordingState: 'recording' }));
        triggerHaptic('heavy');
        
        const video = await cameraRef.current.recordAsync();
        
        if (mediaLibraryPermission && video) {
          await MediaLibrary.saveToLibraryAsync(video.uri);
        }
      } else {
        cameraRef.current.stopRecording();
        setUIState(prev => ({ ...prev, recordingState: 'idle' }));
        triggerHaptic('medium');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record video');
      setUIState(prev => ({ ...prev, recordingState: 'idle' }));
    }
  }, [uiState.recordingState, mediaLibraryPermission, triggerHaptic]);

  if (!cameraPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Image source={require('../../assets/images/icon.png')} style={styles.permissionIcon} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera preview with gesture detection */}
      <GestureDetector gesture={cameraGestures}>
        <Animated.View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={settings.cameraType as CameraType}
            flash={settings.flashMode as FlashMode}
            zoom={settings.zoom}
            mute={true} // Prevents microphone-related crashes
          />
          
          <FocusIndicator
            focusPoint={uiState.focusPoint}
            scale={focusScale}
            opacity={focusOpacity}
          />
        </Animated.View>
      </GestureDetector>

      {/* UI Controls - outside gesture detector to prevent conflicts */}
      <TopBar
        flashMode={settings.flashMode}
        onFlashModeChange={(mode) => updateSetting('flashMode', mode)}
      />

      <BottomControls
        settings={settings}
        uiState={uiState}
        onSettingChange={updateSetting}
        onCapture={settings.captureMode === 'photo' ? capturePhoto : toggleRecording}
        lastCapturedImage={uiState.lastCapturedImage}
      />

      {/* <SideControls
        zoom={settings.zoom}
        onZoomChange={(zoom) => updateSetting('zoom', zoom)}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  permissionIcon: {
    width: 100,
    height: 100,
    tintColor: COLORS.textSecondary,
  },
});

export default CameraScreen;
