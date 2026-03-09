import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  X, 
  Zap, 
  Image as ImageIcon, 
  Camera, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { analyzeEnvironmentalViolation, DetectionResult } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';

export default function ReportForm({ onReportSubmitted, onClose }: { onReportSubmitted: () => void, onClose: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; alt?: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mode, setMode] = useState<'DETECT' | 'WASTE' | 'INFRASTRUCTURE'>('DETECT');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedItems, setVerifiedItems] = useState<number[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getGeoLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude,
          alt: pos.coords.altitude || 12 // Mock altitude if not available
        });
        setIsLocating(false);
      },
      (err) => {
        setError("Location access denied");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Start camera
  useEffect(() => {
    if (!preview && !result) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode },
            audio: false
          });
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera error:", err);
          setError("Camera access denied. Please use gallery upload.");
        }
      };
      startCamera();
    }

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [preview, result, facingMode]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreview(dataUrl);
        getGeoLocation();
        handleAnalyze(dataUrl);
      }
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      getGeoLocation();
      handleAnalyze(dataUrl);
    };
    reader.readAsDataURL(selectedFile);
    setError(null);
  }, [getGeoLocation]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    noClick: true,
    multiple: false
  } as any);

  const handleAnalyze = async (imageData: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeEnvironmentalViolation(imageData);
      setResult(analysis);
    } catch (err) {
      setError("AI analysis failed. Please try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!result || !preview) return;
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: result.type,
          confidence: result.confidence,
          location_lat: location?.lat || 0,
          location_lng: location?.lng || 0,
          image_url: preview,
          description: result.description
        })
      });

      if (response.ok) {
        onReportSubmitted();
        reset();
      }
    } catch (err) {
      setError("Failed to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    setLocation(null);
    setIsVerifying(false);
    setVerifiedItems([]);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <button 
          onClick={onClose}
          className="p-2 bg-black/10 backdrop-blur-md rounded-full text-black hover:bg-black/20 transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="flex flex-col items-center">
          <h2 className="text-black font-bold text-lg">Report Issue</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-600 font-bold tracking-[0.2em] uppercase">Live AI Analysis</span>
          </div>
        </div>

        <button 
          onClick={() => setIsFlashOn(!isFlashOn)}
          className={`p-2 backdrop-blur-md rounded-full transition-colors ${isFlashOn ? 'bg-yellow-500 text-black' : 'bg-black/10 text-black'}`}
        >
          <Zap size={24} fill={isFlashOn ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="h-[75%] relative flex items-center justify-center overflow-hidden">
        {!preview ? (
          <>
            {/* Camera Viewport */}
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </>
        ) : (
          <div className="w-full h-full relative bg-neutral-900">
            <img src={preview} alt="Captured" className="w-full h-full object-contain" />
            
            {/* Analysis Overlay */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center"
                >
                  <div className="relative w-24 h-24 mb-4">
                    <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin" />
                    <Loader2 className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={32} />
                  </div>
                  <p className="text-emerald-400 font-bold tracking-widest uppercase text-xs">AI Processing...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Result Card & Verification */}
        <AnimatePresence>
          {result && !isAnalyzing && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: '-40%', x: '-50%' }}
              animate={{ scale: 1, opacity: 1, y: '-50%', x: '-50%' }}
              exit={{ scale: 0.9, opacity: 0, y: '-40%', x: '-50%' }}
              className="fixed top-1/2 left-1/2 w-[85%] max-w-[400px] bg-black/95 backdrop-blur-3xl border border-emerald-500/20 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 max-h-[80%] overflow-y-auto flex flex-col"
            >
              {!isVerifying ? (
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] block mb-1">AI Detection Result</span>
                      <h3 className="text-3xl font-bold text-white capitalize leading-tight">{result.type.replace('_', ' ')}</h3>
                    </div>
                    <div className="bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30 shrink-0">
                      <span className="text-emerald-400 font-mono font-bold text-base">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <p className="text-neutral-400 text-sm mb-8 leading-relaxed italic">"{result.description}"</p>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setIsVerifying(true)}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                      Verify Report
                      <ChevronRight size={20} />
                    </button>
                    <button 
                      onClick={reset}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-colors border border-white/10"
                    >
                      Retake Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full space-y-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
                      <ShieldCheck className="text-emerald-500" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">AI Verification</h3>
                      <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Case ID: #ET-{Math.floor(Math.random() * 9000) + 1000}</p>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                    {[
                      { id: 1, text: `Object '${result.type.replace('_', ' ')}' detected in target area.` },
                      { id: 2, text: `AI Confidence matches ${(result.confidence * 100).toFixed(0)}%.` },
                      { id: 3, text: `Image metadata (GPS/EXIF) matches report coordinates.` }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (verifiedItems.includes(item.id)) {
                            setVerifiedItems(prev => prev.filter(i => i !== item.id));
                          } else {
                            setVerifiedItems(prev => [...prev, item.id]);
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                          verifiedItems.includes(item.id) 
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-white' 
                            : 'bg-white/5 border-white/10 text-neutral-400'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 ${
                          verifiedItems.includes(item.id)
                            ? 'bg-emerald-500 border-emerald-500 text-black'
                            : 'border-white/20'
                        }`}>
                          {verifiedItems.includes(item.id) && <CheckCircle2 size={14} strokeWidth={3} />}
                        </div>
                        <span className="text-[11px] font-semibold text-left leading-snug">{item.text}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setIsVerifying(false)}
                      className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-colors border border-white/10 text-sm"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={isSubmitting || verifiedItems.length < 3}
                      className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900/50 disabled:text-black/20 text-black font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 text-sm"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                      Approve & Submit
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="h-[25%] p-8 bg-black relative z-20 flex flex-col justify-center">
        {!preview ? (
          <div className="flex justify-between items-center w-full px-10 mb-10">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <button 
                onClick={open}
                className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
              >
                <ImageIcon size={24} />
              </button>
            </div>

            <button 
              onClick={capturePhoto}
              className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-transform"
            >
              <div className="w-20 h-20 border-4 border-black/20 rounded-full flex items-center justify-center">
                <Camera size={36} className="text-black" />
              </div>
            </button>

            <button 
              onClick={toggleCamera}
              className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <RefreshCw size={24} />
            </button>
          </div>
        ) : null}

        {/* Mode Selectors */}
        {!result && (
          <div className="flex justify-center gap-4 mb-6">
            {(['DETECT', 'WASTE', 'INFRASTRUCTURE'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all ${
                  mode === m 
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' 
                    : 'text-neutral-500 border border-transparent hover:text-neutral-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex justify-end">
          <div className="text-[8px] font-mono text-neutral-600 text-right leading-tight">
            <div>LAT: {location?.lat.toFixed(4) || '40.7128'} N</div>
            <div>LONG: {location?.lng.toFixed(4) || '74.0060'} W</div>
            <div>ALT: {location?.alt?.toFixed(0) || '12'}M</div>
          </div>
        </div>
      </div>

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-6 right-6 bg-red-500/90 backdrop-blur-md text-white p-4 rounded-2xl flex items-center gap-3 z-[60] shadow-xl"
          >
            <AlertCircle size={20} />
            <span className="text-xs font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-white/20 rounded-full">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
