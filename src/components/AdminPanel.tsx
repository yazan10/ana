import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  HardDrive,
  Key,
  Activity,
  Settings,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Search,
  Download,
  Upload,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Server,
  Zap,
  Layers,
  Smartphone,
  Wrench,
  FolderDown,
  Terminal,
  Edit,
  FileCode,
  Tag,
  ExternalLink,
  Filter,
  ShieldCheck,
  Database,
  Sliders,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  Language,
  User,
  LicenseKey,
  FirmwareItem,
  AdminTelemetryLog,
  SoftwareDepartment,
} from "../types";
import {
  INITIAL_USERS,
  INITIAL_LICENSE_KEYS,
  INITIAL_FIRMWARES,
  INITIAL_ADMIN_LOGS,
  INITIAL_DEPARTMENTS,
} from "../data/mockAdminData";
import { authService } from "../services/authService";

interface AdminPanelProps {
  lang: Language;
  onExitAdmin: () => void;
}

type AdminTab =
  | "overview"
  | "departments"
  | "firmware"
  | "users"
  | "licenses"
  | "logs"
  | "settings";

export const AdminPanel: React.FC<AdminPanelProps> = ({
  lang,
  onExitAdmin,
}) => {
  const isAr = lang === "ar";
  const [activeTab, setActiveTab] = useState<AdminTab>("departments");

  // State with localStorage persistence
  const [departments, setDepartments] = useState<SoftwareDepartment[]>(() => {
    try {
      const saved = localStorage.getItem("yaz_admin_departments");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DEPARTMENTS;
  });

  const [firmwares, setFirmwares] = useState<FirmwareItem[]>(() => {
    try {
      const saved = localStorage.getItem("yaz_admin_firmwares");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FIRMWARES;
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const all = authService.getAllUsers();
      if (all && all.length > 0) return all;
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USERS;
  });
  const [licenses, setLicenses] = useState<LicenseKey[]>(INITIAL_LICENSE_KEYS);
  const [logs, setLogs] = useState<AdminTelemetryLog[]>(INITIAL_ADMIN_LOGS);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("yaz_admin_departments", JSON.stringify(departments));
    } catch (e) {
      console.error(e);
    }
  }, [departments]);

  useEffect(() => {
    try {
      localStorage.setItem("yaz_admin_firmwares", JSON.stringify(firmwares));
    } catch (e) {
      console.error(e);
    }
  }, [firmwares]);

  // Notifications Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Department Modal State ---
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptNameAr, setDeptNameAr] = useState("");
  const [deptNameEn, setDeptNameEn] = useState("");
  const [deptDescAr, setDeptDescAr] = useState("");
  const [deptDescEn, setDeptDescEn] = useState("");
  const [deptProtocol, setDeptProtocol] = useState("Qualcomm Sahara 9008");
  const [deptIcon, setDeptIcon] = useState("Cpu");
  const [deptColor, setDeptColor] = useState<SoftwareDepartment["colorScheme"]>("purple");
  const [deptStatus, setDeptStatus] = useState<"active" | "maintenance" | "vip_only">("active");
  const [deptBrands, setDeptBrands] = useState("Samsung, Xiaomi, Oppo, Vivo");

  // --- Programming File / Firmware Modal State ---
  const [showFileModal, setShowFileModal] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileBrand, setFileBrand] = useState("Samsung");
  const [fileModel, setFileModel] = useState("");
  const [fileVersion, setFileVersion] = useState("");
  const [fileAndroidVersion, setFileAndroidVersion] = useState("Android 15 (Latest)");
  const [fileType, setFileType] = useState("Odin 4-Files (TAR.MD5)");
  const [fileDeptId, setFileDeptId] = useState("dept_samsung");
  const [fileSizeGb, setFileSizeGb] = useState<number>(4.5);
  const [fileUrl, setFileUrl] = useState("https://dl.mobilefix.pro/firmware/release/");
  const [fileMd5, setFileMd5] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [fileStatus, setFileStatus] = useState<"active" | "vip_only" | "maintenance">("active");

  // --- User Form State ---
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserWorkshop, setNewUserWorkshop] = useState("");
  const [newUserPlan, setNewUserPlan] = useState<"Pro Technician" | "VIP Workshop">("Pro Technician");

  // --- License State ---
  const [newKeyPlan, setNewKeyPlan] = useState<"Pro Technician" | "VIP Workshop" | "Lifetime Unlimited">("VIP Workshop");
  const [newKeyDays, setNewKeyDays] = useState(365);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("all");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState(
    "تحديث جديد لملفات اللودر Firehose ورومات سامسونج 2025/2026 متاح الآن في كافة الأقسام."
  );

  // ----------------------------------------------------
  // Department Handlers
  // ----------------------------------------------------
  const handleOpenAddDept = () => {
    setEditingDeptId(null);
    setDeptNameAr("");
    setDeptNameEn("");
    setDeptDescAr("");
    setDeptDescEn("");
    setDeptProtocol("Qualcomm Sahara 9008");
    setDeptIcon("Cpu");
    setDeptColor("purple");
    setDeptStatus("active");
    setDeptBrands("Samsung, Xiaomi, Oppo, Vivo");
    setShowDeptModal(true);
  };

  const handleOpenEditDept = (dept: SoftwareDepartment) => {
    setEditingDeptId(dept.id);
    setDeptNameAr(dept.nameAr);
    setDeptNameEn(dept.nameEn);
    setDeptDescAr(dept.descriptionAr);
    setDeptDescEn(dept.descriptionEn);
    setDeptProtocol(dept.protocol);
    setDeptIcon(dept.iconName);
    setDeptColor(dept.colorScheme);
    setDeptStatus(dept.status);
    setDeptBrands(dept.supportedBrands.join(", "));
    setShowDeptModal(true);
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptNameAr.trim()) return;

    const brandList = deptBrands
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    if (editingDeptId) {
      // Update existing
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === editingDeptId
            ? {
                ...d,
                nameAr: deptNameAr,
                nameEn: deptNameEn || deptNameAr,
                descriptionAr: deptDescAr,
                descriptionEn: deptDescEn || deptDescAr,
                protocol: deptProtocol,
                iconName: deptIcon,
                colorScheme: deptColor,
                status: deptStatus,
                supportedBrands: brandList,
              }
            : d
        )
      );
      showToast(isAr ? "تم تحديث بيانات القسم بنجاح" : "Department updated successfully");
    } else {
      // Create new
      const newDept: SoftwareDepartment = {
        id: "dept_" + Date.now().toString().slice(-5),
        nameAr: deptNameAr,
        nameEn: deptNameEn || deptNameAr,
        descriptionAr: deptDescAr,
        descriptionEn: deptDescEn || deptDescAr,
        iconName: deptIcon,
        colorScheme: deptColor,
        protocol: deptProtocol,
        status: deptStatus,
        supportedBrands: brandList.length > 0 ? brandList : ["All Brands"],
        filesCount: 0,
        operationsCount: 0,
        order: departments.length + 1,
      };
      setDepartments((prev) => [...prev, newDept]);
      showToast(isAr ? "تم إضافة قسم برمجي جديد بنجاح" : "New software department added");
    }

    setShowDeptModal(false);
  };

  const handleDeleteDepartment = (deptId: string) => {
    if (
      window.confirm(
        isAr
          ? "هل أنت متأكد من حذف هذا القسم البرمجي؟"
          : "Are you sure you want to delete this department?"
      )
    ) {
      setDepartments((prev) => prev.filter((d) => d.id !== deptId));
      showToast(isAr ? "تم حذف القسم" : "Department deleted");
    }
  };

  const handleToggleDeptStatus = (deptId: string) => {
    setDepartments((prev) =>
      prev.map((d) => {
        if (d.id === deptId) {
          const nextStatus: SoftwareDepartment["status"] =
            d.status === "active"
              ? "maintenance"
              : d.status === "maintenance"
              ? "vip_only"
              : "active";
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  // ----------------------------------------------------
  // Programming Files / Firmwares Handlers
  // ----------------------------------------------------
  const handleOpenAddFile = (presetDeptId?: string) => {
    setEditingFileId(null);
    setFileName("");
    setFileBrand("Samsung");
    setFileModel("");
    setFileVersion("");
    setFileAndroidVersion("Android 15 (Latest)");
    setFileType("Odin 4-Files (TAR.MD5)");
    setFileDeptId(presetDeptId || (departments[0]?.id ?? "dept_samsung"));
    setFileSizeGb(5.2);
    setFileUrl(`https://dl.mobilefix.pro/firmware/release_${Date.now().toString().slice(-4)}.zip`);
    setFileMd5(generateRandomMd5());
    setFileDescription("");
    setFileStatus("active");
    setShowFileModal(true);
  };

  const handleOpenEditFile = (fw: FirmwareItem) => {
    setEditingFileId(fw.id);
    setFileName(fw.model);
    setFileBrand(fw.brand);
    setFileModel(fw.model);
    setFileVersion(fw.version);
    setFileAndroidVersion(fw.androidVersion);
    setFileType(fw.fileType);
    setFileDeptId(fw.departmentId || departments[0]?.id || "dept_samsung");
    setFileSizeGb(fw.sizeGb);
    setFileUrl(fw.downloadUrl);
    setFileMd5(fw.checksumMd5);
    setFileDescription(fw.description || "");
    setFileStatus(fw.status || "active");
    setShowFileModal(true);
  };

  const generateRandomMd5 = () => {
    const chars = "0123456789abcdef";
    let res = "";
    for (let i = 0; i < 32; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const handleSaveFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileModel.trim()) return;

    if (editingFileId) {
      // Update
      setFirmwares((prev) =>
        prev.map((f) =>
          f.id === editingFileId
            ? {
                ...f,
                brand: fileBrand,
                model: fileModel,
                version: fileVersion || "v1.0.0_Global",
                androidVersion: fileAndroidVersion,
                fileType: fileType,
                departmentId: fileDeptId,
                sizeGb: Number(fileSizeGb) || 1.0,
                downloadUrl: fileUrl,
                checksumMd5: fileMd5 || generateRandomMd5(),
                description: fileDescription,
                status: fileStatus,
              }
            : f
        )
      );
      showToast(isAr ? "تم تحديث بيانات ملف البرمجة" : "Programming file updated");
    } else {
      // Add
      const newFile: FirmwareItem = {
        id: "fw_" + Date.now().toString().slice(-5),
        brand: fileBrand,
        model: fileModel,
        version: fileVersion || "v1.0.0_Official_Release",
        androidVersion: fileAndroidVersion,
        fileType: fileType,
        departmentId: fileDeptId,
        sizeGb: Number(fileSizeGb) || 2.4,
        downloadUrl: fileUrl,
        checksumMd5: fileMd5 || generateRandomMd5(),
        downloadCount: 0,
        description: fileDescription,
        status: fileStatus,
        uploadedDate: new Date().toISOString().split("T")[0],
      };

      setFirmwares((prev) => [newFile, ...prev]);

      // Increment file count in selected department
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === fileDeptId ? { ...d, filesCount: d.filesCount + 1 } : d
        )
      );

      showToast(isAr ? "تمت إضافة ملف البرمجة الجديد بنجاح" : "New programming file registered");
    }

    setShowFileModal(false);
  };

  const handleDeleteFile = (fileId: string) => {
    if (
      window.confirm(
        isAr
          ? "هل أنت متأكد من حذف هذا الملف البرمجي من السيرفر؟"
          : "Are you sure you want to delete this programming file?"
      )
    ) {
      setFirmwares((prev) => prev.filter((f) => f.id !== fileId));
      showToast(isAr ? "تم حذف الملف من المستودع" : "File deleted from repository");
    }
  };

  // Mock Simulated File Upload from Disk
  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    const sizeInGb = Number((uploaded.size / (1024 * 1024 * 1024)).toFixed(2)) || 0.85;
    const nameWithoutExt = uploaded.name.replace(/\.[^/.]+$/, "");

    setFileModel(nameWithoutExt);
    setFileSizeGb(sizeInGb);
    setFileMd5(generateRandomMd5());
    setFileUrl(`https://cdn.mobilefix.pro/storage/uploads/${encodeURIComponent(uploaded.name)}`);

    // Detect type by extension
    const ext = uploaded.name.split(".").pop()?.toLowerCase();
    if (ext === "md5" || ext === "tar") {
      setFileType("Odin 4-Files (TAR.MD5)");
      setFileBrand("Samsung");
      setFileDeptId("dept_samsung");
    } else if (ext === "elf" || ext === "mbn") {
      setFileType("Qualcomm Firehose (ELF/MBN)");
      setFileDeptId("dept_qualcomm");
    } else if (ext === "txt" && uploaded.name.toLowerCase().includes("scatter")) {
      setFileType("BROM Scatter");
      setFileDeptId("dept_mtk");
    } else if (ext === "ipsw") {
      setFileType("IPSW / DFU");
      setFileBrand("Apple");
      setFileDeptId("dept_apple_mac");
    } else if (ext === "apk") {
      setFileType("FRP & Knox Payload APK");
      setFileDeptId("dept_frp_mdm");
    } else if (ext === "pac") {
      setFileType("SPD / Unisoc PAC File");
      setFileDeptId("dept_unisoc");
    }

    showToast(
      isAr
        ? `تم فحص وتجهيز الملف: ${uploaded.name} (${sizeInGb} GB)`
        : `Inspected & attached: ${uploaded.name}`
    );
  };

  // ----------------------------------------------------
  // User Management Handlers
  // ----------------------------------------------------
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u
      )
    );
  };

  const handleAddCredits = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, credits: u.credits + 50 } : u
      )
    );
    showToast(isAr ? "تم شحن 50 رصيد للفني" : "50 credits added to user");
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const created: User = {
      id: "usr_" + Date.now().toString().slice(-4),
      name: newUserName,
      email: newUserEmail,
      workshopName: newUserWorkshop || "مركز صيانة فني",
      role: "technician",
      accountType: "publisher",
      nationality: "سعودي",
      country: "المملكة العربية السعودية",
      city: "الرياض",
      village: "حي العليا",
      workPerimeter: "15 كم (محيط المدينة والقرى المجاورة)",
      isPublisherActive: true,
      isBlueBadgeVerified: false,
      dailyPublishedCount: 0,
      plan: newUserPlan,
      credits: newUserPlan === "VIP Workshop" ? 500 : 150,
      joinedDate: new Date().toISOString().split("T")[0],
      status: "active",
    };

    setUsers([created, ...users]);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserWorkshop("");
    setShowAddUserModal(false);
    showToast(isAr ? "تم إضافة الفني بنجاح" : "Technician added");
  };

  // ----------------------------------------------------
  // License Generator Handlers
  // ----------------------------------------------------
  const handleGenerateKey = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const keyString = `FIXPRO-${newKeyPlan === "VIP Workshop" ? "VIP" : newKeyPlan === "Lifetime Unlimited" ? "LIFE" : "PRO"}-${randomPart}-${randomSuffix}-SYS`;

    const newKey: LicenseKey = {
      id: "lic_" + Date.now().toString().slice(-4),
      key: keyString,
      plan: newKeyPlan,
      durationDays: newKeyDays,
      status: "active",
      createdDate: new Date().toISOString().split("T")[0],
    };

    setLicenses([newKey, ...licenses]);
    showToast(isAr ? "تم توليد مفتاح التفعيل" : "License key generated");
  };

  const handleCopyKey = (keyText: string, id: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // ----------------------------------------------------
  // Helpers
  // ----------------------------------------------------
  const getDepartmentIcon = (iconName: string) => {
    switch (iconName) {
      case "Smartphone":
        return <Smartphone className="w-5 h-5" />;
      case "Cpu":
        return <Cpu className="w-5 h-5" />;
      case "Zap":
        return <Zap className="w-5 h-5" />;
      case "ShieldAlert":
        return <ShieldAlert className="w-5 h-5" />;
      case "Server":
        return <Server className="w-5 h-5" />;
      case "HardDrive":
        return <HardDrive className="w-5 h-5" />;
      case "Wrench":
        return <Wrench className="w-5 h-5" />;
      case "FolderDown":
        return <FolderDown className="w-5 h-5" />;
      case "Terminal":
        return <Terminal className="w-5 h-5" />;
      case "Layers":
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  const getColorClasses = (colorScheme: SoftwareDepartment["colorScheme"]) => {
    switch (colorScheme) {
      case "blue":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-700",
          badge: "bg-blue-100 text-blue-800",
          iconBg: "bg-blue-600 text-white",
        };
      case "emerald":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-700",
          badge: "bg-emerald-100 text-emerald-800",
          iconBg: "bg-emerald-600 text-white",
        };
      case "purple":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          text: "text-purple-700",
          badge: "bg-purple-100 text-purple-800",
          iconBg: "bg-purple-600 text-white",
        };
      case "amber":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-700",
          badge: "bg-amber-100 text-amber-800",
          iconBg: "bg-amber-600 text-white",
        };
      case "teal":
        return {
          bg: "bg-teal-50",
          border: "border-teal-200",
          text: "text-teal-700",
          badge: "bg-teal-100 text-teal-800",
          iconBg: "bg-teal-600 text-white",
        };
      case "rose":
        return {
          bg: "bg-rose-50",
          border: "border-rose-200",
          text: "text-rose-700",
          badge: "bg-rose-100 text-rose-800",
          iconBg: "bg-rose-600 text-white",
        };
      case "indigo":
      default:
        return {
          bg: "bg-indigo-50",
          border: "border-indigo-200",
          text: "text-indigo-700",
          badge: "bg-indigo-100 text-indigo-800",
          iconBg: "bg-indigo-600 text-white",
        };
    }
  };

  // Filtered Firmwares
  const filteredFirmwares = firmwares.filter((fw) => {
    const matchesSearch =
      fw.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fw.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fw.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fw.checksumMd5.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBrand =
      selectedBrandFilter === "all" ||
      fw.brand.toLowerCase() === selectedBrandFilter.toLowerCase();

    const matchesDept =
      selectedDeptFilter === "all" || fw.departmentId === selectedDeptFilter;

    return matchesSearch && matchesBrand && matchesDept;
  });

  const totalRepoSizeGb = firmwares.reduce((acc, f) => acc + f.sizeGb, 0).toFixed(1);
  const totalDownloads = firmwares.reduce((acc, f) => acc + f.downloadCount, 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 end-6 z-50 bg-slate-900 text-white border border-indigo-500/40 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-md">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">
                {isAr
                  ? "لوحة تحكم المشرف العام وإدارة الأقسام والبرمجة"
                  : "Super Admin & Programming File Manager"}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500 text-white font-bold uppercase tracking-wider">
                Root Access
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              {isAr
                ? "إضافة وإدارة الأقسام البرمجية، رفع ملفات السوفت وير والرومات، التحكم بالفنيين ومفاتيح التفعيل"
                : "Manage software departments, upload firmware & loaders, regulate technician licenses, and review logs."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={() => handleOpenAddDept()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "إضافة قسم برمجي" : "Add Department"}</span>
          </button>

          <button
            onClick={() => handleOpenAddFile()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{isAr ? "إضافة ملف برمجة" : "Add ROM File"}</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>{isAr ? "خروج" : "Exit"}</span>
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto select-none">
        <button
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
            activeTab === "departments"
              ? "bg-slate-900 text-white font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
          }`}
        >
          <Layers className="w-4 h-4 text-purple-400" />
          <span>{isAr ? "إدارة الأقسام والبرمجيات" : "Departments & Services"}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 font-mono font-bold">
            {departments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("firmware")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
            activeTab === "firmware"
              ? "bg-slate-900 text-white font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
          }`}
        >
          <HardDrive className="w-4 h-4 text-emerald-500" />
          <span>{isAr ? "ملفات البرمجة والرومات" : "Programming Files & ROMs"}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold">
            {firmwares.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-slate-900 text-white font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
          }`}
        >
          <Activity className="w-4 h-4 text-blue-500" />
          <span>{isAr ? "نظرة عامة وإحصائيات" : "Analytics & Overview"}</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-slate-900 text-white font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
          }`}
        >
          <Users className="w-4 h-4 text-indigo-500" />
          <span>{isAr ? "إدارة الفنيين والمراكز" : "Technicians"}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-mono">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("licenses")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
            activeTab === "licenses"
              ? "bg-slate-900 text-white font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
          }`}
        >
          <Key className="w-4 h-4 text-amber-500" />
          <span>{isAr ? "مولد مفاتيح التفعيل" : "License Engine"}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 font-mono">
            {licenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
            activeTab === "logs"
              ? "bg-slate-900 text-white font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
          }`}
        >
          <Cpu className="w-4 h-4 text-cyan-500" />
          <span>{isAr ? "سجل عمليات التفليش المباشرة" : "Live Flashing Logs"}</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
            activeTab === "settings"
              ? "bg-slate-900 text-white font-bold shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
          }`}
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span>{isAr ? "إعدادات المنصة والسيرفر" : "System Settings"}</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. DEPARTMENTS & SECTIONS TAB (الأقسام والبرمجيات) */}
      {/* ---------------------------------------------------- */}
      {activeTab === "departments" && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? "هيكلية وأقسام السوفت وير والتفليش" : "Software Departments & Services Structure"}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isAr
                  ? "إضافة أقسام جديدة، تعيين البروتوكولات ومتحكمات الـ WebUSB، وتحديد البراندات المدعومة في كل قسم"
                  : "Create software modules, assign WebUSB protocols, and configure supported OEM brands."}
              </p>
            </div>

            <button
              onClick={() => handleOpenAddDept()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إضافة قسم برمجي جديد" : "Create New Department"}</span>
            </button>
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const theme = getColorClasses(dept.colorScheme);
              const linkedFilesCount = firmwares.filter(
                (f) => f.departmentId === dept.id
              ).length;

              return (
                <div
                  key={dept.id}
                  className={`border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md bg-white ${theme.border} space-y-4 flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${theme.iconBg}`}
                        >
                          {getDepartmentIcon(dept.iconName)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {isAr ? dept.nameAr : dept.nameEn}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: {dept.id}
                          </span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <button
                        onClick={() => handleToggleDeptStatus(dept.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-all ${
                          dept.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : dept.status === "vip_only"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                        title={isAr ? "انقر لتبديل الحالة" : "Click to toggle"}
                      >
                        {dept.status === "active"
                          ? isAr
                            ? "مفعّل نشط"
                            : "Active"
                          : dept.status === "vip_only"
                          ? isAr
                            ? "VIP فقط"
                            : "VIP Only"
                          : isAr
                          ? "قيد الصيانة"
                          : "Maintenance"}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {isAr ? dept.descriptionAr : dept.descriptionEn}
                    </p>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-500 font-medium">
                        <span>{isAr ? "البروتوكول:" : "Protocol:"}</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px]">
                          {dept.protocol}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-500 font-medium">
                        <span>{isAr ? "الملفات المسجلة:" : "Registered Files:"}</span>
                        <span className="font-mono font-bold text-indigo-600">
                          {linkedFilesCount || dept.filesCount} {isAr ? "ملف" : "files"}
                        </span>
                      </div>
                    </div>

                    {/* Brands tag list */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500">
                        {isAr ? "البراندات والموديلات المدعومة:" : "Supported Brands:"}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {dept.supportedBrands.map((brand, bIdx) => (
                          <span
                            key={bIdx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedDeptFilter(dept.id);
                        setActiveTab("firmware");
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>{isAr ? "عرض الملفات" : "View Files"}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAddFile(dept.id)}
                        title={isAr ? "إضافة ملف لهذا القسم" : "Add file to this department"}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditDept(dept)}
                        title={isAr ? "تعديل القسم" : "Edit Department"}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
                        title={isAr ? "حذف القسم" : "Delete Department"}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. PROGRAMMING FILES & FIRMWARE TAB (ملفات البرمجة) */}
      {/* ---------------------------------------------------- */}
      {activeTab === "firmware" && (
        <div className="space-y-6">
          {/* Top Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>{isAr ? "إجمالي ملفات البرمجة" : "Total ROM Files"}</span>
                <HardDrive className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {firmwares.length}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">
                {isAr ? "جاهزة للحقن والتفليش المباشر" : "Ready for WebUSB Injection"}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>{isAr ? "حجم المستودع السحابي" : "Total Storage Size"}</span>
                <Database className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {totalRepoSizeGb} GB
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {isAr ? "خوادم CDN سريعة بدون قيود" : "High-speed CDN Endpoints"}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>{isAr ? "إجمالي التنزيلات" : "Total Downloads"}</span>
                <Download className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {totalDownloads.toLocaleString()}
              </div>
              <div className="text-[11px] text-indigo-600 font-medium">
                {isAr ? "سحب وتنزيل مستمر بالفنيين" : "Active technician pulls"}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>{isAr ? "الأقسام المغطاة" : "Covered Departments"}</span>
                <Layers className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {departments.length}
              </div>
              <div className="text-[11px] text-purple-600 font-medium">
                {isAr ? "سامسونج، شاومي، كوالكوم، آبل" : "Samsung, Xiaomi, Apple, EDL"}
              </div>
            </div>
          </div>

          {/* Action Bar & Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-600" />
                  <span>{isAr ? "مستودع ملفات البرمجة والتفليش" : "Software Repository & Programmer Loaders"}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isAr
                    ? "إضافة وتعديل رومات Odin 4-Files، لودرات Firehose MBN، ملفات Scatter، ورموز DFU"
                    : "Manage stock ROMs, Firehose programmers, BROM scatter tables, and DFU restore packages."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200">
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isAr ? "رفع ملف محلي" : "Select Local File"}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleSimulateFileUpload}
                  />
                </label>

                <button
                  onClick={() => handleOpenAddFile()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? "إضافة ملف برمجي جديد" : "Add Programming File"}</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute top-2.5 start-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={isAr ? "بحث بالموديل، البراند، أو كود MD5..." : "Search model, brand, md5..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl ps-9 pe-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="all">{isAr ? "جميع الأقسام البرمجية" : "All Departments"}</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {isAr ? d.nameAr : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedBrandFilter}
                  onChange={(e) => setSelectedBrandFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="all">{isAr ? "جميع البراندات" : "All OEM Brands"}</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="Oppo">Oppo / Realme</option>
                  <option value="Vivo">Vivo</option>
                  <option value="Apple">Apple</option>
                  <option value="Huawei">Huawei</option>
                  <option value="Tecno">Tecno / Infinix</option>
                </select>
              </div>
            </div>
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFirmwares.map((fw) => {
              const assignedDept = departments.find(
                (d) => d.id === fw.departmentId
              );

              return (
                <div
                  key={fw.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                            {fw.brand}
                          </span>
                          {assignedDept && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {isAr ? assignedDept.nameAr.split("(")[0] : assignedDept.nameEn.split("(")[0]}
                            </span>
                          )}
                          {fw.status === "vip_only" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>VIP Only</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{fw.model}</h4>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                          <span>{fw.version}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium">{fw.androidVersion}</span>
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {fw.sizeGb} GB
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium">
                          {fw.downloadCount} {isAr ? "تنزيل" : "downloads"}
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{fw.fileType}</span>
                      </span>

                      <span className="font-mono text-[11px] text-slate-400 truncate max-w-[200px]" title={fw.checksumMd5}>
                        MD5: {fw.checksumMd5}
                      </span>
                    </div>

                    {fw.description && (
                      <p className="text-xs text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                        {fw.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(fw.downloadUrl);
                        showToast(isAr ? "تم نسخ رابط السيرفر المباشر" : "Direct CDN URL copied");
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isAr ? "نسخ رابط CDN" : "Copy CDN Link"}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditFile(fw)}
                        title={isAr ? "تعديل الملف" : "Edit File"}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteFile(fw.id)}
                        title={isAr ? "حذف الملف" : "Delete File"}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFirmwares.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <HardDrive className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">
                {isAr ? "لا توجد ملفات تطابق البحث المحدد" : "No programming files match criteria"}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isAr
                  ? "يمكنك إضافة ملف برمجي جديد بالضغط على الزر في الأعلى أو تغيير معايير البحث والفلترة"
                  : "Click the add button above to upload or register new firmware files."}
              </p>
              <button
                onClick={() => handleOpenAddFile()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                {isAr ? "إضافة ملف برمجي الآن" : "Add Programming File Now"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. OVERVIEW TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>{isAr ? "إجمالي الفنيين المسجلين" : "Registered Technicians"}</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-800 font-mono">{users.length}</div>
              <div className="text-[11px] text-emerald-600 font-medium">+4 فنيين جدد هذا الأسبوع</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>{isAr ? "عمليات التفليش اليوم" : "Today Flashes"}</span>
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-800 font-mono">148</div>
              <div className="text-[11px] text-indigo-600 font-medium">99.3% نسبة النجاح</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>{isAr ? "ملفات الرومات واللودرات" : "Firmwares & Loaders"}</span>
                <HardDrive className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-800 font-mono">{firmwares.length}</div>
              <div className="text-[11px] text-slate-500 font-medium">
                {isAr ? "إجمالي التنزيلات: " : "Total Downloads: "}
                {totalDownloads}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>{isAr ? "حالة خادم WebUSB & AI" : "Server & AI Status"}</span>
                <Server className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 font-mono">99.98%</div>
              <div className="text-[11px] text-emerald-600 font-medium">الاستجابة: 24ms</div>
            </div>
          </div>

          {/* Quick Admin Live Log Stream */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? "أحدث أنشطة وعمليات الفنيين الحية" : "Live Technician Activities"}</span>
            </h3>
            <div className="space-y-2">
              {logs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{log.technicianName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-indigo-600 font-semibold">{log.deviceModel}</span>
                    </div>
                    <div className="text-slate-600">{log.operation} ({log.protocol})</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-500">{log.timestamp}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase text-[10px]">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. USERS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "users" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? "إدارة الفنيين ومراكز الصيانة" : "Technicians & Workshop Accounts"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isAr
                  ? "تعديل الباقات، شحن الأرصدة، تفعيل أو تعليق الحسابات"
                  : "Grant credits, modify licensing plans, and manage account statuses."}
              </p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إضافة فني جديد" : "Add Technician"}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="py-3 px-4 text-start font-bold">{isAr ? "الفني / المحل" : "Technician / Workshop"}</th>
                  <th className="py-3 px-4 text-start font-bold">{isAr ? "البريد الإلكتروني" : "Email"}</th>
                  <th className="py-3 px-4 text-start font-bold">{isAr ? "الباقة" : "Plan"}</th>
                  <th className="py-3 px-4 text-start font-bold">{isAr ? "الرصيد" : "Credits"}</th>
                  <th className="py-3 px-4 text-start font-bold">{isAr ? "الحالة" : "Status"}</th>
                  <th className="py-3 px-4 text-end font-bold">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.workshopName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-[10px]">
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{u.credits} pts</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          u.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {u.status === "active" ? (isAr ? "نشط" : "Active") : (isAr ? "موقوف" : "Suspended")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAddCredits(u.id)}
                          title={isAr ? "شحن 50 رصيد" : "Add 50 Credits"}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          +50
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
                          title={isAr ? "تبديل الحالة" : "Toggle Status"}
                        >
                          {u.status === "active" ? (
                            <XCircle className="w-4 h-4 text-amber-600" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                          title={isAr ? "حذف الحساب" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. LICENSES TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "licenses" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? "مولد وتوزيع مفاتيح التفعيل المعتمدة" : "License Generation Engine"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isAr
                  ? "توليد مفاتيح باقات Pro و VIP مدى الحياة وإسنادها إلى مراكز الصيانة"
                  : "Issue VIP & Lifetime subscription tokens for workshop activations."}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="text-xs font-bold text-slate-800">
              {isAr ? "توليد مفتاح تفعيل جديد:" : "Generate New Activation Token:"}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? "نوع الباقة:" : "License Plan:"}
                </label>
                <select
                  value={newKeyPlan}
                  onChange={(e) => setNewKeyPlan(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden"
                >
                  <option value="Pro Technician">Pro Technician (فني فردي)</option>
                  <option value="VIP Workshop">VIP Workshop (مركز صيانة VIP)</option>
                  <option value="Lifetime Unlimited">Lifetime Unlimited (مدى الحياة)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isAr ? "المدة بالأيام:" : "Duration (Days):"}
                </label>
                <input
                  type="number"
                  value={newKeyDays}
                  onChange={(e) => setNewKeyDays(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleGenerateKey}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? "توليد المفتاح الآن" : "Generate Token"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700">{isAr ? "المفاتيح النشطة في النظام:" : "Active License Keys:"}</div>
            <div className="space-y-2">
              {licenses.map((lic) => (
                <div
                  key={lic.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {lic.key}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                      {lic.plan}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {lic.durationDays} {isAr ? "يوم" : "days"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {lic.assignedTo && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {lic.assignedTo}
                      </span>
                    )}
                    <button
                      onClick={() => handleCopyKey(lic.key, lic.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                    >
                      {copiedKeyId === lic.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>{copiedKeyId === lic.id ? (isAr ? "تم النسخ" : "Copied") : (isAr ? "نسخ" : "Copy")}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. LOGS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "logs" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? "سجل كافة عمليات التفليش والإصلاح المباشرة" : "Global Flashing & Diagnostic Telemetry"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {isAr
                  ? "مراقبة دقيقة لكل أمر Fastboot، مصافحة Sahara، وتغيير CSC عبر الخادم"
                  : "Live auditing of Sahara handshakes, BROM downloads, and Odin partition writes."}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{log.technicianName}</span>
                    <span className="text-slate-400 font-mono">({log.technicianEmail})</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{log.timestamp}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-slate-700">
                  <span className="font-bold text-indigo-700">{log.deviceModel}</span>
                  <span>•</span>
                  <span className="font-semibold">{log.operation}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                    {log.protocol}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 font-mono bg-white p-2 rounded-lg border border-slate-200">
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. SETTINGS TAB */}
      {/* ---------------------------------------------------- */}
      {activeTab === "settings" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>{isAr ? "إعدادات المنصة وإشعارات الفنيين" : "Platform Broadcast & Server Tuning"}</span>
              </h3>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                {isAr ? "رسالة الإعلان العام للفنيين (Broadcast Banner):" : "Global Technician Announcement:"}
              </label>
              <textarea
                rows={2}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">
                  {isAr ? "وضع الصيانة الشاملة (Maintenance Mode)" : "System Maintenance Lockout"}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {isAr
                    ? "تعطيل خوادم التفليش مؤقتاً للتحديثات الدورية"
                    : "Temporarily pause public flashing sessions during database migrations."}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  maintenanceMode
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {maintenanceMode ? (isAr ? "مفعّل (قيد الصيانة)" : "Maintenance Active") : (isAr ? "معطّل (المنصة تعمل)" : "Live (Normal)")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT DEPARTMENT */}
      {/* ==================================================== */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingDeptId
                    ? isAr
                      ? "تعديل القسم البرمجي"
                      : "Edit Department"
                    : isAr
                    ? "إضافة قسم برمجي جديد"
                    : "Add New Department"}
                </h3>
              </div>
              <button
                onClick={() => setShowDeptModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "اسم القسم بالعربية:" : "Department Name (Arabic):"} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: قسم تفليش شاومي ومبرمج Firehose"
                    value={deptNameAr}
                    onChange={(e) => setDeptNameAr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "اسم القسم بالإنجليزية:" : "Department Name (English):"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Xiaomi Firehose EDL Suite"
                    value={deptNameEn}
                    onChange={(e) => setDeptNameEn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "وصف ومجال عمل القسم:" : "Description:"}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    isAr
                      ? "شرح موجز للمهام والبرمجيات التي يدعمها هذا القسم..."
                      : "Brief description of flashing operations supported..."
                  }
                  value={deptDescAr}
                  onChange={(e) => setDeptDescAr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "البروتوكول المعتمد:" : "Protocol:"}
                  </label>
                  <select
                    value={deptProtocol}
                    onChange={(e) => setDeptProtocol(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Qualcomm Sahara 9008">Qualcomm Sahara 9008</option>
                    <option value="Samsung Loke v4 / WebUSB">Samsung Loke v4 / WebUSB</option>
                    <option value="MTK BROM v7.19">MTK BROM v7.19</option>
                    <option value="Fastbootd / Android Bootloader">Fastbootd / Bootloader</option>
                    <option value="ADB Shell & Packages">ADB Shell & Packages</option>
                    <option value="Apple iBoot / DFU">Apple iBoot / DFU</option>
                    <option value="SPD Diag / FDL Loader">SPD Diag / FDL Loader</option>
                    <option value="Apple Cloud REST API">Apple Cloud REST API</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "الأيقونة:" : "Icon:"}
                  </label>
                  <select
                    value={deptIcon}
                    onChange={(e) => setDeptIcon(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Cpu">Cpu (معالج)</option>
                    <option value="Smartphone">Smartphone (هاتف)</option>
                    <option value="Zap">Zap (طاقة وسرعة)</option>
                    <option value="ShieldAlert">ShieldAlert (حماية وأمان)</option>
                    <option value="Server">Server (سيرفر)</option>
                    <option value="HardDrive">HardDrive (قرص تخزين)</option>
                    <option value="Layers">Layers (طبقات وأقسام)</option>
                    <option value="FolderDown">FolderDown (ملفات)</option>
                    <option value="Terminal">Terminal (أوامر)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "اللون المميز:" : "Color Theme:"}
                  </label>
                  <select
                    value={deptColor}
                    onChange={(e) => setDeptColor(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="purple">Purple (بنفسجي كوالكوم)</option>
                    <option value="blue">Blue (أزرق سامسونج)</option>
                    <option value="emerald">Emerald (أخضر ميديا تك)</option>
                    <option value="amber">Amber (كهرماني FRP)</option>
                    <option value="indigo">Indigo (نيلي ماك وآبل)</option>
                    <option value="teal">Teal (سماوي يونيسوك)</option>
                    <option value="rose">Rose (وردي تحذيري)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "البراندات المدعومة (مفصولة بفواصل):" : "Supported Brands (comma-separated):"}
                </label>
                <input
                  type="text"
                  placeholder="Xiaomi, Redmi, Poco, BlackShark"
                  value={deptBrands}
                  onChange={(e) => setDeptBrands(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "حالة إتاحة القسم:" : "Department Availability:"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeptStatus("active")}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      deptStatus === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {isAr ? "مفعّل للجميع" : "Active (All)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeptStatus("vip_only")}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      deptStatus === "vip_only"
                        ? "bg-amber-50 text-amber-700 border-amber-300 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {isAr ? "باقات VIP فقط" : "VIP Only"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeptStatus("maintenance")}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      deptStatus === "maintenance"
                        ? "bg-rose-50 text-rose-700 border-rose-300 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {isAr ? "قيد الصيانة" : "Maintenance"}
                  </button>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md cursor-pointer"
                >
                  {editingDeptId
                    ? isAr
                      ? "حفظ التعديلات"
                      : "Save Changes"
                    : isAr
                    ? "إضافة القسم الآن"
                    : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT PROGRAMMING FILE / FIRMWARE */}
      {/* ==================================================== */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingFileId
                    ? isAr
                      ? "تعديل بيانات ملف البرمجة"
                      : "Edit Programming File"
                    : isAr
                    ? "إضافة ملف برمجي / روم رسمي جديد"
                    : "Add Programming File / ROM"}
                </h3>
              </div>
              <button
                onClick={() => setShowFileModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFile} className="space-y-4 text-xs">
              {/* Quick file simulator dropzone */}
              <div className="p-3.5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileCode className="w-5 h-5 text-indigo-600" />
                  <div>
                    <span className="font-bold text-slate-800">
                      {isAr ? "سحب ملف من جهازك للتعبئة التلقائية:" : "Auto-fill from local file:"}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {isAr ? "سيقوم النظام بحساب الحجم واقتراح النوع والهاش" : "Will compute size, type, and MD5"}
                    </p>
                  </div>
                </div>

                <label className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer text-xs shadow-xs">
                  <span>{isAr ? "اختيار ملف" : "Browse File"}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleSimulateFileUpload}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "البراند المستهدف:" : "Target OEM Brand:"} *
                  </label>
                  <select
                    value={fileBrand}
                    onChange={(e) => setFileBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Samsung">Samsung</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Oppo">Oppo</option>
                    <option value="Vivo">Vivo</option>
                    <option value="Realme">Realme</option>
                    <option value="Apple">Apple</option>
                    <option value="Huawei">Huawei</option>
                    <option value="Tecno">Tecno / Infinix</option>
                    <option value="Qualcomm Generic">Qualcomm Generic (9008)</option>
                    <option value="MediaTek Generic">MediaTek Generic (BROM)</option>
                    <option value="Unisoc SPD">Unisoc Spreadtrum</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "القسم التابع له:" : "Assigned Department:"} *
                  </label>
                  <select
                    value={fileDeptId}
                    onChange={(e) => setFileDeptId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {isAr ? d.nameAr : d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "اسم الموديل / الجهاز:" : "Device Model / Name:"} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Galaxy S24 Ultra (SM-S928B)"
                    value={fileModel}
                    onChange={(e) => setFileModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "نوع الملف البرمجي:" : "Software / File Type:"} *
                  </label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Odin 4-Files (TAR.MD5)">Odin 4-Files (TAR.MD5 - سامسونج)</option>
                    <option value="Qualcomm Firehose (ELF/MBN)">Qualcomm Firehose (ELF/MBN - كوالكوم)</option>
                    <option value="BROM Scatter">BROM Scatter Table (ميديا تك)</option>
                    <option value="IPSW / DFU">Apple IPSW / DFU Package (آبل)</option>
                    <option value="Fastboot Super / Boot IMG">Fastboot Super / Boot.img</option>
                    <option value="PIT & Partition Matrix">PIT & Partition Matrix</option>
                    <option value="FRP & Knox Payload APK">FRP & Knox Payload APK</option>
                    <option value="SPD / Unisoc PAC File">SPD / Unisoc PAC Firmware</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "رقم إصدار الروم:" : "Firmware Version:"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. S928BXXU1AXCA"
                    value={fileVersion}
                    onChange={(e) => setFileVersion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "إصدار النظام (OS):" : "Android / OS:"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Android 15 (OneUI 7.0)"
                    value={fileAndroidVersion}
                    onChange={(e) => setFileAndroidVersion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "الحجم بالجيجابايت (GB):" : "Size (GB):"}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={fileSizeGb}
                    onChange={(e) => setFileSizeGb(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "رابط السيرفر المباشر (Direct CDN URL):" : "Direct CDN Download URL:"} *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://cdn.mobilefix.pro/firmware/..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      {isAr ? "هاش التحقق (MD5 Checksum):" : "MD5 Checksum:"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setFileMd5(generateRandomMd5())}
                      className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      {isAr ? "توليد تلقائي" : "Generate"}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="32-char hex md5"
                    value={fileMd5}
                    onChange={(e) => setFileMd5(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-[11px] focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "مستوى الوصول:" : "Access Permission:"}
                  </label>
                  <select
                    value={fileStatus}
                    onChange={(e) => setFileStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="active">{isAr ? "متاح لكافة الفنيين (Active)" : "Active (All Users)"}</option>
                    <option value="vip_only">{isAr ? "خاص باشتراكات VIP فقط" : "VIP Workshop Only"}</option>
                    <option value="maintenance">{isAr ? "قيد الفحص والمراجعة" : "Under Review"}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "ملاحظات وتعليمات التفليش للفنيين:" : "Technician Notes & Flash Instructions:"}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    isAr
                      ? "تعليمات خاصة بطريقة التفليش وتفادي مسح البيانات أو البوت لودر..."
                      : "Special instructions for this ROM..."
                  }
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFileModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md cursor-pointer"
                >
                  {editingFileId
                    ? isAr
                      ? "حفظ التعديلات"
                      : "Update File"
                    : isAr
                    ? "تسجيل الملف في المستودع"
                    : "Add File to Repo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD USER */}
      {/* ==================================================== */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800">
              {isAr ? "إضافة فني أو مركز صيانة جديد" : "Add Technician"}
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{isAr ? "الاسم:" : "Name:"}</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isAr ? "البريد:" : "Email:"}</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isAr ? "اسم الورشة:" : "Workshop:"}</label>
                <input
                  type="text"
                  value={newUserWorkshop}
                  onChange={(e) => setNewUserWorkshop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isAr ? "الباقة:" : "Plan:"}</label>
                <select
                  value={newUserPlan}
                  onChange={(e) => setNewUserPlan(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                >
                  <option value="Pro Technician">Pro Technician</option>
                  <option value="VIP Workshop">VIP Workshop</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-xs"
                >
                  {isAr ? "إضافة" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
