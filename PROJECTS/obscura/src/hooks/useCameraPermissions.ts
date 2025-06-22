import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';

export const useCameraPermissions = () => {
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState<boolean>(false);
  const [microphonePermission, setMicrophonePermission] = useState<boolean>(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
    const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();

    setCameraPermission(cameraStatus === 'granted');
    setMediaLibraryPermission(mediaStatus === 'granted');
    setMicrophonePermission(micStatus === 'granted');
  };

  return {
    cameraPermission,
    mediaLibraryPermission,
    microphonePermission,
    requestPermissions,
  };
};
