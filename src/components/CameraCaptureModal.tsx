import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, SwitchCamera } from 'lucide-react';
import { AttachedImage } from '../types';
import { playSpellSound, playPumpkinSound } from '../utils/audio';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: AttachedImage) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement>(null);

  // Start camera when opened
  useEffect(() => {
    if (isOpen && !capturedDataUrl) {
      startCamera(facingMode);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async (mode: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : 'Could not access device camera. You can also use the file upload button to upload photos directly.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (!videoRef.current) return;
    playSpellSound();

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedDataUrl(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    playPumpkinSound();
    setCapturedDataUrl(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (!capturedDataUrl) return;
    playSpellSound();

    const base64 = capturedDataUrl.split(',')[1] || '';
    const approxBytes = Math.round((base64.length * 3) / 4);
    const sizeFormatted = `${Math.round(approxBytes / 1024)} KB`;

    onCapture({
      name: `camera_snapshot_${Date.now()}.jpg`,
      mimeType: 'image/jpeg',
      base64,
      dataUrl: capturedDataUrl,
      sizeFormatted,
    });
    handleClose();
  };

  const handleSwitchCamera = () => {
    playPumpkinSound();
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const handleClose = () => {
    stopCamera();
    setCapturedDataUrl(null);
    setCameraError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0c0617] border border-orange-500/50 rounded-3xl p-5 shadow-[0_0_50px_rgba(249,115,22,0.35)] overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 hover:bg-purple-950 border border-purple-700/60 text-purple-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/40">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-cinzel text-orange-200">
              Capture Homework or Diagram
            </h3>
            <p className="text-xs text-purple-400">
              Point your camera at the problem parchment or worksheet
            </p>
          </div>
        </div>

        {/* Viewfinder or Preview Box */}
        <div className="relative w-full h-72 sm:h-80 bg-black rounded-2xl overflow-hidden border border-purple-900/60 flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center text-xs text-red-300 space-y-3">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
              <p>{cameraError}</p>
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-purple-200 text-xs border border-purple-700 transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : capturedDataUrl ? (
            <div className="relative w-full h-full">
              <img
                src={capturedDataUrl}
                alt="Captured homework"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 border border-emerald-500/50 text-emerald-300 text-[11px] font-mono-code flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Photo Captured
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Focus Reticle Overlay */}
              <div className="pointer-events-none absolute inset-6 border-2 border-dashed border-orange-400/50 rounded-2xl flex items-center justify-center">
                <span className="text-[11px] font-cinzel text-orange-300/80 bg-black/60 px-3 py-1 rounded-full border border-orange-500/30">
                  Align problem or diagram within frame
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex items-center justify-between gap-3">
          {!capturedDataUrl && !cameraError && (
            <button
              type="button"
              onClick={handleSwitchCamera}
              className="px-3 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-800 text-purple-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Switch camera"
            >
              <SwitchCamera className="w-4 h-4" />
              <span className="hidden sm:inline">Flip Camera</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {capturedDataUrl ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-purple-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-900/40 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Use This Picture</span>
                </button>
              </>
            ) : (
              !cameraError && (
                <button
                  type="button"
                  onClick={handleSnap}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-900/50 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Picture</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
