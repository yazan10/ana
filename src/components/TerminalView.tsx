import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Trash2,
  Layers,
  Cpu,
  Zap,
  Activity,
} from "lucide-react";
import { Language, ConnectionMode, UsbPacketLog } from "../types";
import { webUsbService } from "../services/webusb";

interface TerminalViewProps {
  lang: Language;
  activeMode: ConnectionMode;
  onRunCommand: (cmd: string) => Promise<{ success: boolean; output: string }>;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  lang,
  activeMode,
  onRunCommand,
}) => {
  const [activeTab, setActiveTab] = useState<"terminal" | "packets">("terminal");
  const [commandInput, setCommandInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [lines, setLines] = useState<Array<{ type: "cmd" | "out" | "err" | "info"; text: string; time: string }>>([
    {
      type: "info",
      text: "WebUSB Diagnostic & Shell Terminal v2.4.0 ready.",
      time: new Date().toLocaleTimeString(),
    },
    {
      type: "info",
      text: "Type 'help' to view available commands or pick quick command chips below.",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [packets, setPackets] = useState<UsbPacketLog[]>([]);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const isAr = lang === "ar";

  useEffect(() => {
    const unsub = webUsbService.onPacket((pkt) => {
      setPackets((prev) => [...prev.slice(-100), pkt]);
    });
    return unsub;
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, activeTab]);

  const executeCommand = async (cmdToRun: string) => {
    const trimmed = cmdToRun.trim();
    if (!trimmed) return;

    const time = new Date().toLocaleTimeString();
    setLines((prev) => [...prev, { type: "cmd", text: `$ ${trimmed}`, time }]);
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setCommandInput("");

    if (trimmed.toLowerCase() === "clear") {
      setLines([]);
      return;
    }

    if (trimmed.toLowerCase() === "help") {
      setLines((prev) => [
        ...prev,
        {
          type: "info",
          text: `Available Quick Commands:
  • adb devices                      - List connected USB targets
  • adb get-state                    - Query ADB link status
  • adb shell getprop                - Dump Android system properties
  • adb shell dumpsys battery        - Read low-level battery sensor
  • adb shell wm size                - Check screen resolution
  • fastboot devices                 - Query bootloader targets
  • fastboot getvar all              - Read all bootloader variables
  • adb reboot recovery              - Boot into stock/custom recovery
  • adb reboot bootloader            - Boot into fastboot mode
  • adb reboot edl                   - Emergency Download Mode 9008`,
          time,
        },
      ]);
      return;
    }

    try {
      const res = await onRunCommand(trimmed);
      setLines((prev) => [
        ...prev,
        {
          type: res.success ? "out" : "err",
          text: res.output || "(Command completed with no output)",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (e: any) {
      setLines((prev) => [
        ...prev,
        {
          type: "err",
          text: `Error: ${e.message || "Command failed"}`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(commandInput);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setCommandInput(history[nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex >= history.length) {
          setHistoryIndex(-1);
          setCommandInput("");
        } else {
          setHistoryIndex(nextIndex);
          setCommandInput(history[nextIndex]);
        }
      }
    }
  };

  const copyTerminalOutput = () => {
    const fullText = lines.map((l) => `[${l.time}] ${l.text}`).join("\n");
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickCommands = [
    { label: "adb devices", cmd: "adb devices" },
    { label: "adb shell getprop", cmd: "adb shell getprop" },
    { label: "adb shell dumpsys battery", cmd: "adb shell dumpsys battery" },
    { label: "adb shell wm size", cmd: "adb shell wm size" },
    { label: "fastboot getvar all", cmd: "fastboot getvar all" },
    { label: "fastboot devices", cmd: "fastboot devices" },
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar Tabs & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "terminal"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{isAr ? "طرفية الأوامر (ADB / Fastboot Shell)" : "ADB & Fastboot Shell"}</span>
          </button>

          <button
            onClick={() => setActiveTab("packets")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "packets"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{isAr ? "مراقب حزم الـ USB (Raw Packets)" : "USB Packet Inspector"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyTerminalOutput}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            title="Copy Terminal Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? (isAr ? "تم النسخ" : "Copied") : (isAr ? "نسخ السجل" : "Copy Output")}</span>
          </button>

          <button
            onClick={() => setLines([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{isAr ? "مسح" : "Clear"}</span>
          </button>
        </div>
      </div>

      {/* Terminal Mode */}
      {activeTab === "terminal" && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col font-mono text-xs h-[500px]">
          {/* Quick Command Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pb-3.5 border-b border-slate-800/80">
            <span className="text-[11px] text-slate-400 mr-1 font-bold">{isAr ? "أوامر سريعة:" : "Presets:"}</span>
            {quickCommands.map((q) => (
              <button
                key={q.cmd}
                onClick={() => executeCommand(q.cmd)}
                className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-300 text-[11px] font-semibold cursor-pointer transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Console Output Screen */}
          <div className="flex-1 overflow-y-auto py-3 space-y-1.5 select-text">
            {lines.map((line, idx) => {
              let textStyle = "text-slate-300";
              if (line.type === "cmd") textStyle = "text-cyan-400 font-bold";
              if (line.type === "err") textStyle = "text-rose-400 font-semibold";
              if (line.type === "info") textStyle = "text-amber-300";

              return (
                <div key={idx} className={`leading-relaxed whitespace-pre-wrap ${textStyle}`}>
                  {line.text}
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>

          {/* Command Input Prompt */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
            <span className="text-cyan-400 font-bold text-sm">$</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAr ? "اكتب أمر ADB أو Fastboot واضغط Enter..." : "Type ADB or Fastboot command and press Enter..."}
              className="flex-1 bg-transparent text-white focus:outline-hidden placeholder:text-slate-500 font-mono text-xs"
              autoFocus
            />
            <button
              onClick={() => executeCommand(commandInput)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      )}

      {/* Raw USB Packet Inspector Mode */}
      {activeTab === "packets" && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col font-mono text-xs h-[500px]">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-slate-400">
            <span className="text-indigo-400 font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Real-time USB Bulk & Interrupt Transfer Stream</span>
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">Auto-refreshing 100 packets</span>
          </div>

          <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 select-text">
            {packets.map((pkt, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-1 rounded-md hover:bg-slate-900 text-[11px]"
              >
                <span className="text-slate-500 shrink-0 font-semibold">{pkt.timestamp}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    pkt.direction === "IN" ? "bg-emerald-500/20 text-emerald-400" : "bg-cyan-500/20 text-cyan-400"
                  }`}
                >
                  {pkt.direction === "IN" ? "RX ←" : "TX →"}
                </span>
                <span className="text-purple-300 shrink-0 font-bold">{pkt.endpoint}</span>
                <span className="text-slate-400 shrink-0 font-mono">({pkt.bytes}B)</span>
                <span className="text-slate-200 break-all font-mono">{pkt.hexData}</span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}
    </div>
  );
};
