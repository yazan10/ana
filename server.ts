import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy or safe Gemini initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      serverTime: new Date().toISOString(),
      webUsbSupport: true,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // AI Diagnostic Endpoint
  app.post("/api/ai-diagnose", async (req, res) => {
    try {
      const {
        brand,
        model,
        mode,
        symptoms,
        currentDrawMa,
        voltageMv,
        logcatSnippet,
        errorCode,
        lang = "ar",
      } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured in environment.",
          fallbackDiagnosis: {
            title: lang === "ar" ? "تشخيص قياسي أولي" : "Standard Diagnostic",
            summary:
              lang === "ar"
                ? "يرجى التحقق من مسارات الشحن والجهد VBUS / VBAT والتأكد من استجابة الدائرة."
                : "Please inspect VBUS/VBAT charging lines and check motherboard current draw.",
            recommendedSteps: [
              lang === "ar"
                ? "فحص سحب التيار على الباور سبلاي عند الضغط على زر الباور"
                : "Check DC power supply current draw when pressing power key",
              lang === "ar"
                ? "فحص ممانعات كونيكتور البطارية ومنفذ USB Type-C"
                : "Check diode mode readings on battery connector and Type-C port",
              lang === "ar"
                ? "فحص خرج منظمات الجهد LDO ودوائر الباور PMIC"
                : "Measure PMIC buck coils and LDO output voltages",
            ],
            possibleFaultyICs: ["PMIC (Power IC)", "Charging IC / U2", "eMMC/UFS Memory"],
          },
        });
      }

      const prompt = `
You are a master mobile hardware & software repair engineer (خبير صيانة هواتف ذكية متقدم عتاد وبرمجة).
Analyze this smartphone repair diagnostic case:

Device Info:
- Brand: ${brand || "Generic/Android"}
- Model: ${model || "Unknown"}
- Connection Mode: ${mode || "ADB/Fastboot/EDL"}
- Technician Reported Symptoms: ${symptoms || "No specific symptoms reported"}
- DC Power Supply Current Draw: ${currentDrawMa ? `${currentDrawMa} mA` : "Not measured"}
- Battery/Line Voltage: ${voltageMv ? `${voltageMv} mV` : "Standard 3.8-4.2V"}
- Error Code / Flashing Status: ${errorCode || "None"}
${logcatSnippet ? `- Logcat/Crash Logs: \n${logcatSnippet.substring(0, 1500)}` : ""}

Target Language: ${lang === "ar" ? "Arabic (العربية)" : "English"}

Provide a comprehensive, highly actionable technical repair diagnosis with:
1. Exact Root Cause Analysis (تحليل العطل بدقة عتاد أو سوفت وير)
2. Power Supply Current Signature Interpretation (تفسير سحبة الباور سبلاي)
3. Step-by-Step Diagnostic & Measurement Sequence (خطوات القياس بالمتر وفحص الممانعات Diode Mode)
4. Suspected Components / ICs with their standard roles (e.g. PMIC, Charging IC, Tristar/Hydra, CPU, UFS/eMMC, Audio Codec, Baseband)
5. Voltage Injection / Short-circuit isolation tips if applicable
6. Software / Firmware solution if the issue is bootloop or partition corruption.

Return the response formatted strictly as a JSON object matching this structure:
{
  "title": "Short title of diagnosis",
  "faultCategory": "Hardware Short | Software Bootloop | Charging Circuit | Baseband/Network | Display/Backlight | CPU/Memory",
  "confidenceScore": 92,
  "summary": "Clear executive summary of the issue",
  "powerSupplyAnalysis": "Analysis of the current draw pattern (e.g. 0.08A freeze, short on VDD_MAIN, pulse drop)",
  "measurementPoints": [
    {"point": "VBUS 5V Line", "expectedValue": "5.0V - 5.2V", "actionIfAbnormal": "Replace OVP IC or check charging flex"},
    {"point": "VBAT / VPH_PWR", "expectedValue": "3.8V - 4.2V / Diode Mode ~0.350-0.450V", "actionIfAbnormal": "Check primary short with thermal camera / rosin flux"}
  ],
  "stepByStepFix": [
    "Step 1...",
    "Step 2...",
    "Step 3..."
  ],
  "suspectedICs": ["IC Name 1", "IC Name 2"],
  "softwareCommands": ["fastboot getvar all", "adb reboot recovery"],
  "technicianSafetyWarning": "Important precautions for micro-soldering or flashing"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "{}";
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = { rawText: responseText };
      }

      res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.error("AI Diagnose Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate diagnosis." });
    }
  });

  // Error Code Explainer Endpoint
  app.post("/api/explain-error", async (req, res) => {
    try {
      const { code, toolName, brand, lang = "ar" } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          explanation: {
            code,
            meaning: `Error occurred in ${toolName || "tool"}`,
            solutions: [
              "Verify USB cable and port connection (Use USB 2.0 direct port)",
              "Reinstall OEM USB Drivers (Samsung / MTK / Qualcomm)",
              "Ensure device is in the correct mode (Download / Bootloader / EDL)",
            ],
          },
        });
      }

      const prompt = `
Explain the mobile flashing/repair error code: "${code}"
Context: Tool/Platform: "${toolName || "General"}", Brand: "${brand || "All Brands"}".
Language: ${lang === "ar" ? "Arabic" : "English"}.

Provide:
1. Exact meaning of this error code.
2. Common root causes (e.g. damaged partition table, locked bootloader, faulty USB cable, damaged EMMC/UFS memory, incorrect PIT/Scatter file).
3. 3-4 Direct solutions to resolve this error immediately.

Return as JSON:
{
  "code": "${code}",
  "meaning": "Clear explanation",
  "causes": ["cause 1", "cause 2"],
  "solutions": ["solution 1", "solution 2", "solution 3"],
  "proTip": "Expert technician tip"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      let result = {};
      try {
        result = JSON.parse(response.text || "{}");
      } catch {
        result = { raw: response.text };
      }

      res.json({ success: true, explanation: result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mobile Repair WebUSB Suite server running on http://localhost:${PORT}`);
  });
}

startServer();
