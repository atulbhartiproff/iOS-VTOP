import { useCallback, useState } from 'react';
import { CameraSettings } from '../types/camera';

export const useCameraSettings = () => {
  const [settings, setSettings] = useState<CameraSettings>({
    iso: 100,
    shutterSpeed: '1/125',
    focusDistance: 0.5,
    zoom: 1,
    flashMode: 'auto',
    cameraType: 'back',
    captureMode: 'photo',
    timerMode: 'off',
  });

  const updateSetting = useCallback(<K extends keyof CameraSettings>(
    key: K,
    value: CameraSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return { settings, updateSetting };
};
