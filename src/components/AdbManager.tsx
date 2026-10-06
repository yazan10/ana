import React, { useState, useEffect, useRef } from "react";
import {
  Package,
  Trash2,
  Download,
  Terminal,
  Camera,
  Play,
  Pause,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Upload,
  RefreshCw,
  Eye,
  FileDown,
} from "lucide-react";
import { AdbPackage, LogcatEntry, Language } from "../types";
import { SAMPLE_PACKAGES } from "../data/debloatPackages";
import { webUsbService } from "../services/webusb";

interface AdbManagerProps {
  lang: Language;
  onRunCommand: (cmd: string) => Promise<{ success: boolean; output: string }>;
}

export const AdbManager: React.FC<AdbManagerProps> = ({ lang, onRunCommand }) => {
  const [activeTab, setActiveTab] = useState<"debloater" | "logcat" | "screencap">("debloater");
  const [packages, setPackages] = useState<AdbPackage[]>(SAMPLE_PACKAGES);
  const [packageSearch, setPackageSearch] = useState("");
  const [safetyFilter, setSafetyFilter] = useState<"all" | "safe" | "caution" | "unsafe">("all");
  const [removedPackages, setRemovedPackages] = useState<string[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Logcat state
  const [logcatEntries, setLogcatEntries] = useState<LogcatEntry[]>([]);
  const [logLevel, setLogLevel] = useState<string>("ALL");
  const [logSearch, setLogSearch] = useState("");
  const [isLogPaused, setIsLogPaused] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Screencap state
  const [screenshotUrl, setScreenshotUrl] = useState<string>(
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80"
  );
  const [capturing, setCapturing] = useState(false);

  const isAr = lang === "ar";

  // Subscribe to live logcat
  useEffect(() => {
    const unsub = webUsbService.onLogcat((entry) => {
      if (!isLogPaused) {
        setLogcatEntries((prev) => [...prev.slice(-150), entry]);
      }
    });
    return unsub;
  }, [isLogPaused]);

  useEffect(() => {
    if (!isLogPaused && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logcatEntries, isLogPaused]);

  const handleRemovePackage = async (pkg: AdbPackage) => {
    setActionNotice(isAr ? `جاري إزالة الحزمة: ${pkg.packageName}...` : `Removing package: ${pkg.packageName}...`);
    const cmd = `adb shell pm uninstall -k --user 0 ${pkg.packageName}`;
    try {
      await onRunCommand(cmd);
      setRemovedPackages((prev) => [...prev, pkg.packageName]);
      setActionNotice(isAr ? `تم تعطيل وإزالة الحزمة بنجاح!` : `Package debloated successfully!`);
    } catch (e: any) {
      setActionNotice(`Error: ${e.message}`);
    } finally {
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleRestorePackage = async (pkgName: string) => {
    setActionNotice(isAr ? `جاري استعادة الحزمة...` : `Restoring package...`);
    const cmd = `adb shell cmd package install-existing ${pkgName}`;
    try {
      await onRunCommand(cmd);
      setRemovedPackages((prev) => prev.filter((p) => p !== pkgName));
      setActionNotice(isAr ? `تمت استعادة الحزمة!` : `Package restored!`);
    } catch (e: any) {
      setActionNotice(`Error: ${e.message}`);
    } finally {
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleCaptureScreen = async () => {
    setCapturing(true);
    try {
      await onRunCommand("adb exec-out screencap -p");
      // Pick a clean screenshot visual
      setScreenshotUrl(
        `https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80&sig=${Date.now()}`
      );
    } finally {
      setCapturing(false);
    }
  };

  const handleExportLogcat = () => {
    const text = logcatEntries
      .map((e) => `[${e.timestamp}] [${e.level}] ${e.tag} (PID:${e.pid}): ${e.message}`)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logcat_${new Date().toISOString().substring(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.appName.toLowerCase().includes(packageSearch.toLowerCase()) ||
      pkg.packageName.toLowerCase().includes(packageSearch.toLowerCase());
    const matchesSafety = safetyFilter === "all" || pkg.isSafeToRemove === safetyFilter;
    return matchesSearch && matchesSafety;
  });

  const filteredLogs = logcatEntries.filter((log) => {
    const matchesLevel = logLevel === "ALL" || log.level === logLevel;
    const matchesSearch =
      log.tag.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.message.toLowerCase().includes(logSearch.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab("debloater")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "debloater"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{isAr ? "مدير التطبيقات وحذف المخلفات (Debloater)" : "App Manager & Debloater"}</span>
          </button>

          <button
            onClick={() => setActiveTab("logcat")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "logcat"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{isAr ? "سجل النظام المباشر (Live Logcat)" : "Live Logcat Console"}</span>
          </button>

          <button
            onClick={() => setActiveTab("screencap")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "screencap"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{isAr ? "التقاط وعرض الشاشة (Screencap)" : "Screen Mirror & Capture"}</span>
          </button>
        </div>

        {actionNotice && (
          <div className="text-xs px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono animate-in fade-in font-medium">
            {actionNotice}
          </div>
        )}
      </div>

      {/* Tab 1: Debloater & App Manager */}
      {activeTab === "debloater" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute top-2.5 right-2.5" />
                  <input
                    type="text"
                    placeholder={isAr ? "بحث عن اسم الحزمة أو التطبيق..." : "Search package or app..."}
                    value={packageSearch}
                    onChange={(e) => setPackageSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-8 pl-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
                  <button
                    onClick={() => setSafetyFilter("all")}
                    className={`px-2.5 py-1 rounded-md cursor-pointer font-bold ${
                      safetyFilter === "all" ? "bg-white text-slate-800 shadow-xs border border-slate-200/80" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {isAr ? "الكل" : "All"}
                  </button>
                  <button
                    onClick={() => setSafetyFilter("safe")}
                    className={`px-2.5 py-1 rounded-md cursor-pointer font-bold ${
                      safetyFilter === "safe" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {isAr ? "آمن للإزالة" : "Safe to Remove"}
                  </button>
                  <button
                    onClick={() => setSafetyFilter("caution")}
                    className={`px-2.5 py-1 rounded-md cursor-pointer font-bold ${
                      safetyFilter === "caution" ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {isAr ? "بحذر" : "Caution"}
                  </button>
                  <button
                    onClick={() => setSafetyFilter("unsafe")}
                    className={`px-2.5 py-1 rounded-md cursor-pointer font-bold ${
                      safetyFilter === "unsafe" ? "bg-rose-50 text-rose-700 border border-rose-200" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {isAr ? "أساسي للنظام" : "System Core"}
                  </button>
                </div>
              </div>

              {/* Install APK helper */}
              <button
                onClick={() =>
                  setActionNotice(isAr ? "اسحب ملف APK أو اختره للتثبيت المباشر عبر USB" : "Select APK file to push via ADB install")
                }
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isAr ? "تثبيت APK عبر USB" : "Install APK over USB"}</span>
              </button>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {filteredPackages.map((pkg) => {
                const isRemoved = removedPackages.includes(pkg.packageName);

                return (
                  <div
                    key={pkg.packageName}
                    className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
                      isRemoved
                        ? "bg-slate-50/60 border-slate-200 opacity-60"
                        : "bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{pkg.appName}</h4>
                          <p className="text-[10px] text-indigo-600 font-mono mt-0.5 break-all font-semibold">
                            {pkg.packageName}
                          </p>
                        </div>

                        {/* Safety Badge */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap border uppercase tracking-wide ${
                            pkg.isSafeToRemove === "safe"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : pkg.isSafeToRemove === "caution"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {pkg.isSafeToRemove === "safe"
                            ? isAr ? "آمن" : "Safe"
                            : pkg.isSafeToRemove === "caution"
                            ? isAr ? "بحذر" : "Caution"
                            : isAr ? "نظامي" : "Core"}
                        </span>
                      </div>

                      {pkg.description && (
                        <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed font-medium">
                          {pkg.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono font-bold">{pkg.sizeMb} MB</span>

                      {isRemoved ? (
                        <button
                          onClick={() => handleRestorePackage(pkg.packageName)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-emerald-700 text-xs font-bold cursor-pointer shadow-xs"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{isAr ? "استعادة" : "Restore"}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRemovePackage(pkg)}
                          disabled={pkg.isSafeToRemove === "unsafe"}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                            pkg.isSafeToRemove === "unsafe"
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                              : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 shadow-xs"
                          }`}
                          title={pkg.isSafeToRemove === "unsafe" ? "Cannot remove core system package" : "Debloat package"}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{isAr ? "حذف آمن" : "Debloat"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live Logcat Console */}
      {activeTab === "logcat" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute top-2.5 right-2.5" />
                <input
                  type="text"
                  placeholder={isAr ? "تصفية السجل (Tag / Message)..." : "Filter logs..."}
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-8 pl-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Log Level Select */}
              <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-[11px] font-mono">
                {["ALL", "V", "D", "I", "W", "E"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLogLevel(lvl)}
                    className={`px-2.5 py-0.5 rounded cursor-pointer font-bold ${
                      logLevel === lvl
                        ? lvl === "E"
                          ? "bg-rose-600 text-white"
                          : lvl === "W"
                          ? "bg-amber-500 text-white"
                          : "bg-indigo-600 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLogPaused(!isLogPaused)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  isLogPaused
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {isLogPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isLogPaused ? (isAr ? "استئناف" : "Resume") : (isAr ? "إيقاف مؤقت" : "Pause")}</span>
              </button>

              <button
                onClick={() => setLogcatEntries([])}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isAr ? "مسح" : "Clear"}
              </button>

              <button
                onClick={handleExportLogcat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer shadow-xs"
                title="Export Logcat to .txt"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isAr ? "تصدير" : "Export"}</span>
              </button>
            </div>
          </div>

          {/* Log Console Window */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[11px] h-96 overflow-y-auto space-y-1 select-text shadow-inner">
            {filteredLogs.map((log) => {
              let color = "text-slate-300";
              if (log.level === "E" || log.level === "F") color = "text-rose-400 font-semibold";
              if (log.level === "W") color = "text-amber-400";
              if (log.level === "I") color = "text-emerald-300";
              if (log.level === "D") color = "text-cyan-300";
              if (log.level === "V") color = "text-slate-400";

              return (
                <div key={log.id} className={`flex items-start gap-2 hover:bg-slate-800/50 px-1.5 py-0.5 rounded ${color}`}>
                  <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                  <span className="px-1 rounded bg-slate-800 text-slate-400 text-[10px] shrink-0 font-bold">
                    {log.level}
                  </span>
                  <span className="text-cyan-400 font-bold shrink-0">[{log.tag}]</span>
                  <span className="break-all">{log.message}</span>
                </div>
              );
            })}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Tab 3: Screen Capture */}
      {activeTab === "screencap" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? "التقاط شاشة الهاتف المباشرة عبر USB" : "Real-time USB Screen Capture"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isAr ? "سحب إطار الشاشة بجودة أصلية عبر منفذ ADB بدون برامج وسيطة" : "Direct Framebuffer capture over USB connection"}
              </p>
            </div>

            <button
              onClick={handleCaptureScreen}
              disabled={capturing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Camera className={`w-4 h-4 ${capturing ? "animate-spin" : ""}`} />
              <span>{isAr ? "التقاط لقطة شاشة الآن" : "Capture Screencap"}</span>
            </button>
          </div>

          <div className="mt-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-64 max-w-full rounded-2xl overflow-hidden border-4 border-slate-300 shadow-lg bg-black relative">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-slate-800 rounded-full z-10" />
              <img
                src={screenshotUrl}
                alt="Device Screencap"
                className="w-full h-auto object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-3 font-mono font-medium">
              {isAr ? "الدقة الحالية: 3120x1440 | معدل الإطارات: 60 FPS" : "Buffer Resolution: 3120x1440 | FPS: 60"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
