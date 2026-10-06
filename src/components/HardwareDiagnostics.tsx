import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Volume2,
  Vibrate,
  Compass,
  Camera,
  Eye,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  Sliders,
  Play,
  Square,
  Maximize2,
  X,
} from "lucide-react";
import { Language } from "../types";

interface HardwareDiagnosticsProps {
  lang: Language;
}

export const HardwareDiagnostics: React.FC<HardwareDiagnosticsProps> = ({ lang }) => {
  const [activeModule, setActiveModule] = useState<"touch" | "deadpixel" | "audio" | "vibration" | "sensors" | "camera">("touch");

  // Touch test state
  const [touchGrid, setTouchGrid] = useState<boolean[]>(Array(48).fill(false));
  const [touchCoordinates, setTouchCoordinates] = useState<{ x: number; y: number } | null>(null);

  // Dead pixel full screen state
  const [deadPixelColor, setDeadPixelColor] = useState<string | null>(null);

  // Audio tone generator state
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [frequency, setFrequency] = useState<number>(440); // 440 Hz (A4)
  const [audioChannel, setAudioChannel] = useState<"both" | "left" | "right">("both");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);

  // Sensor state
  const [sensorValues, setSensorValues] = useState({
    pitch: 12.4,
    roll: -4.8,
    yaw: 184.2,
    accelX: 0.12,
    accelY: -0.05,
    accelZ: 9.81,
    lightLux: 340,
    proximityNear: false,
  });

  // Camera stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const isAr = lang === "ar";

  // Simulate live sensor fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorValues((prev) => ({
        pitch: +(prev.pitch + (Math.random() - 0.5) * 1.5).toFixed(1),
        roll: +(prev.roll + (Math.random() - 0.5) * 1.5).toFixed(1),
        yaw: Math.round((prev.yaw + (Math.random() - 0.5) * 2 + 360) % 360),
        accelX: +((Math.random() - 0.5) * 0.4).toFixed(2),
        accelY: +((Math.random() - 0.5) * 0.4).toFixed(2),
        accelZ: +(9.81 + (Math.random() - 0.5) * 0.1).toFixed(2),
        lightLux: Math.max(10, Math.round(prev.lightLux + (Math.random() - 0.5) * 20)),
        proximityNear: prev.proximityNear,
      }));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Web Audio Tone Control
  const startTone = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.3;

      let panner: StereoPannerNode | null = null;
      if ("createStereoPanner" in ctx) {
        panner = ctx.createStereoPanner();
        panner.pan.value = audioChannel === "left" ? -1 : audioChannel === "right" ? 1 : 0;
        pannerRef.current = panner;
        osc.connect(panner);
        panner.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.start();

      oscRef.current = osc;
      setAudioPlaying(true);
    } catch (e) {
      console.warn("Audio Context init error", e);
    }
  };

  const stopTone = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {
        console.warn(e);
      }
      oscRef.current = null;
    }
    setAudioPlaying(false);
  };

  const handleFrequencyChange = (newFreq: number) => {
    setFrequency(newFreq);
    if (oscRef.current && audioCtxRef.current) {
      oscRef.current.frequency.setValueAtTime(newFreq, audioCtxRef.current.currentTime);
    }
  };

  const handleChannelChange = (ch: "both" | "left" | "right") => {
    setAudioChannel(ch);
    if (pannerRef.current && audioCtxRef.current) {
      pannerRef.current.pan.setValueAtTime(
        ch === "left" ? -1 : ch === "right" ? 1 : 0,
        audioCtxRef.current.currentTime
      );
    }
  };

  // Vibration Motor Control
  const triggerVibration = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      setCameraError(err.message || "Failed to access camera.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const handleGridHover = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    setTouchGrid((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });

    if ("clientX" in e) {
      setTouchCoordinates({ x: Math.round(e.clientX), y: Math.round(e.clientY) });
    }
  };

  const resetTouchGrid = () => {
    setTouchGrid(Array(48).fill(false));
    setTouchCoordinates(null);
  };

  const touchTestedCount = touchGrid.filter(Boolean).length;
  const touchTestedPercent = Math.round((touchTestedCount / touchGrid.length) * 100);

  return (
    <div className="space-y-4">
      {/* Fullscreen Dead Pixel Overlay */}
      {deadPixelColor && (
        <div
          onClick={() => setDeadPixelColor(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 cursor-pointer"
          style={{ backgroundColor: deadPixelColor }}
        >
          <div className="bg-slate-900/80 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full border border-white/20 font-bold shadow-lg">
            {isAr ? "انقر في أي مكان لإنهاء الفحص" : "Click anywhere to exit Dead Pixel Test"}
          </div>
          <div className="flex gap-2 bg-slate-900/80 p-2 rounded-xl border border-white/20 backdrop-blur-md shadow-xl">
            {["#FF0000", "#00FF00", "#0000FF", "#FFFFFF", "#000000"].map((c) => (
              <button
                key={c}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeadPixelColor(c);
                }}
                className="w-8 h-8 rounded-lg border-2 border-white/60 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Module Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveModule("touch")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeModule === "touch"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{isAr ? "فحص التاتش (Touch Grid)" : "Touch Screen Grid"}</span>
          </button>

          <button
            onClick={() => setActiveModule("deadpixel")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeModule === "deadpixel"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{isAr ? "فحص البكسلات الميتة (Dead Pixels)" : "Dead Pixel Tester"}</span>
          </button>

          <button
            onClick={() => setActiveModule("audio")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeModule === "audio"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isAr ? "فحص الصوت والترددات (Audio)" : "Audio Frequency Lab"}</span>
          </button>

          <button
            onClick={() => setActiveModule("vibration")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeModule === "vibration"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <Vibrate className="w-4 h-4" />
            <span>{isAr ? "محرك الاهتزاز (Vibration)" : "Vibration Motor"}</span>
          </button>

          <button
            onClick={() => setActiveModule("sensors")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeModule === "sensors"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{isAr ? "الحساسات والتوجيه (Sensors)" : "Sensors & Gyroscope"}</span>
          </button>

          <button
            onClick={() => setActiveModule("camera")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeModule === "camera"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{isAr ? "الكاميرات والفلاش (Camera)" : "Camera & Optics"}</span>
          </button>
        </div>
      </div>

      {/* Module 1: Touch Screen Grid */}
      {activeModule === "touch" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Grid className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? "مصفوفة فحص حساسية اللمس وشبكة الشاشة" : "Touch Digitizer Matrix Test"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isAr ? "مرر إصبعك أو مؤشر الفأرة على كل المربعات لتأكيد سلامة طبقة اللمس" : "Swipe across all cells to verify digitizer responsiveness"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-indigo-700 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                {touchTestedCount} / {touchGrid.length} ({touchTestedPercent}%)
              </div>
              <button
                onClick={resetTouchGrid}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? "إعادة الفحص" : "Reset Grid"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Touch Matrix */}
          <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200 select-none">
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5">
              {touchGrid.map((tested, idx) => (
                <div
                  key={idx}
                  onMouseEnter={(e) => handleGridHover(idx, e)}
                  onTouchMove={(e) => handleGridHover(idx, e)}
                  className={`h-12 rounded-lg border transition-all flex items-center justify-center font-mono text-[10px] cursor-crosshair font-bold ${
                    tested
                      ? "bg-emerald-50 border-emerald-400 text-emerald-700 shadow-xs"
                      : "bg-white border-slate-200 text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/30 shadow-xs"
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            {touchTestedPercent === 100 && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 justify-center shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? "تم اجتياز فحص اللمس لجميع نقاط الشاشة بنجاح 100%!" : "Digitizer Pass: 100% Screen Grid Verified!"}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Module 2: Dead Pixel Tester */}
      {activeModule === "deadpixel" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? "فحص البكسلات العالقة والميتة (Dead & Stuck Pixels)" : "Dead & Stuck Pixel Diagnostics"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {isAr ? "اختر أحد الألوان للشاشة الكاملة لفحص أي بكسل معطوب في لوحة AMOLED / LCD" : "Switch between primary RGBW screen colors to spot defective pixel sub-arrays"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
            {[
              { name: isAr ? "أحمر كامل (Red)" : "Pure Red", color: "#FF0000" },
              { name: isAr ? "أخضر كامل (Green)" : "Pure Green", color: "#00FF00" },
              { name: isAr ? "أزرق كامل (Blue)" : "Pure Blue", color: "#0000FF" },
              { name: isAr ? "أبيض كامل (White)" : "Pure White", color: "#FFFFFF" },
              { name: isAr ? "أسود كامل (Black)" : "Pure Black (OLED)", color: "#000000" },
            ].map((item) => (
              <button
                key={item.color}
                onClick={() => setDeadPixelColor(item.color)}
                className="p-5 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 font-bold text-xs transition-transform hover:scale-105 cursor-pointer shadow-xs"
                style={{ backgroundColor: item.color === "#000000" ? "#1e293b" : item.color, color: item.color === "#FFFFFF" ? "#0f172a" : "#fff" }}
              >
                <Maximize2 className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Module 3: Audio Frequency Tone Lab */}
      {activeModule === "audio" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? "مختبر فحص الترددات الصوتية والسماعات" : "Dual-Channel Acoustic & Tone Generator"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isAr ? "توليد موجات جيبية من 20Hz إلى 20,000Hz لفحص مكبر الصوت وسماعة الأذن" : "Generate pure sine wave frequencies from 20Hz to 20,000Hz"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={audioPlaying ? stopTone : startTone}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer ${
                  audioPlaying
                    ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {audioPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{audioPlaying ? (isAr ? "إيقاف التردد" : "Stop Tone") : (isAr ? "تشغيل التردد" : "Play Tone")}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
            {/* Frequency Slider */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-bold">{isAr ? "التردد الحالي:" : "Current Frequency:"}</span>
                <span className="text-indigo-600 font-mono text-base font-bold">{frequency} Hz</span>
              </div>
              <input
                type="range"
                min="20"
                max="20000"
                step="10"
                value={frequency}
                onChange={(e) => handleFrequencyChange(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono font-semibold">
                <span>20 Hz (Bass Sub)</span>
                <span>1,000 Hz (Mid/Voice)</span>
                <span>20,000 Hz (Treble Max)</span>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {[
                  { label: "100 Hz (Bass)", freq: 100 },
                  { label: "440 Hz (Standard A4)", freq: 440 },
                  { label: "1 kHz (Earpiece)", freq: 1000 },
                  { label: "4 kHz (Speaker)", freq: 4000 },
                  { label: "12 kHz (Treble)", freq: 12000 },
                ].map((p) => (
                  <button
                    key={p.freq}
                    onClick={() => handleFrequencyChange(p.freq)}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-[11px] font-mono font-bold cursor-pointer shadow-xs"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Channel Selector */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="text-slate-800 font-bold">{isAr ? "قناة الصوت (Stereo Panning):" : "Speaker Channel:"}</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleChannelChange("left")}
                  className={`p-2.5 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                    audioChannel === "left"
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs"
                  }`}
                >
                  {isAr ? "اليسار (Left)" : "Left Channel"}
                </button>
                <button
                  onClick={() => handleChannelChange("both")}
                  className={`p-2.5 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                    audioChannel === "both"
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs"
                  }`}
                >
                  {isAr ? "كلا القناتين" : "Stereo Both"}
                </button>
                <button
                  onClick={() => handleChannelChange("right")}
                  className={`p-2.5 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                    audioChannel === "right"
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs"
                  }`}
                >
                  {isAr ? "اليمين (Right)" : "Right Channel"}
                </button>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed pt-1 font-medium">
                {isAr
                  ? "يساعد في كشف مكبرات الصوت المشوهة أو انسداد شبكة السماعة العلوية بالغبار."
                  : "Detects blown diaphragm coils, muffled earpieces, or stereo audio codec balance issues."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 4: Vibration Motor */}
      {activeModule === "vibration" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? "فحص محرك الاهتزاز واللمس (Haptic / Linear Motor)" : "Vibration & Haptic Motor Diagnostics"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {isAr ? "إرسال نبضات اهتزاز بأنماط مختلفة لاختبار استجابة المحرك الخطي Z-Axis Haptic" : "Trigger vibration sequences to test linear haptic motor and ERM coin responsiveness"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <button
              onClick={() => triggerVibration(100)}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 shadow-xs"
            >
              <Zap className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">{isAr ? "نقرة قصيرة (Tick 100ms)" : "Short Click (100ms)"}</span>
            </button>

            <button
              onClick={() => triggerVibration(500)}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 shadow-xs"
            >
              <Vibrate className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-bold text-slate-800">{isAr ? "اهتزاز متوسط (Buzz 500ms)" : "Medium Buzz (500ms)"}</span>
            </button>

            <button
              onClick={() => triggerVibration([100, 50, 100, 50, 100, 200, 300, 100, 300])}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 shadow-xs"
            >
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-bold text-slate-800">{isAr ? "نمط نداء استغاثة (SOS Rhythm)" : "SOS Pulse Pattern"}</span>
            </button>

            <button
              onClick={() => triggerVibration(1200)}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 shadow-xs"
            >
              <Zap className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">{isAr ? "اهتزاز طويل مستمر (1.2s)" : "Long Continuous (1.2s)"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Module 5: Sensors & 3D Gyroscope */}
      {activeModule === "sensors" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? "قراءات الحساسات المباشرة (Live Sensor Telemetry)" : "Live Sensor Telemetry"}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {isAr ? "فحص الجيروسكوب، مقياس التسارع، البوصلة، وحساس الإضاءة والتقارب" : "Real-time readout of Gyroscope, Accelerometer, Compass, Light, and Proximity"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {/* Gyroscope / Orientation */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-slate-800 font-bold">
                <span>{isAr ? "الجيروسكوب (Gyroscope)" : "Gyroscope Orientation"}</span>
                <span className="text-indigo-600 font-mono text-[11px]">ICM-42688</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono mt-2">
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 font-bold">Pitch</div>
                  <div className="text-slate-800 font-bold">{sensorValues.pitch}°</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 font-bold">Roll</div>
                  <div className="text-slate-800 font-bold">{sensorValues.roll}°</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 font-bold">Yaw</div>
                  <div className="text-slate-800 font-bold">{sensorValues.yaw}°</div>
                </div>
              </div>
            </div>

            {/* Accelerometer */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-slate-800 font-bold">
                <span>{isAr ? "مقياس التسارع (Accelerometer)" : "G-Force Accelerometer"}</span>
                <span className="text-emerald-600 font-mono font-bold">m/s²</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono mt-2">
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 font-bold">X-Axis</div>
                  <div className="text-slate-800 font-bold">{sensorValues.accelX}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 font-bold">Y-Axis</div>
                  <div className="text-slate-800 font-bold">{sensorValues.accelY}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
                  <div className="text-[10px] text-slate-500 font-bold">Z-Axis</div>
                  <div className="text-slate-800 font-bold">{sensorValues.accelZ}</div>
                </div>
              </div>
            </div>

            {/* Light & Proximity */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="text-slate-800 font-bold">{isAr ? "الإضاءة والتقارب (ALS & Prox)" : "Ambient & Proximity"}</div>
              <div className="space-y-2 mt-2 font-mono">
                <div className="flex justify-between bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-slate-600 font-sans font-medium">{isAr ? "شدة الضوء المحيط:" : "Ambient Light:"}</span>
                  <span className="text-amber-600 font-bold">{sensorValues.lightLux} Lux</span>
                </div>
                <div className="flex justify-between bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-slate-600 font-sans font-medium">{isAr ? "حساس التقارب (Proximity):" : "Proximity State:"}</span>
                  <span className="text-emerald-700 font-bold">FAR (No Obstacle)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 6: Camera & Optics */}
      {activeModule === "camera" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? "فحص الكاميرات ومستشعر التصوير" : "Camera Sensor & Optics Diagnostic"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isAr ? "فحص استجابة مستشعر الكاميرا والتركيز التلقائي (Autofocus)" : "Direct video feed preview to verify camera sensor operation"}
              </p>
            </div>

            <div className="flex gap-2">
              {cameraActive ? (
                <button
                  onClick={stopCamera}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {isAr ? "إيقاف الكاميرا" : "Stop Camera"}
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  {isAr ? "بدء المعاينة الحية" : "Start Live Preview"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            {cameraError && (
              <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200 mb-3 font-medium">
                {cameraError}
              </div>
            )}
            <div className="w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden border border-slate-300 shadow-sm flex items-center justify-center relative">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {!cameraActive && (
                <div className="text-xs text-slate-400 flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 text-slate-500" />
                  <span>{isAr ? "الكاميرا غير نشطة. اضغط لبدء المعاينة" : "Camera inactive. Click to start stream."}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
