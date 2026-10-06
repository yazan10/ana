import React, { useState, useEffect } from "react";
import {
  Smartphone,
  ShieldCheck,
  Package,
  Cpu,
  BatteryCharging,
  Layers,
  MapPin,
  Sparkles,
  Terminal,
  Activity,
  Zap,
  Wrench,
  FolderDown,
  Compass,
} from "lucide-react";
import { ConnectionMode, DeviceTelemetry, Language, AppView, User } from "./types";
import { webUsbService } from "./services/webusb";
import { backgroundDownloader } from "./services/backgroundDownloader";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { LoginPage, SignUpPage, ForgotPasswordPage } from "./components/AuthPages";
import { AdminPanel } from "./components/AdminPanel";
import { SecretAdminModal } from "./components/SecretAdminModal";
import { YazMaintenanceWorkspace } from "./components/YazMaintenanceWorkspace";
import { DeviceOverview } from "./components/DeviceOverview";
import { FastbootCenter } from "./components/FastbootCenter";
import { AdbManager } from "./components/AdbManager";
import { SpecializedModes } from "./components/SpecializedModes";
import { TestPointsFinder } from "./components/TestPointsFinder";
import { AiDiagnosticsPanel } from "./components/AiDiagnosticsPanel";
import { TerminalView } from "./components/TerminalView";
import { BackgroundFilesHub } from "./components/BackgroundFilesHub";
import { TechnicianServicesMarket } from "./components/TechnicianServicesMarket";
import { INITIAL_USERS } from "./data/mockAdminData";
import { authService } from "./services/authService";

type MainTab =
  | "yaz_workspace"
  | "services_hub"
  | "files_hub"
  | "fastboot"
  | "adb"
  | "specialized"
  | "testpoints"
  | "overview"
  | "ai"
  | "terminal";

export default function App() {
  const [lang, setLang] = useState<Language>("ar");
  const [appView, setAppView] = useState<AppView>("login"); // Start directly with the login screen
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return authService.getCurrentUser();
  });

  // Secret Admin 6-click modal
  const [isSecretAdminModalOpen, setIsSecretAdminModalOpen] = useState(false);

  // App workspace states
  const [activeTab, setActiveTab] = useState<MainTab>("yaz_workspace");
  const [activeMode, setActiveMode] = useState<ConnectionMode>("samsung_odin");
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>(webUsbService.getTelemetry());
  const [fastbootVars, setFastbootVars] = useState<{ [key: string]: string }>(
    webUsbService.getFastbootVars()
  );

  const isAr = lang === "ar";

  // Save current user in storage
  useEffect(() => {
    authService.setCurrentUser(currentUser);
  }, [currentUser]);

  // Subscribe to live telemetry and connection updates
  useEffect(() => {
    const unsubTelemetry = webUsbService.onTelemetry((t) => {
      setTelemetry({ ...t });
    });

    const unsubConn = webUsbService.onConnectionChange((connected, mode) => {
      setIsConnected(connected);
      setActiveMode(mode);
    });

    return () => {
      unsubTelemetry();
      unsubConn();
    };
  }, []);

  const handleToggleConnect = async () => {
    if (isConnected) {
      await webUsbService.disconnect();
      setIsConnected(false);
    } else {
      const res = await webUsbService.requestPhysicalUsbDevice();
      if (res.success) {
        setIsConnected(true);
      }
    }
  };

  const handleConnectRealUsb = async () => {
    await webUsbService.requestPhysicalUsbDevice();
  };

  const handleConnectRealSerial = async () => {
    await webUsbService.requestPhysicalSerialPort();
  };

  const handleSelectMockDevice = (deviceId: string) => {
    webUsbService.selectMockDevice(deviceId);
    setTelemetry({ ...webUsbService.getTelemetry() });
    setFastbootVars({ ...webUsbService.getFastbootVars() });
  };

  const handleModeChange = (mode: ConnectionMode) => {
    setActiveMode(mode);
    webUsbService.switchMode(mode);
  };

  const handleRunCommand = async (cmd: string) => {
    return await webUsbService.executeCommand(cmd);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setAppView("login");
  };

  const handleAdminSuccess = () => {
    setIsSecretAdminModalOpen(false);
    setAppView("admin");
  };

  const tabs: Array<{ id: MainTab; labelAr: string; labelEn: string; icon: React.ReactNode }> = [
    {
      id: "yaz_workspace",
      labelAr: "منصة السوفت وير والتفليش الرئيسية",
      labelEn: "GD GSM Flasher & Software Suite",
      icon: <Wrench className="w-4 h-4 text-indigo-600" />,
    },
    {
      id: "services_hub",
      labelAr: "سوق ومحيط خدمات الفنيين",
      labelEn: "Services & Tech Perimeter",
      icon: <Compass className="w-4 h-4 text-indigo-600" />,
    },
    {
      id: "files_hub",
      labelAr: "الرومات والتعريفات بالخلفية",
      labelEn: "ROMs & Drivers Hub",
      icon: <FolderDown className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: "fastboot",
      labelAr: "الفاست بوت والبوت لودر",
      labelEn: "Fastboot & Unlock",
      icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
    },
    {
      id: "adb",
      labelAr: "إدارة وتثبيت حزم السوفت وير ADB",
      labelEn: "ADB Software & Debloater",
      icon: <Package className="w-4 h-4 text-teal-600" />,
    },
    {
      id: "specialized",
      labelAr: "أدوات البراندات والتفليش المتقدم",
      labelEn: "Specialized OEM Flashing",
      icon: <Layers className="w-4 h-4 text-purple-600" />,
    },
    {
      id: "testpoints",
      labelAr: "التيست بوينت لوضعيات EDL و BROM",
      labelEn: "Test Points (EDL / BROM)",
      icon: <MapPin className="w-4 h-4 text-amber-600" />,
    },
    {
      id: "overview",
      labelAr: "بيانات النظام والروم",
      labelEn: "Software & ROM Info",
      icon: <Smartphone className="w-4 h-4 text-slate-700" />,
    },
    {
      id: "ai",
      labelAr: "مساعد السوفت وير الذكي Gemini",
      labelEn: "Gemini Software AI",
      icon: <Sparkles className="w-4 h-4 text-cyan-600" />,
    },
    {
      id: "terminal",
      labelAr: "الطرفية وأوامر السوفت وير USB",
      labelEn: "Software Terminal & USB Packets",
      icon: <Terminal className="w-4 h-4 text-slate-800" />,
    },
  ];

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-[#F4F5F7] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white"
    >
      {/* Top Main Navbar */}
      <Navbar
        lang={lang}
        onToggleLang={() => setLang(lang === "ar" ? "en" : "ar")}
        currentView={appView}
        onNavigate={(v) => setAppView(v)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onTriggerSecretAdminModal={() => setIsSecretAdminModalOpen(true)}
        isConnected={isConnected}
        activeMode={activeMode}
        isSimulated={false}
        onToggleConnect={handleToggleConnect}
        onConnectRealUsb={handleConnectRealUsb}
        onConnectRealSerial={handleConnectRealSerial}
        onSelectMockDevice={handleSelectMockDevice}
        onModeChange={handleModeChange}
      />

      {/* Secret Admin Authentication Modal (Opens upon 6 consecutive clicks on platform logo with password 'jana') */}
      <SecretAdminModal
        isOpen={isSecretAdminModalOpen}
        onClose={() => setIsSecretAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
        lang={lang}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* 1. LANDING PAGE VIEW */}
        {appView === "landing" && (
          <LandingPage
            lang={lang}
            currentUser={currentUser}
            onStartApp={() => setAppView("app")}
            onGoLogin={() => setAppView("login")}
            onGoSignup={() => setAppView("signup")}
            onLogoClick={() => setIsSecretAdminModalOpen(true)}
          />
        )}

        {/* 2. LOGIN VIEW */}
        {appView === "login" && (
          <LoginPage
            lang={lang}
            onNavigate={(v) => setAppView(v)}
            onLoginSuccess={(usr) => setCurrentUser(usr)}
          />
        )}

        {/* 3. SIGNUP VIEW */}
        {appView === "signup" && (
          <SignUpPage
            lang={lang}
            onNavigate={(v) => setAppView(v)}
            onLoginSuccess={(usr) => setCurrentUser(usr)}
          />
        )}

        {/* 4. FORGOT PASSWORD VIEW */}
        {appView === "forgot_password" && (
          <ForgotPasswordPage
            lang={lang}
            onNavigate={(v) => setAppView(v)}
            onLoginSuccess={(usr) => setCurrentUser(usr)}
          />
        )}

        {/* 5. SERVICES MARKET VIEW */}
        {appView === "services_market" && (
          <TechnicianServicesMarket
            lang={lang}
            currentUser={currentUser}
            onUpdateCurrentUser={(usr) => setCurrentUser(usr)}
            onGoLogin={() => setAppView("login")}
            onGoSignUp={() => setAppView("signup")}
          />
        )}

        {/* 6. MASTER ADMIN CONSOLE VIEW */}
        {appView === "admin" && (
          <AdminPanel
            lang={lang}
            onExitAdmin={() => setAppView("landing")}
          />
        )}

        {/* 6. MAIN HARDWARE & SOFTWARE WORKSPACE VIEW */}
        {appView === "app" && (
          <div className="space-y-3">
            {/* Navigation Tabs Bar */}
            <nav
              id="main-navigation-tabs"
              aria-label="Navigation Tabs"
              className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent select-none whitespace-nowrap"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent font-medium"
                    }`}
                  >
                    <span className="shrink-0">{tab.icon}</span>
                    <span className="whitespace-nowrap leading-none">{isAr ? tab.labelAr : tab.labelEn}</span>
                  </button>
                );
              })}
            </nav>

            {/* Tab Content Panels */}
            <div className="animate-in fade-in duration-200">
              {activeTab === "yaz_workspace" && (
                <YazMaintenanceWorkspace
                  lang={lang}
                  telemetry={telemetry}
                  onRunCommand={handleRunCommand}
                  onOpenTestPoints={() => setActiveTab("testpoints")}
                  onOpenAiDiagnostics={() => setActiveTab("ai")}
                  currentUser={currentUser}
                  onGoLogin={() => setAppView("login")}
                />
              )}

              {activeTab === "services_hub" && (
                <TechnicianServicesMarket
                  lang={lang}
                  currentUser={currentUser}
                  onUpdateCurrentUser={(usr) => setCurrentUser(usr)}
                  onGoLogin={() => setAppView("login")}
                  onGoSignUp={() => setAppView("signup")}
                />
              )}

              {activeTab === "files_hub" && (
                <BackgroundFilesHub
                  lang={lang}
                  onOpenWorkspace={() => setActiveTab("yaz_workspace")}
                />
              )}

              {activeTab === "fastboot" && (
                <FastbootCenter
                  fastbootVars={fastbootVars}
                  lang={lang}
                  onRunCommand={handleRunCommand}
                />
              )}

              {activeTab === "adb" && (
                <AdbManager lang={lang} onRunCommand={handleRunCommand} />
              )}

              {activeTab === "specialized" && (
                <SpecializedModes
                  telemetry={telemetry}
                  lang={lang}
                  onRunCommand={handleRunCommand}
                />
              )}

              {activeTab === "testpoints" && <TestPointsFinder lang={lang} />}

              {activeTab === "overview" && (
                <DeviceOverview
                  telemetry={telemetry}
                  lang={lang}
                  activeMode={activeMode}
                  onRunCommand={handleRunCommand}
                />
              )}

              {activeTab === "ai" && (
                <AiDiagnosticsPanel telemetry={telemetry} lang={lang} />
              )}

              {activeTab === "terminal" && (
                <TerminalView
                  lang={lang}
                  activeMode={activeMode}
                  onRunCommand={handleRunCommand}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Global Status Bar Footer */}
      <footer className="border-t border-slate-200 bg-white py-2.5 px-6 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            <span className="font-medium text-slate-700">
              {isConnected
                ? isAr
                  ? `متصل عبر WebUSB: ${telemetry.brand} ${telemetry.model}`
                  : `WebUSB Target: ${telemetry.brand} ${telemetry.model}`
                : isAr
                ? "في انتظار توصيل جهاز USB..."
                : "Awaiting USB Device Connection..."}
            </span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400 font-medium">Protocol: WebUSB Direct Bulk CDC / WebSerial</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <button
            onClick={() => setActiveTab("files_hub")}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            title={isAr ? "مركز التعريفات والملفات المحملة بالخلفية" : "Background Drivers & Tools Hub"}
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span>{isAr ? "التعريفات والملفات: 18 حزمة جاهزة (100%)" : "Drivers & Files: 18 Cached (100%)"}</span>
          </button>
          <span>•</span>
          <span className="text-indigo-600 font-bold">GD GSM v4.2</span>
          <span>•</span>
          <span>{isAr ? "محرك الصيانة الفوري المباشر" : "Hardware Direct USB Engine"}</span>
        </div>
      </footer>
    </div>
  );
}
