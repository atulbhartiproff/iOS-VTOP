export interface CameraSettings {
    iso: number;
    shutterSpeed: string;
    focusDistance: number;
    zoom: number;
    flashMode: 'auto' | 'on' | 'off' | 'torch';
    cameraType: 'front' | 'back';
    captureMode: 'photo' | 'video' | 'portrait';
    timerMode: 'off' | '3s' | '10s';
  }
  
  export interface UIState {
    controlsVisible: boolean;
    recordingState: 'idle' | 'recording' | 'paused';
    lastCapturedImage: string | null;
    focusPoint: { x: number; y: number } | null;
    exposureValue: number;
  }
  