import React, { useState } from "react";
import {
  BatteryCharging,
  Zap,
  Thermometer,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Sliders,
  HelpCircle,
} from "lucide-react";
import { DeviceTelemetry, Language } from "../types";

interface BatteryPowerLabProps {
  telemetry: DeviceTelemetry;
  lang: Language;
}

export const BatteryPowerLab: React.FC<BatteryPowerLabProps> = ({ telemetry, lang }) => {
  const [customCurrentMa, setCustomCurrentMa] = useState<number>(80);
  const isAr = lang === "ar";

  // Power supply diagnosis logic
  const analyzeCurrentDraw = (current: number) => {
    if (current === 0) {
      return {
        state: isAr ? "لا سحب نهائياً (0.00A)" : "Zero Current (0.00A)",
        color: "text-slate-400 border-slate-700 bg-slate-900/60",
        cause: isAr
          ? "مسار زر الباور مفصول، تلف ريش البطارية، أو قطع في خط VBAT / VBUS / خط المقاومة الحرارية BSI."
          : "Open circuit on Power Key flex, damaged battery connector pins, or broken VBAT/VBUS line.",
        steps: [
          isAr ? "قياس جهد زر الباور (يجب أن يكون 1.8V - 3.8V)" : "Measure Power Key line voltage (1.8V - 3.8V)",
          isAr ? "فحص مسار ريش البطارية ومقاومة BSI" : "Check battery pin resistance and BSI line",
          isAr ? "فحص كريستالة التوقيت 32.768 kHz" : "Inspect 32.768 kHz RTC clock crystal",
        ],
      };
    }
    if (current > 0 && current < 150) {
      return {
        state: isAr ? "سحب ضعيف ثابت (0.02A - 0.15A Freeze)" : "Low Current Freeze (0.02A - 0.15A)",
        color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
        cause: isAr
          ? "تلف في آي سي الباور الرئيسي (PMIC)، عطل في دائرة الذاكرة eMMC/UFS، أو فقدان الإقلاع الأولي (Dead Boot / EDL Lock)."
          : "PMIC failed to start secondary buck coils, defective eMMC/UFS memory rail, or device stuck in BootROM state.",
        steps: [
          isAr ? "فحص خروج ملفات الباور (Buck Coils) لآيسي الباور" : "Measure PMIC Buck coil output voltages (VCORE, VRAM, VIO)",
          isAr ? "توصيل الهاتف بالكمبيوتر: هل يتعرف Qualcomm 9008 أو MTK Port؟" : "Check if PC detects Qualcomm 9008 or MTK USB Port",
          isAr ? "إعادة كتابة ملف الـ Dump أو فحص الذاكرة بالبوكس" : "Inspect UFS health report or restore BootROM dump",
        ],
      };
    }
    if (current >= 150 && current < 450) {
      return {
        state: isAr ? "سحب متذبذب ومستمر (0.15A - 0.45A Boot Loop)" : "Bootloop Current Waveform (0.15A - 0.45A)",
        color: "text-purple-400 border-purple-500/40 bg-purple-500/10",
        cause: isAr
          ? "الهاتف عالق على الشعار أو ريستارت مستمر بسبب تلف السوفت وير، عطل آيسي الشحن (Tristar/Hydra)، أو كراك تحت المعالج CPU."
          : "Kernel panic loop, software partition corruption, charging IC fault, or cracked solder balls under CPU.",
        steps: [
          isAr ? "محاولة إدخال الهاتف وضع الريكفري أو الفاست بوت" : "Attempt entering Recovery or Fastboot mode",
          isAr ? "تفليش الهاتف بروم رسمي كامل 4 ملفات مع ملف PIT" : "Clean flash official stock firmware with PIT layout",
          isAr ? "فحص حرارة المعالج أو شبلنة الرام المكدسة (RAM Reballing)" : "Check thermal dissipation on SoC or reball RAM",
        ],
      };
    }
    if (current >= 1000) {
      return {
        state: isAr ? "شورت صريح أو سحب عالي (Short Circuit / High Draw)" : "Direct Short Circuit / Overload",
        color: "text-rose-400 border-rose-500/40 bg-rose-500/10",
        cause: isAr
          ? "شورت صريح على خط البطارية الرئيسي (VBAT / VPH_PWR / VDD_MAIN)، تلف مكثف توازي، أو احتراق آي سي الشحن/الباور."
          : "Direct short on primary power rail (VBAT / VPH_PWR / VDD_MAIN), shorted ceramic capacitor, or burned IC.",
        steps: [
          isAr ? "حقن الجهد (Voltage Injection 1.2V - 3.8V) مع استخدام كاميرا حرارية أو دخان الرجينة" : "Use Rosin flux smoke or thermal camera with low voltage injection",
          isAr ? "فحص مكثفات التوازي حول آيسي الباور والشحن ومضخم الصوت" : "Check parallel decoupling capacitors around PMIC & Audio PA",
          isAr ? "رفع الآيسي التالف بعد تحديد نقطة السخونة" : "Remove overheated component safely with hot air station",
        ],
      };
    }
    return {
      state: isAr ? "إقلاع طبيعي (Normal Boot Cycle)" : "Normal Boot Current (0.5A - 1.8A)",
      color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
      cause: isAr ? "سحب الإقلاع طبيعي ومثالي لكافة مراحل النظام." : "Normal boot sequence with healthy current consumption curves.",
      steps: [
        isAr ? "شاشة الهاتف يجب أن تضيء وتبدأ مرحلة النظام" : "Display should turn on and enter OS desktop",
        isAr ? "التأكد من اكتمال الشحن السريع" : "Verify Fast Charging protocol negotiation",
      ],
    };
  };

  const currentAnalysis = analyzeCurrentDraw(customCurrentMa);

  return (
    <div className="space-y-4">
      {/* Top Battery Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Health & Remaining mAh */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
            <span>{isAr ? "صحة البطارية والسعة" : "Battery Health & mAh"}</span>
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-mono">
            {telemetry.batteryHealthPercent}%
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono font-semibold">
            {telemetry.batteryRealCapacityMah} / {telemetry.batteryDesignCapacityMah} mAh
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${telemetry.batteryHealthPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Voltage */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
            <span>{isAr ? "جهد البطارية المباشر" : "Live Cell Voltage"}</span>
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 font-mono">
            {(telemetry.batteryVoltageMv / 1000).toFixed(3)} V
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono font-semibold">
            {telemetry.batteryVoltageMv} mV (Normal: 3.7V - 4.4V)
          </div>
          <div className="text-[10px] text-emerald-700 mt-2 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block border border-emerald-200">
            {isAr ? "مستوى الجهد مستقر ومناسب" : "Voltage Rail Stabilized"}
          </div>
        </div>

        {/* Metric 3: Charging Current */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
            <span>{isAr ? "تيار الشحن / التفريغ" : "Charge Current Rate"}</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono">
            {telemetry.batteryCurrentMa > 0 ? `+${telemetry.batteryCurrentMa}` : telemetry.batteryCurrentMa} mA
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono font-semibold">
            {isAr ? "بروتوكول الشحن: USB PD 3.0 (45W)" : "Protocol: USB PD 3.0 (45W)"}
          </div>
          <div className="text-[10px] text-indigo-700 mt-2 font-bold bg-indigo-50 px-2 py-0.5 rounded-md inline-block border border-indigo-200">
            {isAr ? "شحن فائق السرعة متصل" : "Fast Charging Negotiated"}
          </div>
        </div>

        {/* Metric 4: Cycles & Temp */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
            <span>{isAr ? "الدورات والحرارة" : "Cycles & Temperature"}</span>
            <Thermometer className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-mono">
            {telemetry.batteryTemperatureC}°C
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono font-semibold">
            {isAr ? `دورات الشحن: ${telemetry.batteryCycleCount} دورة` : `Cycles: ${telemetry.batteryCycleCount}`}
          </div>
          <div className="text-[10px] text-emerald-700 mt-2 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block border border-emerald-200">
            {isAr ? "الحرارة ضمن النطاق الآمن (<40°C)" : "Thermal Zone Safe (<40°C)"}
          </div>
        </div>
      </div>

      {/* DC Power Supply Current Draw Analyzer (Interactive Lab) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>{isAr ? "محلل سحبات الباور سبلاي وتشخيص أعطال الدوائر" : "DC Power Supply Current Signature Analyzer"}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {isAr
              ? "حدد قيمة السحب بالميلي أمبير (mA) عند الضغط على زر الباور لمعرفة سبب العطل ومكونات الدائرة المشتبه بها فوراً"
              : "Analyze DC Power Supply current signatures upon pressing power key to detect shorts, PMIC freezes, or bootloops"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
          {/* Current Slider & Presets */}
          <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-slate-800 text-xs font-bold">
              <span>{isAr ? "سحب التيار على الباور سبلاي:" : "Current Draw (mA):"}</span>
              <span className="text-amber-600 font-mono text-base font-bold">
                {customCurrentMa} mA ({(customCurrentMa / 1000).toFixed(2)} A)
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="2500"
              step="10"
              value={customCurrentMa}
              onChange={(e) => setCustomCurrentMa(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono font-semibold">
              <span>0.00A</span>
              <span>0.50A</span>
              <span>1.50A</span>
              <span>2.50A (Short)</span>
            </div>

            <div className="text-[11px] text-slate-700 font-bold pt-1">
              {isAr ? "سحبات أعطال شائعة سريعة:" : "Common Fault Signatures:"}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: isAr ? "0.00A (لا سحب)" : "0.00A No Draw", val: 0 },
                { label: isAr ? "0.08A (عطل باور/ذاكرة)" : "0.08A PMIC/eMMC", val: 80 },
                { label: isAr ? "0.25A (ريبوت متكرر)" : "0.25A Restart", val: 250 },
                { label: isAr ? "1.80A (شورت صريح)" : "1.80A Direct Short", val: 1800 },
                { label: isAr ? "0.95A (إقلاع سليم)" : "0.95A Normal Boot", val: 950 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  onClick={() => setCustomCurrentMa(preset.val)}
                  className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-slate-700 text-[11px] font-mono text-start cursor-pointer shadow-xs font-semibold"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Card */}
          <div className="lg:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-bold">{isAr ? "التشخيص الفني الدقيق:" : "Diagnostic Diagnosis:"}</span>
                <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${
                  customCurrentMa === 0
                    ? "text-slate-700 border-slate-300 bg-white"
                    : customCurrentMa < 150
                    ? "text-amber-800 border-amber-300 bg-amber-50"
                    : customCurrentMa < 450
                    ? "text-purple-800 border-purple-300 bg-purple-50"
                    : customCurrentMa >= 1000
                    ? "text-rose-800 border-rose-300 bg-rose-50"
                    : "text-emerald-800 border-emerald-300 bg-emerald-50"
                }`}>
                  {currentAnalysis.state}
                </span>
              </div>

              <div className="mt-3 text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs font-medium">
                <span className="text-amber-700 font-bold block mb-1">{isAr ? "السبب المحتمل في الدائرة:" : "Probable Root Cause:"}</span>
                {currentAnalysis.cause}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] text-indigo-700 font-bold block">
                {isAr ? "خطوات القياس والفحص الموصى بها:" : "Recommended Measurement Steps:"}
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                {currentAnalysis.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
