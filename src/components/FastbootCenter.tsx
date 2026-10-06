import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Layers,
  Terminal,
  UploadCloud,
  Trash2,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCode,
} from "lucide-react";
import { Language } from "../types";

interface FastbootCenterProps {
  fastbootVars: { [key: string]: string };
  lang: Language;
  onRunCommand: (cmd: string) => Promise<{ success: boolean; output: string }>;
}

export const FastbootCenter: React.FC<FastbootCenterProps> = ({
  fastbootVars,
  lang,
  onRunCommand,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartition, setSelectedPartition] = useState("boot");
  const [customPartition, setCustomPartition] = useState("");
  const [activeSlot, setActiveSlot] = useState(fastbootVars["current-slot"] || "a");
  const [isUnlocked, setIsUnlocked] = useState(fastbootVars["unlocked"] === "yes");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "Fastboot engine ready.",
    "Target connected in bootloader mode.",
  ]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const isAr = lang === "ar";

  const addLog = (text: string) => {
    setConsoleLogs((prev) => [...prev.slice(-40), `[${new Date().toLocaleTimeString()}] ${text}`]);
  };

  const handleExecute = async (cmd: string, actionName: string) => {
    setLoadingAction(actionName);
    addLog(`> ${cmd}`);
    try {
      const res = await onRunCommand(cmd);
      addLog(res.output);
      if (cmd.includes("unlock")) {
        setIsUnlocked(true);
      }
    } catch (e: any) {
      addLog(`ERR: ${e.message || "Execution failed"}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const filteredVars = Object.entries(fastbootVars).filter(
    ([k, v]) =>
      k.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(v || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const standardPartitions = [
    "boot",
    "init_boot",
    "vendor_boot",
    "recovery",
    "vbmeta",
    "dtbo",
    "super",
    "userdata",
    "cache",
  ];

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>{isAr ? "مركز عمليات الفاست بوت (Fastboot Protocol)" : "Fastboot & Bootloader Center"}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold uppercase">
                  DIRECT USB BULK
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isAr
                  ? "قراءة متغيرات البوت لودر، فك الحماية، وتمرير ملفات الروم والتفليش"
                  : "Query hardware variables, unlock OEM bootloader, and flash partition images"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExecute("fastboot getvar all", "getvar_all")}
              disabled={!!loadingAction}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer shadow-xs"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isAr ? "تحديث كل المتغيرات (GetVar All)" : "Read All Vars"}</span>
            </button>
            <button
              onClick={() => handleExecute("fastboot reboot fastboot", "reboot_fastbootd")}
              disabled={!!loadingAction}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 cursor-pointer shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isAr ? "الدخول إلى Fastbootd (Dynamic)" : "Reboot Fastbootd"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Variables & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: GetVar Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <FileCode className="w-4 h-4 text-amber-600" />
              <span>{isAr ? "متغيرات البوت لودر (Fastboot Variables)" : "Bootloader Variables"}</span>
            </div>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute top-2.5 right-2.5" />
              <input
                type="text"
                placeholder={isAr ? "بحث عن متغير..." : "Filter variables..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-8 pl-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          <div className="mt-4 overflow-y-auto max-h-[360px] border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-3.5 py-2.5 text-start">{isAr ? "المتغير" : "Variable"}</th>
                  <th className="px-3.5 py-2.5 text-start">{isAr ? "القيمة" : "Value"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredVars.length > 0 ? (
                  filteredVars.map(([key, val]) => (
                    <tr key={key} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3.5 py-2 text-indigo-600 font-semibold">{key}</td>
                      <td className="px-3.5 py-2 text-slate-700 select-all font-medium">{val}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-3 py-6 text-center text-slate-400">
                      {isAr ? "لا توجد متغيرات مطابقة" : "No variables matched"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Flashing & Lock Wizard */}
        <div className="lg:col-span-5 space-y-4">
          {/* Bootloader Lock / Unlock Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                {isUnlocked ? <ShieldAlert className="w-4 h-4 text-amber-600" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                <span>{isAr ? "حماية البوت لودر" : "OEM Bootloader State"}</span>
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wide border ${
                  isUnlocked ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {isUnlocked ? "UNLOCKED" : "LOCKED"}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {isAr
                  ? "فك البوت لودر يسمح بتمرير الرومات المعدلة وملفات الروت، ولكنه قد يمسح بيانات المستخدم (Factory Reset)."
                  : "Unlocking allows flashing custom recovery/kernels, but will wipe user data partitions."}
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleExecute("fastboot oem unlock", "unlock_bootloader")}
                  disabled={isUnlocked || !!loadingAction}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{isAr ? "فك البوت لودر (Unlock)" : "Unlock Bootloader"}</span>
                </button>

                <button
                  onClick={() => handleExecute("fastboot oem lock", "lock_bootloader")}
                  disabled={!isUnlocked || !!loadingAction}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? "إعادة القفل (Lock)" : "Relock"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Partition Flashing & Erasing */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="text-xs font-bold text-slate-800 pb-3 border-b border-slate-100 uppercase tracking-wider flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? "تفليش ومسح البارتشن" : "Partition Flash & Erase"}</span>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <label className="text-[11px] text-slate-500 font-bold block mb-1.5">
                  {isAr ? "اختر البارتشن المستهدف:" : "Target Partition:"}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {standardPartitions.map((part) => (
                    <button
                      key={part}
                      onClick={() => setSelectedPartition(part)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                        selectedPartition === part
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {part}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slot Switcher (For A/B Partition Devices) */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-bold">{isAr ? "السلوت النشط (A/B):" : "Active Slot (A/B):"}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setActiveSlot("a");
                      handleExecute("fastboot --set-active=a", "set_slot_a");
                    }}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold cursor-pointer transition-colors ${
                      activeSlot === "a" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    Slot A
                  </button>
                  <button
                    onClick={() => {
                      setActiveSlot("b");
                      handleExecute("fastboot --set-active=b", "set_slot_b");
                    }}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold cursor-pointer transition-colors ${
                      activeSlot === "b" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    Slot B
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() =>
                    handleExecute(`fastboot flash ${selectedPartition} ${selectedPartition}.img`, "flash_partition")
                  }
                  disabled={!!loadingAction}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isAr ? `تفليش ${selectedPartition}` : `Flash ${selectedPartition}`}</span>
                </button>

                <button
                  onClick={() => handleExecute(`fastboot erase ${selectedPartition}`, "erase_partition")}
                  disabled={!!loadingAction}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 cursor-pointer shadow-xs"
                  title={isAr ? "مسح البارتشن" : "Erase Partition"}
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>{isAr ? "مسح" : "Erase"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fastboot Console Output */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Terminal className="w-3.5 h-3.5" />
            <span>Fastboot Console Stream</span>
          </span>
          <button
            onClick={() => setConsoleLogs([])}
            className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="mt-2.5 max-h-32 overflow-y-auto space-y-1 text-slate-300 font-mono">
          {consoleLogs.map((log, i) => (
            <div key={i} className="leading-tight">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
