import * as Haptics from 'expo-haptics';

export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'selection') => {
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
    case 'selection':
      Haptics.selectionAsync();
      break;
  }
};

export const formatShutterSpeed = (speed: string): number => {
  const [numerator, denominator] = speed.split('/');
  return denominator ? parseInt(numerator) / parseInt(denominator) : parseInt(numerator);
};

export const calculateExposureValue = (iso: number, shutterSpeed: string, aperture: number = 2.8): number => {
  const speed = formatShutterSpeed(shutterSpeed);
  return Math.log2((aperture * aperture) / speed) - Math.log2(iso / 100);
};
