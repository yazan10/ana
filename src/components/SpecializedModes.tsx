import React, { useState } from "react";
import {
  Layers,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCcw,
  FileCode,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Smartphone,
  HardDrive,
  Flame,
} from "lucide-react";
import { Language, ConnectionMode, DeviceTelemetry } from "../types";

interface SpecializedModesProps {
  telemetry: DeviceTelemetry;
  lang: Language;
  onRunCommand: (cmd: string) => Promise<{ success: boolean; output: string }>;
}

export const SpecializedModes: React.FC<SpecializedModesProps> = ({
  telemetry,
  lang,
  onRunCommand,
}) => {
  const [activeTab, setActiveTab] = useState<"samsung" | "mtk" | "qualcomm" | "apple">("samsung");
  const [selectedCsc, setSelectedCsc] = useState("KSA");
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [runningAction, setRunningAction] = useState<string | null>(null);

  const isAr = lang === "ar";

  const addLog = (msg: string) => {
    setActionLog((prev) => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleAction = async (name: string, desc: string, cmd: string) => {
    setRunningAction(name);
    addLog(`>>> ${desc}...`);
    try {
      const res = await onRunCommand(cmd);
      addLog(res.output || "Success.");
    } catch (e: any) {
      addLog(`ERR: ${e.message || "Failed"}`);
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Brand Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab("samsung")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "samsung"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Samsung ODIN & CSC</span>
          </button>

          <button
            onClick={() => setActiveTab("mtk")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "mtk"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>MediaTek BROM / DA</span>
          </button>

          <button
            onClick={() => setActiveTab("qualcomm")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "qualcomm"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Qualcomm EDL 9008</span>
          </button>

          <button
            onClick={() => setActiveTab("apple")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "apple"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Apple iOS Recovery / DFU</span>
          </button>
        </div>
      </div>

      {/* Samsung Odin & CSC Panel */}
      {activeTab === "samsung" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>{isAr ? "أدوات وتفليش سامسونج (Samsung Odin & CSC Tool)" : "Samsung Odin & CSC Tool"}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {isAr ? "بروتوكول تفليش أودين عبر الويب وتغيير رمز المنطقة (CSC) بدون فورمات" : "Web Odin flashing handshake and carrier CSC regional code changer"}
                </p>
              </div>

              <div className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                Loke Protocol v4
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
              {/* CSC Changer */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800">{isAr ? "تغيير كود المنطقة (CSC Changer):" : "Change Regional CSC Code:"}</div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {isAr
                    ? "لتفعيل تسجيل المكالمات وشبكات 5G الإقليمية دون حذف البيانات."
                    : "Enables native call recording and regional 5G bands without data wipe."}
                </p>

                <div className="flex gap-2">
                  <select
                    value={selectedCsc}
                    onChange={(e) => setSelectedCsc(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2 font-mono font-medium focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="KSA">KSA (السعودية - تسجيل مكالمات مفعل)</option>
                    <option value="UAE">UAE / XSG (الإمارات)</option>
                    <option value="EGY">EGY (مصر)</option>
                    <option value="MID">MID (العراق)</option>
                    <option value="INS">INS (الهند - تسجيل مكالمات + Samsung Pay)</option>
                    <option value="EUX">EUX (أوروبا)</option>
                  </select>

                  <button
                    onClick={() =>
                      handleAction("change_csc", `Change CSC to ${selectedCsc}`, `adb shell setprop persist.radio.csc ${selectedCsc}`)
                    }
                    disabled={!!runningAction}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isAr ? "تطبيق الكود" : "Apply CSC"}
                  </button>
                </div>
              </div>

              {/* Odin 4-File Flashing Slots */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800">{isAr ? "ملفات الروم الرسمي (Odin 4-Files):" : "Odin Firmware Files:"}</div>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  {["BL (Bootloader)", "AP (System Core)", "CP (Modem Baseband)", "CSC (Partition Table)"].map((slot) => (
                    <div key={slot} className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                      <span className="text-blue-700 font-bold">{slot}</span>
                      <span className="text-slate-500 text-[10px] font-semibold">Ready</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() =>
                      handleAction("reboot_download", "Reboot to Download Mode", "adb reboot download")
                    }
                    disabled={!!runningAction}
                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isAr ? "الدخول لوضع الداونلود" : "Reboot to Download"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MediaTek MTK Mode */}
      {activeTab === "mtk" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-600" />
                <span>{isAr ? "خدمات معالجات ميديا تك (MediaTek BROM / DA Toolkit)" : "MediaTek BROM / DA Toolkit"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isAr ? "تجاوز حماية SLA/DAA، قراءة ملف Scatter، وسحب نسخة احتياطية من NVRAM / IMEI" : "Bypass SLA/DAA hardware auth, parse scatter files, and backup NVRAM"}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-mono font-bold">
              BROM v7.19
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-800 font-bold block">{isAr ? "تجاوز الحماية (SLA/DAA):" : "Auth Bypass:"}</span>
              <p className="text-[11px] text-slate-500 font-medium">
                {isAr ? "تعطيل حماية البوت لودر في معالجات Helio و Dimensity." : "Bypass secure boot challenge in Dimensity & Helio."}
              </p>
              <button
                onClick={() => handleAction("mtk_bypass", "MTK Auth SLA/DAA Bypass", "mtk bypass-security")}
                disabled={!!runningAction}
                className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isAr ? "تجاوز الحماية الآن" : "Run SLA Bypass"}
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-800 font-bold block">{isAr ? "نسخ NVRAM / NVDATA:" : "NVRAM / IMEI Backup:"}</span>
              <p className="text-[11px] text-slate-500 font-medium">
                {isAr ? "سحب ملفات معايرة الشبكة والرقم التسلسلي لمنع فقدان الـ IMEI." : "Dump baseband calibration to prevent IMEI null."}
              </p>
              <button
                onClick={() => handleAction("backup_nvram", "Backup NVRAM Partitions", "mtk read-partition nvram nvdata")}
                disabled={!!runningAction}
                className="w-full py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold cursor-pointer border border-slate-200 shadow-2xs disabled:opacity-50"
              >
                {isAr ? "سحب نسخة احتياطية" : "Backup NVRAM"}
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-800 font-bold block">{isAr ? "محلل ملف Scatter:" : "Scatter Parser:"}</span>
              <p className="text-[11px] text-slate-500 font-medium">
                {isAr ? "فحص خريطة البارتشن وعناوين الذاكرة." : "Inspect memory address offsets from MT68xx scatter."}
              </p>
              <button
                onClick={() => handleAction("parse_scatter", "Parse Android Scatter Map", "mtk parse-scatter MT6896_Android_scatter.txt")}
                disabled={!!runningAction}
                className="w-full py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold cursor-pointer border border-slate-200 shadow-2xs disabled:opacity-50"
              >
                {isAr ? "فحص الـ Scatter" : "Parse Scatter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Qualcomm EDL 9008 Mode */}
      {activeTab === "qualcomm" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Flame className="w-4 h-4 text-purple-600" />
                <span>{isAr ? "وضع الطوارئ كوالكوم (Qualcomm EDL 9008 & Sahara)" : "Qualcomm EDL 9008 & Sahara Protocol"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isAr ? "إحياء الهواتف الميتة، تمرير مبرمج Firehose، وقراءة جدول التقسيم GPT مباشرة من UFS/eMMC" : "Unbrick dead boot, send Firehose programmer, and read raw GPT partition table"}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-mono font-bold">
              Sahara v2.5 / 9008
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-800 font-bold block">{isAr ? "فحص اتصال مبرمج Firehose:" : "Firehose Programmer Handshake:"}</span>
              <p className="text-[11px] text-slate-500 font-medium">
                {isAr ? "إرسال ملف prog_firehose_ddr.elf للتواصل المباشر مع ذاكرة الفلاش UFS." : "Send Firehose binary to establish direct UFS memory bus access."}
              </p>
              <button
                onClick={() => handleAction("edl_firehose", "Send Firehose Programmer", "edl load-firehose prog_firehose_SM8550.elf")}
                disabled={!!runningAction}
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isAr ? "إرسال مبرمج Firehose" : "Load Firehose ELF"}
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-800 font-bold block">{isAr ? "قراءة جدول البارتشن (GPT Table):" : "Dump Raw GPT Header:"}</span>
              <p className="text-[11px] text-slate-500 font-medium">
                {isAr ? "استخراج قائمة جميع البارتشنات وتحديد القطاعات المعطوبة." : "Extract GUID Partition Table to inspect corrupt sectors."}
              </p>
              <button
                onClick={() => handleAction("read_gpt", "Read GUID Partition Table", "edl print-gpt")}
                disabled={!!runningAction}
                className="w-full py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold cursor-pointer border border-slate-200 shadow-2xs disabled:opacity-50"
              >
                {isAr ? "قراءة جدول الـ GPT" : "Read GPT Table"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apple iOS Recovery / DFU */}
      {activeTab === "apple" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-rose-600" />
                <span>{isAr ? "أدوات آبل آيفون (Apple iOS Recovery & DFU)" : "Apple iOS Recovery & DFU Suite"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isAr ? "قراءة ECID، فحص الشحن، والخروج من وضع الريكفري بضغطة زر" : "Read ECID, hardware board ID, and 1-click Exit Recovery mode"}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold">
              iBoot-11881
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-800 font-bold block">{isAr ? "الخروج من وضع الريكفري:" : "Kickout of Recovery Mode:"}</span>
              <p className="text-[11px] text-slate-500 font-medium">
                {isAr ? "إعادة تشغيل الآيفون بشكل طبيعي إذا كان عالقاً في شاشة الكيبل والكمبيوتر." : "Forces device reboot when stuck on 'Support.apple.com/restore' cable screen."}
              </p>
              <button
                onClick={() => handleAction("exit_recovery", "Exit iOS Recovery Mode", "irecovery -n")}
                disabled={!!runningAction}
                className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isAr ? "الخروج من الريكفري فوراً" : "1-Click Exit Recovery"}
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-slate-800 font-bold block">{isAr ? "قراءة بيانات المعرف (ECID & Board):" : "Read ECID / Board Info:"}</span>
              <p className="text-[11px] text-slate-500 font-mono font-medium">
                ECID: 0x001614C80220001C | CPID: 0x8130 (A17 Pro)
              </p>
              <button
                onClick={() => handleAction("read_ecid", "Read Apple Device ECID", "irecovery -q")}
                disabled={!!runningAction}
                className="w-full py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold cursor-pointer border border-slate-200 shadow-2xs disabled:opacity-50"
              >
                {isAr ? "تحديث معلومات الجهاز" : "Query iBoot Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Protocol Log Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs shadow-xs">
        <div className="text-slate-400 pb-2 border-b border-slate-800 flex justify-between items-center font-bold">
          <span>Specialized Protocol Activity Log</span>
          <button onClick={() => setActionLog([])} className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold cursor-pointer">
            Clear
          </button>
        </div>
        <div className="mt-2.5 max-h-32 overflow-y-auto space-y-1 text-slate-300 font-medium">
          {actionLog.length > 0 ? (
            actionLog.map((log, i) => <div key={i}>{log}</div>)
          ) : (
            <div className="text-slate-500">No protocol operations executed yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
