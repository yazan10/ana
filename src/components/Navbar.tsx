import React, { useState, useRef } from "react";
import {
  Usb,
  Cpu,
  RefreshCw,
  Globe,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Smartphone,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon,
  Home,
  Wrench,
  ChevronDown,
  Shield,
  BadgeCheck,
  Compass,
  Crown,
  MapPin,
} from "lucide-react";
import { Language, UsbDeviceInfo, ConnectionMode, User, AppView } from "../types";
import { webUsbService } from "../services/webusb";

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  currentUser: User | null;
  onLogout: () => void;
  onTriggerSecretAdminModal: () => void;
  isConnected?: boolean;
  activeMode: ConnectionMode;
  isSimulated?: boolean;
  selectedDeviceId?: string;
  onToggleConnect?: () => void;
  onConnectRealUsb?: () => void;
  onConnectRealSerial?: () => void;
  onSelectMockDevice?: (id: string) => void;
  onModeChange?: (mode: ConnectionMode) => void;
  usbInfo?: UsbDeviceInfo;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  currentView,
  onNavigate,
  currentUser,
  onLogout,
  onTriggerSecretAdminModal,
  isConnected = true,
  activeMode,
  onToggleConnect,
  onConnectRealUsb,
  onConnectRealSerial,
  usbInfo,
}) => {
  const [connecting, setConnecting] = useState(false);
  const [usbMenuOpen, setUsbMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Secret 6-clicks on logo tracker
  const clickCountRef = useRef<number>(0);
  const lastClickTimeRef = useRef<number>(0);

  const isAr = lang === "ar";
  const device = usbInfo || webUsbService.getDeviceInfo();

  const handleLogoClick = () => {
    const now = Date.now();
    // If more than 2 seconds since last click, reset counter
    if (now - lastClickTimeRef.current > 2000) {
      clickCountRef.current = 1;
    } else {
      clickCountRef.current += 1;
    }
    lastClickTimeRef.current = now;

    if (clickCountRef.current >= 6) {
      clickCountRef.current = 0;
      onTriggerSecretAdminModal();
    }
  };

  const handleConnectUsb = async () => {
    setConnecting(true);
    setUsbMenuOpen(false);
    try {
      if (onConnectRealUsb) {
        await onConnectRealUsb();
      } else if (onToggleConnect) {
        await onToggleConnect();
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectSerial = async () => {
    setConnecting(true);
    setUsbMenuOpen(false);
    try {
      if (onConnectRealSerial) {
        await onConnectRealSerial();
      } else if (onToggleConnect) {
        await onToggleConnect();
      }
    } finally {
      setConnecting(false);
    }
  };

  const getModeBadge = () => {
    switch (activeMode) {
      case "adb":
        return { text: "ADB Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "fastboot":
        return { text: "Fastboot Mode", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "qualcomm_edl":
        return { text: "EDL 9008 Mode", color: "bg-purple-50 text-purple-700 border-purple-200" };
      case "mtk_brom":
        return { text: "MTK BootROM", color: "bg-cyan-50 text-cyan-700 border-cyan-200" };
      case "samsung_odin":
        return { text: "Samsung Odin / Loke", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "apple_recovery":
      case "apple_dfu":
        return { text: "Recovery / DFU", color: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { text: "USB / Serial Port", color: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  const badge = getModeBadge();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & App Title with 6-click trigger */}
        <div className="flex items-center gap-6">
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer select-none group"
            title="GD GSM"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 uppercase flex items-center gap-1.5 font-sans">
                  <span>GD</span>
                  <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">GSM</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold tracking-normal uppercase">
                    v4.2
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isAr ? "منصة فحص وصيانة وتفليش الهواتف الذكية عبر الويب" : "Direct WebUSB Hardware Flasher & Diagnostics"}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate("landing")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currentView === "landing"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{isAr ? "الرئيسية" : "Home"}</span>
            </button>

            <button
              onClick={() => onNavigate("services_market")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currentView === "services_market"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isAr ? "سوق ومحيط الخدمات" : "Services Market"}</span>
            </button>

            <button
              onClick={() => onNavigate("app")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currentView === "app"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isAr ? "بيئة الصيانة والتفليش" : "Workspace"}</span>
            </button>
          </nav>
        </div>

        {/* Workspace specific port indicator badge */}
        {currentView === "app" && (
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isConnected ? "bg-emerald-400 opacity-75" : "bg-slate-300"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isConnected ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
              </span>
              <div className="flex flex-col text-xs">
                <span className="font-bold text-slate-800 truncate max-w-[140px] sm:max-w-[200px]">
                  {webUsbService.getConnectedPortName()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  WebUSB / WebSerial Engine Ready
                </span>
              </div>
            </div>

            <div className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border ${badge.color}`}>
              {badge.text}
            </div>
          </div>
        )}

        {/* Action Controls & User Auth Area */}
        <div className="flex items-center gap-2">
          {/* USB Connect Dropdown in workspace */}
          {currentView === "app" && (
            <div className="relative">
              <button
                id="btn-connect-hardware-main"
                onClick={() => setUsbMenuOpen(!usbMenuOpen)}
                disabled={connecting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Usb className="w-3.5 h-3.5" />
                <span>{isAr ? "ربط الهاتف (USB / COM)" : "Connect Hardware"}</span>
              </button>

              {usbMenuOpen && (
                <div className="absolute right-0 mt-2 w-68 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-widest">
                    {isAr ? "اختيار منفذ الاتصال بالهاتف" : "Hardware Interface Pickers"}
                  </div>
                  <button
                    onClick={handleConnectUsb}
                    className="w-full text-start flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-indigo-50 text-xs text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Usb className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{isAr ? "منفذ WebUSB المباشر" : "WebUSB Direct Port"}</div>
                      <div className="text-[10px] text-slate-500">ADB, Fastboot, Odin Loke, EDL 9008, BROM</div>
                    </div>
                  </button>
                  <button
                    onClick={handleConnectSerial}
                    className="w-full text-start flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-amber-50 text-xs text-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{isAr ? "منفذ WebSerial (COM / Modem)" : "WebSerial (Modem AT Port)"}</div>
                      <div className="text-[10px] text-slate-500">AT Commands, CSC Changer, FRP *#0*#</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="max-w-[90px] sm:max-w-[120px] truncate">{currentUser.name}</span>
                {currentUser.isBlueBadgeVerified && (
                  <BadgeCheck className="w-4 h-4 text-blue-600 fill-blue-100 shrink-0" title={isAr ? "موثق بالشارة الزرقاء ✓" : "Verified"} />
                )}
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {userDropdownOpen && (
                <div className="absolute left-0 sm:right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95 text-xs space-y-2">
                  <div className="p-2 border-b border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-slate-900 flex items-center gap-1">
                        <span>{currentUser.name}</span>
                        {currentUser.isBlueBadgeVerified && (
                          <BadgeCheck className="w-4 h-4 text-blue-600 fill-blue-100" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {currentUser.accountType === "publisher"
                          ? isAr
                            ? "ناشر صيانة"
                            : "Publisher"
                          : isAr
                          ? "مستخدم عادي"
                          : "User"}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono truncate">{currentUser.email}</div>

                    {/* Workplace and Nationality */}
                    <div className="pt-1 text-[11px] text-slate-600 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate">{currentUser.country} - {currentUser.city}</span>
                      </div>
                      {currentUser.village && (
                        <div className="text-[10px] text-slate-400 pl-4 pr-4">
                          {currentUser.village} ({currentUser.workPerimeter})
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[10px] text-slate-500">{currentUser.plan}</span>
                      <span className="text-[11px] font-mono text-slate-700 font-bold">
                        {currentUser.credits} pts
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate("services_market");
                      }}
                      className="w-full text-start flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 text-indigo-700 font-bold cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{isAr ? "سوق خدمات الصيانة ومحيط العمل" : "Services Market Hub"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate("app");
                      }}
                      className="w-full text-start flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isAr ? "لوحة أدوات الصيانة والتفليش" : "Flasher & Repair Workspace"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-start flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 font-bold cursor-pointer pt-1 border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isAr ? "تسجيل الخروج" : "Sign Out"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate("login")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isAr ? "تسجيل الدخول" : "Sign In"}</span>
              </button>
              <button
                onClick={() => onNavigate("signup")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isAr ? "إنشاء حساب" : "Sign Up"}</span>
              </button>
            </div>
          )}

          {/* Language Switcher */}
          <button
            id="btn-toggle-language"
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isAr ? "EN" : "عربي"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
