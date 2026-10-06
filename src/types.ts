export type ConnectionMode =
  | "disconnected"
  | "adb"
  | "fastboot"
  | "samsung_odin"
  | "mtk_brom"
  | "qualcomm_edl"
  | "apple_dfu"
  | "apple_recovery"
  | "serial_modem"
  | "raw_usb";

export type Language = "ar" | "en";

export interface UsbDeviceInfo {
  vendorId: number;
  productId: number;
  vendorName: string;
  productName: string;
  serialNumber: string;
  manufacturerName?: string;
  usbVersionMajor?: number;
  usbVersionMinor?: number;
  deviceClass?: number;
  interfacesCount?: number;
  endpoints?: {
    endpointNumber: number;
    direction: "in" | "out";
    type: "bulk" | "interrupt" | "isochronous" | "control";
    packetSize: number;
  }[];
}

export interface DeviceTelemetry {
  brand: string;
  model: string;
  marketName: string;
  codename: string;
  serialNumber: string;
  imei1: string;
  imei2?: string;
  androidVersion: string;
  buildNumber: string;
  securityPatch: string;
  basebandVersion: string;
  kernelVersion: string;
  bootloaderStatus: "locked" | "unlocked" | "relocked";
  knoxWarrantyBit?: "0x0 (Valid)" | "0x1 (Void)";
  frpStatus: "enabled" | "disabled" | "unknown";
  rootStatus: "rooted" | "not_rooted";
  cpuModel: string;
  cpuCores: number;
  cpuTemperatureC: number;
  ramTotalMb: number;
  ramUsedMb: number;
  storageTotalGb: number;
  storageUsedGb: number;
  batteryLevel: number;
  batteryHealthPercent: number;
  batteryCycleCount: number;
  batteryVoltageMv: number;
  batteryCurrentMa: number; // positive = charging, negative = discharging
  batteryTemperatureC: number;
  batteryDesignCapacityMah: number;
  batteryRealCapacityMah: number;
  screenResolution: string;
  screenRefreshRateHz: number;
}

export interface FastbootVar {
  name: string;
  value: string;
  description?: string;
}

export interface AdbPackage {
  packageName: string;
  appName: string;
  category: "system" | "user" | "carrier" | "oem_bloatware";
  isSafeToRemove: "safe" | "caution" | "unsafe";
  version: string;
  sizeMb: number;
  installedDate: string;
  iconName?: string;
  description?: string;
}

export interface LogcatEntry {
  id: string;
  timestamp: string;
  pid: number;
  tid: number;
  level: "V" | "D" | "I" | "W" | "E" | "F";
  tag: string;
  message: string;
}

export interface UsbPacketLog {
  id: string;
  timestamp: string;
  direction: "IN" | "OUT" | "CONTROL";
  length?: number;
  bytes?: number;
  hex?: string;
  hexData?: string;
  ascii?: string;
  endpoint?: string;
}

export interface TestPointData {
  id: string;
  brand: string;
  phoneModel: string;
  chipset: string;
  type: string;
  locationDescription: string;
  instructionsAr: string;
  instructionsEn: string;
  diodeValue: string;
  schematicImageUrl: string;
}

export interface ErrorCodeData {
  code: string;
  platform: string;
  descriptionAr: string;
  descriptionEn: string;
  solutionAr: string;
  solutionEn: string;
}

export interface AiDiagnosticResult {
  overallHealthScore: number;
  issueSummary: string;
  rootCauses: string[];
  softwareFixes: string[];
  hardwareFixes: string[];
  recommendedTestPoints: string[];
  confidenceLevel: string;
  estimatedRepairTime: string;
}

export type AppView =
  | "landing"
  | "app"
  | "services_market"
  | "login"
  | "signup"
  | "forgot_password"
  | "admin";

export type AccountType = "user" | "publisher";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  workshopName?: string;
  role: "technician" | "workshop_owner" | "admin" | "user";
  accountType: AccountType; // "user" (مستخدم عادي مجاني) أو "publisher" (ناشر خدمات بـ 10$/شهر)
  nationality: string; // جنسية الفني أو المستخدم (سعودي، مصري، أردني...)
  country: string; // الدولة
  city: string; // المدينة
  village: string; // القرية / البلدة / الحي
  workPerimeter: string; // محيط ومجال العمل (مثلاً: 5 كم، 15 كم، كامل المدينة، تغطية شاملة)
  isPublisherActive: boolean; // هل اشتراك الناشر مفعل (10$ شهرياً)
  publisherExpiresAt?: string;
  isBlueBadgeVerified: boolean; // توثيق الحساب بالشارة الزرقاء (10$ شهرياً لنشر غير محدود)
  blueBadgeExpiresAt?: string;
  dailyPublishedCount?: number; // عدد الخدمات المنشورة في اليوم الحالي
  lastPublishDate?: string;
  plan: "Free Trial" | "Pro Technician" | "VIP Workshop";
  credits: number;
  joinedDate: string;
  status: "active" | "suspended";
}

export interface TechnicianServiceItem {
  id: string;
  publisherId: string;
  publisherName: string;
  publisherWorkshop?: string;
  publisherPhone: string;
  isBlueBadgeVerified: boolean;
  nationality: string;
  country: string;
  city: string;
  village: string;
  workPerimeter: string;
  title: string;
  description: string;
  category:
    | "flashing_software"
    | "frp_unlock"
    | "hardware_board"
    | "screen_battery"
    | "icloud_imei"
    | "maintenance_general";
  deviceBrand: string;
  priceUsd: number;
  estimatedTime: string;
  createdAt: string;
  viewsCount: number;
}

export interface LicenseKey {
  id: string;
  key: string;
  plan: "Pro Technician" | "VIP Workshop" | "Lifetime Unlimited";
  durationDays: number;
  assignedTo?: string;
  status: "active" | "used" | "revoked";
  createdDate: string;
}

export interface FirmwareItem {
  id: string;
  brand: string;
  model: string;
  version: string;
  androidVersion: string;
  fileType: string;
  category?: string;
  departmentId?: string;
  sizeGb: number;
  downloadUrl: string;
  checksumMd5: string;
  downloadCount: number;
  description?: string;
  status?: "active" | "vip_only" | "maintenance";
  uploadedDate?: string;
}

export interface SoftwareDepartment {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  iconName: string;
  colorScheme: "blue" | "emerald" | "purple" | "amber" | "indigo" | "rose" | "teal" | "slate";
  protocol: string;
  status: "active" | "maintenance" | "vip_only";
  supportedBrands: string[];
  filesCount: number;
  operationsCount: number;
  order: number;
}

export interface AdminTelemetryLog {
  id: string;
  timestamp: string;
  technicianName: string;
  technicianEmail: string;
  deviceModel: string;
  operation: string;
  protocol: string;
  status: "success" | "failed" | "in_progress";
  details: string;
}

