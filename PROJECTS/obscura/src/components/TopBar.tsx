import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/camera';

interface TopBarProps {
  flashMode: 'auto' | 'on' | 'off' | 'torch';
  onFlashModeChange: (mode: 'auto' | 'on' | 'off' | 'torch') => void;
}

const TopBar: React.FC<TopBarProps> = ({ flashMode, onFlashModeChange }) => {
  const insets = useSafeAreaInsets();

  const getFlashIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (flashMode) {
      case 'auto': return 'flash';
      case 'on': return 'flash';
      case 'off': return 'flash-off';
      case 'torch': return 'flashlight';
      default: return 'flash';
    }
  };

  const cycleFlashMode = () => {
    const modes: Array<'auto' | 'on' | 'off' | 'torch'> = ['auto', 'on', 'off', 'torch'];
    const currentIndex = modes.indexOf(flashMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onFlashModeChange(modes[nextIndex]);
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={50} style={[styles.blurContainer, { paddingTop: insets.top }]}>
        <View style={styles.contentContainer}>
          <TouchableOpacity style={styles.flashButton} onPress={cycleFlashMode}>
            <Ionicons 
              name={getFlashIcon()} 
              size={24} 
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons 
              name="settings-outline" 
              size={24} 
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  blurContainer: {
    minHeight: 80,
  },
  contentContainer: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  flashButton: {
    padding: 10,
    backgroundColor: 'transparent',
  },
  settingsButton: {
    padding: 10,
    backgroundColor: 'transparent',
  },
});

export default TopBar;
