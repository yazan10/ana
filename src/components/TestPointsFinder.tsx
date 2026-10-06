import React, { useState } from "react";
import {
  MapPin,
  Search,
  Cpu,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  Compass,
  Layers,
  HelpCircle,
} from "lucide-react";
import { TestPointData, Language } from "../types";
import { TEST_POINTS_DB } from "../data/testPointsDatabase";

interface TestPointsFinderProps {
  lang: Language;
}

export const TestPointsFinder: React.FC<TestPointsFinderProps> = ({ lang }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedItem, setSelectedItem] = useState<TestPointData>(TEST_POINTS_DB[0]);
  const [probedPoint, setProbedPoint] = useState<boolean>(false);

  const isAr = lang === "ar";

  const brands = ["ALL", "Xiaomi", "Samsung", "Huawei", "Apple"];

  const filteredItems = TEST_POINTS_DB.filter((tp) => {
    const matchesSearch =
      tp.phoneModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tp.chipset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tp.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === "ALL" || tp.brand.toLowerCase() === selectedBrand.toLowerCase();
    return matchesSearch && matchesBrand;
  });

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span>{isAr ? "دليل نقاط التيست بوينت لوضعيات التفليش (EDL 9008 / BROM Test Points)" : "Software Test Points & Emergency Flash Jumper Guide"}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {isAr
                ? "مواقع نقاط القفلة (Test Points) على البوردة لإدخال الأجهزة المقفلة أو الفاصلة في وضع EDL 9008 أو BROM للتفليش والسوفت وير"
                : "Motherboard jumper test points for forcing Qualcomm EDL 9008 & MTK BROM modes for software flashing"}
            </p>
          </div>

          {/* Search bar & Brand filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute top-2.5 right-2.5" />
              <input
                type="text"
                placeholder={isAr ? "ابحث عن الموديل أو المعالج..." : "Search model or chipset..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-8 pl-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    selectedBrand === b ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: List & Detailed Schematic View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Device Selector */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-500 px-1 uppercase tracking-wider">
            {isAr ? "قائمة الأجهزة المتوفرة:" : "Available Device Schematics:"}
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredItems.map((tp) => {
              const isSelected = selectedItem.id === tp.id;

              return (
                <div
                  key={tp.id}
                  onClick={() => {
                    setSelectedItem(tp);
                    setProbedPoint(false);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? "bg-indigo-50/80 border-indigo-500 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{tp.phoneModel}</h4>
                      <p className="text-[11px] text-indigo-600 font-mono font-bold mt-0.5">{tp.chipset}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold uppercase">
                      {tp.brand}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-3 pt-2 border-t border-slate-100">
                    <span className="text-amber-700 font-bold">{tp.type}</span>
                    <span className="font-mono text-slate-700 font-bold">{tp.diodeValue}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Schematic Visualizer & Probe Simulator */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">{selectedItem.phoneModel}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold">
                  {selectedItem.chipset}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isAr ? selectedItem.instructionsAr : selectedItem.instructionsEn}
              </p>
            </div>

            <button
              onClick={() => setProbedPoint(!probedPoint)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                probedPoint
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAr ? "فحص الممانعة بالمقياس" : "Probe Diode Value"}</span>
            </button>
          </div>

          {/* Motherboard Graphic Container */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] shadow-inner">
            <img
              src={selectedItem.schematicImageUrl}
              alt={selectedItem.phoneModel}
              className="max-h-72 w-auto object-contain rounded-lg opacity-90 hover:opacity-100 transition-opacity"
              referrerPolicy="no-referrer"
            />

            {/* Test Point Interactive Hotspot */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto cursor-pointer group"
              onClick={() => setProbedPoint(true)}
            >
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-indigo-400/40 animate-ping absolute inset-0" />
                <div className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-600/50">
                  TP
                </div>
              </div>
              <div className="mt-1 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-indigo-400/60 text-[10px] text-indigo-300 font-mono whitespace-nowrap shadow-xl">
                {selectedItem.locationDescription}
              </div>
            </div>

            {/* Multimeter Overlay Screen */}
            {probedPoint && (
              <div className="absolute top-4 right-4 bg-slate-900/95 border-2 border-emerald-500 rounded-xl p-3 shadow-2xl backdrop-blur-md font-mono text-xs animate-in zoom-in-95">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  {isAr ? "قراءة الأفوميتر (وضع الدايود):" : "Multimeter (Diode Mode):"}
                </div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">
                  {selectedItem.diodeValue}
                </div>
                <div className="text-[10px] text-emerald-300 mt-1 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isAr ? "الممانعة سليمة (لا يوجد شورت)" : "Healthy Line (No Short)"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Step-by-Step Procedure */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="text-slate-800 font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? "طريقة التوصيل والدخول في وضع الطوارئ خطوة بخطوة:" : "Step-by-Step Connection Procedure:"}</span>
            </div>
            <ol className="space-y-1.5 text-slate-700 list-decimal list-inside leading-relaxed font-medium">
              <li>
                {isAr
                  ? "افصل كابل البطارية تماماً عن اللوحة الأم لمنع أي تلف كهربائي."
                  : "Disconnect battery flex completely to prevent electrostatic damage."}
              </li>
              <li>
                {isAr
                  ? `قم بعمل قفلة باستخدام ملقط عازل دقيق بين نقطة الـ (${selectedItem.locationDescription}) والأرضي (GND).`
                  : `Bridge the Test Point pin (${selectedItem.locationDescription}) to Ground (GND / Shield Can) using fine tweezers.`}
              </li>
              <li>
                {isAr
                  ? "قم بتوصيل كابل USB بالكمبيوتر وأنت ضاغط على القفلة، ثم ارفع الملقط بعد ثانيتين فور صدور صوت التعرف."
                  : "Plug USB cable while holding tweezers bridge; release after 2 seconds once PC recognizes port."}
              </li>
              <li>
                {isAr
                  ? "ستظهر المنفذ كـ Qualcomm HS-USB QDLoader 9008 أو MTK USB Port في إدارة الأجهزة."
                  : "Device will enumerate as Qualcomm HS-USB QDLoader 9008 or MediaTek USB VCOM."}
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
