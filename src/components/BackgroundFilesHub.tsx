import React, { useState, useEffect } from "react";
import {
  Download,
  CheckCircle2,
  HardDrive,
  Cpu,
  ShieldCheck,
  Zap,
  RefreshCw,
  Search,
  Filter,
  ArrowDownToLine,
  FolderDown,
  Layers,
  Sparkles,
  FileCode,
  Terminal,
  Usb,
  AlertCircle,
  ExternalLink,
  Sliders,
  Check,
} from "lucide-react";
import { Language } from "../types";
import { BackgroundFileItem } from "../data/driversAndToolsData";
import { backgroundDownloader } from "../services/backgroundDownloader";

interface BackgroundFilesHubProps {
  lang: Language;
  onOpenWorkspace?: () => void;
}

export const BackgroundFilesHub: React.FC<BackgroundFilesHubProps> = ({
  lang,
  onOpenWorkspace,
}) => {
  const isAr = lang === "ar";
  const [files, setFiles] = useState<BackgroundFileItem[]>([]);
  const [totalProgress, setTotalProgress] = useState<number>(100);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSpeed, setDownloadSpeed] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsub = backgroundDownloader.onUpdate((fls, prog, downloading, spd) => {
      setFiles([...fls]);
      setTotalProgress(prog);
      setIsDownloading(downloading);
      setDownloadSpeed(spd);
    });

    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDownloadAll = () => {
    backgroundDownloader.startBackgroundDownloadAll();
    showToast(
      isAr
        ? "بدأ تحميل كافة التطبيقات والتعريفات والملفات في الخلفية..."
        : "Started downloading all packages & drivers in background..."
    );
  };

  const handlePreloadInstant = () => {
    backgroundDownloader.preloadAllInstant();
    showToast(
      isAr
        ? "تم تحميل وتجهيز كافة الحزم والملفات في الذاكرة بنسبة 100%!"
        : "All packages and drivers are 100% ready in memory!"
    );
  };

  const handleExportFile = (file: BackgroundFileItem) => {
    backgroundDownloader.exportFileForTechnician(file);
    showToast(
      isAr
        ? `جاري تصدير وحفظ: ${file.nameAr}`
        : `Exporting: ${file.name}`
    );
  };

  const handleDownloadSingle = (fileId: string) => {
    backgroundDownloader.downloadSingleFile(fileId);
  };

  const categories = [
    { id: "all", labelAr: "جميع الملفات والتطبيقات", labelEn: "All Files & Tools" },
    { id: "driver", labelAr: "حزم التعريفات الرسمية (Drivers)", labelEn: "USB Drivers" },
    { id: "da_loader", labelAr: "ملفات DA واللودر (MTK / BROM)", labelEn: "DA & Loaders" },
    { id: "firehose", labelAr: "مبرمج كوالكوم (Firehose ELF)", labelEn: "Qualcomm Firehose" },
    { id: "frp_payload", labelAr: "تطبيقات وتخطي FRP 2025", labelEn: "FRP APKs & Tools" },
    { id: "firmware_utility", labelAr: "ملفات PIT و CSC وسكربتات", labelEn: "PIT & CSC Matrices" },
    { id: "tool", labelAr: "أدوات الروت والنظام (Magisk/Shizuku)", labelEn: "Root & System Tools" },
  ];

  const filteredFiles = files.filter((file) => {
    const matchesCategory =
      selectedCategory === "all" || file.category === selectedCategory;
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.chipsetOrBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const readyCount = files.filter((f) => f.progress === 100).length;
  const totalCount = files.length;
  const totalSizeMb = files.reduce((acc, f) => acc + f.sizeMb, 0).toFixed(1);

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* Top Banner & Background Engine Controller */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
                <FolderDown className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                GD GSM Background Storage & Drivers Engine
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {isAr
                ? "مركز التنزيلات والتعريفات والملفات في الخلفية"
                : "Background Drivers, Loaders & Essential Packages Hub"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {isAr
                ? "تم تجهيز وتوليد جميع تعريفات الهواتف (سامسونج، كوالكوم 9008، ميديا تيك BROM، جوجل ADB)، ملفات الـ DA الرسمية والمعدلة، مبرمجات الفايرهوس ELF، وحزم تخطي FRP 2025 مع جاهزية التحميل الفوري أو التصدير للحاسوب."
                : "All essential smartphone drivers (Samsung, Qualcomm 9008, MTK BROM, ADB), custom DA loaders, Qualcomm Firehose ELF programmers, and FRP 2025 bypass APKs are cached and ready for instant hardware operations."}
            </p>
          </div>

          {/* Action buttons & Live Speed Monitor */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handlePreloadInstant}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? "تجهيز وتحميل فوري للكل (100%)" : "Instant 100% Preload"}</span>
            </button>

            <button
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                isDownloading
                  ? "bg-indigo-700/60 text-indigo-200 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/40"
              }`}
            >
              <ArrowDownToLine className={`w-4 h-4 ${isDownloading ? "animate-bounce" : ""}`} />
              <span>
                {isDownloading
                  ? isAr
                    ? `جاري التحميل في الخلفية (${downloadSpeed} MB/s)...`
                    : `Downloading in Background (${downloadSpeed} MB/s)...`
                  : isAr
                  ? "تحميل الكل في الخلفية"
                  : "Download All in Background"}
              </span>
            </button>
          </div>
        </div>

        {/* Live Progress Bar and Storage Metrics */}
        <div className="mt-6 pt-5 border-t border-indigo-900/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium">
              {isAr ? "الحزم الجاهزة في الذاكرة" : "Ready Packages"}
            </div>
            <div className="text-lg font-black text-emerald-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span>{readyCount}</span>
              <span className="text-xs text-slate-500 font-normal">/ {totalCount}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium">
              {isAr ? "الحجم الإجمالي للملفات" : "Total Size"}
            </div>
            <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">
              {totalSizeMb} <span className="text-xs font-normal">MB</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium">
              {isAr ? "سرعة التحميل بالخلفية" : "Background Speed"}
            </div>
            <div className="text-lg font-black text-indigo-400 font-mono mt-0.5">
              {isDownloading ? `${downloadSpeed} MB/s` : isAr ? "مكتمل (جاهز)" : "Optimal / Ready"}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium">
              {isAr ? "نسبة الجاهزية العامة" : "Sync Status"}
            </div>
            <div className="text-lg font-black text-amber-400 font-mono mt-0.5 flex items-center gap-2">
              <span>{totalProgress}%</span>
              <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification Alert */}
      {notification && (
        <div className="bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-indigo-200 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr
                ? "بحث عن تعريف، لودر، موديل، أو تطبيق..."
                : "Search drivers, loaders, chipsets..."
            }
            className="w-full pl-3 pr-9 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Files & Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => {
          const isReady = file.progress === 100;
          const isFileDownloading = file.status === "downloading" && file.progress < 100;

          return (
            <div
              key={file.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2.5">
                {/* Header: Category Badge & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                    {file.categoryLabelAr}
                  </span>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold font-mono">
                    {isReady ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAr ? "جاهز ومحمل" : "Ready / Cached"}</span>
                      </span>
                    ) : isFileDownloading ? (
                      <span className="text-indigo-600 flex items-center gap-1 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{file.progress}%</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">{isAr ? "في الانتظار" : "Queued"}</span>
                    )}
                  </div>
                </div>

                {/* File Title & Subtitle */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {file.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {file.nameAr}
                  </p>
                </div>

                {/* Chipset / Brand pill */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold">
                    {file.chipsetOrBrand}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono font-semibold">
                    {file.version}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                    {file.fileFormat}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isAr ? file.descriptionAr : file.descriptionEn}
                </p>
              </div>

              {/* Footer Details & Action Buttons */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {/* Progress bar if downloading */}
                {isFileDownloading && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{isAr ? "جاري التنزيل بالخلفية..." : "Downloading chunk..."}</span>
                      <span>{file.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-200"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Checksum & Size info */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>MD5: {file.checksumMd5.substring(0, 10)}...</span>
                  <span className="font-bold text-slate-600">{file.sizeMb} MB</span>
                </div>

                {/* Buttons Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExportFile(file)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    title={isAr ? "حفظ الملف على حاسوبك" : "Export package to your PC"}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isAr ? "حفظ للكمبيوتر" : "Save to PC"}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!isReady) {
                        handleDownloadSingle(file.id);
                      } else if (onOpenWorkspace) {
                        onOpenWorkspace();
                      } else {
                        showToast(
                          isAr
                            ? `تم ربط وتجهيز ملف (${file.name}) في منصة التفليش المباشرة!`
                            : `Loaded (${file.name}) into Flasher engine!`
                        );
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>
                      {!isReady
                        ? isAr
                          ? "تحميل الآن"
                          : "Download"
                        : isAr
                        ? "ربط بالتفليش"
                        : "Load in Flash"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Installation Guide & Troubleshooting Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Usb className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-900">
            {isAr
              ? "دليل تثبيت التعريفات والتوصيل المباشر عبر WebUSB في GD GSM"
              : "WebUSB Direct Hardware Drivers & Setup Guide"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span>{isAr ? "تعريفات سامسونج وأودين" : "Samsung Odin Drivers"}</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {isAr
                ? "يتم تفعيل المنفذ تلقائياً بمجرد إدخال الهاتف في وضع الداونلود (Download Mode: خفض الصوت + رفع الصوت مع توصيل كابل USB)."
                : "Port automatically activates when entering Download Mode (Vol Down + Vol Up while plugging USB)."}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <span>{isAr ? "منفذ كوالكوم EDL 9008" : "Qualcomm 9008 EDL"}</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {isAr
                ? "يتم التعرف على كابل EDL 9008 أو نقطة التيست بوينت (Test Point) لتنفيذ إنعاش المعالج وبروتوكول Sahara مباشرة."
                : "EDL cable or hardware test points connect to Sahara protocol via QDLoader driver."}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
              <span>{isAr ? "منفذ ميديا تيك BROM" : "MediaTek BROM Port"}</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {isAr
                ? "اضغط مع الاستمرار على زري رفع وخفض الصوت أثناء إطفاء الهاتف وتوصيل USB لتخطي حماية Auth SLA/DAA فوراً."
                : "Hold Vol+ & Vol- while plugging USB on powered-off device to trigger BROM mode."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
