import React from "react";
import {
  Smartphone,
  ShieldCheck,
  Zap,
  Cpu,
  Sparkles,
  Layers,
  MapPin,
  Terminal,
  Activity,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  BatteryCharging,
  Usb,
  LogIn,
  UserPlus,
  PlayCircle,
  Radio,
  ExternalLink,
} from "lucide-react";
import { Language, User } from "../types";

interface LandingPageProps {
  lang: Language;
  onStartApp: () => void;
  onGoLogin: () => void;
  onGoSignup: () => void;
  currentUser: User | null;
  onLogoClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  lang,
  onStartApp,
  onGoLogin,
  onGoSignup,
  currentUser,
  onLogoClick,
}) => {
  const isAr = lang === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      titleAr: "تفليش سامسونج أودين وتغيير CSC",
      titleEn: "Samsung Odin & CSC Changer",
      descAr: "تغيير كود المنطقة CSC لتفعيل تسجيل المكالمات وشبكات 5G وتفليش 4 ملفات عبر بروتوكول Loke مباشرة من المتصفح.",
      descEn: "Change CSC regional codes for call recording and flash official 4-file TAR.MD5 ROMs via WebUSB Loke protocol.",
      badge: "Loke v4",
      bgColor: "bg-blue-50 border-blue-200",
    },
    {
      icon: <Cpu className="w-6 h-6 text-purple-600" />,
      titleAr: "إنعاش وتفليش كوالكوم وضع EDL 9008",
      titleEn: "Qualcomm EDL 9008 Unbrick & Flash",
      descAr: "إحياء الهواتف الفاصلة بنظام الطوارئ Sahara و Firehose، كتابة وتعديل جدول بارتشنات GPT، وتفليش الذاكرة الخام UFS/eMMC.",
      descEn: "Unbrick dead boot Qualcomm devices via Sahara protocol and direct Firehose partition memory flashing.",
      badge: "Sahara 9008",
      bgColor: "bg-purple-50 border-purple-200",
    },
    {
      icon: <Layers className="w-6 h-6 text-teal-600" />,
      titleAr: "تجاوز حماية ميديا تك BROM / SLA",
      titleEn: "MediaTek BROM & SLA Bypass",
      descAr: "تخطي حماية البوت لودر في معالجات Helio و Dimensity، سحب نسخة كاملة من NVRAM والـ IMEI، وتفليش ملفات Scatter.",
      descEn: "Hardware SLA/DAA challenge bypass, NVRAM/NVDATA baseband backup to prevent null IMEI.",
      badge: "BROM v7.19",
      bgColor: "bg-teal-50 border-teal-200",
    },
    {
      icon: <MapPin className="w-6 h-6 text-amber-600" />,
      titleAr: "نقاط التيست بوينت لوضعيات EDL و BROM",
      titleEn: "Software Test Points (EDL / BROM)",
      descAr: "دليل ومخططات مواقع نقاط التيست بوينت (Test Points) على البوردة لإدخال الأجهزة في وضع EDL 9008 أو BROM للتفليش والسوفت وير.",
      descEn: "Motherboard jumper points for emergency Qualcomm EDL 9008 & MTK BROM unbrick and software flashing.",
      badge: "EDL / BROM Mode",
      bgColor: "bg-amber-50 border-amber-200",
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-600" />,
      titleAr: "تخطي وتجاوز حمايات FRP و MDM و Knox",
      titleEn: "FRP, MDM & Knox Security Bypass",
      descAr: "حذف حسابات جوجل FRP 2025/2026 بضغطة زر، تخطي بروفايلات شركات MDM و Payjoy وإصلاح تعطل التطبيقات بعد كسر الحماية.",
      descEn: "One-click Google FRP bypass, enterprise Knox MDM removal, PayJoy unlock, and warranty bit patching.",
      badge: "FRP & MDM",
      bgColor: "bg-emerald-50 border-emerald-200",
    },
    {
      icon: <Layers className="w-6 h-6 text-indigo-600" />,
      titleAr: "خدمات ماك بوك وآبل السحابية (Credits)",
      titleEn: "MacBook & Apple Cloud Services",
      descAr: "تخطي MDM و PIN لأجهزة ماك بوك بشريحة T2 و Apple Silicon M1-M4 واستعادة السوفت وير DFU بنظام رصيد الكريدت.",
      descEn: "T2 & Apple Silicon M1-M4 MDM bypass, EFI unlock, and macOS DFU restore powered by server technician credits.",
      badge: "MacBook Server",
      bgColor: "bg-indigo-50 border-indigo-200",
    },
  ];

  const protocols = [
    { name: "WebUSB Direct CDC", desc: "No Driver Needed" },
    { name: "Android ADB & Fastboot", desc: "Native Web Implementation" },
    { name: "Samsung Loke Flashing", desc: "Odin 4-Files Protocol" },
    { name: "Qualcomm Sahara / Firehose", desc: "EDL 9008 Emergency" },
    { name: "MTK BootROM (BROM)", desc: "SLA / DAA Auth Bypass" },
    { name: "Apple DFU / Recovery", desc: "1-Click Reboot Tool" },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12">
        {/* Background decorative circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-100/60 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>
              {isAr
                ? "منصة السوفت وير والتفليش الأولى عبر المتصفح مباشرة بالـ WebUSB"
                : "Next-Gen WebUSB Smartphone Flashing & Software Platform"}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.2]">
            {isAr ? (
              <>
                منصة السوفت وير والتفليش الشاملة <br />
                <span className="text-indigo-600">بدون بوكسات أو تثبيت برامج</span>
              </>
            ) : (
              <>
                Ultimate Flashing & Software Suite <br />
                <span className="text-indigo-600">Zero Drivers. Pure WebUSB.</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? "تحكم مباشر بالهاتف عبر منفذ USB، تفليش أودين لسامسونج، إنعاش هواتف كوالكوم EDL 9008 وميديا تك BROM، تخطي حمايات FRP و MDM، خدمات ماك بوك السحابية، ومخططات نقاط التيست بوينت لوضعيات التفليش."
              : "Direct browser-to-device communication for mobile software technicians. Flash Odin ROMs, unbrick Qualcomm EDL 9008, bypass MTK BROM, FRP/MDM unlocking, MacBook server credits, and EDL test point guides."}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onStartApp}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Usb className="w-4 h-4" />
              <span>{isAr ? "افتح منصة السوفت وير والتفليش الآن" : "Launch Software Flasher Workspace"}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>

            {!currentUser ? (
              <>
                <button
                  onClick={onGoLogin}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-slate-600" />
                  <span>{isAr ? "تسجيل دخول فني" : "Technician Login"}</span>
                </button>

                <button
                  onClick={onGoSignup}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-indigo-400" />
                  <span>{isAr ? "انضمام كمركز صيانة" : "Create Account"}</span>
                </button>
              </>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {isAr ? `مرحباً بك: ${currentUser.name}` : `Active Session: ${currentUser.name}`}
                </span>
              </div>
            )}
          </div>

          {/* Quick Platform Proof Metrics */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center font-mono">
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-xl font-bold text-slate-800">18,400+</div>
              <div className="text-[11px] text-slate-500 font-sans font-medium mt-0.5">
                {isAr ? "هاتف تم إصلاحه" : "Devices Repaired"}
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-xl font-bold text-indigo-600">99.4%</div>
              <div className="text-[11px] text-slate-500 font-sans font-medium mt-0.5">
                {isAr ? "نسبة نجاح التفليش" : "Success Rate"}
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-xl font-bold text-emerald-600">0 ms</div>
              <div className="text-[11px] text-slate-500 font-sans font-medium mt-0.5">
                {isAr ? "تأخير استجابة WebUSB" : "Direct Latency"}
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="text-xl font-bold text-slate-800">100%</div>
              <div className="text-[11px] text-slate-500 font-sans font-medium mt-0.5">
                {isAr ? "يعمل بالمتصفح" : "Browser Native"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Protocols Strip */}
      <section className="bg-white border-y border-slate-200 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            {isAr ? "بروتوكولات السوفت وير والتفليش المدعومة أصلياً" : "Supported Native Web Software & Flashing Protocols"}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {protocols.map((p, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center"
              >
                <div className="text-xs font-bold text-slate-800">{p.name}</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {isAr ? "أقوى أدوات السوفت وير والتفليش في واجهة واحدة" : "Comprehensive Flashing & Software Suite"}
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            {isAr
              ? "حلول شاملة ومتطورة لتفليش الرومات، فك البوت لودر، تخطي حمايات FRP/MDM، واستعادة الأجهزة عبر نقاط التيست بوينت"
              : "Built specifically for modern GSM software technicians, ROM flashers, and security unlockers."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl border ${f.bgColor}`}>{f.icon}</div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {isAr ? f.titleAr : f.titleEn}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {isAr ? f.descAr : f.descEn}
                </p>
              </div>

              <button
                onClick={onStartApp}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 pt-2 cursor-pointer"
              >
                <span>{isAr ? "تجربة الأداة الآن" : "Launch Feature"}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing & Activation Plans Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? "أسعار تفعيل التراخيص الرسمية" : "Official License Pricing"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {isAr ? "خطط وباقات تفعيل منصة GD GSM" : "GD GSM Subscription & Activation Plans"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {isAr
              ? "تفعيل فوري مباشر بدون انتظار مع دعم التحديثات اليومية ومستودع الفلاشات ومبرمجات الفايرهوس"
              : "Instant license activation with unlimited flashing, FRP removal, and daily cloud firmware repo access."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Plan 1: 3 Months - $34 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  {isAr ? "تفعيل 3 شهور" : "3 Months Plan"}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">90 {isAr ? "يوم" : "Days"}</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">$34</span>
                  <span className="text-xs text-slate-500 font-bold">{isAr ? "دوﻻر / 3 شهور" : "USD / 3 Mo"}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr ? "مثالي للفنيين المبتدئين والورش الفردية" : "Ideal for solo technicians and small workshops"}
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? "تخطي FRP وسامسونج أودين غير محدود" : "Unlimited FRP & Samsung Odin Flashing"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? "دعم معالجات Qualcomm EDL & MTK BROM" : "Qualcomm EDL & MTK BROM Support"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? "تغيير كود CSC وتفعيل التسجيل" : "CSC Change & Call Recording"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? "تحديثات مستمرة طوال 90 يوماً" : "Regular updates for 90 days"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onGoSignup}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer text-center"
            >
              {isAr ? "تفعيل 3 شهور ($34)" : "Activate 3 Months ($34)"}
            </button>
          </div>

          {/* Plan 2: 6 Months - $57 */}
          <div className="bg-white border-2 border-indigo-500 rounded-2xl p-6 shadow-md relative flex flex-col justify-between space-y-6">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
              {isAr ? "الأكثر طلباً" : "Most Popular"}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                  {isAr ? "تفعيل 6 شهور" : "6 Months Plan"}
                </span>
                <span className="text-xs font-mono text-indigo-600 font-bold">180 {isAr ? "يوم" : "Days"}</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-indigo-600">$57</span>
                  <span className="text-xs text-slate-500 font-bold">{isAr ? "دوﻻر / 6 شهور" : "USD / 6 Mo"}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr ? "الخيار الأمثل لمراكز الصيانة النشطة" : "Best for active mobile maintenance shops"}
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{isAr ? "كافة ميزات باقة 3 شهور بالكامل" : "All 3-Months features included"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{isAr ? "تخطي شاومي Mi Account وسيرفر Auth" : "Xiaomi Mi Account & Auth Bypass"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{isAr ? "سرعة تنزيل فائقة للفلاشات واللودرات" : "High-speed firmware repo access"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{isAr ? "دعم فني سريع طوال 180 يوماً" : "Priority technical support for 180 days"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onGoSignup}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer text-center"
            >
              {isAr ? "تفعيل 6 شهور ($57)" : "Activate 6 Months ($57)"}
            </button>
          </div>

          {/* Plan 3: 12 Months - $100 (Best Value) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                  {isAr ? "تفعيل 12 شهر (سنة كاملة)" : "12 Months VIP Plan"}
                </span>
                <span className="text-xs font-mono text-emerald-600 font-bold">365 {isAr ? "يوم" : "Days"}</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">$100</span>
                  <span className="text-xs text-slate-500 font-bold">{isAr ? "دوﻻر / سنة كاملة" : "USD / 12 Mo"}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr ? "أعلى توفير وأقوى ترخيص لكبار مراكز الصيانة" : "Maximum value for professional repair labs"}
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? "وصول VIP شامل لكافة معالجات 2025/2026" : "Full VIP access to all 2025/2026 chipsets"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? "أقوى مبرمجات Qualcomm Firehose ELF" : "Exclusive Qualcomm Firehose Loaders"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? "مخططات التيست بوينت والممانعات كاملة" : "Complete Test Points & Diode Schematics"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? "ترخيص سنوي VIP دائم ومستمر" : "Full 365 Days Unrestricted License"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onGoSignup}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer text-center"
            >
              {isAr ? "تفعيل 12 شهر ($100)" : "Activate 12 Months ($100)"}
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Simulation Preview CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold font-mono">
              <Activity className="w-3.5 h-3.5" />
              <span>Full WebUSB Sandbox Available</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
              {isAr
                ? "جاهز لتجربة الصيانة بدون مخاطرة؟"
                : "Ready to test live hardware commands?"}
            </h2>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              {isAr
                ? "نوفر محاكياً تفاعلياً مدمجاً لأجهزة Samsung Galaxy S24 و Xiaomi و Oppo و iPhone لتجربة أوامر Fastboot و ADB وفحص الممانعات دون الحاجة لربط هاتف حقيقي فوراً."
                : "Explore our rich interactive simulation profiles with preloaded telemetry, battery thermal curves, and test point schematics."}
            </p>
            <div className="pt-2">
              <button
                onClick={onStartApp}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {isAr ? "الدخول لبيئة الصيانة والمحاكي" : "Enter Interactive Workspace"}
              </button>
            </div>
          </div>

          <div className="w-full lg:w-96 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 font-bold text-[11px]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>WebUSB Active Shell</span>
              </span>
              <span>2.4 Mbps</span>
            </div>
            <div className="text-slate-500">$ adb getprop ro.boot.serialno</div>
            <div className="text-emerald-400">R5CW10X99KP (Handshake OK)</div>
            <div className="text-slate-500">$ fastboot oem device-info</div>
            <div className="text-amber-400">Device unlocked: true | FRP: 0</div>
            <div className="text-slate-500">$ qualcomm-edl send firehose_ddr.elf</div>
            <div className="text-indigo-400">Sahara Protocol v2.5 Acked: 0x00</div>
          </div>
        </div>
      </section>
    </div>
  );
};
