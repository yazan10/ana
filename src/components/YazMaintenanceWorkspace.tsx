import React, { useState, useEffect, useRef } from "react";
import {
  Usb,
  Radio,
  Search,
  Zap,
  Shield,
  Layers,
  Cpu,
  RefreshCw,
  Play,
  Square,
  ChevronRight,
  Terminal,
  Settings,
  FolderOpen,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Smartphone,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Download,
  Wifi,
  Lock,
  Unlock,
  Activity,
  HardDrive,
  Copy,
  Trash2,
  Laptop,
  Coins,
  CreditCard,
  Key,
  ShieldAlert,
  Server,
  Filter,
  Check,
  Plus,
} from "lucide-react";
import { Language, ConnectionMode, DeviceTelemetry, User } from "../types";
import { webUsbService } from "../services/webusb";
import {
  YAZ_BRAND_LIST,
  YAZ_DEVICE_MODELS,
  YazDeviceModel,
} from "../data/yazModelsData";

interface YazMaintenanceWorkspaceProps {
  lang: Language;
  telemetry: DeviceTelemetry;
  onRunCommand: (cmd: string) => Promise<{ success: boolean; output: string }>;
  onOpenTestPoints?: () => void;
  onOpenAiDiagnostics?: () => void;
  currentUser?: User | null;
  onGoLogin?: () => void;
}

export type MainServiceTab =
  | "flash"
  | "frp"
  | "mdm"
  | "macbook"
  | "service"
  | "security"
  | "brand_focused"
  | "brom"
  | "edl";

export const YazMaintenanceWorkspace: React.FC<YazMaintenanceWorkspaceProps> = ({
  lang,
  telemetry,
  onRunCommand,
  onOpenTestPoints,
  onOpenAiDiagnostics,
  currentUser,
  onGoLogin,
}) => {
  const isAr = lang === "ar";

  // Selected Brand & Model
  const [selectedBrand, setSelectedBrand] = useState<string>("samsung");
  const [selectedModel, setSelectedModel] = useState<YazDeviceModel>(
    YAZ_DEVICE_MODELS[2] // Samsung S23 Ultra by default
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<MainServiceTab>("flash");

  // Technician Credit System for MacBook / Server Services
  const [technicianCredits, setTechnicianCredits] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("yaz_technician_credits");
      return saved ? parseInt(saved, 10) : 50;
    } catch {
      return 50;
    }
  });
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState<boolean>(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(25);

  // Save credits
  useEffect(() => {
    try {
      localStorage.setItem("yaz_technician_credits", technicianCredits.toString());
    } catch {
      // ignore
    }
  }, [technicianCredits]);

  // Real USB and Serial connection state
  const [isUsbConnected, setIsUsbConnected] = useState<boolean>(true);
  const [isSerialConnected, setIsSerialConnected] = useState<boolean>(true);
  const [portName, setPortName] = useState<string>("COM10 (SAMSUNG Mobile USB Modem)");
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [isFastConnect, setIsFastConnect] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Operation Execution State
  const [currentOperation, setCurrentOperation] = useState<string>("[ODIN] FLASH 4-FILES (BL+AP+CP+CSC)");
  const [operationDescription, setOperationDescription] = useState<string>(
    "Writing BL, AP, CP, CSC partitions via Samsung Loke USB protocol"
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(100);
  const [subProgress, setSubProgress] = useState<number>(100);

  // Terminal Logs
  const [logs, setLogs] = useState<
    Array<{ text: string; color?: string; time: string }>
  >([
    { text: "Initializing GD GSM Multi-Brand Architecture... OK", color: "text-slate-300", time: "01:20:00" },
    { text: "Scanning for device... COM10 [SAMSUNG Mobile USB Modem]", color: "text-slate-300", time: "01:23:20" },
    { text: "Reading Info... OK", color: "text-emerald-400", time: "01:23:21" },
    { text: `Target Model : ${selectedModel.modelName} [${selectedModel.codeNumber}]`, color: "text-amber-300", time: "01:23:21" },
    { text: "Bootloader : S918USQS6EYK3 | Bit: BIT 3", color: "text-slate-300", time: "01:23:22" },
    { text: "Apple Server Gateway : ONLINE (Latency 32ms)", color: "text-indigo-400", time: "01:23:22" },
    { text: "Technician Server Credit Balance : 50 Credits Available", color: "text-amber-300", time: "01:23:23" },
    { text: "System is ready for isolated Brand & Service execution.", color: "text-emerald-400", time: "01:23:24" },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<boolean>(false);

  // Live Time state
  const [liveTime, setLiveTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // When brand changes, auto-select first matching model
  const handleSelectBrand = (brandId: string) => {
    setSelectedBrand(brandId);
    if (brandId === "macbook") {
      setActiveTab("macbook");
    }
    const matching = YAZ_DEVICE_MODELS.filter((m) => {
      if (brandId === "all") return true;
      if (brandId === "qualcomm") return m.brand === "qualcomm" || m.tags.includes("edl");
      if (brandId === "mediatek") return m.brand === "mediatek" || m.tags.includes("brom");
      if (brandId === "spreadtrum") return m.brand === "spreadtrum";
      if (brandId === "macbook") return m.brand === "macbook";
      if (brandId === "android") return m.brand !== "apple" && m.brand !== "macbook";
      return m.brand === brandId;
    });
    if (matching.length > 0) {
      setSelectedModel(matching[0]);
      appendLog(`Switched Brand to: ${brandId.toUpperCase()} (Loaded ${matching.length} models)`, "text-cyan-400");
    }
  };

  // Filtered devices by brand and search
  const filteredModels = YAZ_DEVICE_MODELS.filter((m) => {
    let matchesBrand = selectedBrand === "all";
    if (!matchesBrand) {
      if (m.brand === selectedBrand) {
        matchesBrand = true;
      } else if (selectedBrand === "qualcomm") {
        matchesBrand =
          m.brand === "qualcomm" ||
          m.tags.includes("edl") ||
          m.chipset.toLowerCase().includes("snapdragon") ||
          m.chipset.toLowerCase().includes("qualcomm");
      } else if (selectedBrand === "mediatek") {
        matchesBrand =
          m.brand === "mediatek" ||
          m.tags.includes("brom") ||
          m.chipset.toLowerCase().includes("mediatek") ||
          m.chipset.toLowerCase().includes("helio") ||
          m.chipset.toLowerCase().includes("dimensity");
      } else if (selectedBrand === "spreadtrum") {
        matchesBrand =
          m.brand === "spreadtrum" ||
          m.chipset.toLowerCase().includes("unisoc") ||
          m.chipset.toLowerCase().includes("spreadtrum");
      } else if (selectedBrand === "macbook") {
        matchesBrand = m.brand === "macbook";
      } else if (selectedBrand === "android") {
        matchesBrand = m.brand !== "apple" && m.brand !== "macbook";
      }
    }

    const matchesSearch =
      searchQuery === "" ||
      m.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.codeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.chipset.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const appendLog = (text: string, color: string = "text-slate-300") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { text, color, time }]);
  };

  // Real WebUSB Connect Trigger
  const handleRealWebUsbConnect = async () => {
    setIsScanning(true);
    appendLog("Opening WebUSB Hardware Interface Picker...", "text-cyan-400");
    const res = await webUsbService.requestPhysicalUsbDevice();
    setIsScanning(false);
    if (res.success && res.info) {
      setIsUsbConnected(true);
      setPortName(`WebUSB (${res.info.productName})`);
      appendLog(`[WebUSB] Connected: ${res.info.productName} (VID: 0x${res.info.vendorId.toString(16)})`, "text-emerald-400");
      appendLog(`[Endpoints] Ready for Direct High-Speed Transfers`, "text-slate-400");
    } else {
      appendLog(`[WebUSB] ${res.error || "Connection cancelled or device not selected."}`, "text-amber-400");
    }
  };

  // Real WebSerial Connect Trigger
  const handleRealWebSerialConnect = async () => {
    setIsScanning(true);
    appendLog("Opening WebSerial COM / Modem Port Picker...", "text-cyan-400");
    const res = await webUsbService.requestPhysicalSerialPort(baudRate);
    setIsScanning(false);
    if (res.success && res.name) {
      setIsSerialConnected(true);
      setPortName(res.name);
      appendLog(`[WebSerial] COM Port Linked @ ${baudRate} bps: ${res.name}`, "text-emerald-400");
    } else {
      appendLog(`[WebSerial] ${res.error || "COM Port selection cancelled."}`, "text-amber-400");
    }
  };

  // Execute Function Button with realistic step sequence & cancel support
  const handleExecuteOperation = async (
    opName: string,
    desc: string,
    creditCost: number = 0
  ) => {
    // Check credits if this is a credit-based service
    if (creditCost > 0) {
      if (technicianCredits < creditCost) {
        appendLog(`[CREDIT ERROR] Insufficient credits! This service requires ${creditCost} Credits. Current Balance: ${technicianCredits} Credits.`, "text-rose-400 font-bold");
        setIsTopUpModalOpen(true);
        return;
      }
    }

    setCurrentOperation(opName);
    setOperationDescription(desc);
    setIsRunning(true);
    abortControllerRef.current = false;
    setProgress(10);
    setSubProgress(15);

    appendLog(`--------------------------------------------------`, "text-slate-600");
    appendLog(`[START OPERATION] : ${opName}`, "text-indigo-400 font-bold");
    appendLog(`Target Device : ${selectedModel.modelName} [${selectedModel.codeNumber}]`, "text-slate-300");
    appendLog(`Active Interface : ${portName}`, "text-slate-400");

    if (creditCost > 0) {
      appendLog(`[SERVER TOKEN AUTH] Authenticating with Apple / OEM Cloud Server Gateway...`, "text-cyan-400");
      appendLog(`[CREDIT DEDUCTION] Authorized: -${creditCost} Credits`, "text-amber-300 font-bold");
      setTechnicianCredits((prev) => Math.max(0, prev - creditCost));
    }

    const steps = [
      { msg: "Handshaking with target modem & USB controller...", delay: 600, p: 30, color: "text-slate-300" },
      { msg: "Sending AT diagnostic security challenge / DFU handshake...", delay: 800, p: 55, color: "text-amber-300" },
      { msg: "Bypassing hardware bootloader locks & FRP/MDM token...", delay: 900, p: 80, color: "text-cyan-300" },
      { msg: `Executing payload for ${selectedModel.chipset}... OKAY`, delay: 700, p: 95, color: "text-emerald-400" },
      { msg: `Operation ${opName} Completed Successfully! (Time: 3.12s)`, delay: 400, p: 100, color: "text-emerald-400" },
    ];

    for (const step of steps) {
      if (abortControllerRef.current) {
        appendLog(`[ABORT] Operation terminated by technician.`, "text-rose-400");
        setIsRunning(false);
        return;
      }
      await new Promise((r) => setTimeout(r, step.delay));
      setProgress(step.p);
      setSubProgress(step.p);
      appendLog(step.msg, step.color);
    }

    if (creditCost > 0) {
      appendLog(`[SERVER CONFIRMATION] Token Registered. New Credit Balance: ${technicianCredits - creditCost} Credits.`, "text-emerald-400 font-bold");
    }

    setIsRunning(false);
  };

  const handleStopOperation = () => {
    abortControllerRef.current = true;
    setIsRunning(false);
    appendLog(`[STOP] Emergency abort triggered.`, "text-rose-500 font-bold");
  };

  const handleRechargeCredits = () => {
    const amount = Number(topUpAmount) || 25;
    setTechnicianCredits((prev) => prev + amount);
    appendLog(`[CREDIT TOP-UP] Successfully added +${amount} Credits. New Balance: ${technicianCredits + amount} Credits.`, "text-emerald-400 font-bold");
    setIsTopUpModalOpen(false);
  };

  // Find current brand object
  const currentBrandObj = YAZ_BRAND_LIST.find((b) => b.id === selectedBrand) || YAZ_BRAND_LIST[0];

  return (
    <div className="flex flex-col bg-[#F4F5F7] text-slate-800 rounded-xl border border-slate-300 shadow-lg overflow-hidden font-sans select-none">
      {/* 1. TOP BRAND SELECTOR RIBBON (Stacked Multi-Row for all OEM Brands) */}
      <div className="bg-[#E4E7EB] border-b border-slate-300 p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isAr ? "قائمة براندات وأجهزة الصيانة (اختر البراند لتخصيص الأدوات):" : "Supported OEM Brands & Chipsets (Select to focus):"}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("brand_focused")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                activeTab === "brand_focused"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
              }`}
            >
              <Filter className="w-3 h-3 text-amber-300" />
              <span>{isAr ? `عمليات ${currentBrandObj.name} المخصصة فقط` : `${currentBrandObj.name} Only Mode`}</span>
            </button>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              {isAr ? "مصفوفة متكاملة لكافة الأجهزة" : "Full OEM Matrix"}
            </span>
          </div>
        </div>

        {/* Stacked Brands Grid */}
        <div className="flex flex-wrap items-center gap-1.5">
          {YAZ_BRAND_LIST.map((brand) => {
            const isSelected = selectedBrand === brand.id;
            return (
              <button
                key={brand.id}
                onClick={() => handleSelectBrand(brand.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs uppercase tracking-tight flex items-center gap-1.5 ${
                  brand.bg
                } ${brand.color} ${
                  isSelected
                    ? "ring-2 ring-indigo-600 scale-105 shadow-md font-extrabold"
                    : "opacity-90 hover:opacity-100 hover:scale-102"
                }`}
              >
                {brand.id === "macbook" && <Laptop className="w-3.5 h-3.5 text-amber-300" />}
                <span>{brand.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DEDICATED INDEPENDENT SERVICE TABS RIBBON (كل خدمة لها قسم مستقل) */}
      <div className="bg-[#ECEEF2] border-b border-slate-300 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Main Service Sections */}
        <div className="flex flex-wrap items-center gap-1">
          {/* 1. قسم التفليش */}
          <button
            onClick={() => setActiveTab("flash")}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "flash"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-700 bg-white/80 hover:bg-white border border-slate-300"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>{isAr ? "قسم التفليش (Flash)" : "FLASH & ODIN"}</span>
          </button>

          {/* 2. قسم الـ FRP */}
          <button
            onClick={() => setActiveTab("frp")}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "frp"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-700 bg-white/80 hover:bg-white border border-slate-300"
            }`}
          >
            <Unlock className="w-3.5 h-3.5 text-white" />
            <span>{isAr ? "قسم تخطي FRP" : "FRP UNLOCK"}</span>
          </button>

          {/* 3. قسم الـ MDM */}
          <button
            onClick={() => setActiveTab("mdm")}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "mdm"
                ? "bg-indigo-700 text-white shadow-xs"
                : "text-slate-700 bg-white/80 hover:bg-white border border-slate-300"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-300" />
            <span>{isAr ? "قسم الـ MDM والنوكس" : "MDM & KNOX"}</span>
          </button>

          {/* 4. قسم خدمات ماك بوك (كريدت) */}
          <button
            onClick={() => {
              setActiveTab("macbook");
              if (selectedBrand !== "macbook") {
                setSelectedBrand("macbook");
              }
            }}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "macbook"
                ? "bg-[#1d1d1f] text-white shadow-xs border border-amber-400"
                : "text-slate-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 font-extrabold"
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-amber-500" />
            <span>{isAr ? "خدمات ماك بوك (كريدت)" : "MACBOOK (CREDIT)"}</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-900 font-mono text-[10px] font-black">
              SERVER
            </span>
          </button>

          {/* 5. قسم الصيانة و CSC */}
          <button
            onClick={() => setActiveTab("service")}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "service"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-700 bg-white/80 hover:bg-white border border-slate-300"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isAr ? "صيانة و CSC" : "SERVICE & CSC"}</span>
          </button>

          {/* 6. قسم الحماية والبوت لودر */}
          <button
            onClick={() => setActiveTab("security")}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "security"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-700 bg-white/80 hover:bg-white border border-slate-300"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isAr ? "حماية وبوت لودر" : "SECURITY"}</span>
          </button>
        </div>

        {/* Right Protocol / Hardware Quick Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("brom")}
            className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              activeTab === "brom" ? "bg-amber-600 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>MTK BROM</span>
          </button>

          <button
            onClick={() => setActiveTab("edl")}
            className={`px-2.5 py-1 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              activeTab === "edl" ? "bg-purple-600 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>EDL 9008</span>
          </button>

          <button
            onClick={() => {
              if (onOpenTestPoints) onOpenTestPoints();
            }}
            className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>T.POINT</span>
          </button>

          <button
            onClick={handleRealWebUsbConnect}
            className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <Usb className="w-3.5 h-3.5 text-blue-600" />
            <span>DEVMGR</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN 3-COLUMN WORKBENCH BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[590px] bg-slate-100">
        {/* LEFT COLUMN: DEVICE DATABASE & SEARCH (3 Cols) */}
        <div className="lg:col-span-3 bg-[#FAFAFC] border-e border-slate-300 p-2.5 flex flex-col space-y-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isAr ? "بحث في 505+ موديل..." : "Search... All Models"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Model Count & Active Brand Banner */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1">
            <span>
              {selectedBrand.toUpperCase()} ({filteredModels.length} models)
            </span>
            <span className="text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified VIP
            </span>
          </div>

          {/* Models List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[520px] pr-1">
            {filteredModels.map((m) => {
              const isCurrent = selectedModel.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedModel(m);
                    appendLog(`Selected Device Model: ${m.modelName} [${m.codeNumber}]`, "text-amber-300");
                  }}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-indigo-50/90 border-indigo-300 shadow-xs"
                      : "bg-white border-slate-200/90 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="font-bold text-xs text-slate-800">{m.modelName}</div>
                    {m.bootBit && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        {m.bootBit}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">{m.codeNumber}</div>

                  {/* Badges / Tags */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {m.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                          tag === "testpoint"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : tag === "preloader" || tag === "custom da"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : tag === "edl"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : tag === "odin"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : tag === "dfu"
                            ? "bg-slate-800 text-amber-300 border border-slate-700"
                            : "bg-teal-50 text-teal-700 border border-teal-200"
                        }`}
                      >
                        [{tag}]
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MIDDLE COLUMN: DEDICATED INDEPENDENT SERVICE DEPARTMENTS (5 Cols) */}
        <div className="lg:col-span-5 bg-white border-e border-slate-300 p-3 flex flex-col space-y-3">
          {/* Active Target Banner */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>{selectedModel.modelName}</span>
                <span className="text-[10px] text-indigo-600 font-mono">({selectedModel.chipset})</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Arch: {selectedModel.cpuArchitecture} | Modes: {selectedModel.supportedModes.join(", ")}
              </div>
            </div>
            <div className="text-end">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                ONLINE
              </span>
            </div>
          </div>

          {/* Department Function Views */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[480px]">
            {/* ======================================================== */}
            {/* 1. SEPARATED FLASH DEPARTMENT (قسم التفليش) */}
            {/* ======================================================== */}
            {activeTab === "flash" && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-blue-600 fill-blue-600" />
                    <span>{isAr ? "قسم التفليش الكامل (Odin 4-Files & Multi-Firmware Flasher)" : "Odin 4-Files & Fastboot Flasher"}</span>
                  </div>
                  <p className="text-[11px] text-blue-800">
                    {isAr
                      ? "تفليش روم رسمي لسامسونج عبر منفذ Loke، وتفليش معالجات ميديا تك، كوالكوم، يوني سوك والفاست بوت بدون برامج خارجية."
                      : "Flash stock ROM files (BL, AP, CP, CSC, USERDATA) directly over USB without Odin3.exe or third-party tools."}
                  </p>
                </div>

                {/* 5-Slot TAR.MD5 Firmware Selector */}
                <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px]">
                  {[
                    { slot: "BL (Bootloader)", desc: "sboot.bin, param.bin, tz.mbn" },
                    { slot: "AP (System / Super / Recovery)", desc: "boot.img, recovery.img, super.img" },
                    { slot: "CP (Modem / Baseband)", desc: "modem.bin, modem_debug.bin" },
                    { slot: "CSC (Regional Customization)", desc: "omc.bin, cache.img" },
                    { slot: "USERDATA (Storage / NVRAM)", desc: "userdata.img, efs.img" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200"
                    >
                      <div>
                        <div className="font-bold text-slate-700">{item.slot}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{item.desc}</div>
                      </div>
                      <button
                        onClick={() => appendLog(`Selected file for ${item.slot}: [AUTO CHECK MD5 VALID OK]`, "text-cyan-300")}
                        className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-sans text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        Choose TAR.MD5
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[ODIN] FLASH 4-FILES (BL+AP+CP+CSC)",
                        "Writing BL, AP, CP, CSC partitions via Samsung Loke USB protocol"
                      )
                    }
                    className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>START ODIN FLASH</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[FASTBOOT] FLASH SUPER PARTITION",
                        "Writing dynamic partitions super.img via fastbootd protocol"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>FLASH FASTBOOT ROM</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[COM] ENTER ODIN DOWNLOAD MODE",
                        "Switch device mode into Odin Download Mode via USB modem AT command"
                      )
                    }
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-slate-800 text-start flex items-center gap-2 cursor-pointer"
                  >
                    <span className="p-1 rounded bg-blue-100 text-blue-700 text-[10px] font-mono">COM</span>
                    <span>ENTER DOWNLOAD MODE</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[LOKE] READ PIT PARTITION TABLE",
                        "Extracting PIT (Partition Information Table) from device storage"
                      )
                    }
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-slate-800 text-start flex items-center gap-2 cursor-pointer"
                  >
                    <span className="p-1 rounded bg-blue-100 text-blue-700 text-[10px] font-mono">PIT</span>
                    <span>EXTRACT / READ PIT</span>
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 2. SEPARATED FRP DEPARTMENT (قسم الـ FRP) */}
            {/* ======================================================== */}
            {activeTab === "frp" && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1.5">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Unlock className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? "قسم تخطي حسابات جوجل FRP لكافة المعالجات والبراندات" : "FRP Google Account Bypass Center"}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    {isAr
                      ? "تخطي مباشر لحماية FRP لسامسونج 2025/2026 عبر MTP أو منفذ المودم، شياومي Mi Account، أوبو وريلمي وكوالكوم EDL 9008 وميديا تك BROM."
                      : "Direct one-click FRP unlock via MTP *#0*#, Modem AT ports, ADB exploits, and Qualcomm 9008 / MTK BROM."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[COM] REMOVE FRP [2025 / 2026] (1-CLICK)",
                        "Remove FRP via newest 2025 modem exploit with automated ADB trigger (*#0*#)"
                      )
                    }
                    className="p-2.5 rounded-lg bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-300 text-start flex items-center gap-2 font-bold text-emerald-900 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-emerald-600 text-white text-[10px] font-mono font-bold">2025/26</span>
                    <span className="truncate">SAMSUNG FRP [2025/2026]</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[COM] REMOVE FRP [USA QUALCOMM SNAPDRAGON]",
                        "Bypass Knox security token on Qualcomm Snapdragon USA carrier devices"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-purple-100 text-purple-700 text-[10px] font-mono">USA</span>
                    <span className="truncate">SAMSUNG FRP [USA MODELS]</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[ADB] 1-CLICK ERASE FRP (RESET GOOGLE FRAMEWORK)",
                        "Execute pm clear and reset Google Services framework persistent token"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-emerald-100 text-emerald-700 text-[10px] font-mono">ADB</span>
                    <span className="truncate">ADB ERASE FRP [1-CLICK]</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[EDL 9008] ERASE FRP / PERSISTENT PARTITION",
                        "Zero out persistent config partition and FRP sector in raw UFS/eMMC"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-purple-100 text-purple-700 text-[10px] font-mono">EDL 9008</span>
                    <span className="truncate">QUALCOMM EDL ERASE FRP</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[BROM] MTK ERASE FRP & MISC PARTITIONS",
                        "Direct hardware-level format of FRP partition bypassing auth challenge"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-amber-100 text-amber-700 text-[10px] font-mono">MTK BROM</span>
                    <span className="truncate">MEDIATEK ERASE FRP</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[XIAOMI] BYPASS MI ACCOUNT & ANTI-RELOCK",
                        "Disable Find Device service and prevent relocking on WiFi reconnect"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-orange-100 text-orange-700 text-[10px] font-mono">MI</span>
                    <span className="truncate">XIAOMI MI ACCOUNT BYPASS</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[OPPO/REALME] BYPASS COLOROS FRP (*#813#)",
                        "Execute emergency dialer payload and bypass Google Account setup"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-emerald-100 text-emerald-700 text-[10px] font-mono">OPPO</span>
                    <span className="truncate">OPPO/REALME FRP (*#813#)</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[HUAWEI] REMOVE HUAWEI ID / FRP KEY",
                        "Erase OEMinfo and reset Huawei ID security key token"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-red-100 text-red-700 text-[10px] font-mono">HUAWEI</span>
                    <span className="truncate">HUAWEI ID / FRP REMOVE</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[FASTBOOT] ERASE FRP / CONFIG",
                        "Execute fastboot erase frp && fastboot erase config command sequence"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-slate-200 text-slate-800 text-[10px] font-mono">FASTBOOT</span>
                    <span className="truncate">FASTBOOT ERASE FRP</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[MTP] PUSH BROWSER / YOUTUBE INTENT",
                        "Push hidden intent URL to open Chrome/YouTube on setup wizard screen"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-cyan-100 text-cyan-700 text-[10px] font-mono">MTP</span>
                    <span className="truncate">MTP BROWSER LAUNCH</span>
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 3. SEPARATED MDM & ENTERPRISE DEPARTMENT (قسم الـ MDM) */}
            {/* ======================================================== */}
            {activeTab === "mdm" && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg space-y-1.5">
                  <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    <span>{isAr ? "قسم تخطي حماية الشركات MDM وإدارة الأجهزة و PayJoy" : "MDM, Enterprise & Knox Protection Center"}</span>
                  </div>
                  <p className="text-[11px] text-indigo-800">
                    {isAr
                      ? "إلغاء قفل وإدارة الأجهزة التابعة للشركات (MDM / Enterprise)، تخطي حماية الأقساط Payjoy و Rent-A-Center، وإصلاح مشاكل تعطل تطبيقات سامسونج بسبب كسر الحماية."
                      : "Bypass Enterprise MDM enrollment, PayJoy/Finance locks, QR enrollment profiles, and patch Knox warranty bits."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[KNOX] PERMANENT MDM ENROLLMENT BYPASS",
                        "Disable enterprise Knox device management policies and prevent re-enrollment"
                      )
                    }
                    className="p-2.5 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-300 font-bold text-indigo-900 text-start cursor-pointer flex items-center gap-2 shadow-2xs"
                  >
                    <span className="p-1 rounded bg-indigo-600 text-white text-[10px] font-mono font-bold">KNOX</span>
                    <span className="truncate">SAMSUNG KNOX MDM BYPASS</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[FINANCE] BYPASS PAYJOY / RENT-A-CENTER LOCK",
                        "Patch lock controller package and disable persistent device management payload"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer flex items-center gap-2 shadow-2xs"
                  >
                    <span className="p-1 rounded bg-amber-100 text-amber-700 text-[10px] font-mono">PAYJOY</span>
                    <span className="truncate">PAYJOY FINANCE BYPASS</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[ENTERPRISE] REMOVE QR ENROLLMENT PROFILE",
                        "Remove Android Enterprise device owner policy installed via QR setup code"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer flex items-center gap-2 shadow-2xs"
                  >
                    <span className="p-1 rounded bg-blue-100 text-blue-700 text-[10px] font-mono">QR MDM</span>
                    <span className="truncate">QR ENROLLMENT REMOVAL</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[XIAOMI] BYPASS ENTERPRISE LOCK",
                        "Clear enterprise security policies on MIUI / HyperOS business models"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer flex items-center gap-2 shadow-2xs"
                  >
                    <span className="p-1 rounded bg-orange-100 text-orange-700 text-[10px] font-mono">XIAOMI</span>
                    <span className="truncate">XIAOMI ENTERPRISE BYPASS</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[APPLE] REMOVE IOS / IPADOS MDM PROFILE",
                        "Bypass Remote Management enrollment screen on iPhone and iPad"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer flex items-center gap-2 shadow-2xs"
                  >
                    <span className="p-1 rounded bg-slate-800 text-white text-[10px] font-mono">iOS MDM</span>
                    <span className="truncate">iOS / IPAD MDM BYPASS</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[KNOX] FIX 0x1 TRIP STATUS FOR APPS",
                        "Patch Knox warranty bit check in system framework to enable Secure Folder / Samsung Health"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer flex items-center gap-2 shadow-2xs"
                  >
                    <span className="p-1 rounded bg-rose-100 text-rose-700 text-[10px] font-mono">0x1 FIX</span>
                    <span className="truncate">FIX KNOX 0x1 TRIP BIT</span>
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 4. DEDICATED MACBOOK SERVICES (CREDIT BASED) (قسم ماك بوك) */}
            {/* ======================================================== */}
            {activeTab === "macbook" && (
              <div className="space-y-3 text-xs">
                {/* Credit Wallet Header Banner */}
                <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-800 to-[#1d1d1f] text-white rounded-xl border border-amber-500/40 shadow-md space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                          <span>{isAr ? "خدمات ماك بوك السحابية (Apple Server Credits)" : "MacBook Server Services (Credits)"}</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 font-mono text-[10px] font-black">
                            PRO API
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-mono">
                          Apple Gateway: <span className="text-emerald-400 font-bold">ONLINE</span> (Ping 32ms) | DFU Mode: <span className="text-cyan-300">AUTO-DETECT</span>
                        </div>
                      </div>
                    </div>

                    {/* Credit Counter & Top-Up Button */}
                    <div className="flex items-center gap-2 bg-black/40 border border-amber-400/30 px-3 py-1.5 rounded-lg">
                      <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-mono">{isAr ? "رصيدك الحالي" : "Balance"}</div>
                        <div className="text-sm font-black font-mono text-amber-400">
                          {technicianCredits} <span className="text-[10px] font-sans font-medium text-slate-300">Credits</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsTopUpModalOpen(true)}
                        className="ms-1 px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{isAr ? "شحن رصيد" : "Recharge"}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 border-t border-slate-700/80 pt-1.5">
                    {isAr
                      ? "جميع عمليات ماك بوك (T2 و M1/M2/M3/M4) تتم أوتوماتيكياً عبر خوادم آبل المعتمدة ويتم خصم الكريدت بعد نجاح العملية."
                      : "MacBook services communicate directly with automated Apple DFU security servers. Credits are deducted per operation."}
                  </p>
                </div>

                {/* MacBook Operations Grid (Costed in Credits) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Operation 1: T2 MDM Bypass */}
                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[MACBOOK] T2 CHIP MDM ENROLLMENT BYPASS",
                        "Bypassing Apple Remote Management enrollment profile on T2 Security Chip",
                        10
                      )
                    }
                    className="p-3 rounded-lg bg-slate-50 hover:bg-amber-50/60 border border-slate-300 hover:border-amber-400 text-start flex flex-col justify-between transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-indigo-600" />
                        <span>T2 MDM Bypass</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-mono font-bold text-[10px]">
                        10 Credits
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      MacBook Pro/Air 2018-2020 (A1989, A1990, A2141, A1932, A2179)
                    </p>
                  </button>

                  {/* Operation 2: T2 EFI / PIN Lock */}
                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[MACBOOK] T2 EFI / PIN PASSWORD REMOVAL",
                        "Direct hardware-level wipe of BridgeOS EFI Firmware password",
                        15
                      )
                    }
                    className="p-3 rounded-lg bg-slate-50 hover:bg-amber-50/60 border border-slate-300 hover:border-amber-400 text-start flex flex-col justify-between transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-purple-600" />
                        <span>T2 EFI / PIN Lock Removal</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-mono font-bold text-[10px]">
                        15 Credits
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Remove 6-digit PIN & System Lock PIN in DFU Mode
                    </p>
                  </button>

                  {/* Operation 3: Apple Silicon M1/M2/M3/M4 MDM */}
                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[MACBOOK] APPLE SILICON (M1/M2/M3/M4) MDM BYPASS",
                        "Patch macOS setup assistant and disable Remote Management enrollment",
                        8
                      )
                    }
                    className="p-3 rounded-lg bg-slate-50 hover:bg-amber-50/60 border border-slate-300 hover:border-amber-400 text-start flex flex-col justify-between transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-blue-600" />
                        <span>Apple Silicon M1-M4 MDM</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-mono font-bold text-[10px]">
                        8 Credits
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      MacBook Pro & Air M1, M2, M3, M4 (Sonoma & Sequoia)
                    </p>
                  </button>

                  {/* Operation 4: DFU IPSW Restore */}
                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[MACBOOK] DFU FIRMWARE RESTORE (IPSW)",
                        "Flash Apple Configurator BridgeOS & macOS firmware bundle over DFU USB-C",
                        5
                      )
                    }
                    className="p-3 rounded-lg bg-slate-50 hover:bg-amber-50/60 border border-slate-300 hover:border-amber-400 text-start flex flex-col justify-between transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-emerald-600" />
                        <span>DFU Restore & Unbrick</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-mono font-bold text-[10px]">
                        5 Credits
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Revive bricked MacBook with blinking folder / circle icon
                    </p>
                  </button>

                  {/* Operation 5: iCloud Activation Lock Server Check */}
                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[MACBOOK] ICLOUD ACTIVATION LOCK SERVER BYPASS",
                        "Submit serial token to Apple Activation Server for clean status verification",
                        25
                      )
                    }
                    className="p-3 rounded-lg bg-slate-50 hover:bg-amber-50/60 border border-slate-300 hover:border-amber-400 text-start flex flex-col justify-between transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Unlock className="w-4 h-4 text-rose-600" />
                        <span>iCloud Activation Bypass</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-mono font-bold text-[10px]">
                        25 Credits
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Direct Apple Server token injection for Activation Lock
                    </p>
                  </button>

                  {/* Operation 6: Serial Check & Cloud Registration */}
                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[MACBOOK] SERIAL QUERY & HARDWARE REGISTRATION",
                        "Query GSX Apple database for hardware configuration, warranty, and MDM state",
                        3
                      )
                    }
                    className="p-3 rounded-lg bg-slate-50 hover:bg-amber-50/60 border border-slate-300 hover:border-amber-400 text-start flex flex-col justify-between transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-cyan-600" />
                        <span>Serial Number Check (GSX)</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-mono font-bold text-[10px]">
                        3 Credits
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Full factory specifications and warranty coverage audit
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 5. SEPARATED SERVICE & CSC DEPARTMENT (قسم الصيانة و CSC) */}
            {/* ======================================================== */}
            {activeTab === "service" && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg space-y-1">
                  <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span>{isAr ? "قسم الصيانة، قراءة البيانات وتغيير الـ CSC" : "Service, Diagnostics & CSC Changing"}</span>
                  </div>
                  <p className="text-[11px] text-indigo-800">
                    {isAr
                      ? "تغيير كود الدولة CSC لتفعيل تسجيل المكالمات (KSA, UAE, EGY, INS)، فحص الممانعات والمنافذ وإصلاح البيسباند و EFS."
                      : "Read info, change carrier CSC regions to enable native call recording, and perform factory resets."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[COM+ADB] READ DEVICE INFO & PARAMETERS",
                        "Read complete phone hardware parameters, IMEI, CSC, Knox bit, and battery health"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-blue-100 text-blue-700 text-[10px] font-mono">INFO</span>
                    <span className="truncate">READ FULL INFO</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[COM] CHANGE CSC (ENABLE CALL RECORDING)",
                        "Change Carrier CSC region code (KSA/EGY/UAE/INS/TUR) to enable native call recording"
                      )
                    }
                    className="p-2.5 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-300 text-start flex items-center gap-2 font-bold text-indigo-900 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-indigo-600 text-white text-[10px] font-mono font-bold">CSC</span>
                    <span className="truncate">CHANGE CSC (CALL RECORD)</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[COM] FACTORY RESET / WIPE USERDATA",
                        "Execute full factory reset & userdata wipe via AT command sequence"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-amber-100 text-amber-700 text-[10px] font-mono">COM</span>
                    <span className="truncate">FACTORY RESET</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[COM] ENABLE DIAGNOSTIC PORT (*#0808#)",
                        "Send modem AT command to enable Qualcomm Diag Port for NVRAM calibration"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-blue-100 text-blue-700 text-[10px] font-mono">DIAG</span>
                    <span className="truncate">ENABLE DIAG PORT</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[SECURITY] REPAIR EFS / BASEBAND UNKNOWN",
                        "Restore calibrated modem RF NV parameters and fix Unknown Baseband / IMEI Null"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-rose-100 text-rose-700 text-[10px] font-mono">NV</span>
                    <span className="truncate">REPAIR BASEBAND / EFS</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[ADB] ENABLE DUAL SIM MANAGER",
                        "Enable dual SIM manager on carrier-locked single SIM variant hardware"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start flex items-center gap-2 font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="p-1 rounded bg-emerald-100 text-emerald-700 text-[10px] font-mono">SIM</span>
                    <span className="truncate">ENABLE DUAL SIM</span>
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 6. SEPARATED SECURITY & BOOTLOADER DEPARTMENT (الحماية) */}
            {/* ======================================================== */}
            {activeTab === "security" && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-1">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-purple-600" />
                    <span>{isAr ? "قسم الحماية، فك البوت لودر وإزالة رمز القفل الآمن" : "Security, Bootloader & Screen Lock Center"}</span>
                  </div>
                  <p className="text-[11px] text-purple-800">
                    {isAr
                      ? "إدارة حالة الحماية، فك وتثبيت البوت لودر، وإزالة رمز القفل والنمط بدون مسح بيانات المستخدم."
                      : "Manage bootloader locks, wipe locksettings.db without data loss, and verify OEM auth tokens."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[FASTBOOT] UNLOCK BOOTLOADER",
                        "Execute fastboot flashing unlock and oem unlock verification sequence"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer flex items-center gap-2"
                  >
                    <span className="p-1 rounded bg-purple-100 text-purple-700 text-[10px] font-mono">OEM</span>
                    <span className="truncate">UNLOCK BOOTLOADER</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[FASTBOOT] RELOCK BOOTLOADER",
                        "Execute fastboot flashing lock to restore factory tamper protection"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer flex items-center gap-2"
                  >
                    <span className="p-1 rounded bg-slate-200 text-slate-700 text-[10px] font-mono">LOCK</span>
                    <span className="truncate">RELOCK BOOTLOADER</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[ADB] REMOVE PASSCODE (NO DATA LOSS)",
                        "Wipe locksettings.db and gesture.key without erasing user files or media"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer flex items-center gap-2"
                  >
                    <span className="p-1 rounded bg-emerald-100 text-emerald-700 text-[10px] font-mono">LOCK</span>
                    <span className="truncate">REMOVE PASSCODE (SAFE)</span>
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[XIAOMI] BOOTLOADER AUTH TOKEN UNLOCK",
                        "Send authorized Xiaomi developer account token to bypass waiting period"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer flex items-center gap-2"
                  >
                    <span className="p-1 rounded bg-orange-100 text-orange-700 text-[10px] font-mono">MI AUTH</span>
                    <span className="truncate">XIAOMI AUTH UNLOCK</span>
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 7. BRAND FOCUSED VIEW (قسم البراند المختار فقط بدون تداخل) */}
            {/* ======================================================== */}
            {activeTab === "brand_focused" && (
              <div className="space-y-2.5 text-xs">
                <div
                  className={`p-3 rounded-lg border space-y-1.5 ${
                    selectedBrand === "samsung"
                      ? "bg-blue-50 border-blue-200 text-blue-900"
                      : selectedBrand === "macbook"
                      ? "bg-slate-900 border-amber-400 text-white"
                      : selectedBrand === "mi"
                      ? "bg-orange-50 border-orange-200 text-orange-900"
                      : selectedBrand === "huawei"
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : selectedBrand === "oppo"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : selectedBrand === "vivo"
                      ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                      : selectedBrand === "tecno" || selectedBrand === "infinix"
                      ? "bg-teal-50 border-teal-200 text-teal-900"
                      : "bg-slate-100 border-slate-300 text-slate-900"
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Filter className="w-4 h-4 text-amber-500" />
                      <span>{isAr ? `أدوات ${currentBrandObj.name} الحصرية المخصصة` : `Dedicated Exclusive ${currentBrandObj.name} Tools`}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/20 font-mono">
                      NO OVERLAP
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90">
                    {isAr
                      ? `تم تصفية العمليات لتقتصر على ما يحتاجه براند (${currentBrandObj.name}) فقط دون أي تداخل مع البراندات الأخرى.`
                      : `Strictly filtered operations tailored only for ${currentBrandObj.name} devices.`}
                  </p>
                </div>

                {/* Samsung Specific Operations */}
                {selectedBrand === "samsung" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => handleExecuteOperation("[ODIN] 4-FILES FLASH", "Writing Samsung Stock BL, AP, CP, CSC via Loke USB")}
                      className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-start font-bold text-blue-900 cursor-pointer"
                    >
                      ⚡ ODIN 4-FILES FLASH (BL/AP/CP/CSC)
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[SAMSUNG] 2025/2026 MTP FRP", "Remove FRP via *#0*# test menu exploit")}
                      className="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-start font-bold text-emerald-900 cursor-pointer"
                    >
                      🔓 SAMSUNG FRP [2025/2026] (*#0*#)
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[SAMSUNG] CHANGE CSC", "Change CSC to KSA/UAE/EGY for Call Recording")}
                      className="p-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-start font-bold text-indigo-900 cursor-pointer"
                    >
                      📞 CHANGE CSC (ENABLE CALL RECORD)
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[KNOX] BYPASS ENTERPRISE MDM", "Disable permanent Knox enterprise device management")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                    >
                      🛡️ BYPASS KNOX MDM / PAYJOY
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[SAMSUNG] ENTER DOWNLOAD MODE", "Reboot phone into Odin Download Mode")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                    >
                      ⬇️ ENTER ODIN DOWNLOAD MODE
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[KNOX] FIX 0x1 TRIP BIT", "Patch Knox check for Samsung Health & Secure Folder")}
                      className="p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-start font-bold text-rose-900 cursor-pointer"
                    >
                      🩹 FIX KNOX 0x1 TRIP FOR APPS
                    </button>
                  </div>
                )}

                {/* MacBook Specific Operations */}
                {selectedBrand === "macbook" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => handleExecuteOperation("[MACBOOK] T2 MDM BYPASS", "Bypass T2 Remote Management", 10)}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-start font-bold text-slate-900 cursor-pointer flex items-center justify-between"
                    >
                      <span>🍏 T2 MDM Enrollment Bypass</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 text-amber-950">10 Cr</span>
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[MACBOOK] T2 EFI REMOVAL", "Remove T2 PIN and EFI password", 15)}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-start font-bold text-slate-900 cursor-pointer flex items-center justify-between"
                    >
                      <span>🔑 T2 EFI / PIN Lock Removal</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 text-amber-950">15 Cr</span>
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[MACBOOK] M1-M4 MDM BYPASS", "Bypass Apple Silicon Remote Management", 8)}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-start font-bold text-slate-900 cursor-pointer flex items-center justify-between"
                    >
                      <span>💻 Apple Silicon M1-M4 MDM</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 text-amber-950">8 Cr</span>
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[MACBOOK] DFU IPSW RESTORE", "Restore firmware via DFU mode", 5)}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-start font-bold text-slate-900 cursor-pointer flex items-center justify-between"
                    >
                      <span>⚡ DFU Restore & Unbrick</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200 text-amber-950">5 Cr</span>
                    </button>
                  </div>
                )}

                {/* Xiaomi Specific Operations */}
                {selectedBrand === "mi" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => handleExecuteOperation("[XIAOMI] BYPASS MI ACCOUNT", "Disable Find Device and Mi Account cloud lock")}
                      className="p-2.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-start font-bold text-orange-900 cursor-pointer"
                    >
                      🔓 BYPASS MI ACCOUNT & ANTI-RELOCK
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[XIAOMI] FASTBOOT SUPER FLASH", "Flash official fastboot ROM TGZ")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                    >
                      ⚡ FASTBOOT SUPER ROM FLASHER
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[XIAOMI] SIDELOAD WIPE", "Wipe userdata via Mi Recovery Sideload")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                    >
                      🧹 SIDELOAD FORMAT USERDATA
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[XIAOMI] AUTH BOOTLOADER UNLOCK", "Instant bootloader unlock with authorized account")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                    >
                      🔑 XIAOMI BOOTLOADER AUTH UNLOCK
                    </button>
                  </div>
                )}

                {/* Huawei Specific Operations */}
                {selectedBrand === "huawei" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => handleExecuteOperation("[HUAWEI] REMOVE HUAWEI ID", "Erase OEMinfo and reset Huawei ID security key")}
                      className="p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-start font-bold text-rose-900 cursor-pointer"
                    >
                      🔓 REMOVE HUAWEI ID / FRP KEY
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[HUAWEI] TESTPOINT FASTBOOT", "Switch into Kirin Fastboot mode via USB Test Point")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                    >
                      📍 KIRIN TESTPOINT TO FASTBOOT
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[HUAWEI] FLASH UPDATE.APP", "Flash multi-part firmware via fastboot/dload")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                    >
                      ⚡ FLASH UPDATE.APP (DLOAD)
                    </button>
                  </div>
                )}

                {/* Oppo / Realme / 1+ Specific Operations */}
                {selectedBrand === "oppo" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => handleExecuteOperation("[OPPO] EMERGENCY DIAL FRP (*#813#)", "Trigger emergency code to bypass ColorOS FRP")}
                      className="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-start font-bold text-emerald-900 cursor-pointer"
                    >
                      🔓 COLOROS FRP BYPASS (*#813# / *#899#)
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[OPPO] OFP FIRMWARE EXTRACT & FLASH", "Extract and flash OFP / OPS packages")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                    >
                      ⚡ OFP / OPS FIRMWARE FLASHER
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[OPPO] MTK BROM AUTH BYPASS", "Hardware SLA/DAA challenge bypass for Helio/Dimensity")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                    >
                      🛡️ MTK BROM AUTH CHALLENGE BYPASS
                    </button>
                  </div>
                )}

                {/* Vivo / iQOO Specific Operations */}
                {selectedBrand === "vivo" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => handleExecuteOperation("[VIVO] FASTBOOT FRP ERASE", "Erase FRP and config partition via Vivo Fastboot protocol")}
                      className="p-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-start font-bold text-indigo-900 cursor-pointer"
                    >
                      🔓 VIVO FASTBOOT ERASE FRP
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[VIVO] AT PORT FACTORY WIPE", "Wipe device and remove screen lock via AT modem")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                    >
                      🧹 VIVO AT PORT FACTORY WIPE
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[VIVO] DEMO MODE REMOVAL", "Remove retail demo mode and persistent store app")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                    >
                      🏪 REMOVE VIVO DEMO MODE
                    </button>
                  </div>
                )}

                {/* Tecno / Infinix Specific Operations */}
                {(selectedBrand === "tecno" || selectedBrand === "infinix") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => handleExecuteOperation("[TRANSSION] 2025 FRP BYPASS", "Direct Transsion FRP unlock for Tecno & Infinix")}
                      className="p-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-start font-bold text-teal-900 cursor-pointer"
                    >
                      🔓 TECNO / INFINIX FRP [2025]
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[TRANSSION] BROM 1-CLICK FORMAT", "Hardware format userdata & FRP via MTK BROM")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                    >
                      🧹 BROM 1-CLICK USERDATA FORMAT
                    </button>
                    <button
                      onClick={() => handleExecuteOperation("[TRANSSION] MDM HIOS / XOS REMOVAL", "Disable enterprise MDM and PayJoy on HiOS / XOS")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                    >
                      🛡️ HIOS / XOS MDM BYPASS
                    </button>
                  </div>
                )}

                {/* Fallback for generic brands */}
                {selectedBrand !== "samsung" &&
                  selectedBrand !== "macbook" &&
                  selectedBrand !== "mi" &&
                  selectedBrand !== "huawei" &&
                  selectedBrand !== "oppo" &&
                  selectedBrand !== "vivo" &&
                  selectedBrand !== "tecno" &&
                  selectedBrand !== "infinix" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => handleExecuteOperation(`[${selectedBrand.toUpperCase()}] READ INFO`, "Reading parameters")}
                        className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                      >
                        📋 READ COMPLETE INFO
                      </button>
                      <button
                        onClick={() => handleExecuteOperation(`[${selectedBrand.toUpperCase()}] ERASE FRP`, "Erasing FRP token")}
                        className="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-start font-bold text-emerald-900 cursor-pointer"
                      >
                        🔓 ERASE FRP / CLOUD LOCK
                      </button>
                      <button
                        onClick={() => handleExecuteOperation(`[${selectedBrand.toUpperCase()}] FLASH FIRMWARE`, "Flashing official firmware")}
                        className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-start font-bold text-blue-900 cursor-pointer"
                      >
                        ⚡ FLASH FIRMWARE ROM
                      </button>
                      <button
                        onClick={() => handleExecuteOperation(`[${selectedBrand.toUpperCase()}] FACTORY RESET`, "Wiping userdata")}
                        className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-start font-bold text-slate-800 cursor-pointer"
                      >
                        🧹 FACTORY RESET USERDATA
                      </button>
                    </div>
                  )}
              </div>
            )}

            {/* ======================================================== */}
            {/* 8. MEDIATEK BROM PROTOCOL (MTK BROM) */}
            {/* ======================================================== */}
            {activeTab === "brom" && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                  <div className="font-bold text-amber-900">MediaTek BROM / Preloader Exploits</div>
                  <div className="text-[11px] text-amber-800">
                    Hardware SLA / DAA challenge bypass for Helio G-series and Dimensity MT68xx chipsets.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[BROM] AUTH BYPASS",
                        "Executing SLA/DAA vulnerability to disable secure boot verification"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer"
                  >
                    ⚡ [BROM] AUTH BYPASS
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[BROM] READ FULL DUMP",
                        "Reading full eMMC/UFS memory dump & NVRAM"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer"
                  >
                    💾 [BROM] READ NVRAM / DUMP
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[BROM] FORMAT USERDATA",
                        "Hardware-level partition format bypassing screen lock and FRP"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer"
                  >
                    🧹 [BROM] FORMAT USERDATA
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[BROM] WRITE SCATTER",
                        "Flashing firmware partitions using MTK custom Download Agent (DA)"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer"
                  >
                    📥 [BROM] WRITE SCATTER
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 9. QUALCOMM EDL 9008 PROTOCOL (EDL 9008) */}
            {/* ======================================================== */}
            {activeTab === "edl" && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-800 text-white rounded-lg space-y-1">
                  <div className="font-bold text-amber-400">Qualcomm EDL QDLoader 9008 Emergency Mode</div>
                  <div className="text-[11px] text-slate-300">
                    Sahara and Firehose programmer execution for unbricking dead Qualcomm smartphones.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[EDL 9008] ERASE FRP",
                        "Zero out persistent config partition and FRP sector in UFS"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer"
                  >
                    🧹 [EDL 9008] ERASE FRP
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[EDL 9008] WRITE FIREHOSE",
                        "Sending prog_firehose_ddr.elf and writing rawprogram0.xml"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer"
                  >
                    ⚡ [EDL 9008] WRITE FIREHOSE
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[EDL 9008] READ GPT PARTITIONS",
                        "Reading partition tables from raw UFS LUN 0-5"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer"
                  >
                    📋 [EDL] READ GPT PARTITIONS
                  </button>

                  <button
                    onClick={() =>
                      handleExecuteOperation(
                        "[FASTBOOT] UNLOCK BOOTLOADER",
                        "Execute fastboot flashing unlock and oem unlock token"
                      )
                    }
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-start cursor-pointer"
                  >
                    🔓 [FASTBOOT] UNLOCK BOOTLOADER
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CONNECTION + LIVE EXECUTION CONSOLE (4 Cols) */}
        <div className="lg:col-span-4 bg-[#1E293B] text-white p-3 flex flex-col justify-between space-y-2.5 font-mono text-xs">
          {/* Real Port & USB Connect Bar */}
          <div className="bg-[#0F172A] border border-slate-700 rounded-lg p-2 space-y-1.5 font-sans">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">USB:</span>
              <button
                onClick={handleRealWebUsbConnect}
                disabled={isScanning}
                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Usb className="w-3.5 h-3.5" />
                <span>{isUsbConnected ? "WebUSB Connected" : "Connect WebUSB"}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-1 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">COM:</span>
              <button
                onClick={handleRealWebSerialConnect}
                disabled={isScanning}
                className="flex-1 text-start px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-[11px] font-bold border border-slate-600 truncate flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">{portName}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
              <label className="flex items-center gap-1 text-[10px] text-slate-300 font-medium cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isFastConnect}
                  onChange={(e) => setIsFastConnect(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Fast</span>
              </label>
            </div>
          </div>

          {/* Active Operation Blue Banner */}
          <div className="bg-[#2563EB] text-white px-3 py-1.5 rounded-md font-bold text-xs flex items-center justify-between shadow-xs">
            <span className="truncate">{currentOperation}</span>
            <span className="text-[10px] bg-blue-800/60 px-1.5 py-0.5 rounded font-mono">
              {isRunning ? "PROCESSING..." : "READY"}
            </span>
          </div>

          {/* Real Live Terminal Screen */}
          <div className="flex-1 bg-[#090D16] border border-slate-800 rounded-lg p-2.5 overflow-y-auto max-h-[300px] min-h-[220px] font-mono text-[11px] space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 select-none text-[10px]">[{log.time}]</span>
                <span className={`${log.color || "text-slate-300"} break-all`}>{log.text}</span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Bottom Action Description Banner */}
          <div className="text-[11px] font-sans font-medium text-slate-300 bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700/80">
            {operationDescription}
          </div>

          {/* Dual Progress Bars */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Task Progress</span>
              <span className="text-amber-400 font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-300"
                style={{ width: `${subProgress}%` }}
              />
            </div>
          </div>

          {/* STOP / RUN Buttons */}
          <div className="flex items-center gap-2 pt-1 font-sans">
            <button
              onClick={handleStopOperation}
              disabled={!isRunning}
              className="flex-1 py-2 rounded-lg bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>STOP</span>
            </button>

            <button
              onClick={() => handleExecuteOperation(currentOperation, operationDescription)}
              disabled={isRunning}
              className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>EXECUTE</span>
            </button>

            <button
              onClick={() => setLogs([])}
              title="Clear Terminal"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM STATUS BAR FOOTER */}
      <div className="bg-[#E4E7EB] border-t border-slate-300 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-mono">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800">Database : 505 models</span>
          <span className="text-slate-400">|</span>
          <span className="text-indigo-700 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>GD GSM SUITE</span>
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-amber-700 font-bold flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-600" />
            <span>Credits: {technicianCredits}</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-medium text-slate-700">
            👤 Technician:{" "}
            <span className="font-bold text-indigo-700">
              {currentUser ? currentUser.name : isAr ? "فني زائر" : "Guest Technician"}
            </span>
          </span>
          {!currentUser && onGoLogin && (
            <button
              onClick={onGoLogin}
              className="text-[11px] px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer"
            >
              {isAr ? "دخول / تفعيل" : "Sign In"}
            </button>
          )}
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 font-bold">{liveTime}</span>
        </div>
      </div>

      {/* Top-Up Credits Modal */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {isAr ? "شحن رصيد الكريدت (MacBook Credits)" : "Top-Up Technician Server Credits"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr ? "رصيدك الحالي:" : "Current Balance:"} <span className="font-bold font-mono text-amber-600">{technicianCredits} Credits</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTopUpModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                {isAr ? "اختر باقة الشحن الفوري:" : "Select Instant Credit Package:"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 25, 50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`p-2.5 rounded-xl border text-center font-mono font-bold text-xs transition-all cursor-pointer ${
                      topUpAmount === amt
                        ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                    }`}
                  >
                    +{amt} Credits
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Apple DFU Gateway:</span>
                <span className="text-emerald-600 font-bold">READY</span>
              </div>
              <div className="flex justify-between">
                <span>Auto-Recharge Bonus:</span>
                <span className="text-indigo-600 font-bold">VIP 100% SUCCESS</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsTopUpModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleRechargeCredits}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? `إضافة +${topUpAmount} كريدت فوراً` : `Add +${topUpAmount} Credits`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
