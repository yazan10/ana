import React, { useState } from "react";
import {
  Smartphone,
  Cpu,
  BatteryCharging,
  HardDrive,
  ShieldCheck,
  ShieldAlert,
  Power,
  RotateCcw,
  Layers,
  Thermometer,
  Activity,
  CheckCircle2,
  Copy,
  Check,
  AlertOctagon,
  Sparkles,
  Zap,
} from "lucide-react";
import { DeviceTelemetry, Language, ConnectionMode } from "../types";
import { webUsbService } from "../services/webusb";

interface DeviceOverviewProps {
  telemetry: DeviceTelemetry;
  lang: Language;
  activeMode: ConnectionMode;
  onRunCommand: (cmd: string) => Promise<any>;
}

export const DeviceOverview: React.FC<DeviceOverviewProps> = ({
  telemetry,
  lang,
  activeMode,
  onRunCommand,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isAr = lang === "ar";

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleQuickReboot = async (action: string, cmd: string) => {
    setActionLoading(action);
    setActionMessage(null);
    try {
      const res = await onRunCommand(cmd);
      setActionMessage(res.output || "Reboot command sent.");
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const ramUsagePercent = Math.round((telemetry.ramUsedMb / telemetry.ramTotalMb) * 100);
  const storageUsagePercent = Math.round((telemetry.storageUsedGb / telemetry.storageTotalGb) * 100);

  return (
    <div className="space-y-4">
      {/* Top Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Device Brand, Interactive Visual & Core Specs */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                      {telemetry.brand} {telemetry.marketName}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
                      {telemetry.model} ({telemetry.codename})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    SN: {telemetry.serialNumber}
                  </p>
                </div>
              </div>

              {/* Security & Lock Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Bootloader */}
                <div
                  className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-bold uppercase tracking-wide ${
                    telemetry.bootloaderStatus === "unlocked"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {telemetry.bootloaderStatus === "unlocked" ? (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isAr ? "البوت لودر" : "Bootloader"}: {telemetry.bootloaderStatus.toUpperCase()}
                  </span>
                </div>

                {/* Knox */}
                {telemetry.knoxWarrantyBit && (
                  <div
                    className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-bold uppercase tracking-wide ${
                      telemetry.knoxWarrantyBit.includes("0x0")
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    <span>Knox: {telemetry.knoxWarrantyBit}</span>
                  </div>
                )}

                {/* FRP Status */}
                <div className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-bold uppercase tracking-wide">
                  FRP: {telemetry.frpStatus.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4 text-xs">
              {/* IMEI 1 */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 relative group">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  {isAr ? "رقم الـ IMEI 1" : "IMEI 1 Slot"}
                </div>
                <div className="text-slate-800 font-mono font-semibold mt-1 truncate select-all">
                  {telemetry.imei1}
                </div>
                <button
                  onClick={() => copyToClipboard(telemetry.imei1, "imei1")}
                  className="absolute top-2.5 right-2.5 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Copy"
                >
                  {copiedKey === "imei1" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* IMEI 2 */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 relative group">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  {isAr ? "رقم الـ IMEI 2" : "IMEI 2 Slot"}
                </div>
                <div className="text-slate-800 font-mono font-semibold mt-1 truncate select-all">
                  {telemetry.imei2 || "Single SIM"}
                </div>
                {telemetry.imei2 && (
                  <button
                    onClick={() => copyToClipboard(telemetry.imei2!, "imei2")}
                    className="absolute top-2.5 right-2.5 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Copy"
                  >
                    {copiedKey === "imei2" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* OS Release */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  {isAr ? "إصدار النظام" : "OS Release"}
                </div>
                <div className="text-indigo-600 font-bold mt-1 truncate">
                  Android {telemetry.androidVersion}
                </div>
              </div>

              {/* Security Patch */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  {isAr ? "مستوى الحماية" : "Security Patch"}
                </div>
                <div className="text-slate-800 font-mono font-semibold mt-1 truncate">
                  {telemetry.securityPatch}
                </div>
              </div>

              {/* Baseband Modem */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 col-span-2">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  {isAr ? "إصدار البيسباند (المودم)" : "Baseband / Modem Firmware"}
                </div>
                <div className="text-slate-800 font-mono font-medium mt-1 truncate">
                  {telemetry.basebandVersion}
                </div>
              </div>

              {/* Processor */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 col-span-2">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  {isAr ? "المعالج والشرائح" : "Processor & Chipset"}
                </div>
                <div className="text-slate-800 font-semibold mt-1 truncate">
                  {telemetry.cpuModel}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono">Display: {telemetry.screenResolution} ({telemetry.screenRefreshRateHz}Hz)</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold font-mono">
              USB Interface Ready
            </span>
          </div>
        </div>

        {/* Live Gauges & Thermal Status */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 text-xs font-bold uppercase tracking-wider">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? "مؤشرات العتاد الحية" : "Live Telemetry"}</span>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-mono uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>

            <div className="space-y-3.5 mt-4 text-xs">
              {/* CPU Temperature */}
              <div>
                <div className="flex justify-between items-center text-slate-700 mb-1 font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                    {isAr ? "حرارة المعالج (CPU)" : "CPU Thermal Zone"}
                  </span>
                  <span className="font-mono text-amber-600 font-bold">
                    {telemetry.cpuTemperatureC}°C
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      telemetry.cpuTemperatureC > 45
                        ? "bg-rose-500"
                        : telemetry.cpuTemperatureC > 38
                        ? "bg-amber-500"
                        : "bg-indigo-600"
                    }`}
                    style={{ width: `${Math.min(100, (telemetry.cpuTemperatureC / 80) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Battery Level & Health */}
              <div>
                <div className="flex justify-between items-center text-slate-700 mb-1 font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                    {isAr ? "صحة وحالة البطارية" : "Battery Health & Charge"}
                  </span>
                  <span className="font-mono text-emerald-600 font-bold">
                    {telemetry.batteryLevel}% ({telemetry.batteryHealthPercent}% Health)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${telemetry.batteryLevel}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>{telemetry.batteryVoltageMv} mV</span>
                  <span className="text-slate-600 font-medium">
                    {telemetry.batteryCurrentMa > 0 ? `+${telemetry.batteryCurrentMa} mA` : `${telemetry.batteryCurrentMa} mA`}
                  </span>
                  <span>{telemetry.batteryCycleCount} Cycles</span>
                </div>
              </div>

              {/* RAM Memory */}
              <div>
                <div className="flex justify-between items-center text-slate-700 mb-1 font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    {isAr ? "الذاكرة العشوائية (RAM)" : "RAM Usage"}
                  </span>
                  <span className="font-mono text-indigo-600 font-bold">
                    {(telemetry.ramUsedMb / 1024).toFixed(1)} / {(telemetry.ramTotalMb / 1024).toFixed(0)} GB
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${ramUsagePercent}%` }}
                  />
                </div>
              </div>

              {/* Storage */}
              <div>
                <div className="flex justify-between items-center text-slate-700 mb-1 font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <HardDrive className="w-3.5 h-3.5 text-slate-600" />
                    {isAr ? "ذاكرة التخزين (UFS/eMMC)" : "Internal Storage"}
                  </span>
                  <span className="font-mono text-slate-800 font-bold">
                    {telemetry.storageUsedGb.toFixed(0)} / {telemetry.storageTotalGb} GB
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                  <div
                    className="bg-slate-700 h-full rounded-full transition-all duration-500"
                    style={{ width: `${storageUsagePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Thermal Throttle: OFF</span>
            <span className="font-bold text-slate-700">100% Calibrated</span>
          </div>
        </div>
      </div>

      {/* Quick Power & Reboot Command Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Power className="w-4 h-4 text-indigo-600" />
            <span>{isAr ? "لوحة التحكم في الإقلاع وإعادة التشغيل" : "Boot & Power Control Center"}</span>
          </div>

          {actionMessage && (
            <div className="text-xs px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono animate-in fade-in font-medium">
              {actionMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {/* Reboot System */}
            <button
              onClick={() => handleQuickReboot("system", "adb reboot")}
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isAr ? "إعادة تشغيل عادية" : "Reboot System"}</span>
            </button>

            {/* Reboot Recovery */}
            <button
              onClick={() => handleQuickReboot("recovery", "adb reboot recovery")}
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-xs"
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAr ? "وضع الريكفري (Recovery)" : "Reboot Recovery"}</span>
            </button>

            {/* Reboot Bootloader / Fastboot */}
            <button
              onClick={() => handleQuickReboot("bootloader", "adb reboot bootloader")}
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>{isAr ? "وضع الفاست بوت (Fastboot)" : "Reboot Bootloader"}</span>
            </button>

            {/* Reboot EDL 9008 */}
            <button
              onClick={() => handleQuickReboot("edl", "adb reboot edl")}
              disabled={!!actionLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-all cursor-pointer shadow-xs"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
              <span>{isAr ? "وضع الطوارئ (EDL 9008)" : "Reboot EDL 9008"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

